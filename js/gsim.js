/* ═══════════════════════════════════════════════════════════════════
   GSIM — Simulacao Guiada Multiplayer Realtime
   ═══════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  var shell = document.getElementById("gsim");
  if (!shell) return;

  var stepBtns   = Array.from(shell.querySelectorAll("[data-gsim-target]"));
  var stepLabel  = document.getElementById("gsim-step-label");
  var stepTitle  = document.getElementById("gsim-step-title");
  var stepText   = document.getElementById("gsim-step-text");
  var stepCode   = document.getElementById("gsim-step-code");

  var gpopBossAction = document.getElementById("gpop-boss-action");
  var gpopBossRender = document.getElementById("gpop-boss-render");
  var gpopS1Action   = document.getElementById("gpop-s1-action");
  var gpopS4Action   = document.getElementById("gpop-s4-action");
  var gpopServerProc = document.getElementById("gpop-server-process");
  var gpopServerLbl  = document.getElementById("gpop-server-label");
  var gpopServerCode = document.getElementById("gpop-server-code");
  var gpopServerNote = document.getElementById("gpop-server-note");

  var souls  = [1,2,3,4].map(function (n) { return document.getElementById("gsoul-" + n); });
  var hearts = [1,2,3,4].map(function (n) { return document.getElementById("gheart-" + n); });

  var tracks = {
    boss:   document.getElementById("gtrack-boss"),
    server: document.getElementById("gtrack-server"),
    hbus:   document.getElementById("gsim-hbus"),
    s1:     document.getElementById("gtrack-s1"),
    s2:     document.getElementById("gtrack-s2"),
    s3:     document.getElementById("gtrack-s3"),
    s4:     document.getElementById("gtrack-s4")
  };

  var STEPS = [
    {
      label: "step 1 / 5",
      title: "ACOES DOS CLIENTES",
      text:  "No WebSocket, varios jogadores podem agir quase ao mesmo tempo. O cliente nao decide dano nem vitoria — ele so envia intencao.",
      code:  'boss.emit("attack")\n// Alma 1: -> move\n// Alma 4: attack'
    },
    {
      label: "step 2 / 5",
      title: "INPUTS VIA SOCKET",
      text:  "Cada cliente envia apenas input. O servidor recebe as intencoes e guarda para processar no tick.",
      code:  'socket.emit("utm:input", keys)'
    },
    {
      label: "step 3 / 5",
      title: "SERVER PROCESSA",
      text:  "O servidor e autoritativo. Ele valida inputs, simula a partida, calcula dano e decide o estado real da sala.",
      code:  "processTick(room)"
    },
    {
      label: "step 4 / 5",
      title: "STATE DISTRIBUIDO",
      text:  "Depois do tick, o servidor envia uma unica verdade oficial da partida para todos os clientes da sala.",
      code:  'io.to(room).emit("utm:state", publicState(room))'
    },
    {
      label: "step 5 / 5",
      title: "CLIENTES RENDERIZAM",
      text:  "Os clientes nao decidem o resultado. Eles apenas desenham na tela o state oficial recebido do servidor.",
      code:  "render(state)"
    }
  ];

  var current  = 0;
  var timers   = [];

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];

    [gpopBossAction, gpopBossRender, gpopS1Action, gpopS4Action, gpopServerProc].forEach(function (el) {
      if (el) el.classList.remove("visible");
    });

    souls.forEach(function (s) {
      if (s) s.classList.remove("highlighted", "rendered");
    });

    Object.keys(tracks).forEach(function (key) {
      var t = tracks[key];
      if (!t) return;
      t.querySelectorAll(".gpacket").forEach(function (p) {
        p.classList.remove("go-down", "go-up", "h-in-s1", "h-in-s4", "h-out-s1", "h-out-s2", "h-out-s3", "h-out-s4");
        p.style.opacity = "0";
      });
    });
  }

  function firePacket(trackEl, pktId, animClass, dur) {
    if (!trackEl) return;
    var pkt = trackEl.querySelector("#" + pktId);
    if (!pkt) return;
    pkt.style.setProperty("--pd", dur + "ms");
    pkt.classList.remove("go-down", "go-up", "h-in-s1", "h-in-s4", "h-out-s1", "h-out-s2", "h-out-s3", "h-out-s4");
    void pkt.offsetWidth;
    pkt.style.opacity = "1";
    pkt.classList.add(animClass);
    later(function () { pkt.style.opacity = "0"; }, dur + 60);
  }

  function activate(idx) {
    clearAll();
    current = Math.max(0, Math.min(4, idx));
    var s = STEPS[current];
    shell.dataset.gsimStep = String(current);

    if (stepLabel) stepLabel.textContent = s.label;
    if (stepTitle) stepTitle.textContent = s.title;
    if (stepText)  stepText.textContent  = s.text;
    if (stepCode)  stepCode.textContent  = s.code;

    stepBtns.forEach(function (btn, i) {
      var active = i === current;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    switch (current) {
      case 0: /* ACOES */
        later(function () { if (gpopBossAction) gpopBossAction.classList.add("visible"); }, 120);
        later(function () {
          if (gpopS1Action) gpopS1Action.classList.add("visible");
          if (souls[0]) souls[0].classList.add("highlighted");
        }, 260);
        later(function () {
          if (gpopS4Action) gpopS4Action.classList.add("visible");
          if (souls[3]) souls[3].classList.add("highlighted");
        }, 400);
        break;

      case 1: /* INPUTS */
        /* Boss directly down to server */
        later(function () { firePacket(tracks.boss, "gpkt-boss-input", "go-down", 800); }, 100);
        
        /* Soul 1: up track -> right on hbus -> up server track */
        later(function () { firePacket(tracks.s1, "gpkt-s1-input", "go-up", 400); }, 300);
        later(function () { firePacket(tracks.hbus, "gpkt-hbus-in-s1", "h-in-s1", 400); }, 700);
        later(function () { firePacket(tracks.server, "gpkt-server-in-s1", "go-up", 400); }, 1100);

        /* Soul 4: up track -> left on hbus -> up server track */
        later(function () { firePacket(tracks.s4, "gpkt-s4-input", "go-up", 400); }, 400);
        later(function () { firePacket(tracks.hbus, "gpkt-hbus-in-s4", "h-in-s4", 400); }, 800);
        later(function () { firePacket(tracks.server, "gpkt-server-in-s4", "go-up", 400); }, 1200);
        break;

      case 2: /* SERVER PROCESSA */
        if (gpopServerLbl)  gpopServerLbl.textContent  = "PROCESS";
        if (gpopServerCode) gpopServerCode.textContent = "processTick(room)";
        if (gpopServerNote) gpopServerNote.textContent = "boss.attack + alma1.right + alma4.shoot";
        later(function () { if (gpopServerProc) gpopServerProc.classList.add("visible"); }, 200);
        break;

      case 3: /* STATE DISTRIBUIDO */
        /* Boss state goes straight up */
        later(function () { firePacket(tracks.boss, "gpkt-boss-state", "go-up", 800); }, 80);
        
        /* Server state goes down to hbus */
        later(function () { firePacket(tracks.server, "gpkt-server-state", "go-down", 400); }, 140);
        
        /* HBus outward distribute */
        later(function () {
          firePacket(tracks.hbus, "gpkt-hbus-out-s1", "h-out-s1", 400);
          firePacket(tracks.hbus, "gpkt-hbus-out-s2", "h-out-s2", 400);
          firePacket(tracks.hbus, "gpkt-hbus-out-s3", "h-out-s3", 400);
          firePacket(tracks.hbus, "gpkt-hbus-out-s4", "h-out-s4", 400);
        }, 540);

        /* Down the soul tracks */
        later(function () { firePacket(tracks.s1, "gpkt-s1-state", "go-down", 400); }, 940);
        later(function () { firePacket(tracks.s2, "gpkt-s2-state", "go-down", 400); }, 940);
        later(function () { firePacket(tracks.s3, "gpkt-s3-state", "go-down", 400); }, 940);
        later(function () { firePacket(tracks.s4, "gpkt-s4-state", "go-down", 400); }, 940);
        break;

      case 4: /* CLIENTES RENDERIZAM */
        later(function () { if (gpopBossRender) gpopBossRender.classList.add("visible"); }, 150);
        souls.forEach(function (s, i) {
          later(function () { if (s) s.classList.add("rendered"); }, 200 + i * 150);
        });
        break;
    }
  }

  stepBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activate(Number(btn.dataset.gsimTarget));
      shell.focus({ preventScroll: true });
    });
  });

  function isInView() {
    var r = shell.getBoundingClientRect();
    return r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.15;
  }

  window.addEventListener("keydown", function (ev) {
    if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
    if (!isInView() && !shell.contains(document.activeElement)) return;
    var tag = document.activeElement ? document.activeElement.tagName : "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    ev.preventDefault();
    activate(current + (ev.key === "ArrowRight" ? 1 : -1));
  });

  activate(0);
})();
