(function () {
  "use strict";

  /*
   * Playground JS - script principal.
   * Responsavel por navegacao entre telas, regras dos jogos, placares,
   * efeitos sonoros, animacoes em canvas e controles de teclado/mouse.
   */

  /* =====================================================================
   ÁUDIO
   ===================================================================== */
  var audioCtx = null;
  function getAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AC) audioCtx = new AC();
    return audioCtx;
  }
  function bipe(freq, tipo, dur, vol) {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      var osc = ctx.createOscillator(),
        g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = tipo || "sine";
      osc.frequency.value = freq || 440;
      g.gain.setValueAtTime(vol || 0.13, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.12));
      osc.start();
      osc.stop(ctx.currentTime + (dur || 0.12));
    } catch (e) { }
  }
  function somOk() {
    bipe(523, "sine", 0.08, 0.14);
    setTimeout(function () {
      bipe(659, "sine", 0.08, 0.14);
    }, 110);
    setTimeout(function () {
      bipe(784, "sine", 0.18, 0.14);
    }, 220);
  }
  function somErro() {
    bipe(220, "sawtooth", 0.17, 0.09);
    setTimeout(function () {
      bipe(175, "sawtooth", 0.2, 0.09);
    }, 155);
  }
  function somDraw() {
    bipe(440, "triangle", 0.24, 0.11);
  }
  function somNav() {
    bipe(600, "square", 0.05, 0.06);
  }
  function somEsc() {
    bipe(300, "square", 0.06, 0.05);
    setTimeout(function () {
      bipe(220, "square", 0.08, 0.05);
    }, 60);
  }
  function somMoeda() {
    bipe(660, "sine", 0.07, 0.17);
    setTimeout(function () {
      bipe(990, "sine", 0.14, 0.17);
    }, 85);
  }
  function somGiro() {
    for (var i = 0; i < 7; i++)
      (function (n) {
        setTimeout(function () {
          bipe(260 + Math.random() * 480, "square", 0.04, 0.04);
        }, n * 72);
      })(i);
  }

  /* =====================================================================
   CONFETTI
   ===================================================================== */
  var cvs = document.getElementById("cc-canvas"),
    cx2 = cvs.getContext("2d"),
    pts = [];
  function resizeCvs() {
    cvs.width = innerWidth;
    cvs.height = innerHeight;
  }
  resizeCvs();
  window.addEventListener("resize", resizeCvs);
  function confetti() {
    var C = ["#f9e84d", "#ff2d78", "#00f5c4", "#9d5cff", "#ff8c00", "#00b4ff"];
    pts = [];
    for (var i = 0; i < 140; i++)
      pts.push({
        x: Math.random() * cvs.width,
        y: -10,
        w: 5 + Math.random() * 9,
        h: 7 + Math.random() * 12,
        c: C[~~(Math.random() * C.length)],
        vx: (Math.random() - 0.5) * 5,
        vy: 2.5 + Math.random() * 4,
        r: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        a: 1,
      });
    drawC();
  }
  function drawC() {
    cx2.clearRect(0, 0, cvs.width, cvs.height);
    var alive = false;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.a -= 0.008;
      if (p.a <= 0) continue;
      alive = true;
      cx2.save();
      cx2.translate(p.x, p.y);
      cx2.rotate((p.r * Math.PI) / 180);
      cx2.globalAlpha = p.a;
      cx2.fillStyle = p.c;
      cx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx2.restore();
    }
    if (alive) requestAnimationFrame(drawC);
    else cx2.clearRect(0, 0, cvs.width, cvs.height);
  }

  /* =====================================================================
   SISTEMA DE TELAS
   ===================================================================== */
  var TELA = {
    HUB: "hub",
    ARCADE: "arcade-hub",
    ARCADE_GAMES: "arcade-games-hub",
    JKP: "jokenpo",
    DADOS: "dados",
    CC: "caraCoroa",
    GEO: "geometry-race",
    CYBER: "cyber-maze",
    MP_HUB: "multiplayer-hub",
    UT_MULTI: "undertale-multiplayer",
    PROJECTS: "projects-hub",
    LIGHT: "light-switch",
    PIGGY: "piggy-bank",
    POMO: "pomodoro",
    KEYBOARD: "virtual-keyboard",
    CASINO: "casino",
    SLOTS: "slots",
    ROULETTE: "roulette-game",
    CRASH: "crash-game",
    UT_HUB: "undertale-hub",
    UT_BATTLE: "undertale-battle",
  };
  var telaAtiva = TELA.HUB;
  var STORAGE_TELA_ATIVA = "playground-js-active-screen";
  var telasPersistiveis = {};
  Object.keys(TELA).forEach(function (key) {
    telasPersistiveis[TELA[key]] = true;
  });
  telasPersistiveis["modal-idade"] = false;
  telasPersistiveis[TELA.UT_BATTLE] = false;
  telasPersistiveis[TELA.UT_MULTI] = false;
  var telaInicialPersistida = "";
  try {
    telaInicialPersistida = localStorage.getItem(STORAGE_TELA_ATIVA) || "";
  } catch (e) { }

  function bloquearCliqueMouse(e) {
    if (!e.isTrusted) return;
    if (e.target && e.target.closest && e.target.closest("#undertale-multiplayer")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  ["pointerdown", "mousedown", "mouseup", "click", "dblclick", "contextmenu"].forEach(function (eventName) {
    window.addEventListener(eventName, bloquearCliqueMouse, true);
  });

  if (
    telaInicialPersistida &&
    telaInicialPersistida !== TELA.HUB &&
    telasPersistiveis[telaInicialPersistida] &&
    document.getElementById(telaInicialPersistida)
  ) {
    document.querySelectorAll(".screen").forEach(function (s) {
      s.classList.remove("active");
    });
    var telaInicial = document.getElementById(telaInicialPersistida);
    if (telaInicial) {
      telaInicial.classList.add("active");
      telaAtiva = telaInicialPersistida;
    }
  }

  function irPara(id) {
    document.querySelectorAll(".screen").forEach(function (s) {
      s.classList.remove("active");
    });
    var t = document.getElementById(id);
    if (!t) return;
    t.classList.add("active");
    telaAtiva = id;
    if (telasPersistiveis[id]) {
      try {
        localStorage.setItem(STORAGE_TELA_ATIVA, id);
      } catch (e) { }
    }
    t.scrollTop = 0;
    if (id === TELA.ARCADE_GAMES) setTimeout(function () { arcadeGamesEnter(); }, 60);
    if (id === TELA.MP_HUB) setTimeout(function () { multiplayerSetFoco(0); }, 60);
    if (id === TELA.UT_MULTI) setTimeout(function () { utmEnter(); }, 60);
    if (id === TELA.JKP) setTimeout(function () { jkpSetFoco(0); }, 60);
    if (id === TELA.CC) setTimeout(function () { ccSetFoco(0); }, 60);
    if (id === TELA.GEO) setTimeout(function () { geoEnter(); }, 60);
    else geoStop();
    if (id === TELA.CYBER) setTimeout(function () { cyberEnter(); }, 60);
    else cyberStop();
    if (id === TELA.PROJECTS) setTimeout(function () { projectsEnter(); }, 60);
    if (id === TELA.LIGHT) setTimeout(function () { lightInit(); }, 60);
    if (id === TELA.PIGGY) setTimeout(function () { piggyInit(); }, 60);
    if (id === TELA.POMO) setTimeout(function () { pomoInit(); }, 60);
    if (id === TELA.KEYBOARD) setTimeout(function () { synthInit(); }, 60);
    if (id === TELA.CASINO) setTimeout(function () { casinoSetFocoInicial(); }, 60);
    if (id === TELA.SLOTS) setTimeout(function () {
      var b = document.getElementById("btn-spin");
      if (b) b.classList.add("kb-focus");
    }, 60);
    if (id === TELA.ROULETTE) setTimeout(function () {
      var b = document.getElementById("btn-spin-rlt");
      if (b) b.classList.add("kb-focus");
    }, 60);
    if (id === TELA.CRASH) setTimeout(function () { crashSetFoco(3); }, 60);
    if (id === TELA.DADOS) setTimeout(function () {
      document.getElementById("btn-dados").classList.add("kb-focus");
    }, 60);
    /* Undertale hooks */
    if (id === TELA.UT_BATTLE) {
      setTimeout(function () {
        if (!utSpriteAnimRAF) { utSpriteAnimT = 0; utAnimateSprite(); }
      }, 60);
    } else {
      setTimeout(function () {
        if (typeof utSpriteAnimRAF !== 'undefined' && utSpriteAnimRAF) {
          cancelAnimationFrame(utSpriteAnimRAF);
          utSpriteAnimRAF = null;
        }
      }, 60);
    }
    if (id === TELA.UT_HUB) {
      setTimeout(function () { if (typeof utRefreshHub === 'function') utRefreshHub(); }, 60);
    }
    if (id === TELA.UT_ENDING) {
      /* handled by utShowEnding() */
    }
  }

  /* =====================================================================
   PLAYGROUND HUB
   ===================================================================== */
  var pgIdx = 0;

  function getPgCards() {
    return Array.from(document.querySelectorAll("#pg-grid .gcard"));
  }

  function pgSetFoco(idx) {
    var cards = getPgCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    pgIdx = idx;
  }

  function pgSelect() {
    var cards = getPgCards();
    var card = cards[pgIdx];
    if (card) card.click();
  }

  document.getElementById("pg-arcade").addEventListener("click", function () {
    somNav();
    irPara(TELA.ARCADE);
  });

  document.getElementById("pg-arcade-games").addEventListener("click", function () {
    somNav();
    arcadeGamesBooted = false;
    arcadeGamesAnimating = false;
    irPara(TELA.ARCADE_GAMES);
  });

  document.getElementById("pg-multiplayer").addEventListener("click", function () {
    somNav();
    irPara(TELA.MP_HUB);
  });

  document.getElementById("pg-projects").addEventListener("click", function () {
    somNav();
    projectsUnlocked = false;
    projectsAnimating = false;
    irPara(TELA.PROJECTS);
  });

  var pendingCasinoEntry = false;
  var casinoTicketUsado = false;
  function abrirModalIdade(isCasinoEntry) {
    somNav();
    pendingCasinoEntry = !!isCasinoEntry;
    document.getElementById("age-modal").classList.add("show");
    telaAtiva = "modal-idade";
    modalIdadeIdx = 0;
    modalIdadeSetFoco(0);
  }

  function abrirCasinoEntrada() {
    showCasinoTicketEntry();
    irPara(TELA.CASINO);
  }

  function showCasinoTicketEntry() {
    var panel = document.getElementById("casino-ticket-panel");
    var grid = document.getElementById("casino-game-grid");
    var hero = document.getElementById("casino-hero");
    var hint = document.getElementById("casino-hint");
    casinoTicketUsado = false;
    if (hero) hero.classList.remove("compacted");
    if (hint) {
      hint.innerHTML =
        '<span class="key">ENTER</span> inserir ticket &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
    }
    if (panel) {
      panel.style.display = "flex";
      panel.classList.remove("used");
      panel.setAttribute("aria-hidden", "false");
    }
    if (grid) {
      grid.classList.remove("show");
      grid.classList.add("hidden");
      grid.setAttribute("aria-hidden", "true");
    }
    casinoFocusTicket();
  }

  function revealCasinoGames() {
    if (casinoTicketUsado) return;
    var panel = document.getElementById("casino-ticket-panel");
    var grid = document.getElementById("casino-game-grid");
    var hero = document.getElementById("casino-hero");
    var hint = document.getElementById("casino-hint");
    casinoTicketUsado = true;
    if (hero) hero.classList.add("compacted");
    if (hint) {
      hint.innerHTML =
        '<span class="key">&larr;</span><span class="key">&rarr;</span> navegar &nbsp;|&nbsp; <span class="key">ENTER</span> selecionar &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
    }
    if (panel) panel.classList.add("used");
    setTimeout(function () {
      if (panel) {
        panel.style.display = "none";
        panel.setAttribute("aria-hidden", "true");
      }
      if (grid) {
        grid.classList.remove("hidden");
        grid.classList.add("show");
        grid.setAttribute("aria-hidden", "false");
      }
      casinoSetFoco(0);
      somNav();
    }, 560);
  }

  document.getElementById("pg-casino").addEventListener("click", function () {
    abrirModalIdade(true);
  });

  getPgCards().forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      pgSetFoco(index);
    });
  });

  setTimeout(function () {
    pgSetFoco(0);
  }, 100);

  var slotBet = 10;
  var slotIdx = 0;
  function updateSlotBetUI() {
    var amt = document.getElementById("slot-bet-amount");
    if (amt) amt.textContent = "$" + slotBet;
    var btn = document.getElementById("btn-spin");
    if (btn) btn.textContent = "GIRAR -- $" + slotBet;
  }
  function slotsSetFoco(idx) {
    var controls = [
      document.getElementById("slot-bet-amount"),
      document.getElementById("btn-spin"),
    ];
    if (!controls[0] || !controls[1]) return;
    idx = ((idx % controls.length) + controls.length) % controls.length;
    controls.forEach(function (el) {
      el.classList.remove("kb-focus");
    });
    controls[idx].classList.add("kb-focus");
    slotIdx = idx;
  }
  function adjustSlotBet(delta) {
    slotBet = Math.max(10, Math.min(1000, slotBet + delta));
    updateSlotBetUI();
  }
  updateSlotBetUI();

  var casinoIdx = 0;
  function casinoFocusTicket() {
    var ticket = document.getElementById("btn-ticket");
    var ticketCard = ticket ? ticket.closest(".ticket-card") : null;
    getCasinoCards().forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    if (ticket) ticket.classList.add("kb-focus");
    if (ticketCard) ticketCard.classList.add("kb-focus");
  }
  function casinoBlurTicket() {
    var ticket = document.getElementById("btn-ticket");
    var ticketCard = ticket ? ticket.closest(".ticket-card") : null;
    if (ticket) ticket.classList.remove("kb-focus");
    if (ticketCard) ticketCard.classList.remove("kb-focus");
  }
  function casinoSetFocoInicial() {
    if (casinoTicketUsado) {
      casinoBlurTicket();
      casinoSetFoco(0);
    } else {
      casinoFocusTicket();
    }
  }
  function getCasinoCards() {
    var grid = document.getElementById("casino-game-grid");
    if (!grid || !grid.classList.contains("show")) return [];
    return Array.from(grid.querySelectorAll(".ccard"));
  }
  function casinoSetFoco(idx) {
    var cards = getCasinoCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    casinoBlurTicket();
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    casinoIdx = idx;
  }
  function casinoSelect() {
    if (!casinoTicketUsado) {
      somMoeda();
      revealCasinoGames();
      return;
    }
    var cards = getCasinoCards();
    var card = cards[casinoIdx];
    if (card) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  }
  Array.from(document.querySelectorAll("#casino-game-grid .ccard")).forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      casinoSetFoco(index);
    });
  });

  var rltIdx = 0;
  var rltControls = ["rlt-bet-input", "rc-red", "rc-black", "rc-green", "btn-spin-rlt"];
  function rltSetFoco(idx) {
    idx = ((idx % rltControls.length) + rltControls.length) % rltControls.length;
    rltControls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
    var el = document.getElementById(rltControls[idx]);
    if (!el) return;
    el.classList.add("kb-focus");
    if (rltControls[idx] !== "rlt-bet-input") {
      hideInputNumpad();
    }
    rltIdx = idx;
  }

  var crashIdx = 0;
  var crashControls = [
    "crash-bet-input",
    "crash-auto-toggle",
    "crash-auto-input",
    "btn-crash-bet",
    "btn-crash-out",
  ];
  function crashSetFoco(idx) {
    idx = ((idx % crashControls.length) + crashControls.length) % crashControls.length;
    crashControls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
    var el = document.getElementById(crashControls[idx]);
    if (!el) return;
    el.classList.add("kb-focus");
    if (crashControls[idx] !== "crash-bet-input" && crashControls[idx] !== "crash-auto-input") {
      hideInputNumpad();
    }
    crashIdx = idx;
  }

  var inputNumpadInput = null;
  var inputNumpadBuffer = "";
  var inputNumpadFresh = false;
  var SPECIAL_INPUTS = [
    "rlt-bet-input",
    "crash-bet-input",
    "crash-auto-input",
    "piggy-withdraw",
    "pomo-focus",
    "pomo-break",
  ];

  function isSpecialInput(el) {
    return el && el.tagName === "INPUT" && SPECIAL_INPUTS.indexOf(el.id) !== -1;
  }
  function clampNumber(value, min, max) {
    var n = parseFloat(value);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }
  function updateInputNumpadDisplay(input) {
    var label = "$0";
    if (!input) return;
    if (input.id === "crash-auto-input") {
      label = "×" + (input.value ? parseFloat(input.value).toFixed(1) : "0.0");
    } else if (input.id === "piggy-withdraw") {
      label = "R$ " + (input.value ? parseFloat(input.value).toFixed(2).replace(".", ",") : "0");
    } else if (input.id === "pomo-focus" || input.id === "pomo-break") {
      label = (input.value ? parseInt(input.value, 10) : 0) + " min";
    } else {
      label = "$" + (input.value ? parseInt(input.value, 10) : 0);
    }
    var el = document.getElementById("numpad-value");
    if (el) el.textContent = label;
  }
  function showInputNumpad(input) {
    var panel = document.getElementById("global-input-numpad");
    var alreadyOpen = panel && !panel.classList.contains("hidden") && inputNumpadInput === input;
    inputNumpadInput = input;
    if (!alreadyOpen) {
      inputNumpadBuffer = input.value || "";
      inputNumpadFresh = true;
    }
    updateInputNumpadDisplay(input);
    if (panel) panel.classList.remove("hidden");
  }
  function hideInputNumpad() {
    inputNumpadInput = null;
    inputNumpadFresh = false;
    var panel = document.getElementById("global-input-numpad");
    if (panel) panel.classList.add("hidden");
  }
  function getPresetValues(input) {
    if (!input) return [];
    if (input.id === "crash-auto-input") return [1.1, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0, 100.0];
    if (input.id === "piggy-withdraw") return [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100];
    if (input.id === "pomo-focus") return [5, 10, 15, 20, 25, 30, 45, 60, 90];
    if (input.id === "pomo-break") return [1, 3, 5, 10, 15, 20, 30];
    return [10, 20, 50, 100, 200, 500, 1000];
  }
  function settleSpecialInputValue(input, value) {
    if (!input) return;
    if (input.id === "crash-auto-input") {
      input.value = clampNumber(
        value,
        parseFloat(input.min) || 1.1,
        parseFloat(input.max) || 100,
      ).toFixed(1);
    } else if (input.id === "piggy-withdraw") {
      input.value = clampNumber(
        value,
        parseFloat(input.min) || 0,
        parseFloat(input.max) || 100000,
      ).toFixed(2);
    } else {
      input.value = Math.round(
        clampNumber(value, parseInt(input.min, 10) || 1, parseInt(input.max, 10) || 1000),
      );
    }
    inputNumpadBuffer = input.value;
    updateInputNumpadDisplay(input);
  }
  function adjustSpecialInputValue(input, delta) {
    if (!input) return;
    var options = getPresetValues(input);
    var current = parseFloat(input.value) || options[0];
    var closest = 0;
    for (var i = 0; i < options.length; i++) {
      if (options[i] === current) {
        closest = i;
        break;
      }
      if (options[i] > current) {
        closest = i;
        break;
      }
    }
    if (options[closest] !== current) {
      if (delta < 0) closest = Math.max(0, closest - 1);
    } else {
      closest = Math.max(0, Math.min(options.length - 1, closest + delta));
    }
    settleSpecialInputValue(input, options[closest]);
  }
  function applyNumpadBuffer(input) {
    if (!input) return;
    var raw = inputNumpadBuffer || "";
    if (input.id === "crash-auto-input" || input.id === "piggy-withdraw") {
      raw = raw.replace(/[^0-9.]/g, "");
      if ((raw.match(/\./g) || []).length > 1) {
        raw = raw.slice(0, raw.lastIndexOf("."));
      }
      if (raw.indexOf(".") >= 0) {
        var parts = raw.split(".");
        raw = parts[0] + "." + (parts[1] || "").slice(0, input.id === "piggy-withdraw" ? 2 : 1);
      }
      if (raw === "" || raw === ".") {
        input.value = "";
      } else {
        input.value = raw;
      }
    } else {
      raw = raw.replace(/\D/g, "");
      if (raw === "") {
        input.value = "";
      } else {
        input.value = Math.round(
          clampNumber(
            parseInt(raw, 10),
            parseInt(input.min, 10) || 1,
            parseInt(input.max, 10) || 1000,
          ),
        );
      }
    }
    inputNumpadBuffer = input.value || raw;
    updateInputNumpadDisplay(input);
  }
  function confirmSpecialInput(input) {
    if (!input) return;
    if (!input.value) {
      if (input.id === "piggy-withdraw") {
        settleSpecialInputValue(input, 0);
      } else {
      settleSpecialInputValue(
        input,
        parseFloat(input.min) || (input.id === "crash-auto-input" ? 1.1 : 10),
      );
      }
    } else if (input.id === "crash-auto-input") {
      settleSpecialInputValue(input, parseFloat(input.value));
    } else if (input.id === "piggy-withdraw") {
      if (input.value) settleSpecialInputValue(input, parseFloat(input.value));
    } else if (input.id === "pomo-focus" || input.id === "pomo-break") {
      if (input.value) settleSpecialInputValue(input, parseFloat(input.value));
      pomoReset();
    }
    if (input.id === "rlt-bet-input") {
      rltSetFoco(4);
    } else if (input.id === "piggy-withdraw") {
      piggySetFoco(4);
    } else if (input.id === "pomo-focus") {
      pomoSetFoco(5);
    } else if (input.id === "pomo-break") {
      pomoSetFoco(0);
    } else {
      crashSetFoco(3);
    }
    input.blur();
    hideInputNumpad();
  }
  function flashKeyHint(key) {
    var selector = '#key-feedback [data-key="' + key + '"]';
    var keyEl = document.querySelector(selector);
    if (keyEl) {
      keyEl.classList.add("active");
      setTimeout(function () {
        keyEl.classList.remove("active");
      }, 120);
    }
    var numpadKey = key.toLowerCase();
    if (numpadKey === "backspace") numpadKey = "backspace";
    if (numpadKey === "enter") numpadKey = "enter";
    var inputKey = document.querySelector('#global-input-numpad [data-key="' + numpadKey + '"]');
    if (inputKey) {
      inputKey.classList.add("active");
      setTimeout(function () {
        inputKey.classList.remove("active");
      }, 120);
    }
  }
  function handleSpecialInputKey(input, key) {
    if (!input) return false;
    if (key === "ArrowUp" || key === "ArrowDown") {
      inputNumpadFresh = false;
      adjustSpecialInputValue(input, key === "ArrowUp" ? 1 : -1);
      return true;
    }
    if (key === "Backspace") {
      inputNumpadFresh = false;
      inputNumpadBuffer = inputNumpadBuffer.slice(0, -1);
      applyNumpadBuffer(input);
      return true;
    }
    if (key === "Enter") {
      confirmSpecialInput(input);
      return true;
    }
    if (key === "Escape") {
      input.blur();
      hideInputNumpad();
      return true;
    }
    if (/^[0-9.]$/.test(key)) {
      if (key === "." && input.id !== "crash-auto-input" && input.id !== "piggy-withdraw") return false;
      if (inputNumpadFresh) {
        inputNumpadBuffer = key === "." ? "0" : "";
        inputNumpadFresh = false;
      }
      if (key === "." && inputNumpadBuffer.indexOf(".") !== -1) return true;
      inputNumpadBuffer += key;
      applyNumpadBuffer(input);
      return true;
    }
    return false;
  }

  function isCrashAutoEnabled() {
    var cb = document.getElementById("crash-auto-enabled");
    return !!(cb && cb.checked);
  }
  function syncCrashAutoToggle() {
    var cb = document.getElementById("crash-auto-enabled");
    var toggle = document.getElementById("crash-auto-toggle");
    if (!cb || !toggle) return;
    toggle.setAttribute("aria-checked", cb.checked ? "true" : "false");
    toggle.classList.toggle("auto-on", cb.checked);
    var grp = toggle.closest(".crash-input-grp");
    if (grp) grp.classList.toggle("auto-on", cb.checked);
  }
  var crashAutoToggle = document.getElementById("crash-auto-toggle");
  if (crashAutoToggle) {
    crashAutoToggle.addEventListener("click", function (e) {
      if (e) e.preventDefault();
      var cb = document.getElementById("crash-auto-enabled");
      if (!cb) return;
      cb.checked = !cb.checked;
      syncCrashAutoToggle();
      somNav();
    });
  }
  syncCrashAutoToggle();

  SPECIAL_INPUTS.forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.readOnly = true;
    input.addEventListener("focus", function () {
      showInputNumpad(input);
    });
    input.addEventListener("blur", function () {
      setTimeout(function () {
        if (document.activeElement && isSpecialInput(document.activeElement)) return;
        hideInputNumpad();
      }, 120);
    });
  });

  var numpadOverlay = document.getElementById("global-input-numpad");
  if (numpadOverlay) {
    numpadOverlay.addEventListener("click", function (e) {
      var button = e.target.closest(".numpad-key");
      if (!button || !inputNumpadInput) return;
      var key = button.dataset.key;
      if (!key) return;
      var physical = key === "backspace" ? "Backspace" : key === "enter" ? "Enter" : key;
      handleSpecialInputKey(inputNumpadInput, physical);
      flashKeyHint(physical);
      inputNumpadInput.focus();
    });
  }

  /* Controle de teclado do modal de idade */
  var modalIdadeIdx = 0; // 0 = SIM, 1 = NAO

  function modalIdadeSetFoco(idx) {
    var btns = [document.getElementById("age-yes"), document.getElementById("age-no")];
    btns.forEach(function (b) {
      b.classList.remove("kb-focus");
    });
    btns[idx].classList.add("kb-focus");
    modalIdadeIdx = idx;
  }

  document.getElementById("age-yes").addEventListener("mouseenter", function () {
    modalIdadeSetFoco(0);
  });
  document.getElementById("age-no").addEventListener("mouseenter", function () {
    modalIdadeSetFoco(1);
  });

  /* =====================================================================
   ARCADE HUB
   ===================================================================== */
  var btnCoin = document.getElementById("btn-coin");
  var hubHint = document.getElementById("hub-hint");
  var gameGrid = document.getElementById("game-grid");
  var mCoin = document.getElementById("mario-coin");
  var arcHero = document.getElementById("arc-hero");
  var coinUsada = false;
  var hubIdx = 0;

  function getHubCards() {
    return Array.from(document.querySelectorAll("#game-grid .gcard"));
  }

  function hubSetFoco(idx) {
    var cards = getHubCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    hubIdx = idx;
  }

  function hubSelect() {
    var cards = getHubCards();
    var card = cards[hubIdx];
    if (card) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  }

  function inserirMoeda() {
    if (coinUsada) return;
    coinUsada = true;
    somMoeda();
    btnCoin.classList.add("kb-sel");
    var r = btnCoin.getBoundingClientRect();
    mCoin.style.left = r.left + r.width / 2 - 26 + "px";
    mCoin.style.top = r.top + r.height / 2 - 26 + "px";
    mCoin.style.opacity = "1";
    mCoin.classList.remove("coin-rise");
    void mCoin.offsetWidth;
    mCoin.classList.add("coin-rise");
    setTimeout(function () {
      btnCoin.classList.add("gone");
      arcHero.classList.add("compacted");
      gameGrid.classList.add("show");
      hubHint.classList.add("show");
      setTimeout(function () {
        hubSetFoco(0);
        somNav();
      }, 380);
    }, 870);
  }

  function resetArcade() {
    coinUsada = false;
    if (btnCoin) {
      btnCoin.classList.remove("gone", "kb-sel");
    }
    if (arcHero) {
      arcHero.classList.remove("compacted");
    }
    if (gameGrid) {
      gameGrid.classList.remove("show");
    }
    if (hubHint) {
      hubHint.classList.remove("show");
    }
  }

  btnCoin.addEventListener("click", inserirMoeda);

  document.getElementById("game-grid").addEventListener("click", function (e) {
    var card = e.target.closest(".gcard");
    if (card && coinUsada) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  });

  var arcadeGamesIdx = 0;
  var arcadeGamesBooted = false;
  var arcadeGamesAnimating = false;
  function getArcadeGamesCards() {
    return Array.from(document.querySelectorAll("#arcade-games-grid .gcard"));
  }
  function arcadeGamesClearFoco() {
    getArcadeGamesCards().forEach(function (c) { c.classList.remove("kb-focus"); });
  }
  function arcadeGamesShowEntry() {
    var hero = document.getElementById("arcade-games-hero");
    var panel = document.getElementById("arcade-boot-panel");
    var grid = document.getElementById("arcade-games-grid");
    var entryHint = document.getElementById("arcade-games-entry-hint");
    var playHint = document.getElementById("arcade-games-play-hint");
    var btn = document.getElementById("arcade-power-btn");
    if (hero) hero.classList.remove("compacted");
    if (panel) panel.classList.remove("gone", "booting");
    if (grid) {
      grid.classList.remove("show");
      grid.setAttribute("aria-hidden", "true");
    }
    if (entryHint) entryHint.classList.add("show");
    if (playHint) playHint.classList.remove("show");
    if (btn) btn.classList.add("kb-focus");
    arcadeGamesClearFoco();
  }
  function arcadeGamesShowGrid() {
    var hero = document.getElementById("arcade-games-hero");
    var panel = document.getElementById("arcade-boot-panel");
    var grid = document.getElementById("arcade-games-grid");
    var entryHint = document.getElementById("arcade-games-entry-hint");
    var playHint = document.getElementById("arcade-games-play-hint");
    var btn = document.getElementById("arcade-power-btn");
    if (hero) hero.classList.add("compacted");
    if (panel) panel.classList.add("gone");
    if (grid) {
      grid.classList.add("show");
      grid.setAttribute("aria-hidden", "false");
    }
    if (entryHint) entryHint.classList.remove("show");
    if (playHint) playHint.classList.add("show");
    if (btn) btn.classList.remove("kb-focus");
    arcadeGamesSetFoco(arcadeGamesIdx);
  }
  function arcadeGamesEnter() {
    if (arcadeGamesBooted) arcadeGamesShowGrid();
    else arcadeGamesShowEntry();
  }
  function arcadeGamesReveal() {
    var panel = document.getElementById("arcade-boot-panel");
    var entryHint = document.getElementById("arcade-games-entry-hint");
    if (arcadeGamesBooted || arcadeGamesAnimating) return;
    arcadeGamesAnimating = true;
    arcadeGamesBooted = true;
    somMoeda();
    if (entryHint) entryHint.classList.remove("show");
    if (panel) panel.classList.add("booting");
    setTimeout(function () {
      arcadeGamesAnimating = false;
      if (telaAtiva !== TELA.ARCADE_GAMES || !arcadeGamesBooted) return;
      arcadeGamesIdx = 0;
      arcadeGamesShowGrid();
    }, 1260);
  }
  function arcadeGamesSetFoco(idx) {
    var cards = getArcadeGamesCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) { c.classList.remove("kb-focus"); });
    cards[idx].classList.add("kb-focus");
    arcadeGamesIdx = idx;
  }
  function arcadeGamesSelect() {
    if (!arcadeGamesBooted || arcadeGamesAnimating) return;
    var cards = getArcadeGamesCards();
    var card = cards[arcadeGamesIdx];
    if (!card) return;
    var goto = card.getAttribute("data-goto");
    if (goto) {
      somNav();
      irPara(goto);
    }
  }
  document.getElementById("arcade-games-grid").addEventListener("click", function (e) {
    if (!arcadeGamesBooted || arcadeGamesAnimating) return;
    var card = e.target.closest(".gcard");
    if (!card) return;
    var goto = card.getAttribute("data-goto");
    if (goto) {
      somNav();
      irPara(goto);
    }
  });
  getArcadeGamesCards().forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      if (!arcadeGamesBooted) return;
      arcadeGamesSetFoco(index);
    });
  });
  var arcadePowerBtn = document.getElementById("arcade-power-btn");
  if (arcadePowerBtn) {
    arcadePowerBtn.addEventListener("click", function () {
      arcadeGamesReveal();
    });
  }

  /* =====================================================================
   MULTIPLAYER HUB
   ===================================================================== */
  var multiplayerIdx = 0;

  function getMultiplayerCards() {
    return Array.from(document.querySelectorAll("#multiplayer-grid .gcard"));
  }

  function multiplayerSetFoco(idx) {
    var cards = getMultiplayerCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (card) {
      card.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    multiplayerIdx = idx;
  }

  function multiplayerSelect() {
    var cards = getMultiplayerCards();
    var card = cards[multiplayerIdx];
    var goto = card && card.getAttribute("data-goto");
    if (!goto) return;
    somNav();
    irPara(goto);
  }

  var multiplayerGrid = document.getElementById("multiplayer-grid");
  if (multiplayerGrid) {
    multiplayerGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".gcard");
      var goto = card && card.getAttribute("data-goto");
      if (!goto) return;
      somNav();
      irPara(goto);
    });
  }
  getMultiplayerCards().forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      multiplayerSetFoco(index);
    });
  });

  /* =====================================================================
   UNDERTALE MULTIPLAYER -- Cliente Socket.IO
   ===================================================================== */
  var UTM = {
    socket: null,
    socketUrl: "",
    selfId: "",
    room: null,
    state: null,
    raf: null,
    t: 0,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      dash: false,
      attack: false,
      pattern1: false,
      pattern2: false,
    },
    pulse: {
      dash: false,
      attack: false,
      pattern1: false,
      pattern2: false,
    },
    phaser: null,
    phaserScene: null,
    menuIdx: 0,
    carouselRaf: null,
    renderCache: {},
    stateBuffer: [],
    renderDelay: 100,
    bufferKey: "",
    hpMemory: {},
    hitFx: {},
  };

  function utmEl(id) {
    return document.getElementById(id);
  }

  function utmSetStatus(message, kind) {
    var el = utmEl("utm-status");
    if (!el) return;
    el.textContent = message;
    el.setAttribute("data-kind", kind || "");
  }

  function utmGetName() {
    var el = utmEl("utm-player-name");
    return el && el.value.trim() ? el.value.trim() : "Jogador";
  }

  function utmGetRoomCode() {
    var el = utmEl("utm-room-code");
    return el ? el.value.trim().toUpperCase() : "";
  }

  function utmGetServerUrl() {
    var el = utmEl("utm-server-url");
    return el ? el.value.trim().replace(/\/$/, "") : "";
  }

  function utmSetConnectionBadge(text, online) {
    var badge = utmEl("utm-connection-badge");
    if (!badge) return;
    badge.textContent = text;
    badge.classList.toggle("online", !!online);
  }

  var UTM_MENU_CONTROLS = [
    "utm-server-url",
    "utm-player-name",
    "utm-create-room",
    "utm-room-code",
    "utm-join-room",
    "utm-start-game",
  ];

  function utmGetMenuControls() {
    return UTM_MENU_CONTROLS.map(function (id) {
      return utmEl(id);
    }).filter(function (el) {
      return !!el && !el.disabled;
    });
  }

  function utmSetMenuFocus(idx) {
    var controls = utmGetMenuControls();
    if (!controls.length) return;
    idx = ((idx % controls.length) + controls.length) % controls.length;
    controls.forEach(function (el) {
      el.classList.remove("kb-focus");
    });
    controls[idx].classList.add("kb-focus");
    UTM.menuIdx = idx;
  }

  function utmGetFocusedMenuControl() {
    var controls = utmGetMenuControls();
    return controls[UTM.menuIdx] || null;
  }

  function utmFocusControl(id) {
    var controls = utmGetMenuControls();
    var idx = controls.findIndex(function (el) {
      return el.id === id;
    });
    utmSetMenuFocus(idx >= 0 ? idx : 0);
  }

  function utmConfirmTextField(input, nextId) {
    if (!input) return;
    input.blur();
    if (input.id === "utm-player-name") {
      utmEmit("utm:set-name", { name: utmGetName() });
    }
    setTimeout(function () {
      utmFocusControl(nextId || "utm-create-room");
    }, 0);
  }

  function utmActivateFocusedControl() {
    var controls = utmGetMenuControls();
    var el = controls[UTM.menuIdx];
    if (!el) {
      utmSetMenuFocus(0);
      return;
    }
    if (el.tagName === "INPUT") {
      el.focus();
      if (typeof el.select === "function") el.select();
      return;
    }
    el.click();
  }

  function utmSetActionFocus(delta) {
    utmSetMenuFocus(UTM.menuIdx + delta);
  }

  function utmConnect() {
    var url = utmGetServerUrl();
    if (!window.io) {
      utmSetStatus("Socket.IO Client nao foi carregado. Rode pelo servidor Node.", "error");
      utmSetConnectionBadge("SEM IO", false);
      return null;
    }

    if (UTM.socket && UTM.socketUrl === url) return UTM.socket;
    if (UTM.socket) UTM.socket.disconnect();

    UTM.socketUrl = url;
    UTM.socket = url
      ? window.io(url, { transports: ["websocket", "polling"], reconnection: true })
      : window.io({ transports: ["websocket", "polling"], reconnection: true });

    UTM.socket.on("connect", function () {
      UTM.selfId = UTM.socket.id;
      utmSetConnectionBadge("ONLINE", true);
      utmSetStatus("Servidor conectado. Crie ou entre em uma sala.", "ok");
      UTM.socket.emit("utm:set-name", { name: utmGetName() });
    });

    UTM.socket.on("disconnect", function () {
      utmSetConnectionBadge("OFFLINE", false);
      utmSetStatus("Conexao perdida com o servidor.", "error");
    });

    UTM.socket.on("utm:hello", function (payload) {
      UTM.selfId = payload && payload.selfId ? payload.selfId : UTM.selfId;
    });

    UTM.socket.on("utm:joined", function (payload) {
      if (payload && payload.roomId) {
        var codeInput = utmEl("utm-room-code");
        if (codeInput) codeInput.value = payload.roomId;
        utmSetStatus("Sala " + payload.roomId + " conectada.", "ok");
      }
    });

    UTM.socket.on("utm:room", function (room) {
      UTM.room = room;
      utmRenderRoom();
    });

    UTM.socket.on("utm:state", function (state) {
      utmTrackDamage(state);
      UTM.state = state;
      utmPushStateSnapshot(state);
      utmRenderStateHud();
    });

    UTM.socket.on("utm:damage", function (payload) {
      utmTriggerDamage(payload);
    });

    UTM.socket.on("utm:error", function (payload) {
      somErro();
      utmSetStatus((payload && payload.message) || "Erro multiplayer.", "error");
    });

    return UTM.socket;
  }

  function utmEmit(eventName, payload) {
    var socket = utmConnect();
    if (!socket) return;
    var send = function () {
      socket.emit(eventName, payload || {});
    };
    if (socket.connected) send();
    else socket.once("connect", send);
  }

  function utmCreateRoom() {
    somNav();
    utmEmit("utm:create-room", { name: utmGetName() });
  }

  function utmJoinRoom() {
    var roomId = utmGetRoomCode();
    if (!roomId) {
      somErro();
      utmSetStatus("Digite o codigo da sala.", "error");
      return;
    }
    somNav();
    utmEmit("utm:join-room", { roomId: roomId, name: utmGetName() });
  }

  function utmChooseRole(role) {
    somNav();
    utmEmit("utm:choose-role", { role: role });
  }

  function utmStartGame() {
    somNav();
    utmEmit("utm:start-game");
  }

  function utmLeaveRoom() {
    utmResetKeys();
    if (UTM.socket && UTM.socket.connected) {
      UTM.socket.emit("utm:leave-room");
    }
    UTM.room = null;
    UTM.state = null;
    UTM.renderCache = {};
    UTM.stateBuffer = [];
    UTM.bufferKey = "";
    UTM.hpMemory = {};
    UTM.hitFx = {};
    utmRenderRoom();
    utmRenderStateHud();
  }

  function utmGetSelf() {
    if (!UTM.room || !UTM.room.players) return null;
    return UTM.room.players.find(function (player) {
      return player.id === UTM.selfId;
    }) || null;
  }

  function utmGetSelfLive() {
    if (!UTM.state || !UTM.selfId) return utmGetSelf();
    if (UTM.state.boss && UTM.state.boss.id === UTM.selfId) return UTM.state.boss;
    var souls = UTM.state.souls || [];
    return souls.find(function (player) { return player.id === UTM.selfId; }) || utmGetSelf();
  }

  function utmCooldownLabel(value) {
    return value > 0 ? value.toFixed(1) + "s" : "OK";
  }

  function utmTrackDamage(state) {
    if (!state || state.status !== "playing") {
      if (state && state.status !== "ended") UTM.hpMemory = {};
      return;
    }
    var now = performance.now();
    var actors = [];
    if (state.boss) actors.push({ actor: state.boss, kind: "boss", color: "#ff4040" });
    (state.souls || []).forEach(function (soul, index) {
      actors.push({ actor: soul, kind: "soul", color: utmSoulColor(index, soul) });
    });
    actors.forEach(function (entry) {
      var actor = entry.actor;
      if (!actor || !actor.id) return;
      var previous = UTM.hpMemory[actor.id];
      if (typeof previous === "number" && actor.hp < previous) {
        utmTriggerDamage({
          targetId: actor.id,
          targetRole: entry.kind,
          color: entry.color,
        });
      }
      UTM.hpMemory[actor.id] = actor.hp;
    });
  }

  function utmTriggerDamage(payload) {
    if (!payload || !payload.targetId) return;
    var now = performance.now();
    var kind = payload.targetRole || "soul";
    UTM.hitFx[payload.targetId] = {
      start: now,
      until: now + (kind === "boss" ? 460 : 360),
      color: payload.color || (kind === "boss" ? "#ff4040" : "#00f5c4"),
      kind: kind,
    };
  }

  function utmHitPower(id) {
    var fx = id && UTM.hitFx[id];
    if (!fx) return 0;
    var now = performance.now();
    if (now >= fx.until) {
      delete UTM.hitFx[id];
      return 0;
    }
    return 1 - (now - fx.start) / (fx.until - fx.start);
  }

  function utmHitShake(id, amount) {
    var power = utmHitPower(id);
    if (!power) return 0;
    return Math.round(Math.sin(UTM.t * 1.9) * amount * power);
  }

  function utmSoulColor(index, soul) {
    var palette = ["#ff4040", "#00f5c4", "#ffee44", "#9d5cff"];
    return (soul && soul.color) || palette[index % palette.length];
  }

  function utmCloneState(state) {
    if (!state) return null;
    if (typeof structuredClone === "function") return structuredClone(state);
    return JSON.parse(JSON.stringify(state));
  }

  function utmStateBufferKey(state) {
    if (!state) return "";
    return [state.roomId || "", state.status || "", state.winner || ""].join(":");
  }

  function utmPushStateSnapshot(state) {
    if (!state) {
      UTM.stateBuffer = [];
      UTM.bufferKey = "";
      return;
    }

    var key = utmStateBufferKey(state);
    if (key !== UTM.bufferKey) {
      UTM.stateBuffer = [];
      UTM.renderCache = {};
      UTM.bufferKey = key;
    }

    UTM.stateBuffer.push({
      at: performance.now(),
      state: utmCloneState(state),
    });

    if (UTM.stateBuffer.length > 8) UTM.stateBuffer.splice(0, UTM.stateBuffer.length - 8);
  }

  function utmLerp(a, b, t) {
    return a + (b - a) * t;
  }

  function utmById(list) {
    var map = {};
    (list || []).forEach(function (item) {
      if (item && item.id != null) map[item.id] = item;
    });
    return map;
  }

  function utmInterpolateEntity(previous, next, alpha, maxSnap) {
    if (!next) return null;
    if (!previous || previous.id !== next.id) return utmCloneState(next);

    var dx = next.x - previous.x;
    var dy = next.y - previous.y;
    if (Math.hypot(dx, dy) > maxSnap) return utmCloneState(next);

    var copy = utmCloneState(next);
    copy.x = utmLerp(previous.x, next.x, alpha);
    copy.y = utmLerp(previous.y, next.y, alpha);
    if (typeof previous.vx === "number" && typeof next.vx === "number") copy.vx = utmLerp(previous.vx, next.vx, alpha);
    if (typeof previous.vy === "number" && typeof next.vy === "number") copy.vy = utmLerp(previous.vy, next.vy, alpha);
    return copy;
  }

  function utmInterpolateState(previous, next, alpha) {
    if (!previous || !next || previous.status !== next.status || previous.roomId !== next.roomId) {
      return utmCloneState(next || previous);
    }

    var render = utmCloneState(next);
    render.boss = utmInterpolateEntity(previous.boss, next.boss, alpha, 140);

    var prevSouls = utmById(previous.souls);
    render.souls = (next.souls || []).map(function (soul) {
      return utmInterpolateEntity(prevSouls[soul.id], soul, alpha, 120);
    });

    var prevBullets = utmById(previous.bullets);
    render.bullets = (next.bullets || []).map(function (bullet) {
      return utmInterpolateEntity(prevBullets[bullet.id], bullet, alpha, 180);
    });

    return render;
  }

  function utmGetRenderState() {
    if (!UTM.state) return null;
    var buffer = UTM.stateBuffer;
    if (!buffer || buffer.length < 2) return UTM.state;

    var renderAt = performance.now() - UTM.renderDelay;
    while (buffer.length > 2 && buffer[1].at <= renderAt) buffer.shift();

    var previous = buffer[0];
    var next = buffer[1];
    if (!previous || !next) return UTM.state;

    if (renderAt <= previous.at) return previous.state;
    if (renderAt >= next.at) return next.state;

    var span = Math.max(1, next.at - previous.at);
    var alpha = Math.max(0, Math.min(1, (renderAt - previous.at) / span));
    return utmInterpolateState(previous.state, next.state, alpha);
  }

  function utmSmoothBoss(boss) {
    return boss || null;
  }

  function utmSmoothSoul(soul) {
    return soul || null;
  }

  function utmSmoothBullet(bullet) {
    return bullet || null;
  }

  function utmGetMode() {
    var status = (UTM.state && UTM.state.status) || (UTM.room && UTM.room.status) || "lobby";
    if (status === "playing") return "playing";
    if (status === "ended") return "ended";
    if (status === "selecting") return "selecting";
    return "lobby";
  }

  function utmSyncMode() {
    var screen = utmEl("undertale-multiplayer");
    if (!screen) return;
    var mode = utmGetMode();
    screen.classList.remove("utm-mode-lobby", "utm-mode-selecting", "utm-mode-playing", "utm-mode-ended");
    screen.classList.add("utm-mode-" + mode);
  }

  function utmGetSelection() {
    return (UTM.room && UTM.room.selection) || (UTM.state && UTM.state.selection) || null;
  }

  function utmSelectionName(id) {
    var selection = utmGetSelection();
    var order = selection && selection.order ? selection.order : [];
    var match = order.find(function (player) { return player.id === id; });
    if (match) return match.name;
    if (UTM.room && UTM.room.players) {
      match = UTM.room.players.find(function (player) { return player.id === id; });
      if (match) return match.name;
    }
    return "Boss";
  }

  function utmStopCarousel() {
    if (UTM.carouselRaf) cancelAnimationFrame(UTM.carouselRaf);
    UTM.carouselRaf = null;
  }

  function utmRenderCarouselFrame() {
    var track = utmEl("utm-carousel-track");
    var result = utmEl("utm-carousel-result");
    var selection = utmGetSelection();
    if (!track || !selection || !selection.order || !selection.order.length) {
      if (track) track.innerHTML = "";
      if (result) result.textContent = "Aguardando jogadores...";
      utmStopCarousel();
      return;
    }

    var elapsed = Math.max(0, Date.now() - selection.startedAt);
    var duration = selection.durationMs || 4200;
    var done = elapsed >= duration;
    var names = selection.order;
    var finalIndex = names.findIndex(function (player) { return player.id === selection.selectedBossId; });
    if (finalIndex < 0) finalIndex = 0;

    var progress = Math.min(1, elapsed / duration);
    var spin = Math.floor(progress * progress * names.length * 12);
    var centerIndex = done ? finalIndex : spin % names.length;
    track.innerHTML = "";

    for (var offset = -2; offset <= 2; offset++) {
      var player = names[(centerIndex + offset + names.length * 10) % names.length];
      var card = document.createElement("div");
      card.className = "utm-carousel-card" + (offset === 0 ? " center" : "");
      card.textContent = player.name + (player.host ? " HOST" : "");
      track.appendChild(card);
    }

    if (result) {
      result.textContent = done
        ? utmSelectionName(selection.selectedBossId) + " virou o Boss"
        : "Girando...";
    }

    if (!done && utmGetMode() === "selecting") {
      UTM.carouselRaf = requestAnimationFrame(utmRenderCarouselFrame);
    } else {
      UTM.carouselRaf = null;
    }
  }

  function utmStartCarousel() {
    if (UTM.carouselRaf) return;
    utmRenderCarouselFrame();
  }

  function utmRenderRoom() {
    var room = UTM.room;
    var code = room && room.id ? room.id : "----";
    var currentRoom = utmEl("utm-current-room");
    var heroRoom = utmEl("utm-hero-room-code");
    var roomPill = utmEl("utm-room-pill");
    var roster = utmEl("utm-roster");
    var count = utmEl("utm-player-count");
    utmSyncMode();
    if (currentRoom) currentRoom.textContent = code;
    if (heroRoom) heroRoom.textContent = code;
    if (roomPill) roomPill.textContent = code;
    if (count) count.textContent = room && room.players ? room.players.length + "/5" : "0/5";
    if (roster) {
      roster.innerHTML = "";
      if (!room || !room.players || !room.players.length) {
        var empty = document.createElement("div");
        empty.className = "utm-roster-empty";
        empty.textContent = "Nenhum jogador na sala.";
        roster.appendChild(empty);
      } else {
        room.players.forEach(function (player) {
          var row = document.createElement("div");
          row.className = "utm-roster-row " + (player.role || "none");
          if (player.id === UTM.selfId) row.classList.add("self");
          var name = document.createElement("strong");
          name.textContent = player.name + (player.id === room.hostId ? " HOST" : "");
          var meta = document.createElement("span");
          if (room.status === "selecting") meta.textContent = "NO SORTEIO";
          else if (player.role === "boss") meta.textContent = "BOSS HP " + player.hp + "/" + player.maxHp;
          else if (player.role === "soul") meta.textContent = "ALMA HP " + player.hp;
          else meta.textContent = "AGUARDANDO";
          row.appendChild(name);
          row.appendChild(meta);
          roster.appendChild(row);
        });
      }
    }

    if (utmGetMode() === "selecting") utmStartCarousel();
    else utmStopCarousel();
    utmSetMenuFocus(UTM.menuIdx);
  }

  function utmRenderStateHud() {
    var state = UTM.state;
    var time = utmEl("utm-time-pill");
    var bossName = utmEl("utm-boss-name");
    var result = utmEl("utm-result");
    var dialog = utmEl("utm-dialog-text");
    utmSyncMode();

    if (time) time.textContent = state && state.boss ? state.boss.hp + "/" + state.boss.maxHp : "--";
    if (bossName) bossName.textContent = state && state.boss ? state.boss.name : "AGUARDANDO";

    if (!state) {
      if (result) result.textContent = "LOBBY";
      if (dialog) dialog.textContent = "Crie uma sala, espere os jogadores e inicie o sorteio do Boss.";
      return;
    }

    if (state.status === "selecting") {
      if (result) result.textContent = "SORTEIO";
      if (dialog) dialog.textContent = "O Boss esta sendo sorteado.";
      utmStartCarousel();
      return;
    }

    if (state.status === "playing") {
      if (result) result.textContent = "PARTIDA";
      var self = utmGetSelf();
      if (dialog) {
        if (self && self.role === "boss") dialog.textContent = "Boss: WASD/setas movem e miram. Z tiro, X leque, C ossos.";
        else if (self && self.role === "soul") dialog.textContent = "Alma: WASD/setas desviam. Z atira, Shift da dash.";
        else dialog.textContent = "Partida em andamento.";
      }
      utmStopCarousel();
      return;
    }

    if (state.status === "ended") {
      if (result) result.textContent = state.winner === "boss" ? "BOSS VENCEU" : "ALMAS VENCERAM";
      if (dialog) {
        dialog.textContent =
          state.winner === "boss"
            ? "Todas as Almas foram derrotadas."
            : "As Almas derrotaram o Boss.";
      }
      utmStopCarousel();
      return;
    }

    if (result) result.textContent = "LOBBY";
    utmStopCarousel();
  }

  function utmResetKeys() {
    Object.keys(UTM.keys).forEach(function (key) {
      UTM.keys[key] = false;
    });
    Object.keys(UTM.pulse).forEach(function (key) {
      UTM.pulse[key] = false;
    });
    utmSendInput(true);
  }

  function utmKeyTargetIsText(target) {
    return (
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    );
  }

  function utmSetKey(key, isDown) {
    var k = String(key || "").toLowerCase();
    var handled = true;
    if (k === "arrowup" || k === "w") UTM.keys.up = isDown;
    else if (k === "arrowdown" || k === "s") UTM.keys.down = isDown;
    else if (k === "arrowleft" || k === "a") UTM.keys.left = isDown;
    else if (k === "arrowright" || k === "d") UTM.keys.right = isDown;
    else if (k === "shift") UTM.keys.dash = isDown;
    else if (k === "z" || k === " " || k === "spacebar") UTM.keys.attack = isDown;
    else if (k === "x") UTM.keys.pattern1 = isDown;
    else if (k === "c") UTM.keys.pattern2 = isDown;
    else handled = false;
    return handled;
  }

  function utmBuildInput() {
    var self = utmGetSelf();
    var payload = {
      up: UTM.keys.up,
      down: UTM.keys.down,
      left: UTM.keys.left,
      right: UTM.keys.right,
      dash: UTM.keys.dash || UTM.pulse.dash,
      attack: UTM.keys.attack || UTM.pulse.attack,
      pattern1: UTM.keys.pattern1 || UTM.pulse.pattern1,
      pattern2: UTM.keys.pattern2 || UTM.pulse.pattern2,
    };

    if (!self || self.role !== "boss") {
      payload.pattern1 = false;
      payload.pattern2 = false;
    }
    if (!self || self.role !== "soul") {
      payload.dash = false;
    }
    return payload;
  }

  function utmSendInput(force) {
    if (!UTM.socket || !UTM.socket.connected) return;
    if (!UTM.state || UTM.state.status !== "playing") {
      if (!force) return;
    }
    UTM.socket.emit("utm:input", utmBuildInput());
    UTM.pulse.dash = false;
    UTM.pulse.attack = false;
    UTM.pulse.pattern1 = false;
    UTM.pulse.pattern2 = false;
  }

  function utmPulseAction(action) {
    if (!Object.prototype.hasOwnProperty.call(UTM.pulse, action)) return;
    UTM.pulse[action] = true;
    utmSendInput(true);
  }

  setInterval(function () {
    utmSendInput(false);
  }, 50);

  function utmHeartPath(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.2);
    ctx.bezierCurveTo(cx, cy - s, cx - s * 1.1, cy - s, cx - s * 1.1, cy - s * 0.2);
    ctx.bezierCurveTo(cx - s * 1.1, cy + s * 0.4, cx, cy + s * 0.9, cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx + s * 1.1, cy + s * 0.4, cx + s * 1.1, cy - s * 0.2, cx + s * 1.1, cy - s * 0.2);
    ctx.bezierCurveTo(cx + s * 1.1, cy - s, cx, cy - s, cx, cy - s * 0.2);
    ctx.closePath();
  }

  function utmDrawBossHpBarCanvas(ctx, state, w) {
    if (!state || !state.boss) return;
    var boss = state.boss;
    var souls = state.souls || [];
    var pct = boss.maxHp ? Math.max(0, Math.min(1, boss.hp / boss.maxHp)) : 0;
    var barW = Math.min(w - 70, 280 + souls.length * 68);
    var x = (w - barW) / 2;
    var y = 22;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.76)";
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, barW, 22);
    ctx.strokeRect(x, y, barW, 22);
    var grad = ctx.createLinearGradient(x, y, x + barW, y);
    grad.addColorStop(0, "#ff4040");
    grad.addColorStop(0.55, "#ff8844");
    grad.addColorStop(1, "#ffee44");
    ctx.fillStyle = grad;
    ctx.fillRect(x + 3, y + 3, Math.max(0, (barW - 6) * pct), 16);
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText((boss.name || "BOSS") + " HP " + boss.hp + "/" + boss.maxHp, w / 2, y + 15);
    ctx.restore();
  }

  function utmDrawDamagePixels(ctx, x, y, color, power, scale) {
    if (!power) return;
    scale = scale || 1;
    ctx.save();
    ctx.globalAlpha = Math.min(1, power + 0.1);
    ctx.shadowColor = color || "#ffffff";
    ctx.shadowBlur = 10 * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 28 * scale, y - 22 * scale, 7 * scale, 7 * scale);
    ctx.fillRect(x + 21 * scale, y - 30 * scale, 6 * scale, 6 * scale);
    ctx.fillRect(x + 30 * scale, y + 10 * scale, 8 * scale, 5 * scale);
    ctx.fillRect(x - 36 * scale, y + 14 * scale, 6 * scale, 6 * scale);
    ctx.fillStyle = color || "#ff4040";
    ctx.fillRect(x - 18 * scale, y - 34 * scale, 5 * scale, 5 * scale);
    ctx.fillRect(x + 12 * scale, y + 24 * scale, 5 * scale, 5 * scale);
    ctx.restore();
  }

  function utmDrawBoss(ctx, boss) {
    if (!boss) return;
    ctx.save();
    var hitPower = utmHitPower(boss.id);
    var hitFlash = hitPower > 0 && Math.floor(UTM.t / 2) % 2 === 0;
    ctx.translate(boss.x + utmHitShake(boss.id, 5), boss.y);
    var bob = Math.sin(UTM.t * 0.07) * 3;
    ctx.translate(0, bob);
    ctx.shadowColor = hitFlash ? "#ffffff" : "#ff4040";
    ctx.shadowBlur = hitPower ? 28 : 16;
    ctx.fillStyle = hitFlash ? "#ffffff" : "#241022";
    ctx.fillRect(-32, -8, 64, 56);
    ctx.fillStyle = hitFlash ? "#ffb0b0" : "#d8d4ff";
    ctx.fillRect(-28, -48, 56, 44);
    ctx.fillStyle = hitFlash ? "#05030e" : "#ff4040";
    ctx.fillRect(-18, -32, 12, 12);
    ctx.fillRect(6, -32, 12, 12);
    ctx.fillStyle = "#05030e";
    ctx.fillRect(-14, -28, 5, 5);
    ctx.fillRect(10, -28, 5, 5);
    ctx.fillStyle = "#ff8844";
    ctx.fillRect(-48, 8, 18, 12);
    ctx.fillRect(30, 8, 18, 12);
    ctx.fillStyle = "#ffee44";
    ctx.fillRect(-44, 11, 10, 6);
    ctx.fillRect(34, 11, 10, 6);
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText(boss.name || "BOSS", 0, 66);
    utmDrawDamagePixels(ctx, 0, 0, "#ff4040", hitPower, 1);
    ctx.restore();
  }

  function utmDrawSoul(ctx, soul, index) {
    ctx.save();
    ctx.globalAlpha = soul.alive ? (soul.invuln > 0 ? 0.48 + Math.sin(UTM.t * 0.5) * 0.24 : 1) : 0.28;
    var color = utmSoulColor(index, soul);
    var bob = Math.sin(UTM.t * 0.08 + index) * 2;
    var hitPower = utmHitPower(soul.id);
    var hitFlash = hitPower > 0 && Math.floor(UTM.t / 2) % 2 === 0;
    var x = Math.round(soul.x + utmHitShake(soul.id, 4));
    var y = Math.round(soul.y + bob);
    ctx.shadowColor = hitFlash ? "#ffffff" : color;
    ctx.shadowBlur = hitPower ? 24 : soul.alive ? 14 : 0;
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.fillRect(x - 8, y - 16, 16, 4);
    ctx.fillRect(x - 14, y - 10, 4, 18);
    ctx.fillRect(x + 10, y - 10, 4, 18);
    ctx.fillRect(x - 8, y + 10, 16, 4);
    ctx.fillStyle = hitFlash ? "#ffffff" : color;
    ctx.fillRect(x - 10, y - 12, 20, 6);
    ctx.fillRect(x - 14, y - 6, 28, 12);
    ctx.fillRect(x - 10, y + 6, 20, 8);
    ctx.fillRect(x - 4, y + 14, 8, 5);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x - 6, y - 8, 12, 4);
    ctx.fillRect(x - 3, y - 3, 6, 8);
    ctx.fillStyle = "#05030e";
    ctx.fillRect(x - 3, y - 1, 6, 6);
    ctx.fillStyle = hitFlash ? "#ff4040" : color;
    ctx.fillRect(x - 1, y + 1, 2, 2);
    ctx.shadowBlur = 0;
    utmDrawDamagePixels(ctx, x, y, color, hitPower, 0.58);

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(soul.name || "ALMA", x, y + 31);
    ctx.fillStyle = "#ffff00";
    for (var i = 0; i < soul.maxHp; i++) {
      ctx.globalAlpha = i < soul.hp ? 1 : 0.22;
      ctx.fillRect(x - soul.maxHp * 5 + i * 10, y + 39, 7, 5);
    }
    ctx.restore();
  }

  function utmDrawBullet(ctx, bullet) {
    ctx.save();
    if (bullet.type === "soul-shot") {
      var shotColor = bullet.color || "#00f5c4";
      var r = bullet.r || 6;
      var bx = Math.round(bullet.x);
      var by = Math.round(bullet.y);
      ctx.shadowColor = shotColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = shotColor;
      ctx.fillRect(bx - r * 2, by - 2, r * 4, 4);
      ctx.fillRect(bx - 2, by - r * 2, 4, r * 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(bx - r, by - 1, r * 2, 2);
      ctx.fillRect(bx - 1, by - r, 2, r * 2);
      ctx.shadowBlur = 0;
    } else if (bullet.type === "bone") {
      ctx.translate(bullet.x, bullet.y);
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#e9e9d8";
      ctx.fillRect(-7, -20, 14, 40);
      ctx.beginPath();
      ctx.arc(-7, -18, 7, 0, Math.PI * 2);
      ctx.arc(7, -18, 7, 0, Math.PI * 2);
      ctx.arc(-7, 18, 7, 0, Math.PI * 2);
      ctx.arc(7, 18, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = bullet.color || "#ff4040";
      ctx.shadowBlur = bullet.type === "ring" ? 14 : 10;
      ctx.fillStyle = bullet.color || "#ff4040";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.arc(bullet.x - bullet.r * 0.25, bullet.y - bullet.r * 0.25, Math.max(2, bullet.r * 0.32), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function utmPhaserColor(hex, fallback) {
    var value = String(hex || fallback || "#ffffff").replace("#", "");
    var parsed = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
    return isNaN(parsed) ? 0xffffff : parsed;
  }

  function utmPhaserLabel(scene, x, y, text, size, color) {
    if (!scene.utmLabels) scene.utmLabels = [];
    var label = scene.add
      .text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: size + "px",
        color: color || "#ffffff",
      })
      .setOrigin(0.5);
    scene.utmLabels.push(label);
  }

  function utmHeartPoints(cx, cy, s) {
    var points = [];
    function cubic(p0, p1, p2, p3, t) {
      var mt = 1 - t;
      return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
    }
    function addCurve(x0, y0, x1, y1, x2, y2, x3, y3) {
      for (var i = 0; i <= 14; i++) {
        var t = i / 14;
        points.push({
          x: cubic(x0, x1, x2, x3, t),
          y: cubic(y0, y1, y2, y3, t),
        });
      }
    }
    var x0 = cx;
    var y0 = cy - s * 0.2;
    addCurve(x0, y0, cx, cy - s, cx - s * 1.1, cy - s, cx - s * 1.1, cy - s * 0.2);
    addCurve(cx - s * 1.1, cy - s * 0.2, cx - s * 1.1, cy + s * 0.4, cx, cy + s * 0.9, cx, cy + s * 0.9);
    addCurve(cx, cy + s * 0.9, cx + s * 1.1, cy + s * 0.4, cx + s * 1.1, cy - s * 0.2, cx + s * 1.1, cy - s * 0.2);
    addCurve(cx + s * 1.1, cy - s * 0.2, cx + s * 1.1, cy - s, cx, cy - s, x0, y0);
    return points;
  }

  function utmPhaserHeart(g, cx, cy, s, fill, alpha, stroke) {
    var a = alpha == null ? 1 : alpha;
    var points = utmHeartPoints(cx, cy, s);
    g.fillStyle(fill, a);
    if (typeof g.fillPoints === "function") {
      g.fillPoints(points, true);
    } else {
      g.fillCircle(cx - s * 0.45, cy - s * 0.15, s * 0.55);
      g.fillCircle(cx + s * 0.45, cy - s * 0.15, s * 0.55);
      g.fillTriangle(cx - s * 1.03, cy, cx + s * 1.03, cy, cx, cy + s * 1.16);
    }
    if (stroke) {
      g.lineStyle(1.5, 0xffffff, a);
      if (typeof g.strokePoints === "function") {
        g.strokePoints(points, true);
      } else {
        g.strokeCircle(cx - s * 0.45, cy - s * 0.15, s * 0.55);
        g.strokeCircle(cx + s * 0.45, cy - s * 0.15, s * 0.55);
        g.strokeTriangle(cx - s * 1.03, cy, cx + s * 1.03, cy, cx, cy + s * 1.16);
      }
    }
  }

  function utmDrawPhaserSoul(g, soul, index, alpha) {
    var a = alpha == null ? 1 : alpha;
    var color = utmPhaserColor(utmSoulColor(index, soul), "#ff4040");
    var hitPower = utmHitPower(soul.id);
    var hitFlash = hitPower > 0 && Math.floor(UTM.t / 2) % 2 === 0;
    var x = Math.round(soul.x + utmHitShake(soul.id, 4));
    var y = Math.round(soul.y + Math.sin(UTM.t * 0.08 + index) * 2);
    g.fillStyle(0xffffff, a * 0.86);
    g.fillRect(x - 8, y - 16, 16, 4);
    g.fillRect(x - 14, y - 10, 4, 18);
    g.fillRect(x + 10, y - 10, 4, 18);
    g.fillRect(x - 8, y + 10, 16, 4);
    g.fillStyle(hitFlash ? 0xffffff : color, a);
    g.fillRect(x - 10, y - 12, 20, 6);
    g.fillRect(x - 14, y - 6, 28, 12);
    g.fillRect(x - 10, y + 6, 20, 8);
    g.fillRect(x - 4, y + 14, 8, 5);
    g.fillStyle(0xffffff, a * 0.5);
    g.fillRect(x - 6, y - 8, 12, 4);
    g.fillRect(x - 3, y - 3, 6, 8);
    g.fillStyle(0x05030e, a * 0.76);
    g.fillRect(x - 3, y - 1, 6, 6);
    g.fillStyle(hitFlash ? 0xff4040 : color, a);
    g.fillRect(x - 1, y + 1, 2, 2);
    utmDrawPhaserDamagePixels(g, x, y, color, hitPower, 0.58);
  }

  function utmDrawPhaserSoulBolt(g, bullet) {
    var color = utmPhaserColor(bullet.color, "#00f5c4");
    var r = bullet.r || 6;
    var x = Math.round(bullet.x);
    var y = Math.round(bullet.y);
    g.fillStyle(color, 1);
    g.fillRect(x - r * 2, y - 2, r * 4, 4);
    g.fillRect(x - 2, y - r * 2, 4, r * 4);
    g.fillStyle(0xffffff, 0.82);
    g.fillRect(x - r, y - 1, r * 2, 2);
    g.fillRect(x - 1, y - r, 2, r * 2);
  }

  function utmDrawPhaserDamagePixels(g, x, y, color, power, scale) {
    if (!power) return;
    scale = scale || 1;
    var a = Math.min(1, power + 0.1);
    g.fillStyle(0xffffff, a);
    g.fillRect(x - 28 * scale, y - 22 * scale, 7 * scale, 7 * scale);
    g.fillRect(x + 21 * scale, y - 30 * scale, 6 * scale, 6 * scale);
    g.fillRect(x + 30 * scale, y + 10 * scale, 8 * scale, 5 * scale);
    g.fillRect(x - 36 * scale, y + 14 * scale, 6 * scale, 6 * scale);
    g.fillStyle(color || 0xff4040, a);
    g.fillRect(x - 18 * scale, y - 34 * scale, 5 * scale, 5 * scale);
    g.fillRect(x + 12 * scale, y + 24 * scale, 5 * scale, 5 * scale);
  }

  function utmDrawPhaserBossHp(scene, g, state, w) {
    if (!state || !state.boss) return;
    var boss = state.boss;
    var souls = state.souls || [];
    var pct = boss.maxHp ? Math.max(0, Math.min(1, boss.hp / boss.maxHp)) : 0;
    var barW = Math.min(w - 70, 280 + souls.length * 68);
    var x = (w - barW) / 2;
    var y = 22;
    g.fillStyle(0x000000, 0.76);
    g.fillRect(x, y, barW, 22);
    g.lineStyle(2, 0xffffff, 0.88);
    g.strokeRect(x, y, barW, 22);
    g.fillStyle(0xff4040, 1);
    g.fillRect(x + 3, y + 3, Math.max(0, (barW - 6) * pct), 16);
    g.fillStyle(0xffee44, 0.34);
    g.fillRect(x + 3, y + 3, Math.max(0, (barW - 6) * pct), 4);
    utmPhaserLabel(scene, w / 2, y + 12, (boss.name || "BOSS") + " HP " + boss.hp + "/" + boss.maxHp, 8, "#ffffff");
  }

  function utmDrawPhaser(scene) {
    var g = scene.utmGraphics;
    if (!g) return;
    if (scene.utmLabels) {
      scene.utmLabels.forEach(function (label) { label.destroy(); });
      scene.utmLabels = [];
    }

    var w = 720;
    var h = 420;
    g.clear();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.lineStyle(4, 0xffffff, 1);
    g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle(0xffffff, 0.035);
    for (var y = 18; y < h; y += 10) g.fillRect(10, y, w - 20, 1);

    var state = utmGetRenderState();
    if (!state) {
      utmPhaserLabel(scene, w / 2, h / 2 - 8, "UNDERTALE MP", 18, "#ff4040");
      utmPhaserLabel(scene, w / 2, h / 2 + 22, "AGUARDANDO SALA", 10, "#d8e0ff");
      return;
    }

    var selfLive = utmGetSelfLive();
    if (state.status === "playing" && selfLive) {
      var controlText = selfLive.role === "boss"
        ? "Z TIRO " + utmCooldownLabel(selfLive.attackCooldown) + "   X LEQUE " + utmCooldownLabel(selfLive.ringCooldown) + "   C OSSOS " + utmCooldownLabel(selfLive.wallCooldown)
        : "Z TIRO " + utmCooldownLabel(selfLive.attackCooldown) + "   SHIFT DASH " + utmCooldownLabel(selfLive.dashCooldown);
      utmPhaserLabel(scene, w / 2, h - 18, controlText, 8, selfLive.role === "boss" ? "#ff8844" : "#00f5c4");
    }

    utmDrawPhaserBossHp(scene, g, state, w);

    if (state.boss) {
      var boss = utmSmoothBoss(state.boss);
      var bossHit = utmHitPower(boss.id);
      var bossFlash = bossHit > 0 && Math.floor(UTM.t / 2) % 2 === 0;
      var bob = Math.sin(UTM.t * 0.07) * 3;
      var bx = boss.x + utmHitShake(boss.id, 5);
      var by = boss.y + bob;
      g.fillStyle(bossFlash ? 0xffffff : 0x241022, 1);
      g.fillRect(bx - 32, by - 8, 64, 56);
      g.fillStyle(bossFlash ? 0xffb0b0 : 0xd8d4ff, 1);
      g.fillRect(bx - 28, by - 48, 56, 44);
      g.fillStyle(bossFlash ? 0x05030e : 0xff4040, 1);
      g.fillRect(bx - 18, by - 32, 12, 12);
      g.fillRect(bx + 6, by - 32, 12, 12);
      g.fillStyle(0x05030e, 1);
      g.fillRect(bx - 14, by - 28, 5, 5);
      g.fillRect(bx + 10, by - 28, 5, 5);
      g.fillStyle(0xff8844, 1);
      g.fillRect(bx - 48, by + 8, 18, 12);
      g.fillRect(bx + 30, by + 8, 18, 12);
      g.fillStyle(0xffee44, 1);
      g.fillRect(bx - 44, by + 11, 10, 6);
      g.fillRect(bx + 34, by + 11, 10, 6);
      utmPhaserLabel(scene, bx, by + 66, boss.name || "BOSS", 10, "#ffffff");
      utmDrawPhaserDamagePixels(g, bx, by, 0xff4040, bossHit, 1);
    }

    (state.bullets || []).forEach(function (rawBullet) {
      var bullet = utmSmoothBullet(rawBullet);
      if (bullet.type === "soul-shot") {
        utmDrawPhaserSoulBolt(g, bullet);
      } else if (bullet.type === "bone") {
        g.fillStyle(0xe9e9d8, 1);
        g.fillRect(bullet.x - 7, bullet.y - 20, 14, 40);
        g.fillCircle(bullet.x - 7, bullet.y - 18, 7);
        g.fillCircle(bullet.x + 7, bullet.y - 18, 7);
        g.fillCircle(bullet.x - 7, bullet.y + 18, 7);
        g.fillCircle(bullet.x + 7, bullet.y + 18, 7);
      } else {
        var color = utmPhaserColor(bullet.color, "#ff4040");
        g.fillStyle(color, 1);
        g.fillCircle(bullet.x, bullet.y, bullet.r);
        g.fillStyle(0xffffff, 0.75);
        g.fillCircle(bullet.x - bullet.r * 0.25, bullet.y - bullet.r * 0.25, Math.max(2, bullet.r * 0.32));
      }
    });

    (state.souls || []).forEach(function (rawSoul, index) {
      var soul = utmSmoothSoul(rawSoul);
      var alpha = soul.alive ? (soul.invuln > 0 ? 0.58 : 1) : 0.28;
      utmDrawPhaserSoul(g, soul, index, alpha);
      utmPhaserLabel(scene, soul.x, soul.y + 28, soul.name || "ALMA", 9, "#ffffff");
      for (var i = 0; i < soul.maxHp; i++) {
        g.fillStyle(0xffff00, i < soul.hp ? 1 : 0.22);
        g.fillRect(soul.x - soul.maxHp * 5 + i * 10, soul.y + 36, 7, 5);
      }
    });

    if (state.status === "ended") {
      g.fillStyle(0x000000, 0.72);
      g.fillRect(0, 0, w, h);
      utmPhaserLabel(scene, w / 2, h / 2, state.winner === "boss" ? "BOSS VENCEU" : "ALMAS VENCERAM", 18, state.winner === "boss" ? "#ff4040" : "#ffff00");
    }
  }

  function utmStartPhaser() {
    if (UTM.phaser || !window.Phaser) return !!UTM.phaser;
    var canvas = utmEl("utm-canvas");
    if (!canvas) return false;
    UTM.phaser = new window.Phaser.Game({
      type: window.Phaser.CANVAS,
      canvas: canvas,
      width: 720,
      height: 420,
      backgroundColor: "#000000",
      audio: { noAudio: true },
      scene: {
        create: function () {
          UTM.phaserScene = this;
          this.utmGraphics = this.add.graphics();
          this.utmLabels = [];
        },
        update: function () {
          if (telaAtiva !== TELA.UT_MULTI) return;
          UTM.t += 1;
          utmDrawPhaser(this);
        },
      },
    });
    return true;
  }

  function utmDrawArena() {
    var canvas = utmEl("utm-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (var y = 18; y < h; y += 10) ctx.fillRect(10, y, w - 20, 1);

    var state = utmGetRenderState();
    if (!state) {
      ctx.fillStyle = "#ff4040";
      ctx.font = "18px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("UNDERTALE MP", w / 2, h / 2 - 8);
      ctx.fillStyle = "#d8e0ff";
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.fillText("AGUARDANDO SALA", w / 2, h / 2 + 22);
      return;
    }

    var selfLive = utmGetSelfLive();
    if (state.status === "playing" && selfLive) {
      ctx.fillStyle = selfLive.role === "boss" ? "#ff8844" : "#00f5c4";
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        selfLive.role === "boss"
          ? "Z TIRO " + utmCooldownLabel(selfLive.attackCooldown) + "   X LEQUE " + utmCooldownLabel(selfLive.ringCooldown) + "   C OSSOS " + utmCooldownLabel(selfLive.wallCooldown)
          : "Z TIRO " + utmCooldownLabel(selfLive.attackCooldown) + "   SHIFT DASH " + utmCooldownLabel(selfLive.dashCooldown),
        w / 2,
        h - 17,
      );
    }

    utmDrawBossHpBarCanvas(ctx, state, w);

    if (state.boss) utmDrawBoss(ctx, utmSmoothBoss(state.boss));
    (state.bullets || []).forEach(function (bullet) {
      utmDrawBullet(ctx, utmSmoothBullet(bullet));
    });
    (state.souls || []).forEach(function (soul, index) {
      utmDrawSoul(ctx, utmSmoothSoul(soul), index);
    });

    if (state.status === "ended") {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.72)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = state.winner === "boss" ? "#ff4040" : "#ffff00";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 18;
      ctx.font = "18px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(state.winner === "boss" ? "BOSS VENCEU" : "ALMAS VENCERAM", w / 2, h / 2);
      ctx.restore();
    }
  }

  function utmLoop() {
    if (UTM.phaser) {
      UTM.raf = null;
      return;
    }
    if (telaAtiva !== TELA.UT_MULTI) {
      UTM.raf = null;
      return;
    }
    UTM.t += 1;
    utmDrawArena();
    UTM.raf = requestAnimationFrame(utmLoop);
  }

  function utmEnter() {
    utmRenderRoom();
    utmRenderStateHud();
    if (!utmStartPhaser() && !UTM.raf) UTM.raf = requestAnimationFrame(utmLoop);
    if (!UTM.room) UTM.menuIdx = 1;
    setTimeout(function () { utmSetMenuFocus(UTM.menuIdx); }, 80);
  }

  function utmBindButton(id, handler) {
    var btn = utmEl(id);
    if (!btn) return;
    btn.addEventListener("click", handler);
  }

  utmBindButton("utm-create-room", utmCreateRoom);
  utmBindButton("utm-join-room", utmJoinRoom);
  utmBindButton("utm-role-boss", function () { utmChooseRole("boss"); });
  utmBindButton("utm-role-soul", function () { utmChooseRole("soul"); });
  utmBindButton("utm-start-game", utmStartGame);
  utmBindButton("utm-action-shot", function () { utmPulseAction("attack"); });
  utmBindButton("utm-action-ring", function () { utmPulseAction("pattern1"); });
  utmBindButton("utm-action-wall", function () { utmPulseAction("pattern2"); });
  utmBindButton("utm-action-dash", function () { utmPulseAction("dash"); });

  var utmRoomCodeInput = utmEl("utm-room-code");
  if (utmRoomCodeInput) {
    utmRoomCodeInput.addEventListener("input", function () {
      utmRoomCodeInput.value = utmRoomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    });
    utmRoomCodeInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        utmConfirmTextField(utmRoomCodeInput, "utm-join-room");
      }
    });
  }

  var utmNameInput = utmEl("utm-player-name");
  if (utmNameInput) {
    utmNameInput.addEventListener("change", function () {
      utmEmit("utm:set-name", { name: utmGetName() });
    });
    utmNameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        utmConfirmTextField(utmNameInput, "utm-create-room");
      }
    });
  }

  var utmServerInput = utmEl("utm-server-url");
  if (utmServerInput) {
    utmServerInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        utmConfirmTextField(utmServerInput, "utm-player-name");
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (telaAtiva !== TELA.UT_MULTI || utmKeyTargetIsText(e.target)) return;
    if (utmSetKey(e.key, true)) {
      e.preventDefault();
      if (UTM.state && UTM.state.status === "playing") e.stopImmediatePropagation();
      utmSendInput(true);
    }
  }, true);

  document.addEventListener("keyup", function (e) {
    if (telaAtiva !== TELA.UT_MULTI || utmKeyTargetIsText(e.target)) return;
    if (utmSetKey(e.key, false)) {
      e.preventDefault();
      if (UTM.state && UTM.state.status === "playing") e.stopImmediatePropagation();
      utmSendInput(true);
    }
  }, true);

  /* Nav-back centralizado */
  document.addEventListener("click", function (e) {
    var back = e.target.closest(".nav-back");
    if (!back) return;
    somEsc();
    var id = back.id;
    if (id === "jkp-back" || id === "dados-back" || id === "cc-back") {
      irPara(TELA.ARCADE);
    } else if (id === "geo-back") {
      geoStop();
      irPara(TELA.ARCADE_GAMES);
    } else if (id === "cyber-back") {
      cyberStop();
      irPara(TELA.ARCADE_GAMES);
    } else if (id === "multiplayer-back") {
      irPara(TELA.HUB);
    } else if (id === "utm-back") {
      utmLeaveRoom();
      irPara(TELA.MP_HUB);
    } else if (id === "light-back" || id === "piggy-back" || id === "pomo-back" || id === "synth-back") {
      irPara(TELA.PROJECTS);
    } else if (id === "projects-back") {
      projectsUnlocked = false;
      projectsAnimating = false;
      irPara(TELA.HUB);
    } else if (id === "casino-back") {
      irPara(TELA.HUB);
    } else if (id === "slots-back" || id === "rlt-back" || id === "crash-back") {
      irPara(TELA.CASINO);
    } else if (id === "ut-hub-back") {
      irPara(TELA.ARCADE_GAMES);
    } else if (id === "ut-battle-back") {
      utBattleAbort();
      irPara(TELA.UT_HUB);
    }
  });

  /* =====================================================================
   PROJETOS WEB -- Navegação do hub avaliativo
   ===================================================================== */
  var projectsIdx = 0;
  var projectsUnlocked = false;
  var projectsAnimating = false;
  function getProjectCards() {
    return Array.from(document.querySelectorAll("#projects-grid .gcard"));
  }
  function projectsHintEntry() {
    var hint = document.getElementById("projects-hint");
    if (!hint) return;
    hint.innerHTML = '<span class="key">ENTER</span> compilar &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
  }
  function projectsHintGrid() {
    var hint = document.getElementById("projects-hint");
    if (!hint) return;
    hint.innerHTML = '<span class="key">&larr;</span><span class="key">&rarr;</span> navegar &nbsp;|&nbsp; <span class="key">ENTER</span> selecionar &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
  }
  function projectsClearFoco() {
    getProjectCards().forEach(function (c) { c.classList.remove("kb-focus"); });
  }
  function projectsShowEntry() {
    var hero = document.getElementById("projects-hero");
    var panel = document.getElementById("projects-build-panel");
    var grid = document.getElementById("projects-grid");
    var btn = document.getElementById("projects-build-btn");
    if (hero) hero.classList.remove("compacted");
    if (panel) panel.classList.remove("gone", "compiling");
    if (grid) {
      grid.classList.remove("show");
      grid.setAttribute("aria-hidden", "true");
    }
    if (btn) btn.classList.add("kb-focus");
    projectsHintEntry();
    projectsClearFoco();
  }
  function projectsShowGrid() {
    var hero = document.getElementById("projects-hero");
    var panel = document.getElementById("projects-build-panel");
    var grid = document.getElementById("projects-grid");
    var btn = document.getElementById("projects-build-btn");
    if (hero) hero.classList.add("compacted");
    if (panel) panel.classList.add("gone");
    if (grid) {
      grid.classList.add("show");
      grid.setAttribute("aria-hidden", "false");
    }
    if (btn) btn.classList.remove("kb-focus");
    projectsHintGrid();
    projectsSetFoco(projectsIdx);
  }
  function projectsEnter() {
    if (projectsUnlocked) projectsShowGrid();
    else projectsShowEntry();
  }
  function projectsReveal() {
    var panel = document.getElementById("projects-build-panel");
    if (projectsUnlocked || projectsAnimating) return;
    projectsAnimating = true;
    projectsUnlocked = true;
    somMoeda();
    if (panel) panel.classList.add("compiling");
    setTimeout(function () {
      projectsAnimating = false;
      if (telaAtiva !== TELA.PROJECTS || !projectsUnlocked) return;
      projectsIdx = 0;
      projectsShowGrid();
    }, 1280);
  }
  function projectsSetFoco(idx) {
    var cards = getProjectCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) { c.classList.remove("kb-focus"); });
    cards[idx].classList.add("kb-focus");
    projectsIdx = idx;
  }
  function projectsSelect() {
    if (!projectsUnlocked || projectsAnimating) return;
    var card = getProjectCards()[projectsIdx];
    if (!card) return;
    somNav();
    irPara(card.getAttribute("data-goto"));
  }
  document.getElementById("projects-grid").addEventListener("click", function (e) {
    if (!projectsUnlocked || projectsAnimating) return;
    var card = e.target.closest(".gcard");
    if (!card) return;
    somNav();
    irPara(card.getAttribute("data-goto"));
  });
  getProjectCards().forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      if (!projectsUnlocked) return;
      projectsSetFoco(index);
    });
  });
  var projectsBuildBtn = document.getElementById("projects-build-btn");
  if (projectsBuildBtn) {
    projectsBuildBtn.addEventListener("click", function () {
      projectsReveal();
    });
  }

  function setFocusByIds(ids, idx) {
    if (!ids.length) return 0;
    idx = ((idx % ids.length) + ids.length) % ids.length;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
    var active = document.getElementById(ids[idx]);
    if (active) active.classList.add("kb-focus");
    return idx;
  }

  function clearFocusByIds(ids) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
  }

  function clickFocusedId(ids, idx) {
    var el = document.getElementById(ids[idx]);
    if (!el) return;
    if (el.tagName === "INPUT") {
      el.focus();
    } else {
      el.click();
    }
  }

  /* =====================================================================
   PROJETO 1 -- Controle de Luz
   ===================================================================== */
  var lightReady = false;
  var lightOn = false;
  var lightCount = 0;
  var lightIdx = 0;
  var lightControls = ["light-toggle"];
  function lightInit() {
    if (!lightReady) {
      lightReady = true;
      document.getElementById("light-toggle").addEventListener("click", lightToggle);
      document.getElementById("light-toggle").addEventListener("mouseenter", function () { lightSetFoco(0); });
    }
    lightSetFoco(0);
    lightRender();
  }
  function lightSetFoco(idx) {
    lightIdx = setFocusByIds(lightControls, idx);
  }
  function lightToggle() {
    lightOn = !lightOn;
    if (lightOn) lightCount++;
    lightRender();
    bipe(lightOn ? 740 : 260, "sine", 0.12, 0.12);
  }
  function lightRender() {
    var screen = document.getElementById("light-switch");
    var off = document.getElementById("lamp-off");
    var on = document.getElementById("lamp-on");
    var btn = document.getElementById("light-toggle");
    var msg = document.getElementById("light-msg");
    var count = document.getElementById("light-count");
    if (!screen || !off || !on || !btn) return;
    screen.classList.toggle("light-on", lightOn);
    off.classList.toggle("hidden", lightOn);
    on.classList.toggle("hidden", !lightOn);
    btn.textContent = lightOn ? "DESLIGAR" : "LIGAR";
    if (msg) msg.textContent = lightOn ? "A lampada esta acesa." : "A lampada esta apagada.";
    if (count) count.textContent = lightCount;
  }

  /* =====================================================================
   PROJETO 2 -- Cofrinho Digital
   ===================================================================== */
  var piggyReady = false;
  var piggyState = { total: 0, counts: { "0.10": 0, "0.25": 0, "0.50": 0, "1.00": 0 } };
  var piggyIdx = 0;
  var piggyAnimTimer = null;
  var piggyDoorTimers = [];
  var piggyBusy = false;
  var piggyControls = [
    "piggy-coin-010",
    "piggy-coin-025",
    "piggy-coin-050",
    "piggy-coin-100",
    "piggy-withdraw",
    "piggy-cashout",
    "piggy-empty",
  ];
  function piggyInit() {
    if (!piggyReady) {
      piggyReady = true;
      try {
        var saved = JSON.parse(localStorage.getItem("playground-piggy-bank") || "null");
        if (saved && saved.counts) piggyState = saved;
      } catch (e) { }
      Array.from(document.querySelectorAll("[data-coin]")).forEach(function (btn) {
        btn.addEventListener("click", function () { piggyAdd(btn.getAttribute("data-coin")); });
      });
      document.getElementById("piggy-cashout").addEventListener("click", piggyWithdraw);
      document.getElementById("piggy-empty").addEventListener("click", piggyEmpty);
      piggyControls.forEach(function (id, index) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("mouseenter", function () { piggySetFoco(index); });
      });
    }
    piggySetFoco(0);
    piggyRender("Adicione moedas ao cofre.");
  }
  function piggySetFoco(idx) {
    piggyIdx = setFocusByIds(piggyControls, idx);
    if (piggyControls[piggyIdx] !== "piggy-withdraw") hideInputNumpad();
  }
  function piggyMoney(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }
  function piggySave() {
    localStorage.setItem("playground-piggy-bank", JSON.stringify(piggyState));
  }
  function piggyAdd(value) {
    if (piggyBusy) return;
    var amount = Number(value);
    piggyState.total = Number((piggyState.total + amount).toFixed(2));
    piggyState.counts[value]++;
    piggySave();
    piggyRender("Moeda de " + piggyMoney(amount) + " adicionada.");
    piggyAnimateCoin(value, "deposit");
    somMoeda();
  }
  function piggyAnimateCoin(value, mode) {
    var visual = document.querySelector(".piggy-bank-visual");
    var coin = document.getElementById("piggy-drop-coin");
    if (!coin) return;
    piggyBusy = true;
    if (piggyAnimTimer) clearTimeout(piggyAnimTimer);
    piggyDoorTimers.forEach(function (timer) { clearTimeout(timer); });
    piggyDoorTimers = [];
    coin.textContent = "$";
    coin.className = "piggy-drop-coin";
    coin.style.animation = "none";
    coin.style.opacity = "0";
    if (visual) {
      visual.classList.remove("safe-opening", "safe-open", "safe-closing");
      void visual.offsetWidth;
      visual.classList.add("safe-opening");
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-opening", "safe-closing");
        visual.classList.add("safe-open");
      }, 220));
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-opening", "safe-open");
        visual.classList.add("safe-closing");
      }, 520));
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-closing");
      }, 780));
    }
    void coin.offsetWidth;
    coin.style.animation =
      (mode === "withdraw" ? "piggyCoinOut" : "piggyCoinIn") +
      " 0.62s cubic-bezier(0.18, 0.82, 0.32, 1) both";
    piggyAnimTimer = setTimeout(function () {
      coin.className = "piggy-drop-coin";
      coin.style.animation = "none";
      coin.style.opacity = "0";
      piggyBusy = false;
      piggyAnimTimer = null;
    }, 680);
  }
  function piggyWithdraw() {
    if (piggyBusy) return;
    var input = document.getElementById("piggy-withdraw");
    var amount = Number(input.value || 0);
    if (amount <= 0) {
      piggyRender("Digite um valor valido para sacar.");
      somErro();
      return;
    }
    if (amount > piggyState.total) {
      piggyRender("Voce nao tem Saldo para o saque!!");
      somErro();
      return;
    }
    piggyState.total = Number((piggyState.total - amount).toFixed(2));
    input.value = "";
    piggySave();
    piggyRender("Saque de " + piggyMoney(amount) + " realizado.");
    piggyAnimateCoin(amount, "withdraw");
    somOk();
  }
  function piggyEmpty() {
    if (piggyBusy) return;
    var hadMoney = piggyState.total > 0;
    piggyState = { total: 0, counts: { "0.10": 0, "0.25": 0, "0.50": 0, "1.00": 0 } };
    piggySave();
    piggyRender("Cofre esvaziado.");
    if (hadMoney) piggyBurstCoins();
    somEsc();
  }
  function piggyBurstCoins() {
    var visual = document.querySelector(".piggy-bank-visual");
    var burst = document.getElementById("piggy-burst");
    if (!burst) return;
    piggyBusy = true;
    burst.innerHTML = "";
    if (piggyAnimTimer) clearTimeout(piggyAnimTimer);
    piggyDoorTimers.forEach(function (timer) { clearTimeout(timer); });
    piggyDoorTimers = [];
    if (visual) {
      visual.classList.remove("safe-opening", "safe-open", "safe-closing");
      void visual.offsetWidth;
      visual.classList.add("safe-opening");
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-opening", "safe-closing");
        visual.classList.add("safe-open");
      }, 220));
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-opening", "safe-open");
        visual.classList.add("safe-closing");
      }, 940));
      piggyDoorTimers.push(setTimeout(function () {
        visual.classList.remove("safe-closing");
      }, 1200));
    }
    for (var i = 0; i < 12; i++) {
      var coin = document.createElement("span");
      coin.className = "piggy-burst-coin";
      coin.textContent = "$";
      coin.style.animationDelay = i * 45 + "ms";
      coin.style.setProperty("--tx", 80 + Math.random() * 190 + "px");
      coin.style.setProperty("--ty", -92 + Math.random() * 184 + "px");
      coin.style.setProperty("--rot", 220 + Math.random() * 420 + "deg");
      burst.appendChild(coin);
    }
    setTimeout(function () {
      burst.innerHTML = "";
      piggyBusy = false;
    }, 1600);
  }
  function piggyRender(message) {
    var total = document.getElementById("piggy-total");
    var counts = document.getElementById("piggy-counts");
    var fill = document.getElementById("piggy-fill");
    var msg = document.getElementById("piggy-msg");
    if (total) total.textContent = piggyMoney(piggyState.total);
    if (counts) {
      counts.textContent =
        "R$0,10: " + piggyState.counts["0.10"] +
        " | R$0,25: " + piggyState.counts["0.25"] +
        " | R$0,50: " + piggyState.counts["0.50"] +
        " | R$1,00: " + piggyState.counts["1.00"];
    }
    if (fill) fill.style.height = Math.min(100, piggyState.total * 8) + "%";
    if (msg) msg.textContent = message;
  }

  /* =====================================================================
   PROJETO 3 -- Pomodoro
   ===================================================================== */
  var pomoReady = false;
  var pomoTimer = null;
  var pomoMode = "focus";
  var pomoRemaining = 25 * 60;
  var pomoIdx = 0;
  var pomoTaskIdx = 0;
  var pomoFocusZone = "main";
  var pomoTasks = [];
  var pomoTaskSeed = 1;
  var POMO_TASKS_KEY = "playground-pomodoro-tasks";
  var pomoControls = [
    "pomo-start",
    "pomo-pause",
    "pomo-reset",
    "pomo-focus",
    "pomo-break",
  ];
  var pomoTaskBaseControls = ["pomo-task-input", "pomo-task-add"];
  function pomoInit() {
    if (!pomoReady) {
      pomoReady = true;
      document.getElementById("pomo-start").addEventListener("click", pomoStart);
      document.getElementById("pomo-pause").addEventListener("click", pomoPause);
      document.getElementById("pomo-reset").addEventListener("click", pomoReset);
      document.getElementById("pomo-focus").addEventListener("change", pomoReset);
      document.getElementById("pomo-break").addEventListener("change", pomoReset);
      var taskInput = document.getElementById("pomo-task-input");
      var taskAdd = document.getElementById("pomo-task-add");
      var taskClear = document.getElementById("pomo-task-clear");
      if (taskInput) {
        taskInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            pomoAddTask();
          } else if (e.key === "Escape") {
            e.preventDefault();
            taskInput.blur();
            pomoSetFoco(0);
          }
        });
      }
      if (taskAdd) taskAdd.addEventListener("click", pomoAddTask);
      if (taskClear) taskClear.addEventListener("click", pomoClearDoneTasks);
      var taskList = document.getElementById("pomo-task-list");
      if (taskList) {
        taskList.addEventListener("click", function (e) {
          var toggle = e.target.closest("[data-pomo-task-toggle]");
          var remove = e.target.closest("[data-pomo-task-remove]");
          if (toggle) {
            pomoToggleTask(toggle.getAttribute("data-pomo-task-toggle"));
          } else if (remove) {
            pomoRemoveTask(remove.getAttribute("data-pomo-task-remove"));
          }
        });
      }
      pomoControls.forEach(function (id, index) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("mouseenter", function () { pomoSetFoco(index); });
      });
      pomoTaskBaseControls.forEach(function (id, index) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("mouseenter", function () { pomoSetTaskFoco(index); });
      });
      if (taskClear) {
        taskClear.addEventListener("mouseenter", function () {
          pomoSetTaskFoco(pomoGetTaskControls().length - 1);
        });
      }
      pomoLoadTasks();
    }
    pomoSetFoco(0);
    pomoRender("Configure, inicie e acompanhe a contagem regressiva.");
    pomoRenderTasks();
  }
  function pomoSetFoco(idx) {
    pomoFocusZone = "main";
    clearFocusByIds(pomoGetTaskControls());
    pomoIdx = setFocusByIds(pomoControls, idx);
    var current = pomoControls[pomoIdx];
    if (current !== "pomo-focus" && current !== "pomo-break") hideInputNumpad();
  }
  function pomoGetTaskControls() {
    var ids = ["pomo-task-input", "pomo-task-add"];
    pomoTasks.forEach(function (task, index) {
      ids.push("pomo-task-toggle-" + task.id);
      ids.push("pomo-task-remove-" + task.id);
    });
    ids.push("pomo-task-clear");
    return ids;
  }
  function pomoSetTaskFoco(idx) {
    var ids = pomoGetTaskControls();
    if (!ids.length) return;
    pomoFocusZone = "tasks";
    clearFocusByIds(pomoControls);
    pomoTaskIdx = setFocusByIds(ids, idx);
    if (ids[pomoTaskIdx] !== "pomo-task-input") hideInputNumpad();
  }
  function pomoActivateTaskFocus() {
    clickFocusedId(pomoGetTaskControls(), pomoTaskIdx);
  }
  function pomoMinutes(id, fallback) {
    var value = Number(document.getElementById(id).value || fallback);
    return Math.max(1, Math.min(90, value));
  }
  function pomoDuration() {
    return (pomoMode === "focus" ? pomoMinutes("pomo-focus", 25) : pomoMinutes("pomo-break", 5)) * 60;
  }
  function pomoStart() {
    if (pomoTimer) return;
    if (!pomoRemaining) pomoRemaining = pomoDuration();
    pomoTimer = setInterval(function () {
      pomoRemaining--;
      if (pomoRemaining <= 0) {
        pomoPause();
        somOk();
        pomoMode = pomoMode === "focus" ? "break" : "focus";
        pomoRemaining = pomoDuration();
        pomoRender(pomoMode === "focus" ? "Hora de voltar ao foco." : "Pausa iniciada.");
        return;
      }
      pomoRender("Timer em andamento.");
    }, 1000);
    pomoRender("Timer em andamento.");
    somNav();
  }
  function pomoPause() {
    if (pomoTimer) clearInterval(pomoTimer);
    pomoTimer = null;
    pomoRender("Timer pausado.");
  }
  function pomoReset() {
    pomoPause();
    pomoMode = "focus";
    pomoRemaining = pomoDuration();
    pomoRender("Timer resetado.");
  }
  function pomoLoadTasks() {
    try {
      var saved = JSON.parse(localStorage.getItem(POMO_TASKS_KEY) || "[]");
      if (Array.isArray(saved)) {
        pomoTasks = saved
          .filter(function (task) { return task && String(task.text || "").trim(); })
          .map(function (task) {
            return {
              id: Number(task.id) || pomoTaskSeed++,
              text: String(task.text || "").slice(0, 48),
              done: !!task.done,
            };
          });
        pomoTasks.forEach(function (task) {
          pomoTaskSeed = Math.max(pomoTaskSeed, task.id + 1);
        });
      }
    } catch (e) {
      pomoTasks = [];
    }
  }
  function pomoSaveTasks() {
    try {
      localStorage.setItem(POMO_TASKS_KEY, JSON.stringify(pomoTasks));
    } catch (e) { }
  }
  function pomoAddTask() {
    var input = document.getElementById("pomo-task-input");
    var text = input ? input.value.trim() : "";
    if (!text) {
      pomoRender("Digite uma tarefa antes de adicionar.");
      somErro();
      return;
    }
    pomoTasks.push({
      id: pomoTaskSeed++,
      text: text.slice(0, 48),
      done: false,
    });
    if (input) {
      input.value = "";
      input.blur();
    }
    pomoSaveTasks();
    pomoRenderTasks();
    pomoSetTaskFoco(2 + (pomoTasks.length - 1) * 2);
    pomoRender("Tarefa adicionada ao ciclo de foco.");
    somOk();
  }
  function pomoToggleTask(id) {
    var task = pomoTasks.find(function (item) { return String(item.id) === String(id); });
    if (!task) return;
    task.done = !task.done;
    pomoSaveTasks();
    pomoRenderTasks();
    pomoSetTaskFoco(pomoTaskIdx);
    pomoRender(task.done ? "Tarefa marcada como feita." : "Tarefa voltou para pendente.");
    somNav();
  }
  function pomoRemoveTask(id) {
    pomoTasks = pomoTasks.filter(function (item) { return String(item.id) !== String(id); });
    pomoSaveTasks();
    pomoRenderTasks();
    pomoSetTaskFoco(Math.min(pomoTaskIdx, pomoGetTaskControls().length - 1));
    pomoRender("Tarefa removida.");
    somEsc();
  }
  function pomoClearDoneTasks() {
    var before = pomoTasks.length;
    pomoTasks = pomoTasks.filter(function (task) { return !task.done; });
    pomoSaveTasks();
    pomoRenderTasks();
    pomoSetTaskFoco(Math.min(pomoTaskIdx, pomoGetTaskControls().length - 1));
    pomoRender(before === pomoTasks.length ? "Nenhuma tarefa feita para limpar." : "Tarefas feitas removidas.");
    if (before === pomoTasks.length) somErro();
    else somOk();
  }
  function pomoRenderTasks() {
    var list = document.getElementById("pomo-task-list");
    var count = document.getElementById("pomo-task-count");
    var pending = pomoTasks.filter(function (task) { return !task.done; }).length;
    if (count) count.textContent = pending + (pending === 1 ? " pendente" : " pendentes");
    if (!list) return;
    list.innerHTML = "";
    pomoTasks.forEach(function (task, index) {
      var item = document.createElement("li");
      item.className = "pomo-task-item" + (task.done ? " done" : "");
      var toggleId = "pomo-task-toggle-" + task.id;
      var removeId = "pomo-task-remove-" + task.id;
      item.innerHTML =
        '<button class="pomo-task-toggle" id="' + toggleId + '" type="button" data-pomo-task-toggle="' + task.id + '" aria-label="Alternar tarefa">' +
        (task.done ? "OK" : "") +
        '</button>' +
        '<span class="pomo-task-text"></span>' +
        '<button class="pomo-task-remove" id="' + removeId + '" type="button" data-pomo-task-remove="' + task.id + '" aria-label="Remover tarefa">X</button>';
      var text = item.querySelector(".pomo-task-text");
      if (text) text.textContent = task.text;
      var toggle = item.querySelector(".pomo-task-toggle");
      var remove = item.querySelector(".pomo-task-remove");
      if (toggle) toggle.addEventListener("mouseenter", function () { pomoSetTaskFoco(2 + index * 2); });
      if (remove) remove.addEventListener("mouseenter", function () { pomoSetTaskFoco(3 + index * 2); });
      list.appendChild(item);
    });
  }
  function pomoRender(message) {
    var m = Math.floor(pomoRemaining / 60);
    var s = pomoRemaining % 60;
    var time = document.getElementById("pomo-time");
    var mode = document.getElementById("pomo-mode");
    var msg = document.getElementById("pomo-msg");
    if (time) time.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    if (mode) mode.textContent = pomoMode === "focus" ? "FOCO" : "PAUSA";
    if (msg) msg.textContent = message;
  }

  /* =====================================================================
   TECLADO VIRTUAL -- Sons na Web
   ===================================================================== */
  var synthReady = false;
  var synthCount = 0;
  var synthRecording = false;
  var synthRecordStarted = 0;
  var synthSequence = [];
  var synthIdx = 0;
  var synthOctave = 4;
  var synthKeyMap = {};
  var synthControls = [
    "synth-song-scale",
    "synth-song-twinkle",
    "synth-song-ode",
    "synth-song-neon",
  ];
  var synthNoteNames = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];
  var synthLegacyKeys = {
    do: "a",
    re: "s",
    mi: "d",
    fa: "f",
    sol: "g",
    la: "h",
    si: "j",
  };
  var synthPresetSongs = {
    scale: {
      title: "PARABENS",
      steps: [["b", 260], ["b", 220], ["n", 420], ["b", 420], ["q", 420], ["m", 720], [null, 160], ["b", 260], ["b", 220], ["n", 420], ["b", 420], ["w", 420], ["q", 720], [null, 160], ["b", 260], ["b", 220], ["t", 420], ["e", 420], ["q", 420], ["m", 420], ["n", 680], [null, 160], ["r", 260], ["r", 220], ["e", 420], ["q", 420], ["w", 420], ["q", 760]],
    },
    twinkle: {
      title: "BRILHA",
      steps: [["z", 360], ["z", 360], ["b", 360], ["b", 360], ["n", 360], ["n", 360], ["b", 560], [null, 160], ["v", 360], ["v", 360], ["c", 360], ["c", 360], ["x", 360], ["x", 360], ["z", 620]],
    },
    ode: {
      title: "ODE",
      steps: [["c", 300], ["c", 300], ["v", 300], ["b", 300], ["b", 300], ["v", 300], ["c", 300], ["x", 300], ["z", 300], ["z", 300], ["x", 300], ["c", 300], ["c", 420], ["x", 180], ["x", 620]],
    },
    neon: {
      title: "JINGLE",
      steps: [["c", 240], ["c", 240], ["c", 480], [null, 90], ["c", 240], ["c", 240], ["c", 480], [null, 90], ["c", 260], ["b", 260], ["z", 320], ["x", 220], ["c", 700], [null, 120], ["v", 240], ["v", 240], ["v", 280], ["v", 220], ["v", 240], ["c", 240], ["c", 240], ["c", 160], ["c", 160], ["x", 240], ["x", 240], ["c", 260], ["x", 360], ["b", 640]],
    },
  };

  function synthInit() {
    if (synthReady) {
      synthSetFoco(0);
      synthRefreshKeyLabels();
      return;
    }
    synthReady = true;
    synthRebuildKeyMap();
    Array.from(document.querySelectorAll(".synth-key[data-synth-key]")).forEach(function (key) {
      key.addEventListener("click", function () {
        synthPlayKey(key.getAttribute("data-synth-key"), true);
      });
    });
    Array.from(document.querySelectorAll(".synth-key[data-control]")).forEach(function (key) {
      key.addEventListener("click", function () {
        synthRunControl(key.getAttribute("data-control"));
      });
    });
    var record = document.getElementById("synth-record");
    var play = document.getElementById("synth-play");
    var clear = document.getElementById("synth-clear");
    var octaveDown = document.getElementById("synth-oct-down");
    var octaveUp = document.getElementById("synth-oct-up");
    if (record) record.addEventListener("click", synthToggleRecord);
    if (play) play.addEventListener("click", function () { synthReplay(); });
    if (clear) clear.addEventListener("click", synthClearSequence);
    if (octaveDown) octaveDown.addEventListener("click", function () { synthChangeOctave(-1); });
    if (octaveUp) octaveUp.addEventListener("click", function () { synthChangeOctave(1); });
    Array.from(document.querySelectorAll("[data-synth-song]")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        synthPlayPreset(btn.getAttribute("data-synth-song"));
      });
    });
    synthControls.forEach(function (id, index) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("mouseenter", function () { synthSetFoco(index); });
    });
    synthSetFoco(0);
  }
  function synthSetFoco(idx) {
    synthIdx = setFocusByIds(synthControls, idx);
  }

  function synthNormalizeKey(k) {
    if (k === " ") return "space";
    k = String(k || "").toLowerCase();
    if (k === "spacebar") return "space";
    return k;
  }

  function synthReadableKey(k) {
    if (k === "space") return "SPACE";
    return String(k || "").toUpperCase();
  }

  function synthRebuildKeyMap() {
    synthKeyMap = {};
    Array.from(document.querySelectorAll(".synth-key[data-synth-key]")).forEach(function (key, index) {
      var keyName = synthNormalizeKey(key.getAttribute("data-synth-key"));
      var customIndex = parseInt(key.getAttribute("data-synth-index"), 10);
      var noteIndex = Number.isFinite(customIndex) ? customIndex : index;
      key.setAttribute("data-synth-index", String(noteIndex));
      synthKeyMap[keyName] = {
        el: key,
        index: noteIndex,
      };
    });
    synthRefreshKeyLabels();
    synthUpdateOctave();
  }

  function synthMidiForIndex(index) {
    return 48 + (synthOctave - 4) * 12 + index;
  }

  function synthLabelForIndex(index) {
    var midi = synthMidiForIndex(index);
    var name = synthNoteNames[((midi % 12) + 12) % 12];
    var octave = Math.floor(midi / 12) - 1;
    return name + octave;
  }

  function synthFrequencyForIndex(index) {
    var midi = synthMidiForIndex(index);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function synthRefreshKeyLabels() {
    Object.keys(synthKeyMap).forEach(function (keyName) {
      var data = synthKeyMap[keyName];
      var note = data.el.querySelector(".note");
      if (note) note.textContent = synthLabelForIndex(data.index);
    });
  }

  function synthUpdateOctave() {
    var el = document.getElementById("synth-octave");
    if (el) el.textContent = "OITAVA " + synthOctave;
    synthRefreshKeyLabels();
  }

  function synthChangeOctave(delta) {
    synthOctave = Math.max(2, Math.min(6, synthOctave + delta));
    synthUpdateOctave();
    var now = document.getElementById("synth-now");
    if (now) now.textContent = "OITAVA ATUAL: " + synthOctave;
    somNav();
  }

  function synthRunControl(action) {
    synthFlashControl(action);
    if (action === "record") synthToggleRecord();
    else if (action === "play") synthReplay();
    else if (action === "clear") synthClearSequence();
    else if (action === "octave-down") synthChangeOctave(-1);
    else if (action === "octave-up") synthChangeOctave(1);
  }

  function synthFlashControl(action) {
    var key = document.querySelector('.synth-key[data-control="' + action + '"]');
    if (!key) {
      var buttons = {
        record: "synth-record",
        play: "synth-play",
        clear: "synth-clear",
        "octave-down": "synth-oct-down",
        "octave-up": "synth-oct-up",
      };
      key = document.getElementById(buttons[action]);
    }
    if (!key) return;
    key.classList.add("active");
    setTimeout(function () { key.classList.remove("active"); }, 170);
  }

  function synthNoteFromKey(k) {
    k = synthNormalizeKey(k);
    return synthKeyMap[k] ? k : "";
  }

  function synthPlayNote(note, shouldRecord) {
    if (synthLegacyKeys[note]) return synthPlayKey(synthLegacyKeys[note], shouldRecord);
    return synthPlayKey(note, shouldRecord);
  }

  function synthPlayKey(keyName, shouldRecord) {
    keyName = synthNormalizeKey(keyName);
    var data = synthKeyMap[keyName];
    if (!data) return false;
    var key = data.el;
    if (key) {
      key.classList.add("active");
      setTimeout(function () { key.classList.remove("active"); }, 170);
    }
    var label = synthLabelForIndex(data.index);
    var now = document.getElementById("synth-now");
    if (now) now.textContent = "ULTIMA NOTA: " + label + "  |  TECLA " + synthReadableKey(keyName);
    synthCount++;
    var count = document.getElementById("synth-count");
    if (count) count.textContent = synthCount;
    synthTone(synthFrequencyForIndex(data.index));
    if (synthRecording && shouldRecord) {
      synthSequence.push({ key: keyName, at: Date.now() - synthRecordStarted });
    }
    return true;
  }

  function synthTone(freq) {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.43);
    } catch (e) { }
  }

  function synthToggleRecord() {
    synthRecording = !synthRecording;
    var btn = document.getElementById("synth-record");
    if (synthRecording) {
      synthSequence = [];
      synthRecordStarted = Date.now();
      if (btn) {
        btn.classList.add("active");
        btn.textContent = "GRAVANDO";
      }
      var now = document.getElementById("synth-now");
      if (now) now.textContent = "GRAVANDO SEQUENCIA";
      somNav();
    } else {
      if (btn) {
        btn.classList.remove("active");
        btn.textContent = "GRAVAR";
      }
      var saved = document.getElementById("synth-now");
      if (saved) saved.textContent = synthSequence.length ? "SEQUENCIA SALVA" : "NENHUMA NOTA GRAVADA";
      somOk();
    }
  }

  function synthBuildPresetSequence(song) {
    var at = 0;
    var sequence = [];
    song.steps.forEach(function (step) {
      var key = step[0];
      var duration = step[1] || 260;
      if (key) sequence.push({ key: key, at: at });
      at += duration;
    });
    return sequence;
  }

  function synthClearSongButtons() {
    Array.from(document.querySelectorAll("[data-synth-song].active")).forEach(function (btn) {
      btn.classList.remove("active");
    });
  }

  function synthPlayPreset(songId) {
    var song = synthPresetSongs[songId];
    if (!song) return;
    if (synthRecording) synthToggleRecord();
    synthSequence = synthBuildPresetSequence(song);
    var btn = document.querySelector('[data-synth-song="' + songId + '"]');
    synthClearSongButtons();
    if (btn) btn.classList.add("active");
    synthReplay(song.title, btn);
  }

  function synthReplay(label, sourceButton) {
    if (!synthSequence.length) {
      somErro();
      var now = document.getElementById("synth-now");
      if (now) now.textContent = "GRAVE UMA SEQUENCIA PRIMEIRO";
      return;
    }
    if (synthRecording) synthToggleRecord();
    var play = document.getElementById("synth-play");
    if (play) play.classList.add("active");
    var nowPlaying = document.getElementById("synth-now");
    if (nowPlaying && typeof label === "string" && label) nowPlaying.textContent = "TOCANDO: " + label;
    synthSequence.forEach(function (item, index) {
      setTimeout(function () {
        synthPlayNote(item.key || item.note, false);
        if (index === synthSequence.length - 1) {
          if (play) play.classList.remove("active");
          if (sourceButton) sourceButton.classList.remove("active");
        }
      }, item.at);
    });
  }

  function synthClearSequence() {
    synthSequence = [];
    synthClearSongButtons();
    if (synthRecording) synthToggleRecord();
    var now = document.getElementById("synth-now");
    if (now) now.textContent = "SEQUENCIA LIMPA";
    somEsc();
  }

  /* =====================================================================
   JOKENPÔ -- Navegação com teclado
   ===================================================================== */
  var jkpIdx = 0;

  function getJkpCards() {
    return Array.from(document.querySelectorAll(".jkp-card"));
  }

  function jkpSetFoco(idx) {
    var cards = getJkpCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    jkpIdx = idx;
  }

  function jkpConfirmar() {
    var c = getJkpCards()[jkpIdx];
    if (c) jogarJkp(c.getAttribute("data-jkp"));
  }

  /* Clique nos cards de jkp via mouse */
  getJkpCards().forEach(function (card) {
    card.addEventListener("click", function () {
      jogarJkp(card.getAttribute("data-jkp"));
    });
  });

  /* Clique NOVA RODADA via mouse */
  document.getElementById("jkp-new").addEventListener("click", function () {
    reiniciarJkp();
  });

  /* =====================================================================
   CARA OU COROA -- Navegação com teclado
   ===================================================================== */
  var ccIdx = 0;

  function ccSetFoco(idx) {
    idx = ((idx % 2) + 2) % 2;
    document.getElementById("btn-cara").classList.remove("kb-focus");
    document.getElementById("btn-coroa").classList.remove("kb-focus");
    (idx === 0
      ? document.getElementById("btn-cara")
      : document.getElementById("btn-coroa")
    ).classList.add("kb-focus");
    ccIdx = idx;
  }

  function ccConfirmar() {
    var btn =
      ccIdx === 0 ? document.getElementById("btn-cara") : document.getElementById("btn-coroa");
    if (!btn.classList.contains("disabled")) jogarCc(ccIdx === 0 ? "cara" : "coroa");
  }

  /* Clique nos botões cara/coroa via mouse */
  document.getElementById("btn-cara").addEventListener("click", function () {
    jogarCc("cara");
  });
  document.getElementById("btn-coroa").addEventListener("click", function () {
    jogarCc("coroa");
  });

  /* =====================================================================
   LISTENER DE TECLADO
   ===================================================================== */
  var guard = false;

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.repeat) return;
      if (guard) return;
      guard = true;
      setTimeout(function () {
        guard = false;
      }, 0);

      var k = e.key;
      var target = e.target;
      var customInput =
        target && target.tagName === "INPUT" && SPECIAL_INPUTS.indexOf(target.id) !== -1;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        if (k === "F12" || k === "F5") return;
        if (customInput) {
          if (handleSpecialInputKey(target, k)) {
            flashKeyHint(k);
            e.preventDefault();
            return;
          }
        }
        if (!customInput) return;
      }
      if (k === "F12" || k === "F5") return;
      if (telaAtiva !== TELA.KEYBOARD && (k === "i" || k === "I") && typeof window.openAiChat === "function") {
        e.preventDefault();
        flashKeyHint("I");
        window.openAiChat();
        return;
      }
      e.preventDefault();
      flashKeyHint(k);

      /* ── MODAL IDADE ── */
      if (telaAtiva === "modal-idade") {
        if (k === "ArrowLeft" || k === "ArrowRight") {
          modalIdadeSetFoco(1 - modalIdadeIdx);
          somNav();
        } else if (k === "Enter" || k === " ") {
          if (modalIdadeIdx === 0) {
            document.getElementById("age-yes").click();
          } else {
            somEsc();
            document.getElementById("age-modal").classList.remove("show");
            telaAtiva = TELA.HUB;
            pgSetFoco(pgIdx);
          }
        } else if (k === "Escape") {
          somEsc();
          document.getElementById("age-modal").classList.remove("show");
          telaAtiva = TELA.HUB;
          pgSetFoco(pgIdx);
        }
        return;
      }

      /* ── PLAYGROUND HUB ── */
      if (telaAtiva === TELA.HUB) {
        if (k === "ArrowLeft") {
          pgSetFoco(pgIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          pgSetFoco(pgIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          pgSelect();
        }
        return;
      }

      if (telaAtiva === TELA.MP_HUB) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.HUB);
          return;
        }
        if (k === "ArrowLeft") {
          multiplayerSetFoco(multiplayerIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          multiplayerSetFoco(multiplayerIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          multiplayerSelect();
        }
        return;
      }

      if (telaAtiva === TELA.UT_MULTI) {
        if (k === "Escape") {
          somEsc();
          utmLeaveRoom();
          irPara(TELA.MP_HUB);
          return;
        }
        if (UTM.state && UTM.state.status === "playing") {
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowUp") {
          if (!UTM.state || UTM.state.status !== "playing") {
            utmSetMenuFocus(UTM.menuIdx - 1);
            somNav();
          }
          return;
        }
        if (k === "ArrowRight" || k === "ArrowDown") {
          if (!UTM.state || UTM.state.status !== "playing") {
            utmSetMenuFocus(UTM.menuIdx + 1);
            somNav();
          }
          return;
        }
        var focusedUtmControl = utmGetFocusedMenuControl();
        if (focusedUtmControl && focusedUtmControl.tagName === "INPUT") {
          if (k === "Enter" || k === " ") {
            utmActivateFocusedControl();
          }
          return;
        }
        if (k === "c" || k === "C") {
          utmCreateRoom();
          return;
        }
        if (k === "e" || k === "E") {
          utmJoinRoom();
          return;
        }
        if (k === "Enter" || k === " ") {
          if (!UTM.state || UTM.state.status !== "playing") {
            utmActivateFocusedControl();
          }
          return;
        }
        return;
      }

      /* ── PROJETOS WEB HUB ── */
      if (telaAtiva === TELA.PROJECTS) {
        if (k === "Escape") {
          somEsc();
          projectsUnlocked = false;
          projectsAnimating = false;
          irPara(TELA.HUB);
          return;
        }
        if (projectsAnimating) return;
        if (!projectsUnlocked) {
          if (k === "Enter" || k === " ") projectsReveal();
          return;
        }
        if (k === "ArrowLeft") {
          projectsSetFoco(projectsIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          projectsSetFoco(projectsIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          projectsSelect();
        }
        return;
      }

      if (telaAtiva === TELA.LIGHT) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.PROJECTS);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowRight") {
          lightSetFoco(0);
          somNav();
        } else if (k === "Enter" || k === " ") {
          clickFocusedId(lightControls, lightIdx);
        }
        return;
      }

      if (telaAtiva === TELA.PIGGY) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.PROJECTS);
          return;
        }
        if (k === "ArrowLeft") {
          piggySetFoco(piggyIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          piggySetFoco(piggyIdx + 1);
          somNav();
        } else if (k === "ArrowUp" || k === "ArrowDown") {
          piggySetFoco(piggyIdx + (k === "ArrowDown" ? 1 : -1));
          somNav();
        } else if (k === "Enter" || k === " ") {
          clickFocusedId(piggyControls, piggyIdx);
        }
        return;
      }

      if (telaAtiva === TELA.POMO) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.PROJECTS);
          return;
        }
        if (k === "ArrowDown" && pomoFocusZone === "main") {
          pomoSetTaskFoco(0);
          somNav();
        } else if (k === "ArrowRight" && pomoFocusZone === "main" && pomoIdx === pomoControls.length - 1) {
          pomoSetTaskFoco(0);
          somNav();
        } else if (pomoFocusZone === "tasks" && (k === "ArrowLeft" || (k === "ArrowUp" && pomoTaskIdx === 0))) {
          pomoSetFoco(pomoIdx);
          somNav();
        } else if (pomoFocusZone === "tasks" && (k === "ArrowRight" || k === "ArrowDown")) {
          pomoSetTaskFoco(pomoTaskIdx + 1);
          somNav();
        } else if (pomoFocusZone === "tasks" && k === "ArrowUp") {
          pomoSetTaskFoco(pomoTaskIdx - 1);
          somNav();
        } else if (k === "ArrowLeft") {
          pomoSetFoco(pomoIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          pomoSetFoco(pomoIdx + 1);
          somNav();
        } else if (k === "ArrowUp") {
          pomoSetFoco(pomoIdx - 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          if (pomoFocusZone === "tasks") pomoActivateTaskFocus();
          else clickFocusedId(pomoControls, pomoIdx);
        }
        return;
      }

      /* ── TECLADO VIRTUAL ── */
      if (telaAtiva === TELA.KEYBOARD) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.PROJECTS);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowUp") {
          synthSetFoco(synthIdx - 1);
          somNav();
          return;
        }
        if (k === "ArrowRight" || k === "ArrowDown") {
          synthSetFoco(synthIdx + 1);
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          clickFocusedId(synthControls, synthIdx);
          return;
        }
        if (k === "Backspace") {
          synthRunControl("clear");
          return;
        }
        if (k === "CapsLock") {
          synthRunControl("record");
          return;
        }
        if (k === "p" || k === "P") {
          synthRunControl("play");
          return;
        }
        if (k === "Tab") {
          synthRunControl("octave-down");
          return;
        }
        if (k === "Shift") {
          synthRunControl("octave-up");
          return;
        }
        if (synthPlayKey(k, true)) return;
        return;
      }

      /* ── CASINO HUB ── */
      if (telaAtiva === TELA.CASINO) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.HUB);
          return;
        }
        if (!casinoTicketUsado) {
          casinoFocusTicket();
          if (k === "Enter" || k === " ") {
            somMoeda();
            revealCasinoGames();
          }
          return;
        }
        if (k === "ArrowLeft") {
          casinoSetFoco(casinoIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          casinoSetFoco(casinoIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          casinoSelect();
        }
        return;
      }

      /* ── CAÇA-NÍQUEL ── */
      if (telaAtiva === TELA.SLOTS) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowUp" || k === "ArrowDown") {
          slotsSetFoco(1 - slotIdx);
          somNav();
          return;
        }
        if (slotIdx === 0 && k === "ArrowLeft") {
          adjustSlotBet(-10);
          somNav();
          return;
        }
        if (slotIdx === 0 && k === "ArrowRight") {
          adjustSlotBet(10);
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var btn = document.getElementById("btn-spin");
          if (btn && !btn.classList.contains("disabled")) btn.click();
        }
        return;
      }

      /* ── ROLETA ── */
      if (telaAtiva === TELA.ROULETTE) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowRight") {
          rltSetFoco(rltIdx + (k === "ArrowRight" ? 1 : -1));
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var id = rltControls[rltIdx];
          if (rltIdx === 0) {
            var input = document.getElementById(id);
            if (input) input.focus();
          } else {
            var btn = document.getElementById(id);
            if (btn) btn.click();
          }
          return;
        }
        return;
      }

      /* ── CRASH GAME ── */
      if (telaAtiva === TELA.CRASH) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowRight") {
          crashSetFoco(crashIdx + (k === "ArrowRight" ? 1 : -1));
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var id = crashControls[crashIdx];
          if (id === "crash-bet-input" || id === "crash-auto-input") {
            var input = document.getElementById(id);
            if (input) input.focus();
          } else if (id === "crash-auto-toggle") {
            var tog = document.getElementById(id);
            if (tog) tog.click();
          } else {
            var btn = document.getElementById(id);
            if (btn) btn.click();
          }
        }
        return;
      }

      /* ── ARCADE HUB ── */
      if (telaAtiva === TELA.ARCADE) {
        if (k === "Escape") {
          somEsc();
          resetArcade();
          irPara(TELA.HUB);
          return;
        }
        if (!coinUsada) {
          if (k === "Enter" || k === " ") inserirMoeda();
          return;
        }
        if (k === "ArrowLeft") {
          hubSetFoco(hubIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          hubSetFoco(hubIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          hubSelect();
        }
        return;
      }

      /* ── JOKENPÔ ─── */
      if (telaAtiva === TELA.ARCADE_GAMES) {
        if (k === "Escape") {
          somEsc();
          arcadeGamesBooted = false;
          arcadeGamesAnimating = false;
          irPara(TELA.HUB);
          return;
        }
        if (arcadeGamesAnimating) return;
        if (!arcadeGamesBooted) {
          if (k === "Enter" || k === " ") arcadeGamesReveal();
          return;
        }
        if (k === "ArrowLeft") {
          arcadeGamesSetFoco(arcadeGamesIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          arcadeGamesSetFoco(arcadeGamesIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          arcadeGamesSelect();
        }
        return;
      }

      if (telaAtiva === TELA.GEO) {
        if (k === "Escape") {
          somEsc();
          geoStop();
          irPara(TELA.ARCADE_GAMES);
          return;
        }
        if (k === "Enter") {
          geoRestart();
          return;
        }
        if (k === " " || k === "w" || k === "W") {
          geoSetKey(1, true);
          return;
        }
        if (k === "ArrowUp") {
          geoSetKey(2, true);
          return;
        }
        return;
      }

      if (telaAtiva === TELA.CYBER) {
        if (k === "Escape") {
          somEsc();
          cyberStop();
          irPara(TELA.ARCADE_GAMES);
          return;
        }
        if (k === "Enter") {
          cyberConfirm();
          return;
        }
        if (cyberHandleKey(k, true)) {
          return;
        }
        return;
      }

      if (telaAtiva === TELA.JKP) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "Enter" && jkpEst.locked) {
          reiniciarJkp();
          return;
        }
        if (k === "ArrowLeft") {
          jkpSetFoco(jkpIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          jkpSetFoco(jkpIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          jkpConfirmar();
        }
        return;
      }

      /* ── DADOS ─── */
      if (telaAtiva === TELA.DADOS) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "Enter" || k === " ") {
          jogarDados();
        }
        return;
      }

      /* ── CARA OU COROA ─── */
      if (telaAtiva === TELA.CC) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "ArrowLeft") {
          ccSetFoco(0);
          somNav();
        } else if (k === "ArrowRight") {
          ccSetFoco(1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          ccConfirmar();
        }
        return;
      }
      /* -- UNDERTALE HUB -- */
      if (telaAtiva === TELA.UT_HUB) {
        if (k === "Escape") { somEsc(); irPara(TELA.ARCADE_GAMES); return; }
        if (k === "ArrowLeft") { utHubSetFoco(utHubIdx - 1); somNav(); }
        else if (k === "ArrowRight") { utHubSetFoco(utHubIdx + 1); somNav(); }
        else if (k === "Enter" || k === " ") { utHubSelect(); }
        return;
      }

      /* -- UNDERTALE BATTLE -- */
      if (telaAtiva === TELA.UT_BATTLE) {
        if (k === "Escape") { somEsc(); utBattleAbort(); irPara(TELA.UT_HUB); return; }
        utBattleKey(k);
        return;
      }
    },
    true,
  );
  /* =====================================================================
   JOKENPÔ -- Lógica
   ===================================================================== */
  /* =====================================================================
   GEOMETRY RACE -- Duelo split-screen
   ===================================================================== */
  var GEO_W = 1120;
  var GEO_H = 620;
  var GEO_LANE_H = 290;
  var GEO_LANE_GAP = 40;
  var GEO_X = 132;
  var GEO_SIZE = 28;
  var geoState = {
    canvas: null,
    ctx: null,
    raf: null,
    countTimer: null,
    last: 0,
    status: "idle",
    distance: 0,
    speed: 310,
    mapEnd: 0,
    currentMode: "cube",
    segments: [],
    obstacles: [],
    players: [],
    keys: { p1: false, p2: false },
  };

  function geoRand(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function geoSetup() {
    if (geoState.canvas) return;
    geoState.canvas = document.getElementById("geo-canvas");
    if (!geoState.canvas) return;
    geoState.ctx = geoState.canvas.getContext("2d");
    geoState.canvas.width = GEO_W;
    geoState.canvas.height = GEO_H;
  }

  function geoLaneTop(lane) {
    return lane === 0 ? 0 : GEO_LANE_H + GEO_LANE_GAP;
  }

  function geoLaneFloor(lane) {
    return geoLaneTop(lane) + GEO_LANE_H - 34;
  }

  function geoLaneCeil(lane) {
    return geoLaneTop(lane) + 34;
  }

  function geoMakePlayer(id, lane, color) {
    return {
      id: id,
      lane: lane,
      color: color,
      x: GEO_X,
      y: geoLaneFloor(lane) - GEO_SIZE,
      vy: 0,
      rot: 0,
      alive: true,
      mode: "",
      onGround: false,
      trail: [],
    };
  }

  function geoModeLabel(mode) {
    return {
      cube: "CUBE",
      ship: "SHIP",
      gravity: "GRAVITY",
      wave: "WAVE",
    }[mode] || "CUBE";
  }

  function geoBuildMap() {
    var rand = geoRand(20260510);
    var pattern = ["cube", "cube", "ship", "gravity", "cube", "wave", "ship", "gravity", "wave"];
    var x = 360;
    geoState.segments = [];
    geoState.obstacles = [];

    for (var i = 0; i < 34; i++) {
      var mode = pattern[i % pattern.length];
      var len = 760 + Math.floor(rand() * 260) + (i > 10 ? 80 : 0);
      var start = x;
      var end = x + len;
      geoState.segments.push({ start: start, end: end, mode: mode });
      if (i > 0) geoState.obstacles.push({ type: "portal", x: start, mode: mode });

      if (mode === "cube" || mode === "gravity") {
        var p = start + 190;
        while (p < end - 120) {
          var group = rand() > 0.72 ? 2 : 1;
          var side = mode === "gravity" ? "top" : "bottom";
          geoState.obstacles.push({
            type: "spike",
            x: p,
            w: 30 * group,
            h: 30,
            side: side,
          });
          if (rand() > 0.78) {
            geoState.obstacles.push({
              type: "orb",
              x: p + 115,
              y: mode === "gravity" ? 92 + rand() * 46 : GEO_LANE_H - 118 - rand() * 42,
              r: 16,
            });
          }
          p += 210 + Math.floor(rand() * 120);
        }
      } else {
        var q = start + 190;
        while (q < end - 120) {
          var gap = Math.max(102, 138 - i * 1.1 - rand() * 14);
          var center = 104 + rand() * (GEO_LANE_H - 208);
          geoState.obstacles.push({
            type: "gate",
            x: q,
            w: 36,
            gapY: center - gap / 2,
            gapH: gap,
          });
          if (rand() > 0.7) {
            geoState.obstacles.push({
              type: "orb",
              x: q + 125,
              y: center + (rand() > 0.5 ? -gap * 0.68 : gap * 0.68),
              r: 14,
            });
          }
          q += 250 + Math.floor(rand() * 105);
        }
      }
      x = end;
    }
    geoState.mapEnd = x;
  }

  function geoModeAt(distance) {
    var worldX = distance + GEO_X;
    if (geoState.segments.length && worldX < geoState.segments[0].start) return geoState.segments[0].mode;
    for (var i = 0; i < geoState.segments.length; i++) {
      var s = geoState.segments[i];
      if (worldX >= s.start && worldX < s.end) return s.mode;
    }
    return geoState.segments.length ? geoState.segments[geoState.segments.length - 1].mode : "cube";
  }

  function geoSetKey(player, down) {
    if (player === 1) geoState.keys.p1 = down;
    if (player === 2) geoState.keys.p2 = down;
  }

  function geoEnter() {
    geoSetup();
    geoRestart();
  }

  function geoStop() {
    if (geoState.raf) cancelAnimationFrame(geoState.raf);
    if (geoState.countTimer) clearInterval(geoState.countTimer);
    geoState.raf = null;
    geoState.countTimer = null;
    geoState.status = "idle";
    geoState.keys.p1 = false;
    geoState.keys.p2 = false;
  }

  function geoRestart() {
    geoSetup();
    if (!geoState.canvas || !geoState.ctx) return;
    geoStop();
    geoBuildMap();
    geoState.status = "countdown";
    geoState.distance = 0;
    geoState.speed = 310;
    geoState.currentMode = "cube";
    geoState.last = 0;
    geoState.players = [
      geoMakePlayer(1, 0, "#00f5c4"),
      geoMakePlayer(2, 1, "#ff2d78"),
    ];
    geoState.keys.p1 = false;
    geoState.keys.p2 = false;

    var result = document.getElementById("geo-result-overlay");
    if (result) result.classList.remove("show");
    geoSyncHud();

    var n = 3;
    geoShowCountdown("3");
    geoState.countTimer = setInterval(function () {
      n--;
      if (n > 0) {
        geoShowCountdown(String(n));
      } else if (n === 0) {
        geoShowCountdown("GO");
      } else {
        clearInterval(geoState.countTimer);
        geoState.countTimer = null;
        geoHideCountdown();
        geoState.status = "running";
        geoState.last = performance.now();
        somOk();
      }
    }, 760);

    geoState.raf = requestAnimationFrame(geoLoop);
  }

  function geoShowCountdown(text) {
    var el = document.getElementById("geo-countdown");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
  }

  function geoHideCountdown() {
    var el = document.getElementById("geo-countdown");
    if (el) el.classList.remove("show");
  }

  function geoSyncHud() {
    var meter = document.getElementById("geo-meter");
    if (meter) meter.textContent = Math.max(0, Math.floor(geoState.distance / 18)) + "m";
    var mode = document.getElementById("geo-mode-pill");
    if (mode) mode.textContent = geoModeLabel(geoState.currentMode);
  }

  function geoSetMode(player, mode) {
    if (player.mode === mode) return;
    player.mode = mode;
    player.vy = 0;
    if (mode === "gravity") player.y = geoLaneCeil(player.lane);
    else if (mode === "ship" || mode === "wave") player.y = geoLaneTop(player.lane) + GEO_LANE_H * 0.5 - GEO_SIZE * 0.5;
    else player.y = geoLaneFloor(player.lane) - GEO_SIZE;
  }

  function geoUpdatePlayer(player, keyDown, dt, mode) {
    if (!player.alive) return;
    geoSetMode(player, mode);
    var floor = geoLaneFloor(player.lane);
    var ceil = geoLaneCeil(player.lane);

    if (mode === "ship") {
      player.vy += (keyDown ? -980 : 760) * dt;
      player.vy *= 0.992;
      player.y += player.vy * dt;
      player.rot = Math.max(-0.55, Math.min(0.55, player.vy / 520));
    } else if (mode === "wave") {
      player.vy = keyDown ? -510 : 510;
      player.y += player.vy * dt;
      player.rot = keyDown ? -0.72 : 0.72;
    } else if (mode === "gravity") {
      if (keyDown && player.onGround) {
        player.vy = 735;
        player.onGround = false;
        bipe(560, "square", 0.055, 0.05);
      }
      player.vy -= 1900 * dt;
      player.y += player.vy * dt;
      if (player.y <= ceil) {
        player.y = ceil;
        player.vy = 0;
        player.onGround = true;
      }
      player.rot -= Math.abs(player.vy) * dt * 0.018;
    } else {
      if (keyDown && player.onGround) {
        player.vy = -735;
        player.onGround = false;
        bipe(520, "square", 0.055, 0.05);
      }
      player.vy += 1900 * dt;
      player.y += player.vy * dt;
      if (player.y >= floor - GEO_SIZE) {
        player.y = floor - GEO_SIZE;
        player.vy = 0;
        player.onGround = true;
      }
      player.rot += Math.abs(player.vy) * dt * 0.018;
    }

    if (player.y < ceil - 2 || player.y + GEO_SIZE > floor + 2) {
      geoKill(player);
    }

    player.trail.push({ x: player.x + GEO_SIZE * 0.5, y: player.y + GEO_SIZE * 0.5, a: 1 });
    if (player.trail.length > 10) player.trail.shift();
    for (var i = 0; i < player.trail.length; i++) player.trail[i].a *= 0.82;
  }

  function geoKill(player) {
    if (!player.alive) return;
    player.alive = false;
    somErro();
  }

  function geoRectCircle(rx, ry, rw, rh, cx, cy, r) {
    var nx = Math.max(rx, Math.min(cx, rx + rw));
    var ny = Math.max(ry, Math.min(cy, ry + rh));
    var dx = cx - nx;
    var dy = cy - ny;
    return dx * dx + dy * dy <= r * r;
  }

  function geoCheckCollisions(player) {
    if (!player.alive) return;
    var left = geoState.distance + player.x + 3;
    var right = left + GEO_SIZE - 6;
    var top = player.y + 3;
    var bottom = top + GEO_SIZE - 6;
    var laneTop = geoLaneTop(player.lane);
    var floor = geoLaneFloor(player.lane);
    var ceil = geoLaneCeil(player.lane);

    for (var i = 0; i < geoState.obstacles.length; i++) {
      var o = geoState.obstacles[i];
      if (o.type === "portal") continue;
      if (o.x > right + 40) break;
      if (o.x + (o.w || o.r || 0) < left - 40) continue;

      if (o.type === "spike") {
        var sy = o.side === "top" ? ceil : floor - o.h;
        if (right > o.x && left < o.x + o.w && bottom > sy && top < sy + o.h) {
          geoKill(player);
          return;
        }
      } else if (o.type === "gate") {
        if (right > o.x && left < o.x + o.w) {
          var gapTop = laneTop + o.gapY;
          var gapBottom = gapTop + o.gapH;
          if (top < gapTop || bottom > gapBottom) {
            geoKill(player);
            return;
          }
        }
      } else if (o.type === "orb") {
        if (geoRectCircle(left, top, right - left, bottom - top, o.x, laneTop + o.y, o.r)) {
          geoKill(player);
          return;
        }
      }
    }
  }

  function geoFinishIfNeeded() {
    var p1 = geoState.players[0];
    var p2 = geoState.players[1];
    if (!p1 || !p2 || geoState.status !== "running") return;
    if (p1.alive && p2.alive) return;
    geoState.status = "finished";
    var title = "EMPATE TECNICO";
    if (!p1.alive && p2.alive) title = "PLAYER 2 VENCEU";
    else if (!p2.alive && p1.alive) title = "PLAYER 1 VENCEU";
    geoShowResult(title);
  }

  function geoShowResult(title) {
    var titleEl = document.getElementById("geo-result-title");
    var subEl = document.getElementById("geo-result-sub");
    var overlay = document.getElementById("geo-result-overlay");
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = Math.floor(geoState.distance / 18) + "m percorridos - ENTER para reiniciar";
    if (overlay) overlay.classList.add("show");
  }

  function geoUpdate(dt) {
    geoState.distance += geoState.speed * dt;
    geoState.speed = Math.min(455, 310 + geoState.distance * 0.008);
    geoState.currentMode = geoModeAt(geoState.distance);
    geoUpdatePlayer(geoState.players[0], geoState.keys.p1, dt, geoState.currentMode);
    geoUpdatePlayer(geoState.players[1], geoState.keys.p2, dt, geoState.currentMode);
    geoCheckCollisions(geoState.players[0]);
    geoCheckCollisions(geoState.players[1]);
    geoFinishIfNeeded();
    geoSyncHud();
  }

  function geoDrawLane(ctx, lane, label, color) {
    var top = geoLaneTop(lane);
    var floor = geoLaneFloor(lane);
    var ceil = geoLaneCeil(lane);
    ctx.save();
    ctx.fillStyle = lane === 0 ? "rgba(0,245,196,0.035)" : "rgba(255,45,120,0.035)";
    ctx.fillRect(0, top, GEO_W, GEO_LANE_H);
    ctx.strokeStyle = "rgba(74,58,156,0.28)";
    ctx.lineWidth = 1;
    var grid = 40;
    var off = -((geoState.distance * 0.7) % grid);
    for (var x = off; x < GEO_W; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + GEO_LANE_H);
      ctx.stroke();
    }
    for (var y = top + 18; y < top + GEO_LANE_H; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GEO_W, y);
      ctx.stroke();
    }
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floor);
    ctx.lineTo(GEO_W, floor);
    ctx.moveTo(0, ceil);
    ctx.lineTo(GEO_W, ceil);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = "13px 'Press Start 2P'";
    ctx.fillStyle = color;
    ctx.fillText(label, 22, top + 30);
    ctx.restore();
  }

  function geoDrawObstacle(ctx, o, lane) {
    var top = geoLaneTop(lane);
    var floor = geoLaneFloor(lane);
    var ceil = geoLaneCeil(lane);
    var x = o.x - geoState.distance;
    if (x < -80 || x > GEO_W + 80) return;
    ctx.save();
    if (o.type === "spike") {
      var y = o.side === "top" ? ceil : floor;
      ctx.fillStyle = o.side === "top" ? "rgba(255,45,120,0.9)" : "rgba(249,232,77,0.92)";
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (var sx = 0; sx < o.w; sx += 30) {
        ctx.beginPath();
        if (o.side === "top") {
          ctx.moveTo(x + sx, y);
          ctx.lineTo(x + sx + 15, y + o.h);
          ctx.lineTo(x + sx + 30, y);
        } else {
          ctx.moveTo(x + sx, y);
          ctx.lineTo(x + sx + 15, y - o.h);
          ctx.lineTo(x + sx + 30, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (o.type === "gate") {
      var gapTop = top + o.gapY;
      var gapBottom = gapTop + o.gapH;
      ctx.fillStyle = "rgba(0,180,255,0.82)";
      ctx.shadowColor = "rgba(0,180,255,0.55)";
      ctx.shadowBlur = 14;
      ctx.fillRect(x, ceil, o.w, Math.max(0, gapTop - ceil));
      ctx.fillRect(x, gapBottom, o.w, Math.max(0, floor - gapBottom));
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(x - 3, gapTop - 3, o.w + 6, 3);
      ctx.fillRect(x - 3, gapBottom, o.w + 6, 3);
    } else if (o.type === "orb") {
      ctx.fillStyle = "rgba(255,45,120,0.82)";
      ctx.shadowColor = "rgba(255,45,120,0.65)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x, top + o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.type === "portal") {
      ctx.strokeStyle = "rgba(249,232,77,0.8)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(249,232,77,0.55)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(x, top + GEO_LANE_H / 2, 20, 78, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "10px 'Press Start 2P'";
      ctx.fillStyle = "rgba(249,232,77,0.9)";
      ctx.fillText(geoModeLabel(o.mode), x - 32, top + GEO_LANE_H / 2 - 88);
    }
    ctx.restore();
  }

  function geoDrawPlayer(ctx, p) {
    ctx.save();
    for (var i = 0; i < p.trail.length; i++) {
      var t = p.trail[i];
      ctx.globalAlpha = t.a * 0.34;
      ctx.fillStyle = p.color;
      ctx.fillRect(t.x - 8, t.y - 8, 16, 16);
    }
    ctx.globalAlpha = p.alive ? 1 : 0.38;
    ctx.translate(p.x + GEO_SIZE / 2, p.y + GEO_SIZE / 2);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 14;
    if (p.mode === "ship") {
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();
    } else if (p.mode === "wave") {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(18, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(-GEO_SIZE / 2, -GEO_SIZE / 2, GEO_SIZE, GEO_SIZE);
      ctx.strokeStyle = "rgba(5,3,14,0.65)";
      ctx.lineWidth = 3;
      ctx.strokeRect(-GEO_SIZE / 2 + 4, -GEO_SIZE / 2 + 4, GEO_SIZE - 8, GEO_SIZE - 8);
    }
    ctx.restore();
  }

  function geoDraw() {
    var ctx = geoState.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, GEO_W, GEO_H);
    ctx.fillStyle = "#05030e";
    ctx.fillRect(0, 0, GEO_W, GEO_H);
    geoDrawLane(ctx, 0, "P1", "#00f5c4");
    geoDrawLane(ctx, 1, "P2", "#ff2d78");

    ctx.save();
    ctx.fillStyle = "rgba(249,232,77,0.18)";
    ctx.fillRect(0, GEO_LANE_H + GEO_LANE_GAP / 2 - 2, GEO_W, 4);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = "rgba(249,232,77,0.78)";
    ctx.textAlign = "center";
    ctx.fillText("VERSUS", GEO_W / 2, GEO_LANE_H + GEO_LANE_GAP / 2 + 5);
    ctx.restore();

    for (var i = 0; i < geoState.obstacles.length; i++) {
      var o = geoState.obstacles[i];
      if (o.x - geoState.distance > GEO_W + 120) break;
      geoDrawObstacle(ctx, o, 0);
      geoDrawObstacle(ctx, o, 1);
    }
    geoDrawPlayer(ctx, geoState.players[0]);
    geoDrawPlayer(ctx, geoState.players[1]);
  }

  function geoLoop(now) {
    if (geoState.status === "idle") return;
    if (!geoState.last) geoState.last = now;
    var dt = Math.min(0.034, Math.max(0, (now - geoState.last) / 1000));
    geoState.last = now;
    if (geoState.status === "running") geoUpdate(dt);
    geoDraw();
    geoState.raf = requestAnimationFrame(geoLoop);
  }

  document.addEventListener("keyup", function (e) {
    if (telaAtiva !== TELA.GEO) return;
    if (e.key === " " || e.key === "w" || e.key === "W") {
      geoSetKey(1, false);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      geoSetKey(2, false);
      e.preventDefault();
    }
  }, true);

  /* =====================================================================
   CUPSHOCK -- Boss fight arcade cartunesca  [REFORMULADO]
   ===================================================================== */
  var CY_W = 1280;
  var CY_H = 720;
  var TAX_GROUND = 586;
  var cyberDialog = [
    { t: "SENTINELA NEXUS", s: "Intruso detectado. Esta arena não responde a humanos." },
    { t: "VOCÊ", s: "Então abre caminho. Eu só preciso derrubar esse núcleo." },
    { t: "SENTINELA NEXUS", s: "Permissão negada. Ativando protocolo de combate." },
    { t: "NÚCLEO INSTÁVEL", s: "Desvie dos padrões, quebre a defesa e finalize o Sentinela." },
  ];
  var cyberState = {
    canvas: null,
    ctx: null,
    raf: null,
    last: 0,
    clock: 0,
    status: "idle",
    dialogIndex: 0,
    phase: 1,
    risk: 0,
    shake: 0,
    transformTimer: 0,
    nextAttack: 1.1,
    attackPulse: 0,
    patternIndex: 0,
    player: null,
    boss: null,
    bullets: [],
    enemy: [],
    particles: [],
    floating: [],
    bgParticles: [],
    keys: {
      left: false,
      right: false,
      jump: false,
      shoot: false,
      dash: false,
      special: false,
    },
  };

  function cyberSetup() {
    if (cyberState.canvas) return;
    cyberState.canvas = document.getElementById("cyber-canvas");
    if (!cyberState.canvas) return;
    cyberState.ctx = cyberState.canvas.getContext("2d");
    cyberState.canvas.width = CY_W;
    cyberState.canvas.height = CY_H;
  }

  function cyberMakePlayer() {
    return {
      x: 122, y: TAX_GROUND - 82, w: 42, h: 82,
      vx: 0, vy: 0, dir: 1, hp: 3,
      inv: 0, shootCd: 0, dashCd: 0, dashTime: 0, dashMax: 0,
      dashDirX: 1, dashDirY: 0,
      jumpFx: 0, landFx: 0, dashFx: 0, hurtFx: 0,
      special: 0, onGround: true, anim: 0,
      shootFlash: 0,
      trail: [],
    };
  }

  function cyberMakeBoss() {
    return {
      x: 790, y: 166, w: 245, h: 350,
      hp: 420, maxHp: 420,
      hurt: 0, mouth: 0, bob: 0, transform: 0,
      wingAngle: 0,
      eyePulse: 0,
      glitch: 0,
    };
  }

  function cyberInitBgParticles() {
    cyberState.bgParticles = [];
    for (var i = 0; i < 38; i++) {
      cyberState.bgParticles.push({
        x: Math.random() * CY_W,
        y: Math.random() * CY_H,
        size: 1 + Math.random() * 2.5,
        speed: 18 + Math.random() * 32,
        alpha: 0.08 + Math.random() * 0.22,
        color: Math.random() > 0.5 ? "#00f5c4" : "#9d5cff",
      });
    }
  }

  function cyberResetKeys() {
    cyberState.keys.left = false;
    cyberState.keys.right = false;
    cyberState.keys.jump = false;
    cyberState.keys.shoot = false;
    cyberState.keys.dash = false;
    cyberState.keys.special = false;
  }

  function cyberHandleKey(k, down) {
    var key = null;
    if (k === "ArrowLeft" || k === "a" || k === "A") key = "left";
    else if (k === "ArrowRight" || k === "d" || k === "D") key = "right";
    else if (k === "ArrowUp" || k === "w" || k === "W" || k === " ") key = "jump";
    else if (k === "Shift") key = "dash";
    else if (k === "j" || k === "J" || k === "z" || k === "Z") key = "shoot";
    else if (k === "k" || k === "K" || k === "x" || k === "X") key = "special";
    if (!key) return false;
    cyberState.keys[key] = down;
    return true;
  }

  function cyberEnter() { cyberSetup(); cyberRestart(); }

  function cyberStop() {
    if (cyberState.raf) cancelAnimationFrame(cyberState.raf);
    cyberState.raf = null;
    cyberState.status = "idle";
    cyberResetKeys();
    cyberHideMessage();
    cyberSetSiren(false);
  }

  function cyberRestart() {
    cyberSetup();
    if (!cyberState.canvas || !cyberState.ctx) return;
    if (cyberState.raf) cancelAnimationFrame(cyberState.raf);
    cyberState.raf = null;
    cyberState.last = 0; cyberState.clock = 0;
    cyberState.status = "intro"; cyberState.dialogIndex = 0;
    cyberState.phase = 1; cyberState.risk = 0; cyberState.shake = 0;
    cyberState.transformTimer = 0; cyberState.nextAttack = 1.1;
    cyberState.attackPulse = 0; cyberState.patternIndex = 0;
    cyberState.player = cyberMakePlayer();
    cyberState.boss = cyberMakeBoss();
    cyberState.bullets = []; cyberState.enemy = [];
    cyberState.particles = []; cyberState.floating = [];
    cyberInitBgParticles();
    cyberResetKeys();
    cyberSetSiren(false);
    cyberShowMessage("CUPSHOCK", "Aproxime-se do Sentinela Nexus");
    cyberSyncHud();
    cyberState.raf = requestAnimationFrame(cyberLoop);
  }

  function cyberConfirm() {
    if (cyberState.status === "idle") { cyberRestart(); return; }
    if (cyberState.status === "intro") {
      if (cyberState.player && cyberState.player.x > 440) cyberStartDialog();
      return;
    }
    if (cyberState.status === "dialog") {
      cyberState.dialogIndex++;
      if (cyberState.dialogIndex >= cyberDialog.length) cyberStartTransform();
      else cyberShowDialog();
      return;
    }
    if (cyberState.status === "win") { cyberStop(); irPara(TELA.ARCADE_GAMES); return; }
    if (cyberState.status === "lose") cyberRestart();
  }

  function cyberStartDialog() {
    cyberState.status = "dialog";
    cyberState.dialogIndex = 0;
    cyberResetKeys();
    cyberShowDialog();
    somNav();
  }

  function cyberShowDialog() {
    var d = cyberDialog[cyberState.dialogIndex];
    cyberShowMessage(d.t, d.s + "  ENTER");
  }

  function cyberStartTransform() {
    var p = cyberState.player;
    var b = cyberState.boss;
    cyberState.status = "transform";
    cyberState.transformTimer = 0;
    cyberState.shake = 0.12;
    cyberResetKeys();
    cyberHideMessage();
    if (p) { p.dir = 1; p.vx = 0; p.vy = 0; p.y = TAX_GROUND - p.h; }
    if (b) { b.transform = 0; b.mouth = 0; b.hurt = 0; }
    cyberBurst(910, 336, "#9d5cff", 30);
    bipe(180, "sawtooth", 0.18, 0.09);
    setTimeout(function () { bipe(290, "sawtooth", 0.16, 0.08); }, 170);
    setTimeout(function () { bipe(520, "square", 0.18, 0.07); }, 360);
  }

  function cyberStartFight() {
    cyberState.status = "fight";
    cyberHideMessage();
    cyberState.nextAttack = 0.72;
    cyberState.player.x = 150;
    cyberState.player.y = TAX_GROUND - cyberState.player.h;
    cyberState.player.vx = 0; cyberState.player.vy = 0;
    if (cyberState.boss) cyberState.boss.transform = 1;
    somOk();
  }

  function cyberShowMessage(title, sub) {
    var box = document.getElementById("cyber-message");
    var t = document.getElementById("cyber-message-title");
    var s = document.getElementById("cyber-message-sub");
    if (t) t.textContent = title;
    if (s) s.textContent = sub;
    if (box) box.classList.add("show");
  }

  function cyberHideMessage() {
    var box = document.getElementById("cyber-message");
    if (box) box.classList.remove("show");
  }

  function cyberSetSiren(on) {
    var siren = document.getElementById("tax-siren");
    if (siren) siren.classList.toggle("show", !!on);
  }

  function cyberPhaseName(phase) {
    return phase === 1 ? "PROTOCOLO I" : phase === 2 ? "MODO CAÇADOR" : "NÚCLEO CRÍTICO";
  }

  function cyberSchemeName(phase) {
    return phase === 1 ? "BLASTER" : phase === 2 ? "DASH AÉREO" : "ESPECIAL";
  }

  function cyberSyncHud() {
    var p = cyberState.player;
    var b = cyberState.boss;
    var hpPct = b ? Math.max(0, b.hp / b.maxHp) : 0;
    var level = document.getElementById("cyber-level");
    var time = document.getElementById("cyber-time");
    var deaths = document.getElementById("cyber-deaths");
    var status = document.getElementById("cyber-status");
    var dash = document.getElementById("cyber-dash");
    var phase = document.getElementById("tax-panel-phase");
    var phaseName = document.getElementById("tax-panel-name");
    var bossFill = document.getElementById("tax-boss-hp-fill");
    var playerHp = document.getElementById("tax-player-hp");
    var hearts = document.getElementById("tax-heart-row");
    var scheme = document.getElementById("tax-scheme");
    var risk = document.getElementById("tax-risk");
    var riskFill = document.getElementById("tax-risk-fill");

    if (level) level.textContent = String(cyberState.phase).padStart(2, "0");
    if (time) time.textContent = Math.round(hpPct * 100) + "%";
    if (deaths) deaths.textContent = Math.round(cyberState.risk) + "%";
    if (status) {
      var txt = "APROXIME-SE";
      if (cyberState.status === "dialog") txt = "AUDIÊNCIA";
      else if (cyberState.status === "transform") txt = "TRANSFORMAÇÃO";
      else if (cyberState.status === "fight") txt = "COMBATE ATIVO";
      else if (cyberState.status === "win") txt = "VITÓRIA";
      else if (cyberState.status === "lose") txt = "DERROTADO";
      status.textContent = txt;
    }
    if (dash) {
      var special = p ? Math.floor(p.special) : 0;
      dash.textContent = special + "%";
      dash.classList.toggle("cooldown", special < 100);
    }
    if (phase) phase.textContent = cyberState.phase + "/3";
    if (phaseName) phaseName.textContent = cyberPhaseName(cyberState.phase);
    if (bossFill) bossFill.style.width = Math.round(hpPct * 100) + "%";
    if (playerHp) playerHp.textContent = p ? p.hp : 0;
    if (hearts && p) {
      var html = "";
      for (var i = 0; i < 3; i++) html += '<i class="' + (i >= p.hp ? "empty" : "") + '"></i>';
      hearts.innerHTML = html;
    }
    if (scheme) scheme.textContent = cyberSchemeName(cyberState.phase);
    if (risk) risk.textContent = Math.round(cyberState.risk) + "%";
    if (riskFill) riskFill.style.width = Math.min(100, cyberState.risk) + "%";
  }

  function cyberRectHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function cyberCircleHitRect(c, r) {
    var nx = Math.max(r.x, Math.min(c.x, r.x + r.w));
    var ny = Math.max(r.y, Math.min(c.y, r.y + r.h));
    var dx = c.x - nx; var dy = c.y - ny;
    return dx * dx + dy * dy <= c.r * c.r;
  }

  function cyberDamagePlayer(amount) {
    var p = cyberState.player;
    if (!p || p.inv > 0 || cyberState.status !== "fight") return;
    p.hp -= amount || 1;
    p.inv = 1.15; p.vx = -210; p.vy = -260; p.hurtFx = 0.38;
    cyberState.risk = Math.min(100, cyberState.risk + 18);
    cyberState.shake = 0.22;
    somErro();
    cyberBurst(p.x + p.w / 2, p.y + 22, "#ff2d78", 22);
    // Soul shatter particles
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      cyberState.particles.push({
        x: p.x + p.w / 2, y: p.y + 40,
        vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 - 60,
        life: 0.5, max: 0.5, color: "#ff2d78",
        size: 4, type: "heart",
      });
    }
    if (p.hp <= 0) cyberLose();
  }

  function cyberDamageBoss(amount) {
    var b = cyberState.boss;
    var p = cyberState.player;
    if (!b || cyberState.status !== "fight") return;
    b.hp = Math.max(0, b.hp - amount);
    b.hurt = 0.16; b.mouth = 0.18; b.glitch = 0.12;
    if (p) p.special = Math.min(100, p.special + amount * 0.34);
    cyberState.risk = Math.min(100, cyberState.risk + amount * 0.03);
    cyberBurst(b.x + b.w * 0.48, b.y + b.h * 0.5, "#f9e84d", 8);
    // Glitch particles when hurt
    for (var i = 0; i < 4; i++) {
      cyberState.particles.push({
        x: b.x + 60 + Math.random() * 120, y: b.y + 60 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200,
        life: 0.25, max: 0.25, color: Math.random() > 0.5 ? "#00f5c4" : "#ff2d78",
        size: 6 + Math.random() * 8, type: "rect",
      });
    }
    if (b.hp <= 0) cyberWin();
  }

  function cyberWin() {
    if (cyberState.status !== "fight") return;
    cyberState.status = "win";
    cyberSetSiren(false);
    cyberShowMessage("SENTINELA DERROTADO", "O núcleo caiu. ENTER para voltar ao Arcade.");
    cyberBurst(cyberState.boss.x + 90, cyberState.boss.y + 150, "#00f5c4", 80);
    somOk(); confetti();
  }

  function cyberLose() {
    if (cyberState.status === "lose") return;
    cyberState.status = "lose";
    cyberSetSiren(true);
    cyberShowMessage("VOCÊ FOI DERROTADO", "O Sentinela dominou a arena. ENTER para tentar novamente.");
    cyberState.shake = 1.2;
    for (var i = 0; i < 8; i++) setTimeout(function () { bipe(190 + Math.random() * 90, "sawtooth", 0.08, 0.08); }, i * 110);
  }

  function cyberBurst(x, y, color, amount) {
    for (var i = 0; i < amount; i++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 90 + Math.random() * 320;
      cyberState.particles.push({
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0.35 + Math.random() * 0.55, max: 0.75,
        color: color, size: 2 + Math.random() * 5, type: "rect",
      });
    }
  }

  function cyberShoot() {
    var p = cyberState.player;
    if (!p || p.shootCd > 0 || cyberState.status !== "fight") return;
    p.shootCd = 0.13;
    p.shootFlash = 0.1;
    var dir = p.dir || 1;
    cyberState.bullets.push({
      x: p.x + (dir > 0 ? p.w + 4 : -8),
      y: p.y + p.h - 34,
      w: 18, h: 6, vx: 720 * dir, life: 1.1,
    });
    bipe(760, "square", 0.035, 0.035);
  }

  function cyberSpecial() {
    var p = cyberState.player;
    if (!p || p.special < 100 || cyberState.status !== "fight") return;
    p.special = 0;
    cyberState.shake = 0.28;
    cyberDamageBoss(54);
    // Beam particles across screen
    for (var i = 0; i < 20; i++) {
      cyberState.particles.push({
        x: p.x + p.w, y: p.y + 30 + (Math.random() - 0.5) * 20,
        vx: 1400 + Math.random() * 200, vy: (Math.random() - 0.5) * 60,
        life: 0.22, max: 0.22, color: i % 2 ? "#00f5c4" : "#ffffff",
        size: 3 + Math.random() * 5, type: "rect",
      });
    }
    cyberBurst(cyberState.boss.x + 90, cyberState.boss.y + 120, "#00f5c4", 44);
    bipe(880, "triangle", 0.12, 0.12);
    setTimeout(function () { bipe(1320, "triangle", 0.15, 0.1); }, 80);
  }

  function cyberSpawnEnemy(type, data) {
    var o = data || {};
    o.type = type; o.life = o.life || 8;
    cyberState.enemy.push(o);
  }

  function cyberSpawnLaser(lane, order, speed, warn) {
    var low = lane === "low";
    cyberSpawnEnemy("note", {
      x: CY_W + 42 + order * 146,
      y: low ? TAX_GROUND - 36 : TAX_GROUND - 164,
      w: low ? 48 : 42, h: low ? 30 : 34,
      vx: -(speed || 282) - order * 10, vy: 0,
      rot: low ? -0.08 : 0.1,
      warn: warn == null ? 0.38 : warn,
      lane: lane, damage: 1,
      glow: 0,
    });
  }

  function cyberSpawnOrbs(count, startX, speed, gravity, spread) {
    for (var i = 0; i < count; i++) {
      cyberSpawnEnemy("coin", {
        x: startX + i * (spread || 86), y: 84 + (i % 2) * 18,
        r: 12 + (i % 2),
        vx: -(speed || 190) - i * 15, vy: -92 + i * 15,
        gravity: gravity || 455, damage: 1,
        spin: Math.random() * Math.PI * 2,
      });
    }
  }

  function cyberSpawnDrones(count, speed, tight) {
    var p = cyberState.player || { y: TAX_GROUND - 90 };
    for (var i = 0; i < count; i++) {
      var gy = 150 + ((i * 79 + cyberState.patternIndex * 41) % 310);
      cyberSpawnEnemy("ghost", {
        x: CY_W + 60 + i * (tight ? 70 : 92), y: gy,
        r: tight ? 12 : 13,
        vx: -(speed || 180) - i * 8,
        vy: (p.y + 18 - gy) * (tight ? 0.085 : 0.07),
        amp: tight ? 24 : 30, freq: tight ? 3.2 : 2.6,
        wave: i * 1.4, damage: 1,
        eyeFlicker: Math.random(),
      });
    }
  }

  function cyberSpawnImpacts(columns, warn, speed) {
    for (var i = 0; i < columns.length; i++) {
      cyberSpawnEnemy("stamp", {
        x: columns[i], y: -72 - i * 24,
        w: 74, h: 52,
        vy: (speed || 312) + i * 10,
        warn: warn == null ? 0.58 : warn, damage: 1,
        rot: (Math.random() - 0.5) * 0.15,
      });
    }
  }

  function cyberSpawnCoreRush(speed, warn) {
    cyberSetSiren(true);
    cyberSpawnEnemy("pfcar", {
      x: CY_W + 70, y: TAX_GROUND - 48,
      w: 124, h: 48,
      vx: -(speed || 585),
      warn: warn == null ? 0.48 : warn, damage: 1,
      chargeAnim: 0,
    });
    setTimeout(function () {
      if (cyberState.status === "fight") cyberSetSiren(false);
    }, 1300);
  }

  function cyberBossAttack() {
    var phase = cyberState.phase;
    cyberState.boss.mouth = 0.32;
    cyberState.attackPulse = 0.32;
    cyberState.boss.eyePulse = 0.4;
    cyberState.patternIndex++;
    var step = cyberState.patternIndex;

    if (phase === 1) {
      var p1 = step % 3;
      if (p1 === 1) {
        ["low", "high", "low"].forEach(function (lane, i) { cyberSpawnLaser(lane, i, 282, 0.42); });
      } else if (p1 === 2) {
        cyberSpawnOrbs(5, 720, 178, 430, 82);
      } else {
        ["high", "low", "high"].forEach(function (lane, i) { cyberSpawnLaser(lane, i, 300, 0.38); });
        cyberSpawnOrbs(2, 890, 165, 390, 112);
      }
    } else if (phase === 2) {
      var p2 = step % 4;
      if (p2 === 1) {
        cyberSpawnDrones(5, 188, false);
      } else if (p2 === 2) {
        cyberSpawnImpacts([250, 430, 610, 790], 0.62, 330);
      } else if (p2 === 3) {
        ["low", "high", "low", "high"].forEach(function (lane, i) { cyberSpawnLaser(lane, i, 318, 0.34); });
      } else {
        cyberSpawnDrones(3, 180, true);
        cyberSpawnOrbs(4, 760, 210, 470, 92);
      }
    } else {
      var p3 = step % 5;
      if (p3 === 1) {
        cyberSpawnCoreRush(620, 0.46);
        cyberSpawnDrones(3, 205, true);
      } else if (p3 === 2) {
        ["low", "high", "low", "high", "low"].forEach(function (lane, i) { cyberSpawnLaser(lane, i, 338, 0.3); });
      } else if (p3 === 3) {
        cyberSpawnImpacts([230, 370, 510, 650, 790], 0.52, 365);
      } else {
        cyberSpawnOrbs(6, 700, 230, 540, 92);
        if (p3 === 0) cyberSpawnLaser(step % 2 ? "high" : "low", 0, 330, 0.32);
      }
    }
  }

  function cyberUpdatePlayer(dt) {
    var p = cyberState.player;
    if (!p) return;
    var keys = cyberState.keys;
    var target = 0;
    var wasGround = p.onGround;
    if (keys.left) target -= 1;
    if (keys.right) target += 1;
    if (target !== 0) p.dir = target;

    var accel = p.onGround ? 2300 : 1450;
    p.vx += target * accel * dt;
    if (target === 0) p.vx *= Math.pow(0.0008, dt);
    p.vx = Math.max(-270, Math.min(270, p.vx));

    if (keys.dash && p.dashCd <= 0) {
      var dx = 0; var dy = keys.jump ? -1 : 0;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;
      if (dx === 0 && dy === 0) dx = p.dir || 1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      p.dashDirX = dx / len; p.dashDirY = dy / len;
      p.dashTime = 0.22; p.dashMax = 0.22; p.dashFx = 0.22;
      p.dashCd = 0.62; p.inv = Math.max(p.inv, 0.22);
      p.vx = 780 * p.dashDirX; p.vy = 720 * p.dashDirY;
      if (p.dashDirY < 0) p.onGround = false;
      keys.dash = false;
      if (dy < 0) keys.jump = false;
      // Spawn dash trail
      for (var i = 0; i < 3; i++) {
        cyberState.particles.push({
          x: p.x + p.w / 2, y: p.y + p.h / 2,
          vx: -p.dashDirX * (60 + i * 30) + (Math.random() - 0.5) * 40,
          vy: -p.dashDirY * 60 + (Math.random() - 0.5) * 40,
          life: 0.18 + i * 0.05, max: 0.25, color: i % 2 ? "#00f5c4" : "#ff2d78",
          size: 8 - i * 2, type: "rect",
        });
      }
      bipe(940 + (p.dashDirY < 0 ? 160 : 0), "square", 0.055, 0.05);
    }

    if (keys.jump && p.onGround && p.dashTime <= 0) {
      p.vy = -610; p.onGround = false; p.jumpFx = 0.24;
      keys.jump = false;
      cyberBurst(p.x + p.w / 2, TAX_GROUND - 2, "#00f5c4", 6);
      bipe(560, "square", 0.045, 0.045);
    }
    if (keys.shoot) cyberShoot();
    if (keys.special) { cyberSpecial(); keys.special = false; }

    if (p.dashTime > 0) {
      var dashRatio = p.dashMax ? p.dashTime / p.dashMax : 0;
      var dashSpeed = 520 + 300 * dashRatio;
      p.vx = p.dashDirX * dashSpeed; p.vy = p.dashDirY * dashSpeed;
      p.dashTime = Math.max(0, p.dashTime - dt);
    } else {
      p.vy += 1620 * dt;
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.x = Math.max(42, Math.min(cyberState.status === "intro" ? 540 : 740, p.x));
    if (p.y >= TAX_GROUND - p.h) {
      if (!wasGround && p.vy > 220) {
        p.landFx = 0.2;
        cyberBurst(p.x + p.w / 2, TAX_GROUND - 3, "#00f5c4", 8);
      }
      p.y = TAX_GROUND - p.h; p.vy = 0; p.onGround = true;
    }
    if (p.inv > 0) p.inv = Math.max(0, p.inv - dt);
    if (p.shootCd > 0) p.shootCd = Math.max(0, p.shootCd - dt);
    if (p.shootFlash > 0) p.shootFlash = Math.max(0, p.shootFlash - dt);
    if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);
    if (p.jumpFx > 0) p.jumpFx = Math.max(0, p.jumpFx - dt);
    if (p.landFx > 0) p.landFx = Math.max(0, p.landFx - dt);
    if (p.dashFx > 0) p.dashFx = Math.max(0, p.dashFx - dt);
    if (p.hurtFx > 0) p.hurtFx = Math.max(0, p.hurtFx - dt);
    p.anim += dt * (Math.abs(p.vx) > 20 && p.onGround ? 12 : 5);

    // Keep trail for ghost effect
    p.trail = p.trail || [];
    p.trail.unshift({ x: p.x, y: p.y, dir: p.dir, alpha: 0.32 });
    if (p.trail.length > 5) p.trail.pop();
    for (var ti = 0; ti < p.trail.length; ti++) p.trail[ti].alpha *= 0.72;
  }

  function cyberUpdateFight(dt) {
    var p = cyberState.player;
    var boss = cyberState.boss;
    if (!p || !boss) return;
    var hpPct = boss.hp / boss.maxHp;
    var newPhase = hpPct > 0.66 ? 1 : hpPct > 0.33 ? 2 : 3;
    if (newPhase !== cyberState.phase) {
      cyberState.phase = newPhase;
      cyberState.shake = 0.24;
      cyberShowMessage("NOVO PROTOCOLO", cyberPhaseName(newPhase));
      setTimeout(function () {
        if (cyberState.status === "fight") cyberHideMessage();
      }, 850);
      cyberBurst(boss.x + 120, boss.y + 150, newPhase === 2 ? "#00f5c4" : "#ff2d78", 34);
      somDraw();
    }

    boss.bob += dt;
    boss.hurt = Math.max(0, boss.hurt - dt);
    boss.mouth = Math.max(0, boss.mouth - dt);
    boss.eyePulse = Math.max(0, boss.eyePulse - dt * 2);
    boss.glitch = Math.max(0, boss.glitch - dt * 3);
    boss.wingAngle = Math.sin(cyberState.clock * 1.8) * 0.12 + 0.08;
    cyberState.attackPulse = Math.max(0, cyberState.attackPulse - dt);
    cyberState.risk = Math.min(100, cyberState.risk + dt * (cyberState.phase * 1.25));
    cyberState.nextAttack -= dt * (1 + cyberState.risk / 210);
    if (cyberState.nextAttack <= 0) {
      var maxThreats = cyberState.phase === 1 ? 7 : cyberState.phase === 2 ? 9 : 11;
      var heavyCount = cyberState.enemy.filter(function (e) {
        return e.type === "pfcar" || e.type === "stamp";
      }).length;
      var activeLasers = cyberState.enemy.filter(function (e) {
        return e.type === "note" && e.warn <= 0;
      });
      if (heavyCount > 1 || activeLasers.length > 5 || cyberState.enemy.length >= maxThreats) {
        cyberState.nextAttack = 0.22;
      } else {
        cyberBossAttack();
        cyberState.nextAttack = Math.max(0.72, 1.68 - cyberState.phase * 0.16 - cyberState.risk * 0.003);
      }
    }
  }

  function cyberUpdateBullets(dt) {
    var bossBox = {
      x: cyberState.boss.x + 28, y: cyberState.boss.y + 28,
      w: cyberState.boss.w - 56, h: cyberState.boss.h - 18,
    };
    for (var i = cyberState.bullets.length - 1; i >= 0; i--) {
      var b = cyberState.bullets[i];
      b.x += b.vx * dt; b.life -= dt;
      if (cyberRectHit(b, bossBox)) {
        cyberDamageBoss(5);
        cyberState.bullets.splice(i, 1);
        // Hit spark
        cyberBurst(b.x, b.y + 3, "#f9e84d", 6);
      } else if (b.life <= 0 || b.x < -40 || b.x > CY_W + 40) {
        cyberState.bullets.splice(i, 1);
      }
    }
  }

  function cyberUpdateEnemy(dt) {
    var p = cyberState.player;
    var pBox = { x: p.x + 12, y: p.y + 24, w: p.w - 24, h: p.h - 36 };
    for (var i = cyberState.enemy.length - 1; i >= 0; i--) {
      var e = cyberState.enemy[i];
      e.life -= dt;
      if (e.type === "coin") {
        e.vy += e.gravity * dt;
        e.x += e.vx * dt; e.y += e.vy * dt;
        e.spin = (e.spin || 0) + dt * 3;
      } else if (e.type === "ghost") {
        e.wave += dt * (e.freq || 3.4);
        e.x += e.vx * dt;
        e.y += (e.vy + Math.sin(e.wave) * (e.amp || 40)) * dt;
        e.y = Math.max(124, Math.min(TAX_GROUND - 72, e.y));
        e.eyeFlicker = (e.eyeFlicker || 0) + dt * 8;
      } else if (e.type === "stamp") {
        e.warn -= dt;
        if (e.warn <= 0) e.y += e.vy * dt;
      } else if (e.type === "pfcar") {
        e.warn -= dt;
        e.chargeAnim = (e.chargeAnim || 0) + dt;
        if (e.warn <= 0) e.x += e.vx * dt;
      } else if (e.type === "note") {
        e.warn -= dt;
        e.glow = (e.glow || 0) + dt * 6;
        if (e.warn <= 0) { e.x += e.vx * dt; e.y += e.vy * dt; }
      } else {
        e.x += e.vx * dt; e.y += e.vy * dt;
      }

      var hit = false;
      if (e.type === "coin") {
        hit = cyberCircleHitRect({ x: e.x, y: e.y, r: (e.r || 12) * 0.72 }, pBox);
      } else if (e.type === "ghost") {
        hit = cyberCircleHitRect({ x: e.x, y: e.y, r: (e.r || 14) * 0.68 }, pBox);
      } else if (e.type === "note") {
        hit = e.warn <= 0 && cyberRectHit({ x: e.x + 9, y: e.y + 7, w: e.w - 18, h: e.h - 14 }, pBox);
      } else if (e.type === "stamp") {
        hit = e.warn <= 0 && cyberRectHit({ x: e.x + 10, y: e.y + 9, w: e.w - 20, h: e.h - 18 }, pBox);
      } else if (e.type === "pfcar") {
        hit = e.warn <= 0 && cyberRectHit({ x: e.x + 18, y: e.y + 18, w: e.w - 36, h: e.h - 24 }, pBox);
      } else {
        hit = cyberRectHit({ x: e.x + 6, y: e.y + 6, w: e.w - 12, h: e.h - 12 }, pBox);
      }
      if (hit) {
        cyberDamagePlayer(e.damage || 1);
        cyberBurst(p.x + p.w / 2, p.y + 30, "#ff2d78", 10);
        cyberState.enemy.splice(i, 1); continue;
      }
      if (e.life <= 0 || e.x < -180 || e.x > CY_W + 180 || e.y > CY_H + 160) cyberState.enemy.splice(i, 1);
    }
  }

  function cyberUpdateParticles(dt) {
    for (var i = cyberState.particles.length - 1; i >= 0; i--) {
      var p = cyberState.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 520 * dt; p.life -= dt;
      if (p.life <= 0) cyberState.particles.splice(i, 1);
    }
    // Update bg particles
    for (var j = 0; j < cyberState.bgParticles.length; j++) {
      var bp = cyberState.bgParticles[j];
      bp.y -= bp.speed * dt;
      if (bp.y < -10) { bp.y = CY_H + 5; bp.x = Math.random() * CY_W; }
    }
  }

  function cyberUpdateTransform(dt) {
    var p = cyberState.player;
    var b = cyberState.boss;
    cyberState.transformTimer += dt;
    var t = Math.min(1, cyberState.transformTimer / 1.55);
    if (b) {
      b.transform = t;
      b.mouth = Math.max(b.mouth, t > 0.58 ? 0.22 : 0);
      b.bob += dt;
      b.wingAngle = Math.sin(cyberState.clock * 3) * t * 0.3;
    }

    // Occasional burst during transform
    if (Math.random() < dt * 6 && t > 0.2 && b) {
      cyberBurst(
        b.x + 40 + Math.random() * (b.w - 80),
        b.y + 40 + Math.random() * (b.h - 80),
        t > 0.6 ? "#ff2d78" : "#9d5cff", 6
      );
    }

    if (cyberState.transformTimer > 1.85 && cyberState.status === "transform") cyberStartFight();
  }

  function cyberUpdate(dt) {
    if (cyberState.status === "transform") cyberUpdateTransform(dt);
    cyberUpdatePlayer(dt);
    if (cyberState.status === "fight") {
      cyberUpdateFight(dt);
      cyberUpdateBullets(dt);
      cyberUpdateEnemy(dt);
    }
    cyberUpdateParticles(dt);
    if (cyberState.shake > 0) cyberState.shake = Math.max(0, cyberState.shake - dt * 2.8);
    cyberSyncHud();
  }

  /* ======================== DRAW FUNCTIONS ======================== */

  function cyberDrawBackground(ctx) {
    var t = cyberState.clock;
    var phase = cyberState.phase;

    // Sky base
    ctx.fillStyle = "#03040f";
    ctx.fillRect(0, 0, CY_W, CY_H);

    // Atmospheric radial glow behind boss - color shifts per phase
    var glowColor = phase === 1 ? "rgba(0,180,255,0.13)" : phase === 2 ? "rgba(255,100,30,0.11)" : "rgba(255,30,80,0.14)";
    var grd = ctx.createRadialGradient(910, 330, 60, 910, 330, 520);
    grd.addColorStop(0, phase === 1 ? "rgba(0,100,200,0.22)" : phase === 2 ? "rgba(200,60,10,0.2)" : "rgba(200,20,60,0.22)");
    grd.addColorStop(0.5, glowColor);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CY_W, CY_H);

    // Vertical columns (perspective floor lines)
    ctx.save();
    ctx.strokeStyle = "rgba(74,58,156,0.18)";
    ctx.lineWidth = 1;
    for (var x = -20; x < CY_W; x += 52) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CY_H); ctx.stroke();
    }
    for (var y2 = 0; y2 < CY_H; y2 += 52) {
      ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(CY_W, y2); ctx.stroke();
    }
    ctx.restore();

    // Perspective floor grid with vanishing point
    ctx.save();
    ctx.strokeStyle = phase === 3 ? "rgba(255,45,120,0.35)" : "rgba(157,92,255,0.32)";
    ctx.lineWidth = 1.5;
    var vx = 640, vy = TAX_GROUND;
    for (var gi = 0; gi <= 12; gi++) {
      var gx = gi * (CY_W / 12);
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(gx, CY_H); ctx.stroke();
    }
    for (var gr = 1; gr <= 5; gr++) {
      var gy = TAX_GROUND + gr * ((CY_H - TAX_GROUND) / 5);
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CY_W, gy); ctx.stroke();
    }
    ctx.restore();

    // Ground line with glow
    ctx.save();
    ctx.shadowColor = phase === 3 ? "rgba(255,45,120,0.9)" : "rgba(157,92,255,0.9)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = phase === 3 ? "rgba(255,45,120,0.8)" : "rgba(157,92,255,0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, TAX_GROUND + 2); ctx.lineTo(CY_W, TAX_GROUND + 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Ambient floating particles
    ctx.save();
    for (var pi = 0; pi < cyberState.bgParticles.length; pi++) {
      var bp = cyberState.bgParticles[pi];
      ctx.globalAlpha = bp.alpha * (0.8 + Math.sin(t * 2.2 + pi) * 0.2);
      ctx.fillStyle = bp.color;
      ctx.fillRect(bp.x - bp.size / 2, bp.y - bp.size / 2, bp.size, bp.size);
    }
    ctx.restore();

    // Phase 3 red scan line
    if (phase === 3) {
      var scan = ((t * 120) % (CY_H + 20)) - 10;
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#ff2d78";
      ctx.fillRect(0, scan, CY_W, 4);
      ctx.restore();
    }
  }

  function cyberRoundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function cyberClamp01(v) { return Math.max(0, Math.min(1, v)); }
  function cyberSmooth(v) { v = cyberClamp01(v); return v * v * (3 - 2 * v); }

  function cyberBossBeastAmount() {
    if (cyberState.status === "intro" || cyberState.status === "dialog") return 0;
    if (cyberState.status === "transform") return cyberSmooth(cyberState.boss ? cyberState.boss.transform : 0);
    return 1;
  }

  /* ---- Boss calm (pre-fight) form ---- */
  function cyberDrawCalmBoss(ctx, alpha, amount) {
    var b = cyberState.boss;
    if (!b || alpha <= 0.01) return;
    var t = cyberState.clock;
    var bob = Math.sin(t * 1.6) * 5;
    var cx = b.x + b.w / 2;
    var cy2 = b.y + b.h / 2 + bob - amount * 40;
    ctx.save();
    ctx.globalAlpha *= alpha;

    // Outer hexagonal shell
    ctx.save();
    ctx.translate(cx, cy2 - 20);
    for (var hi = 0; hi < 6; hi++) {
      var ha = hi * Math.PI / 3 + t * 0.3;
      var hr = 110 + Math.sin(t * 2 + hi) * 4;
      var hx = Math.cos(ha) * hr; var hy = Math.sin(ha) * hr;
      ctx.strokeStyle = "rgba(0,245,196," + (0.12 + Math.sin(t * 3 + hi) * 0.06) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(hx, hy);
      ctx.strokeStyle = "rgba(0,245,196,0.07)";
      ctx.stroke();
    }
    ctx.restore();

    // Main body: tall dark panel with circuit accents
    ctx.fillStyle = "rgba(10,14,36,0.97)";
    ctx.strokeStyle = "rgba(0,245,196,0.65)";
    ctx.lineWidth = 4;
    cyberRoundRectPath(ctx, b.x + 22, b.y + 60, b.w - 44, b.h - 80, 18);
    ctx.fill(); ctx.stroke();

    // Inner face panel
    ctx.fillStyle = "rgba(6,10,28,0.99)";
    ctx.strokeStyle = "rgba(157,92,255,0.55)";
    ctx.lineWidth = 3;
    cyberRoundRectPath(ctx, b.x + 38, b.y + 80, b.w - 76, b.h - 120, 14);
    ctx.fill(); ctx.stroke();

    // Two glowing eyes
    var eyePulse = 0.72 + Math.sin(t * 3.5) * 0.22;
    ctx.shadowColor = "#00b4ff"; ctx.shadowBlur = 22;
    ctx.fillStyle = "rgba(0,180,255," + eyePulse + ")";
    ctx.beginPath();
    ctx.arc(b.x + 88, b.y + 170, 20, 0, Math.PI * 2);
    ctx.arc(b.x + b.w - 88, b.y + 170, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Pupil slit
    ctx.fillStyle = "#05030e";
    ctx.fillRect(b.x + 84, b.y + 164, 8, 12);
    ctx.fillRect(b.x + b.w - 92, b.y + 164, 8, 12);

    // Chest core (calm/idle pulsing)
    var corePulse = 0.6 + Math.sin(t * 4.5) * 0.28;
    ctx.shadowColor = "rgba(0,245,196,0.9)"; ctx.shadowBlur = 24;
    ctx.fillStyle = "rgba(0,245,196," + corePulse + ")";
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + 260, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Core ring
    ctx.strokeStyle = "rgba(0,245,196,0.4)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 260, 52, 0, Math.PI * 2); ctx.stroke();

    // Name label
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#00f5c4";
    ctx.textAlign = "center";
    ctx.fillText("NEXUS", b.x + b.w / 2, b.y + 55);
    ctx.font = "9px 'Press Start 2P'";
    ctx.fillStyle = "rgba(200,220,255,0.55)";
    ctx.fillText("standby", b.x + b.w / 2, b.y + 74);

    if (amount > 0.06) {
      ctx.globalAlpha *= amount;
      ctx.strokeStyle = "#ff2d78"; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(b.x + 44, b.y + 104); ctx.lineTo(b.x + 92, b.y + 172); ctx.lineTo(b.x + 72, b.y + 228);
      ctx.moveTo(b.x + b.w - 44, b.y + 104); ctx.lineTo(b.x + b.w - 92, b.y + 172); ctx.lineTo(b.x + b.w - 72, b.y + 228);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- Boss transform rays ---- */
  function cyberDrawTransformRays(ctx, amount) {
    if (amount <= 0.04 || amount >= 0.98) return;
    var b = cyberState.boss;
    if (!b) return;
    var cx = b.x + b.w / 2; var cy2 = b.y + b.h / 2;
    ctx.save();
    ctx.globalAlpha = Math.sin(amount * Math.PI) * 0.75;
    var rayColor = amount > 0.55 ? "#ff2d78" : "#00f5c4";
    ctx.strokeStyle = rayColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = rayColor; ctx.shadowBlur = 20;
    for (var i = 0; i < 20; i++) {
      var a = i * Math.PI / 10 + cyberState.clock * 1.1;
      var r1 = 60 + amount * 30;
      var r2 = 160 + Math.sin(cyberState.clock * 10 + i) * 28;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy2 + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy2 + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ---- Boss active (fight) form - 3 phases ---- */
  function cyberDrawBoss(ctx) {
    var amount = cyberBossBeastAmount();
    cyberDrawCalmBoss(ctx, 1 - amount, amount);
    cyberDrawTransformRays(ctx, amount);
    if (amount > 0.01) cyberDrawBossMonster(ctx, amount);
  }

  function cyberDrawBossMonster(ctx, amount) {
    var b = cyberState.boss;
    if (!b) return;
    amount = cyberClamp01(amount == null ? 1 : amount);
    var t = cyberState.clock;
    var phase = cyberState.phase;
    var bob = Math.sin(t * 2.2) * (phase === 3 ? 14 : 8);
    var attack = cyberState.attackPulse > 0 ? cyberState.attackPulse / 0.32 : 0;
    var hurt = b.hurt > 0 ? Math.sin(t * 88) * 7 : 0;
    var glitch = b.glitch > 0 && Math.floor(t * 40) % 3 === 0;

    // Phase colors
    var bodyColor, eyeColor, coreColor, accentColor;
    if (phase === 1) {
      bodyColor = "rgba(12,18,48,0.97)";
      eyeColor = "#00b4ff"; coreColor = "#00f5c4"; accentColor = "#9d5cff";
    } else if (phase === 2) {
      bodyColor = "rgba(28,14,8,0.97)";
      eyeColor = "#ff8c00"; coreColor = "#ff5520"; accentColor = "#f9e84d";
    } else {
      bodyColor = "rgba(28,4,14,0.97)";
      eyeColor = "#ff2d78"; coreColor = "#ff0040"; accentColor = "#ff8080";
    }

    var x = b.x + hurt;
    var y = b.y + bob + Math.sin(attack * Math.PI) * 6;
    var cx2 = b.x + b.w / 2;
    var cy2 = b.y + b.h / 2;

    ctx.save();
    ctx.globalAlpha *= amount;
    var scale = 0.74 + amount * 0.26 + attack * 0.03;
    ctx.translate(cx2, cy2 + (1 - amount) * 62);
    ctx.scale(scale, scale);
    ctx.translate(-cx2, -cy2);

    if (glitch) {
      ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
    }

    /* ---- WINGS ---- */
    var wingA = b.wingAngle || 0;
    var wingSpread = phase === 2 ? 1.35 : phase === 3 ? 1.6 : 0.9;
    var wingFlap = Math.sin(t * (phase === 3 ? 5.5 : 2.8)) * 0.14 * wingSpread;

    for (var wi = 0; wi < 2; wi++) {
      var wSide = wi === 0 ? -1 : 1;
      var wBaseX = cx2 + wSide * 40;
      var wBaseY = b.y + 140;
      var wTipX = cx2 + wSide * (160 + wingSpread * 80);
      var wTipY = b.y + 80 + wingFlap * 80;
      var wBotX = cx2 + wSide * (110 + wingSpread * 60);
      var wBotY = b.y + b.h - 80;

      ctx.save();
      ctx.globalAlpha *= 0.82;
      var wGrad = ctx.createLinearGradient(wBaseX, wBaseY, wTipX, wTipY);
      if (phase === 1) {
        wGrad.addColorStop(0, "rgba(30,40,100,0.9)");
        wGrad.addColorStop(1, "rgba(0,180,255,0.15)");
      } else if (phase === 2) {
        wGrad.addColorStop(0, "rgba(100,30,10,0.9)");
        wGrad.addColorStop(1, "rgba(255,80,20,0.15)");
      } else {
        wGrad.addColorStop(0, "rgba(100,10,30,0.9)");
        wGrad.addColorStop(1, "rgba(255,20,60,0.15)");
      }
      ctx.fillStyle = wGrad;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(wBaseX, wBaseY);
      ctx.quadraticCurveTo(wTipX, wTipY - 50, wTipX + wSide * 20, wTipY);
      ctx.quadraticCurveTo(wTipX, wTipY + 50, wBotX, wBotY);
      ctx.quadraticCurveTo(cx2 + wSide * 60, b.y + b.h - 40, wBaseX, wBaseY);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Wing vein lines
      ctx.strokeStyle = "rgba(" + (phase === 1 ? "0,200,255" : phase === 2 ? "255,100,20" : "255,40,80") + ",0.28)";
      ctx.lineWidth = 1.5;
      for (var vn = 1; vn <= 3; vn++) {
        var vnr = vn / 4;
        ctx.beginPath();
        ctx.moveTo(wBaseX, wBaseY);
        ctx.lineTo(wBaseX + (wTipX - wBaseX) * vnr, wBaseY + (wTipY - wBaseY) * vnr - 30 * vnr);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ---- LEGS/CLAWS ---- */
    ctx.strokeStyle = "rgba(157,92,255,0.5)";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    var legs = [
      [x + 60, y + b.h - 40, x + 10, y + b.h + 20, x - 60, TAX_GROUND - 10],
      [x + b.w - 60, y + b.h - 40, x + b.w - 10, y + b.h + 20, x + b.w + 60, TAX_GROUND - 10],
    ];
    for (var li = 0; li < legs.length; li++) {
      ctx.beginPath();
      ctx.moveTo(legs[li][0], legs[li][1]);
      ctx.quadraticCurveTo(legs[li][2], legs[li][3], legs[li][4], legs[li][5]);
      ctx.stroke();
      // Claw
      ctx.shadowColor = accentColor; ctx.shadowBlur = 12;
      ctx.fillStyle = accentColor;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(legs[li][4], legs[li][5], 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* ---- MAIN BODY ---- */
    var bodyOutline = b.hurt > 0 ? "#ff2d78" : accentColor;
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = bodyOutline;
    ctx.lineWidth = 5;
    cyberRoundRectPath(ctx, x + 12, y + 22, b.w - 24, b.h - 52, 26);
    ctx.fill(); ctx.stroke();

    // Phase 3 cracks
    if (phase === 3) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,40,80,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 60, y + 40); ctx.lineTo(x + 90, y + 110); ctx.lineTo(x + 70, y + 180);
      ctx.moveTo(x + b.w - 80, y + 60); ctx.lineTo(x + b.w - 50, y + 140);
      ctx.stroke();
      ctx.restore();
    }

    /* ---- SHOULDER PADS ---- */
    for (var si = 0; si < 2; si++) {
      var sX = si === 0 ? x + 8 : x + b.w - 58;
      ctx.fillStyle = "rgba(20,24,56,0.96)";
      ctx.strokeStyle = accentColor; ctx.lineWidth = 3;
      cyberRoundRectPath(ctx, sX, y + 28, 50, 26, 8);
      ctx.fill(); ctx.stroke();
      // Small light
      ctx.shadowColor = eyeColor; ctx.shadowBlur = 8;
      ctx.fillStyle = eyeColor;
      ctx.beginPath(); ctx.arc(sX + 25, y + 41, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* ---- EYES ---- */
    var ep = b.eyePulse > 0 ? 1.0 : (0.78 + Math.sin(t * 4.2) * 0.18);
    var eyeGlow = b.hurt > 0 ? "rgba(255,45,120,0.9)" : eyeColor;
    ctx.shadowColor = eyeGlow; ctx.shadowBlur = 28;
    ctx.fillStyle = eyeGlow;
    var eyeW = 26 + attack * 8;
    var eyeH = 14 + attack * 4;
    ctx.beginPath();
    ctx.ellipse(x + 78, y + 118, eyeW * ep, eyeH * ep, 0, 0, Math.PI * 2);
    ctx.ellipse(x + b.w - 78, y + 118, eyeW * ep, eyeH * ep, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil vertical slit
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#05030e";
    ctx.fillRect(x + 73, y + 110, 10, 16);
    ctx.fillRect(x + b.w - 83, y + 110, 10, 16);

    /* ---- MOUTH (attack indicator) ---- */
    var mouthOpen = b.mouth > 0 ? 22 : 6;
    ctx.shadowColor = coreColor; ctx.shadowBlur = 18;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.ellipse(x + b.w / 2, y + 196, 44 + mouthOpen * 0.5, 18 + mouthOpen * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#05030e";
    ctx.beginPath();
    ctx.ellipse(x + b.w / 2, y + 196, 30 + mouthOpen * 0.3, 10 + mouthOpen * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (b.mouth > 0) {
      // Teeth marks
      ctx.fillStyle = coreColor;
      for (var ti2 = 0; ti2 < 4; ti2++) {
        ctx.fillRect(x + b.w / 2 - 24 + ti2 * 14, y + 190, 7, 5);
      }
    }

    /* ---- CHEST CORE ---- */
    var hpPct = b.hp / b.maxHp;
    var corePulse = 0.7 + Math.sin(t * (3 + (1 - hpPct) * 4)) * 0.28;
    var coreSize = 28 + attack * 12 + (1 - hpPct) * 8;

    // Core ring
    ctx.strokeStyle = coreColor; ctx.lineWidth = 2.5;
    ctx.shadowColor = coreColor; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x + b.w / 2, y + 262, coreSize + 16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + b.w / 2, y + 262, coreSize + 26, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(" + (phase === 1 ? "0,245,196" : phase === 2 ? "255,120,20" : "255,30,80") + ",0.28)";
    ctx.stroke();

    // Core inner
    ctx.shadowBlur = 30; ctx.shadowColor = coreColor;
    ctx.fillStyle = "rgba(" + (phase === 1 ? "0,245,196" : phase === 2 ? "255,100,20" : "255,20,60") + "," + (corePulse * 0.9) + ")";
    ctx.beginPath(); ctx.arc(x + b.w / 2, y + 262, coreSize, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#05030e";
    ctx.beginPath(); ctx.arc(x + b.w / 2, y + 262, coreSize * 0.38, 0, Math.PI * 2); ctx.fill();

    // Phase number indicator inside core
    ctx.font = "11px 'Press Start 2P'";
    ctx.fillStyle = b.hurt > 0 ? "#ff2d78" : "#f9e84d";
    ctx.textAlign = "center";
    ctx.fillText("NEXUS", x + b.w / 2, y + 36);

    // HP bar overlay at bottom of body
    var barW = b.w - 60;
    ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.strokeStyle = accentColor; ctx.lineWidth = 2;
    cyberRoundRectPath(ctx, x + 30, y + b.h - 38, barW, 12, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = coreColor;
    cyberRoundRectPath(ctx, x + 30, y + b.h - 38, barW * hpPct, 12, 4);
    ctx.fill();

    ctx.restore();
  }

  /* ---- Player ---- */
  function cyberDrawPlayer(ctx) {
    var p = cyberState.player;
    if (!p) return;
    var t = cyberState.clock;

    // Ghost trail for dash
    if (p.trail && p.dashFx > 0) {
      for (var ti = p.trail.length - 1; ti >= 0; ti--) {
        var tr = p.trail[ti];
        if (tr.alpha < 0.02) continue;
        ctx.save();
        ctx.globalAlpha = tr.alpha * p.dashFx;
        ctx.translate(tr.x + p.w / 2, tr.y + p.h);
        ctx.scale(tr.dir, 1);
        ctx.fillStyle = ti % 2 === 0 ? "#00f5c4" : "#ff2d78";
        // Simple ghost body silhouette
        cyberRoundRectPath(ctx, -14, -62, 28, 44, 8);
        ctx.fill();
        cyberRoundRectPath(ctx, -16, -82, 32, 24, 10);
        ctx.fill();
        ctx.restore();
      }
    }

    var blink = p.inv > 0 && Math.floor(t * 24) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);

    var run = p.onGround ? Math.sin(p.anim) : 0.35;
    var step = p.onGround ? Math.cos(p.anim) : -0.2;
    var dashPose = p.dashTime > 0;
    var jumpPose = !p.onGround && p.vy < -40;
    var fallPose = !p.onGround && p.vy >= -40;
    var landPose = p.landFx > 0 ? p.landFx / 0.2 : 0;
    var jumpFx = p.jumpFx > 0 ? p.jumpFx / 0.24 : 0;
    var hurtPose = p.hurtFx > 0 ? p.hurtFx / 0.38 : 0;
    var squash = p.onGround ? Math.sin(p.anim * 0.75) * 0.015 : -0.02;
    squash += landPose * 0.14 - jumpFx * 0.08;
    var bodyLift = jumpPose ? -8 : fallPose ? -3 : 0;
    var airTuck = !p.onGround ? 1 : 0;

    // Landing shockwave
    if (landPose > 0) {
      ctx.save();
      ctx.globalAlpha = landPose * 0.5;
      ctx.strokeStyle = "#00f5c4"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, 34 + landPose * 18, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ground shadow
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#00f5c4";
    ctx.beginPath(); ctx.ellipse(0, 3, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Body lean
    var lean = dashPose ? (p.dashDirX || 0) * 0.2 + (p.dashDirY || 0) * 0.08 : p.vx * 0.00008;
    if (jumpPose) lean += 0.06;
    if (hurtPose > 0) lean -= 0.18 * hurtPose;
    ctx.rotate(lean);
    ctx.scale(p.dir, 1 + squash);
    ctx.translate(0, bodyLift);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    // --- CAPE ---
    ctx.fillStyle = hurtPose > 0 ? "rgba(255,45,120,0.95)" : "rgba(255,45,120,0.88)";
    ctx.strokeStyle = "#05030e"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, -58);
    ctx.lineTo(-38, -44 + step * 3);
    ctx.lineTo(-20, -20);
    ctx.lineTo(-7, -44);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // --- LEGS ---
    ctx.strokeStyle = "#05030e"; ctx.lineWidth = 7;
    var leftFootX = -26 + airTuck * 8 - (dashPose ? 8 : 0);
    var leftFootY = -3 + run * 6 - airTuck * 14 + (fallPose ? 6 : 0);
    var rightFootX = 3 + airTuck * 6 + (dashPose ? 6 : 0);
    var rightFootY = -3 - run * 6 - airTuck * 8 + (fallPose ? 9 : 0);
    ctx.beginPath();
    ctx.moveTo(-7, -22); ctx.lineTo(leftFootX + 9, leftFootY);
    ctx.moveTo(8, -22); ctx.lineTo(rightFootX + 11, rightFootY);
    ctx.stroke();
    // Boot shapes
    ctx.fillStyle = "#0b122e"; ctx.strokeStyle = "#00f5c4"; ctx.lineWidth = 2.5;
    cyberRoundRectPath(ctx, leftFootX, leftFootY, 24, 9, 3); ctx.fill(); ctx.stroke();
    cyberRoundRectPath(ctx, rightFootX, rightFootY, 25, 9, 3); ctx.fill(); ctx.stroke();
    // Boot accent stripe
    ctx.fillStyle = "#ff2d78";
    ctx.fillRect(leftFootX + 4, leftFootY + 5, 12, 3);
    ctx.fillRect(rightFootX + 4, rightFootY + 5, 13, 3);

    // --- TORSO ---
    ctx.fillStyle = hurtPose > 0 && Math.floor(t * 36) % 2 === 0 ? "#2a1040" : "#101830";
    ctx.strokeStyle = "#05030e"; ctx.lineWidth = 5;
    cyberRoundRectPath(ctx, -18, -60, 36, 42, 9); ctx.fill(); ctx.stroke();
    // Torso trim
    ctx.strokeStyle = "#00f5c4"; ctx.lineWidth = 2;
    cyberRoundRectPath(ctx, -14, -56, 28, 34, 7); ctx.stroke();

    // SOUL HEART on chest (Undertale reference!)
    var heartPulse = 0.8 + Math.sin(t * 4.5) * 0.2;
    ctx.save();
    ctx.globalAlpha = heartPulse * (hurtPose > 0 ? 0.5 : 0.95);
    ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#ff2d78";
    var hs = 5.5; // heart size
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.bezierCurveTo(-hs * 0.5, -36 - hs * 0.6, -hs, -36 - hs * 0.6, -hs, -36);
    ctx.bezierCurveTo(-hs, -36 + hs * 0.4, 0, -36 + hs * 0.7, 0, -36 + hs * 0.8);
    ctx.bezierCurveTo(0, -36 + hs * 0.7, hs, -36 + hs * 0.4, hs, -36);
    ctx.bezierCurveTo(hs, -36 - hs * 0.6, hs * 0.5, -36 - hs * 0.6, 0, -36);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Torso bottom stripe
    ctx.fillStyle = "#00f5c4";
    cyberRoundRectPath(ctx, -10, -24, 20, 5, 2); ctx.fill();

    // --- NECK ---
    ctx.fillStyle = "#0c122a"; ctx.strokeStyle = "#05030e"; ctx.lineWidth = 2.5;
    cyberRoundRectPath(ctx, -6, -66, 12, 10, 3); ctx.fill(); ctx.stroke();

    // --- ARMS ---
    ctx.strokeStyle = "#05030e"; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-12, -47);
    ctx.quadraticCurveTo(-26, -42 + step * 2, -30, -32 + run * 2);
    ctx.moveTo(13, -47);
    ctx.quadraticCurveTo(28, -44 + step, 40, -40 + Math.sin(t * 9) * 1.5);
    ctx.stroke();
    // Fists
    ctx.fillStyle = "#ddf8ff"; ctx.strokeStyle = "#05030e"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-30, -31 + run * 2, 6, 0, Math.PI * 2);
    ctx.arc(41, -39 + Math.sin(t * 9) * 1.5, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // BLASTER arm
    ctx.shadowColor = "rgba(0,245,196,0.75)"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#00f5c4";
    cyberRoundRectPath(ctx, 41, -44, 32, 10, 3); ctx.fill();
    ctx.shadowBlur = 0;
    // Barrel tip highlight
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(74, -39, 3, 0, Math.PI * 2); ctx.fill();
    // Shoot flash
    if (p.shootFlash > 0) {
      ctx.save();
      ctx.globalAlpha = p.shootFlash / 0.1;
      ctx.shadowColor = "#f9e84d"; ctx.shadowBlur = 20;
      ctx.fillStyle = "#f9e84d";
      ctx.beginPath();
      ctx.moveTo(73, -39);
      ctx.lineTo(96, -45); ctx.lineTo(90, -38); ctx.lineTo(98, -31); ctx.lineTo(73, -34);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- HELMET ---
    ctx.fillStyle = "#d8f4ff"; ctx.strokeStyle = "#05030e"; ctx.lineWidth = 5;
    cyberRoundRectPath(ctx, -21, -94, 42, 32, 13); ctx.fill(); ctx.stroke();
    // Visor
    ctx.fillStyle = "#0e172f"; ctx.strokeStyle = "#05030e"; ctx.lineWidth = 3.5;
    cyberRoundRectPath(ctx, -15, -84, 30, 14, 4); ctx.fill(); ctx.stroke();
    // Visor glow
    ctx.shadowColor = "rgba(0,245,196,0.9)"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#00f5c4";
    cyberRoundRectPath(ctx, -11, -80, 22, 8, 3); ctx.fill();
    ctx.shadowBlur = 0;
    // Helmet top antenna
    ctx.strokeStyle = "#ff2d78"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -96); ctx.lineTo(0, -104);
    ctx.moveTo(-5, -100); ctx.lineTo(5, -100);
    ctx.stroke();
    // Antenna tip flash
    ctx.fillStyle = "#ff2d78";
    ctx.beginPath(); ctx.arc(0, -104, 3, 0, Math.PI * 2); ctx.fill();
    // Helmet gloss
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -91); ctx.quadraticCurveTo(-2, -97, 11, -92); ctx.stroke();

    // Dash speed lines
    if (dashPose) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "#00f5c4"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-19, -22); ctx.lineTo(-40, -14);
      ctx.moveTo(-16, -34); ctx.lineTo(-38, -32);
      ctx.moveTo(-14, -46); ctx.lineTo(-36, -50);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /* ---- Projectiles / Enemy ---- */
  function cyberDrawProjectiles(ctx) {
    var t = cyberState.clock;
    ctx.save();

    // Player bullets — glowing cyan laser bolts
    for (var bi = 0; bi < cyberState.bullets.length; bi++) {
      var bul = cyberState.bullets[bi];
      // Tail gradient
      var bGrad = ctx.createLinearGradient(bul.x, bul.y, bul.x + bul.w, bul.y);
      bGrad.addColorStop(0, "rgba(0,245,196,0)");
      bGrad.addColorStop(1, "rgba(0,245,196,0.95)");
      ctx.fillStyle = bGrad;
      ctx.fillRect(bul.x - 14, bul.y, bul.w + 14, bul.h);
      // Bright core
      ctx.shadowColor = "#00f5c4"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(bul.x + bul.w - 6, bul.y + 1, 6, bul.h - 2);
      ctx.shadowBlur = 0;
    }

    // Enemies
    for (var ei = 0; ei < cyberState.enemy.length; ei++) {
      var e = cyberState.enemy[ei];

      if (e.type === "note") {
        // Crystal data shard
        var noteColor = e.lane === "low" ? "#f9e84d" : "#ff2d78";
        if (e.warn > 0) {
          // Warning lane highlight
          ctx.save();
          ctx.globalAlpha = 0.15 + Math.sin(t * 22) * 0.06;
          ctx.fillStyle = noteColor;
          ctx.fillRect(0, e.y - 6, CY_W, e.h + 12);
          ctx.restore();
          // Dashed line
          ctx.save();
          ctx.globalAlpha = 0.5 + Math.sin(t * 18) * 0.15;
          ctx.strokeStyle = noteColor; ctx.lineWidth = 2;
          ctx.setLineDash([12, 8]);
          ctx.beginPath(); ctx.moveTo(50, e.y + e.h / 2); ctx.lineTo(CY_W - 50, e.y + e.h / 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
        ctx.save();
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        ctx.rotate(e.rot || 0);
        ctx.shadowColor = noteColor; ctx.shadowBlur = 20;
        // Diamond shard shape
        ctx.fillStyle = noteColor;
        ctx.beginPath();
        ctx.moveTo(0, -e.h / 2 - 4);
        ctx.lineTo(e.w / 2 + 4, 0);
        ctx.lineTo(0, e.h / 2 + 4);
        ctx.lineTo(-e.w / 2 - 4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Inner detail
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.moveTo(0, -e.h / 2 + 2); ctx.lineTo(e.w / 4, 0); ctx.lineTo(0, e.h / 2 - 2); ctx.lineTo(-e.w / 4, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();

      } else if (e.type === "coin") {
        // Plasma orb with spinning corona
        var orbColor = cyberState.phase === 1 ? "#00b4ff" : cyberState.phase === 2 ? "#ff8c00" : "#ff2d78";
        ctx.save();
        ctx.translate(e.x, e.y);
        // Outer glow ring
        ctx.shadowColor = orbColor; ctx.shadowBlur = 22;
        ctx.strokeStyle = orbColor; ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.5 + Math.sin(t * 6 + ei) * 0.2;
        ctx.beginPath(); ctx.arc(0, 0, e.r + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        // Core orb
        var oGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, e.r);
        oGrad.addColorStop(0, "#ffffff");
        oGrad.addColorStop(0.4, orbColor);
        oGrad.addColorStop(1, "rgba(0,0,0,0.2)");
        ctx.fillStyle = oGrad;
        ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // Spinning rim
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, e.r * 0.65, e.spin || 0, (e.spin || 0) + Math.PI); ctx.stroke();
        ctx.restore();

      } else if (e.type === "ghost") {
        // Pixel-art ghost (Undertale feel)
        ctx.save();
        ctx.translate(e.x, e.y);
        var ghostA = 0.7 + Math.sin(t * 3 + ei) * 0.2;
        ctx.globalAlpha = ghostA;
        ctx.shadowColor = "#00f5c4"; ctx.shadowBlur = 14;
        var gr2 = e.r || 13;
        // Ghost body
        ctx.fillStyle = "rgba(180,220,255,0.85)";
        ctx.strokeStyle = "#00f5c4"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -gr2 * 0.3, gr2, Math.PI, 0, false);
        ctx.lineTo(gr2, gr2 * 0.7);
        // Wavy bottom
        ctx.quadraticCurveTo(gr2 * 0.6, gr2 * 1.0, gr2 * 0.3, gr2 * 0.7);
        ctx.quadraticCurveTo(0, gr2 * 1.0, -gr2 * 0.3, gr2 * 0.7);
        ctx.quadraticCurveTo(-gr2 * 0.6, gr2 * 1.0, -gr2, gr2 * 0.7);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        // Pixel eyes
        var eyeFlick = Math.sin(e.eyeFlicker || 0) > 0.5;
        ctx.fillStyle = "#05030e";
        if (eyeFlick) {
          ctx.fillRect(-gr2 * 0.45, -gr2 * 0.5, gr2 * 0.28, gr2 * 0.28);
          ctx.fillRect(gr2 * 0.17, -gr2 * 0.5, gr2 * 0.28, gr2 * 0.28);
        } else {
          ctx.fillRect(-gr2 * 0.45, -gr2 * 0.35, gr2 * 0.28, gr2 * 0.12);
          ctx.fillRect(gr2 * 0.17, -gr2 * 0.35, gr2 * 0.28, gr2 * 0.12);
        }
        ctx.restore();

      } else if (e.type === "stamp") {
        // Crushing data block
        if (e.warn > 0) {
          ctx.save();
          ctx.strokeStyle = "rgba(255,45,120,0.5)";
          ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
          ctx.strokeRect(e.x, 80, e.w, TAX_GROUND - 80);
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.15 + Math.sin(t * 16) * 0.07;
          ctx.fillStyle = "#ff2d78";
          ctx.fillRect(e.x, 80, e.w, TAX_GROUND - 80);
          ctx.restore();
        }
        ctx.save();
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        ctx.rotate(e.rot || 0);
        ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 16;
        // Hexagonal stamp shape
        ctx.fillStyle = "rgba(200,30,80,0.92)";
        ctx.strokeStyle = "#f9e84d"; ctx.lineWidth = 3;
        var sw = e.w / 2; var sh = e.h / 2;
        ctx.beginPath();
        ctx.moveTo(-sw + 8, -sh);
        ctx.lineTo(sw - 8, -sh);
        ctx.lineTo(sw, -sh + 8);
        ctx.lineTo(sw, sh - 8);
        ctx.lineTo(sw - 8, sh);
        ctx.lineTo(-sw + 8, sh);
        ctx.lineTo(-sw, sh - 8);
        ctx.lineTo(-sw, -sh + 8);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        // Cross detail
        ctx.strokeStyle = "rgba(249,232,77,0.6)"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-sw + 14, 0); ctx.lineTo(sw - 14, 0);
        ctx.moveTo(0, -sh + 12); ctx.lineTo(0, sh - 12);
        ctx.stroke();
        ctx.restore();

      } else if (e.type === "pfcar") {
        // Energy torpedo / railgun bolt
        if (e.warn > 0) {
          ctx.save();
          ctx.globalAlpha = 0.25 + Math.sin(t * 24) * 0.1;
          ctx.fillStyle = "rgba(255,45,120,0.15)";
          ctx.fillRect(0, TAX_GROUND - 58, CY_W, 58);
          ctx.strokeStyle = "#ff2d78"; ctx.lineWidth = 2.5; ctx.setLineDash([14, 8]);
          ctx.beginPath(); ctx.moveTo(30, TAX_GROUND - 50); ctx.lineTo(CY_W - 30, TAX_GROUND - 50); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          // Charge effect growing at right edge
          var chargeRad = 10 + Math.sin(t * 18) * 6;
          ctx.save();
          ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 20;
          ctx.fillStyle = "rgba(255,45,120,0.8)";
          ctx.beginPath(); ctx.arc(CY_W - 20, TAX_GROUND - 32, chargeRad, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
        ctx.save();
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 24;
        // Torpedo body
        ctx.fillStyle = "#ff2d78";
        ctx.beginPath();
        ctx.moveTo(-e.w / 2, 0);
        ctx.lineTo(-e.w / 2 + 30, -e.h / 2);
        ctx.lineTo(e.w / 2, -e.h / 2 + 8);
        ctx.lineTo(e.w / 2, e.h / 2 - 8);
        ctx.lineTo(-e.w / 2 + 30, e.h / 2);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        // Engine glow at tail
        var engGrad = ctx.createRadialGradient(e.w / 2 + 16, 0, 0, e.w / 2 + 16, 0, 28);
        engGrad.addColorStop(0, "rgba(255,255,255,0.95)");
        engGrad.addColorStop(0.3, "rgba(255,150,0,0.7)");
        engGrad.addColorStop(1, "rgba(255,45,120,0)");
        ctx.fillStyle = engGrad;
        ctx.beginPath(); ctx.arc(e.w / 2 + 8, 0, 22, 0, Math.PI * 2); ctx.fill();
        // Dark cockpit window
        ctx.fillStyle = "#05030e";
        ctx.beginPath(); ctx.arc(-e.w / 2 + 42, 0, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ff8c00";
        ctx.beginPath(); ctx.arc(-e.w / 2 + 42, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function cyberDrawParticles(ctx) {
    ctx.save();
    for (var i = 0; i < cyberState.particles.length; i++) {
      var p = cyberState.particles[i];
      var a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.type === "heart") {
        // Mini heart particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(a, a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-4, -4, -8, -4, -8, 0);
        ctx.bezierCurveTo(-8, 4, 0, 8, 0, 8);
        ctx.bezierCurveTo(0, 8, 8, 4, 8, 0);
        ctx.bezierCurveTo(8, -4, 4, -4, 0, 0);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.restore();
  }

  function cyberDraw() {
    var ctx = cyberState.ctx;
    if (!ctx) return;
    ctx.save();
    if (cyberState.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * cyberState.shake * 22,
        (Math.random() - 0.5) * cyberState.shake * 14
      );
    }
    cyberDrawBackground(ctx);
    cyberDrawBoss(ctx);
    cyberDrawProjectiles(ctx);
    cyberDrawPlayer(ctx);
    cyberDrawParticles(ctx);
    ctx.restore();
  }

  function cyberLoop(now) {
    if (cyberState.status === "idle") return;
    if (!cyberState.last) cyberState.last = now;
    var dt = Math.min(0.034, Math.max(0, (now - cyberState.last) / 1000));
    cyberState.last = now; cyberState.clock += dt;
    if (cyberState.status === "intro" || cyberState.status === "fight" || cyberState.status === "transform") cyberUpdate(dt);
    else {
      cyberUpdateParticles(dt);
      if (cyberState.shake > 0) cyberState.shake = Math.max(0, cyberState.shake - dt);
      cyberSyncHud();
    }
    cyberDraw();
    cyberState.raf = requestAnimationFrame(cyberLoop);
  }

  document.addEventListener("keyup", function (e) {
    if (telaAtiva !== TELA.CYBER) return;
    if (cyberHandleKey(e.key, false)) e.preventDefault();
  }, true);

  var jkpEst = { v: 0, d: 0, e: 0, locked: false };
  var jkpOpts = ["pedra", "papel", "tesoura"];
  var jkpNomes = { pedra: "Pedra", papel: "Papel", tesoura: "Tesoura" };

  /* SVGs inline - solid filled para o painel VS */
  var SVG_Q =
    '<svg viewBox="0 0 60 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="30" y="42" text-anchor="middle" font-size="34" font-family="monospace" opacity=".22">?</text></svg>';
  var SVG = {
    pedra:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 38 L15 25 L27 15 L42 18 L52 31 L47 45 L34 53 L18 49 Z" fill="currentColor"/><path d="M17 28 L28 34 M36 20 L31 33 M43 33 L33 45" stroke="rgba(5,3,14,.42)" stroke-width="2.4" stroke-linecap="round"/><path d="M15 25 L27 15 L42 18" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-linecap="round"/></svg>',
    tesoura:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="43" r="8" stroke="currentColor" stroke-width="4"/><circle cx="41" cy="43" r="8" stroke="currentColor" stroke-width="4"/><path d="M25 38 L49 13 M35 38 L11 13" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M30 35 L30 47" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    papel:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 7 H39 L50 18 V53 H16 Z" fill="rgba(157,92,255,.16)" stroke="currentColor" stroke-width="3"/><path d="M39 7 V19 H50" stroke="currentColor" stroke-width="3"/><path d="M23 29 H42 M23 37 H42 M23 45 H35" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  };

  function jkpWho(j, c) {
    if (j === c) return "draw";
    return { pedra: "tesoura", papel: "pedra", tesoura: "papel" }[j] === c ? "win" : "lose";
  }

  function atualizarJkp() {
    document.getElementById("jw").textContent = jkpEst.v;
    document.getElementById("jl").textContent = jkpEst.d;
    document.getElementById("jd").textContent = jkpEst.e;
  }

  function jogarJkp(escolha) {
    if (jkpEst.locked) return;
    jkpEst.locked = true;
    somNav();
    getJkpCards().forEach(function (c) {
      c.classList.remove("kb-focus");
      c.classList.toggle("selected", c.getAttribute("data-jkp") === escolha);
    });
    var cpu = jkpOpts[~~(Math.random() * 3)];
    var elJ = document.getElementById("jkp-pc");
    var elC = document.getElementById("jkp-ic");
    elJ.innerHTML = SVG[escolha];
    elJ.style.color = "var(--purple)";
    elJ.classList.remove("pop");
    void elJ.offsetWidth;
    elJ.classList.add("pop");
    elC.innerHTML = SVG_Q;
    elC.style.color = "var(--brite)";
    setTimeout(function () {
      elC.innerHTML = SVG[cpu];
      elC.style.color = "var(--pink)";
      elC.classList.remove("pop");
      void elC.offsetWidth;
      elC.classList.add("pop");
      var res = jkpWho(escolha, cpu);
      var elR = document.getElementById("jkp-result");
      elR.className = "result-box " + res;
      if (res === "win") {
        elR.innerHTML =
          "» VITÓRIA! «<div class='result-sub'>" +
          jkpNomes[escolha] +
          " vence " +
          jkpNomes[cpu] +
          "</div>";
        jkpEst.v++;
        somOk();
        confetti();
      } else if (res === "lose") {
        elR.innerHTML =
          "× DERROTA ×<div class='result-sub'>" +
          jkpNomes[cpu] +
          " vence " +
          jkpNomes[escolha] +
          "</div>";
        jkpEst.d++;
        somErro();
      } else {
        elR.innerHTML = "= EMPATE =<div class='result-sub'>Ambos: " + jkpNomes[escolha] + "</div>";
        jkpEst.e++;
        somDraw();
      }
      atualizarJkp();
      document.getElementById("jkp-new").style.display = "";
    }, 740);
  }

  function reiniciarJkp() {
    jkpEst.locked = false;
    somNav();
    getJkpCards().forEach(function (c) {
      c.classList.remove("selected", "kb-focus");
    });
    var elJ = document.getElementById("jkp-pc"),
      elC = document.getElementById("jkp-ic");
    elJ.innerHTML = SVG_Q;
    elJ.style.color = "var(--brite)";
    elC.innerHTML = SVG_Q;
    elC.style.color = "var(--brite)";
    var elR = document.getElementById("jkp-result");
    elR.className = "result-box idle";
    elR.innerHTML = "Faça sua escolha acima";
    document.getElementById("jkp-new").style.display = "none";
    jkpSetFoco(0);
  }

  /* =====================================================================
   DADOS -- Lógica
   ===================================================================== */
  var dadoEst = { v: 0, d: 0, e: 0, rod: 0, girando: false };
  var dotMap = {
    1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    2: [1, 0, 0, 0, 0, 0, 0, 0, 1],
    3: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
    5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
    6: [1, 0, 1, 1, 0, 1, 1, 0, 1],
  };

  function renderDado(id, val) {
    var ds = document.getElementById(id).querySelectorAll(".dot"),
      m = dotMap[val];
    for (var i = 0; i < ds.length; i++) ds[i].classList.toggle("on", !!m[i]);
  }
  function atualizarDados() {
    document.getElementById("dw").textContent = dadoEst.v;
    document.getElementById("dl").textContent = dadoEst.d;
    document.getElementById("dd").textContent = dadoEst.e;
    document.getElementById("dr").textContent = dadoEst.rod;
    document.getElementById("ds").textContent = dadoEst.v + " : " + dadoEst.d;
  }
  function jogarDados() {
    if (dadoEst.girando) return;
    dadoEst.girando = true;
    somGiro();
    var btn = document.getElementById("btn-dados"),
      dP = document.getElementById("df-p"),
      dI = document.getElementById("df-i");
    btn.classList.add("disabled");
    dP.classList.remove("winner");
    dI.classList.remove("winner");
    dP.classList.add("rolling");
    dI.classList.add("rolling");
    var rol = setInterval(function () {
      var a = ~~(Math.random() * 6) + 1,
        b = ~~(Math.random() * 6) + 1;
      renderDado("df-p", a);
      renderDado("df-i", b);
      document.getElementById("dn-p").textContent = a;
      document.getElementById("dn-i").textContent = b;
    }, 75);
    setTimeout(function () {
      clearInterval(rol);
      dP.classList.remove("rolling");
      dI.classList.remove("rolling");
      var vJ = ~~(Math.random() * 6) + 1,
        vC = ~~(Math.random() * 6) + 1;
      renderDado("df-p", vJ);
      renderDado("df-i", vC);
      document.getElementById("dn-p").textContent = vJ;
      document.getElementById("dn-i").textContent = vC;
      dadoEst.rod++;
      var elR = document.getElementById("dados-res");
      if (vJ > vC) {
        dadoEst.v++;
        dP.classList.add("winner");
        elR.className = "result-box win";
        elR.innerHTML =
          "» JOGADOR VENCEU! «<div class='result-sub'>" + vJ + " &gt; " + vC + "</div>";
        somOk();
        confetti();
      } else if (vC > vJ) {
        dadoEst.d++;
        dI.classList.add("winner");
        elR.className = "result-box lose";
        elR.innerHTML = "× CPU VENCEU ×<div class='result-sub'>" + vC + " &gt; " + vJ + "</div>";
        somErro();
      } else {
        dadoEst.e++;
        elR.className = "result-box draw";
        elR.innerHTML = "= EMPATE =<div class='result-sub'>Ambos: " + vJ + "</div>";
        somDraw();
      }
      atualizarDados();
      dadoEst.girando = false;
      btn.classList.remove("disabled");
    }, 700);
  }

  /* Clique no botão dados via mouse */
  document.getElementById("btn-dados").addEventListener("click", jogarDados);

  /* =====================================================================
   CARA OU COROA -- Lógica
   ===================================================================== */
  var ccEst = { v: 0, d: 0, girando: false };
  function atualizarCc() {
    document.getElementById("cw").textContent = ccEst.v;
    document.getElementById("cl").textContent = ccEst.d;
  }
  function jogarCc(escolha) {
    if (ccEst.girando) return;
    ccEst.girando = true;
    somGiro();
    var bC = document.getElementById("btn-cara"),
      bK = document.getElementById("btn-coroa");
    bC.classList.add("disabled");
    bK.classList.add("disabled");
    bC.classList.remove("kb-focus");
    bK.classList.remove("kb-focus");
    bC.classList.toggle("selected", escolha === "cara");
    bK.classList.toggle("selected", escolha === "coroa");
    var res = Math.random() < 0.5 ? "cara" : "coroa";
    var coin = document.getElementById("coin3d");
    coin.className = "coin3d";
    void coin.offsetWidth;
    coin.classList.add("flip-" + res);
    setTimeout(function () {
      var elR = document.getElementById("cc-result"),
        lbl = res === "cara" ? "CARA" : "COROA";
      if (escolha === res) {
        ccEst.v++;
        elR.className = "result-box win";
        elR.innerHTML = "» ACERTOU! «<div class='result-sub'>Resultado: " + lbl + "</div>";
        somOk();
        confetti();
      } else {
        ccEst.d++;
        elR.className = "result-box lose";
        elR.innerHTML = "× ERROU ×<div class='result-sub'>Resultado: " + lbl + "</div>";
        somErro();
      }
      atualizarCc();
      setTimeout(function () {
        ccEst.girando = false;
        bC.classList.remove("disabled", "selected");
        bK.classList.remove("disabled", "selected");
        coin.className = "coin3d";
        elR.className = "result-box idle";
        elR.innerHTML = "Escolha CARA ou COROA acima";
        ccSetFoco(0);
      }, 2500);
    }, 1600);
  }

  /* =====================================================================
   CASINO JS -- VARIAVEL DE DIFICULDADE
   0   = impossivel ganhar (casa sempre vence)
   0.5 = balanceado (resultado justo e aleatorio)
   1   = ganho garantido e alto (jogador sempre vence)
   ===================================================================== */
  var WIN_DIFFICULTY = 1;

  function calcWinChance(base) {
    if (WIN_DIFFICULTY <= 0) return 0;
    if (WIN_DIFFICULTY >= 1) return 1;
    return base + (WIN_DIFFICULTY - 0.5) * 2 * (1 - base) * 0.8;
  }

  var casinoSaldo = 500;
  function atualizarSaldo(delta) {
    casinoSaldo = Math.max(0, casinoSaldo + delta);
    var s = "$" + casinoSaldo;
    ["casino-bal-hero", "slots-bal", "slots-bal2", "rlt-bal", "crash-bal"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = s;
    });
  }

  var ageModal = document.getElementById("age-modal");

  var ageYesBtn = document.getElementById("age-yes");
  if (ageYesBtn) {
    ageYesBtn.addEventListener("click", function () {
      somOk();
      ageModal.classList.remove("show");
      atualizarSaldo(0);
      if (pendingCasinoEntry) {
        abrirCasinoEntrada();
        pendingCasinoEntry = false;
      } else {
        abrirCasinoEntrada();
      }
    });
  }
  var ageNoBtn = document.getElementById("age-no");
  if (ageNoBtn) {
    ageNoBtn.addEventListener("click", function () {
      somEsc();
      ageModal.classList.remove("show");
      telaAtiva = TELA.HUB;
      pgSetFoco(pgIdx);
    });
  }
  /* casino-back handled by central nav-back listener */
  /* slots-back handled by central nav-back listener */
  /* rlt-back handled by central nav-back listener */
  /* crash-back handled by central nav-back listener */
  document.querySelectorAll(".ccard").forEach(function (card) {
    card.addEventListener("click", function () {
      if (!casinoTicketUsado) return;
      var g = card.getAttribute("data-goto");
      if (g) {
        somNav();
        irPara(g);
      }
    });
  });
  var btnTicket = document.getElementById("btn-ticket");
  if (btnTicket) {
    btnTicket.addEventListener("click", function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      somMoeda();
      revealCasinoGames();
    });
  }

  /* CACA-NIQUEL */
  var SLOT_SYMS = ["L", "C", "B", "S", "D", "J"];
  var SLOT_DISP = {
    L: String.fromCodePoint(0x1f34b),
    C: String.fromCodePoint(0x1f352),
    B: String.fromCodePoint(0x1f514),
    S: String.fromCodePoint(0x2b50),
    D: String.fromCodePoint(0x1f48e),
    J: String.fromCodePoint(0x1f3b0),
  };
  var SLOT_PAYS = { L: 3, C: 5, B: 10, S: 8, D: 20, J: 50 };
  var slotSpinning = false;
  ["reel-0", "reel-1", "reel-2"].forEach(function (id, idx) {
    var el = document.getElementById(id);
    if (el) el.textContent = SLOT_DISP[["C", "L", "B"][idx]];
  });
  function slotRandom() {
    var w = [30, 24, 18, 13, 9, 6];
    if (WIN_DIFFICULTY > 0.5) {
      var b = (WIN_DIFFICULTY - 0.5) * 2;
      w[5] = Math.round(6 + b * 44);
      w[4] = Math.round(9 + b * 21);
    } else if (WIN_DIFFICULTY < 0.5) {
      var n = (0.5 - WIN_DIFFICULTY) * 2;
      w[5] = Math.max(1, Math.round(6 - n * 5));
      w[0] = Math.round(30 + n * 20);
    }
    var tot = w.reduce(function (a, v) {
      return a + v;
    }, 0),
      r = Math.random() * tot,
      acc = 0;
    for (var i = 0; i < SLOT_SYMS.length; i++) {
      acc += w[i];
      if (r < acc) return SLOT_SYMS[i];
    }
    return SLOT_SYMS[0];
  }
  function jogarSlots() {
    if (slotSpinning) return;
    if (casinoSaldo < slotBet) {
      document.getElementById("slot-msg").textContent = "Saldo insuficiente!";
      return;
    }
    atualizarSaldo(-slotBet);
    slotSpinning = true;
    somGiro();
    document.getElementById("btn-spin").classList.add("disabled");
    var rs = [
      document.getElementById("reel-0"),
      document.getElementById("reel-1"),
      document.getElementById("reel-2"),
    ];
    var res = [];
    var msg = document.getElementById("slot-msg");
    msg.textContent = "Girando...";
    msg.style.color = "var(--muted)";
    rs.forEach(function (r) {
      r.classList.add("spin");
    });
    var iv = setInterval(function () {
      rs.forEach(function (r) {
        r.textContent = SLOT_DISP[SLOT_SYMS[~~(Math.random() * 6)]];
      });
    }, 80);
    [380, 580, 780].forEach(function (delay, idx) {
      setTimeout(function () {
        res[idx] = slotRandom();
        rs[idx].textContent = SLOT_DISP[res[idx]];
        rs[idx].classList.remove("spin");
        bipe(440 + idx * 110, "sine", 0.08, 0.12);
        if (idx === 2) {
          clearInterval(iv);
          setTimeout(function () {
            var r0 = res[0],
              r1 = res[1],
              r2 = res[2],
              payout = 0;
            if (r0 === r1 && r1 === r2) {
              payout = 10 * SLOT_PAYS[r0];
              msg.textContent = (r0 === "J" ? "JACKPOT! +$" : "TRÊS IGUAIS! +$") + payout;
              msg.style.color = "var(--yellow)";
              confetti();
              somOk();
            } else if (r0 === r1 || r1 === r2 || r0 === r2) {
              payout = 15;
              msg.textContent = "Par! +$" + payout;
              msg.style.color = "var(--cyan)";
              bipe(523, "sine", 0.12, 0.14);
            } else {
              msg.textContent = "Sem sorte!";
              msg.style.color = "var(--muted)";
              somErro();
            }
            if (payout > 0) atualizarSaldo(payout);
            slotSpinning = false;
            document.getElementById("btn-spin").classList.remove("disabled");
          }, 220);
        }
      }, delay);
    });
  }
  document.getElementById("btn-spin").addEventListener("click", jogarSlots);

  /* ROLETA */
  var RLT_NUMS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
    31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];
  var RLT_RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  var RLT_COL = {};
  RLT_NUMS.forEach(function (n) {
    RLT_COL[n] = n === 0 ? "g" : RLT_RED.indexOf(n) >= 0 ? "r" : "b";
  });
  var rltCvs = document.getElementById("roulette-canvas"),
    rltCtx = rltCvs.getContext("2d");
  var rltAngle = 0,
    rltSpin = false,
    rltChoice = null;
  function normAngle(a) {
    var t = Math.PI * 2;
    return ((a % t) + t) % t;
  }
  function resizeRoulette() {
    var wrap = rltCvs.parentElement;
    var size = Math.round((wrap && wrap.clientWidth) || 280);
    rltCvs.width = size;
    rltCvs.height = size;
    drawWheel(rltAngle);
  }
  function drawWheel(a) {
    var size = rltCvs.width || 280,
      cx = size / 2,
      cy = size / 2,
      R = size / 2 - 3,
      ri = size * 0.27,
      seg = (Math.PI * 2) / 37;
    rltCtx.clearRect(0, 0, size, size);
    RLT_NUMS.forEach(function (n, i) {
      var s = a + i * seg - Math.PI / 2,
        e = s + seg,
        col = RLT_COL[n];
      rltCtx.beginPath();
      rltCtx.moveTo(cx, cy);
      rltCtx.arc(cx, cy, R, s, e);
      rltCtx.closePath();
      rltCtx.fillStyle = col === "g" ? "#2e7d32" : col === "r" ? "#c62828" : "#1a1a2e";
      rltCtx.fill();
      rltCtx.strokeStyle = "rgba(255,255,255,.1)";
      rltCtx.lineWidth = 1;
      rltCtx.stroke();
      var ma = s + seg / 2,
        tx = cx + (R - size * 0.1) * Math.cos(ma),
        ty = cy + (R - size * 0.1) * Math.sin(ma);
      rltCtx.save();
      rltCtx.translate(tx, ty);
      rltCtx.rotate(ma + Math.PI / 2);
      rltCtx.fillStyle = "#fff";
      rltCtx.font = "bold " + Math.max(8, Math.round(size * 0.032)) + "px monospace";
      rltCtx.textAlign = "center";
      rltCtx.textBaseline = "middle";
      rltCtx.fillText(n, 0, 0);
      rltCtx.restore();
    });
    rltCtx.beginPath();
    rltCtx.arc(cx, cy, R, 0, Math.PI * 2);
    rltCtx.strokeStyle = "#c8a400";
    rltCtx.lineWidth = 3;
    rltCtx.stroke();
    rltCtx.beginPath();
    rltCtx.arc(cx, cy, ri, 0, Math.PI * 2);
    rltCtx.fillStyle = "#0c0820";
    rltCtx.fill();
    rltCtx.strokeStyle = "#3a2a70";
    rltCtx.lineWidth = 2;
    rltCtx.stroke();
  }
  resizeRoulette();
  window.addEventListener("resize", resizeRoulette);
  ["rc-red", "rc-black", "rc-green"].forEach(function (id) {
    document.getElementById(id).addEventListener("click", function () {
      if (rltSpin) return;
      document.querySelectorAll(".rc-btn").forEach(function (b) {
        b.classList.remove("selected");
      });
      document.getElementById(id).classList.add("selected");
      rltChoice = id === "rc-red" ? "r" : id === "rc-black" ? "b" : "g";
      somNav();
    });
  });
  document.getElementById("btn-spin-rlt").addEventListener("click", function () {
    if (rltSpin || !rltChoice) {
      if (!rltChoice)
        document.getElementById("rlt-result").textContent = "Escolha uma cor primeiro!";
      return;
    }
    var bet = Math.min(parseInt(document.getElementById("rlt-bet-input").value) || 20, casinoSaldo);
    if (casinoSaldo < 1) return;
    atualizarSaldo(-bet);
    rltSpin = true;
    somGiro();
    document.getElementById("btn-spin-rlt").classList.add("disabled");
    document.getElementById("rlt-num").textContent = "...";
    var pool, landed;
    if (Math.random() < calcWinChance(0.46)) {
      pool = RLT_NUMS.filter(function (n) {
        return RLT_COL[n] === rltChoice;
      });
    } else {
      pool = RLT_NUMS.filter(function (n) {
        return RLT_COL[n] !== rltChoice;
      });
    }
    landed = pool[~~(Math.random() * pool.length)];
    var li = RLT_NUMS.indexOf(landed),
      seg = (Math.PI * 2) / 37,
      turn = Math.PI * 2;
    var desired = normAngle(-(li * seg) - seg / 2);
    var delta = desired - normAngle(rltAngle);
    while (delta < 0) delta += turn;
    var totalSpin = turn * 7 + delta,
      targetAngle = rltAngle + totalSpin;
    var dur = 3800,
      st = null,
      sa = rltAngle;
    function animR(ts) {
      if (!st) st = ts;
      var p = Math.min(1, (ts - st) / dur),
        ease = 1 - Math.pow(1 - p, 4);
      rltAngle = sa + totalSpin * ease;
      drawWheel(rltAngle);
      if (p < 1) {
        requestAnimationFrame(animR);
        return;
      }
      rltAngle = targetAngle;
      drawWheel(rltAngle);
      var win = RLT_COL[landed] === rltChoice,
        mult = rltChoice === "g" ? 14 : 2,
        gain = win ? bet * mult : 0;
      if (win) {
        atualizarSaldo(gain);
        confetti();
        somOk();
      } else {
        somErro();
      }
      var clab = RLT_COL[landed] === "r" ? "VERMELHO" : RLT_COL[landed] === "b" ? "PRETO" : "VERDE";
      var el = document.getElementById("rlt-result");
      el.textContent =
        (win ? "GANHOU! +$" + gain + " - " : "PERDEU - ") + clab + " (" + landed + ")";
      el.style.color = win ? "var(--cyan)" : "var(--pink)";
      el.style.borderColor = win ? "var(--cyan)" : "var(--pink)";
      document.getElementById("rlt-num").textContent = landed;
      document.getElementById("rlt-num").style.color =
        RLT_COL[landed] === "r" ? "#e53935" : RLT_COL[landed] === "b" ? "#bbb" : "#43a047";
      var chip = document.createElement("div");
      chip.className = "rh-chip " + RLT_COL[landed];
      chip.textContent = landed;
      var hist = document.getElementById("rlt-history");
      hist.insertBefore(chip, hist.firstChild);
      if (hist.children.length > 14) hist.removeChild(hist.lastChild);
      rltSpin = false;
      document.getElementById("btn-spin-rlt").classList.remove("disabled");
    }
    requestAnimationFrame(animR);
  });

  /* CRASH */
  var crCvs = document.getElementById("crash-canvas"),
    crCtx = crCvs.getContext("2d");
  var crSt = {
    running: false,
    busted: false,
    mult: 1,
    crashAt: 2,
    bet: 0,
    cashedOut: false,
    autoAt: Infinity,
    autoEnabled: false,
  };
  var crPts = [];
  function resizeCr() {
    crCvs.width = crCvs.parentElement.clientWidth || 580;
    crCvs.height = window.innerWidth > 700 ? 300 : 240;
    drawCrash();
  }
  resizeCr();
  window.addEventListener("resize", resizeCr);
  function drawCrash() {
    var W = crCvs.width,
      H = crCvs.height;
    crCtx.clearRect(0, 0, W, H);
    crCtx.fillStyle = "#0c0820";
    crCtx.fillRect(0, 0, W, H);
    crCtx.strokeStyle = "rgba(100,80,255,.07)";
    crCtx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 60) {
      crCtx.beginPath();
      crCtx.moveTo(gx, 0);
      crCtx.lineTo(gx, H);
      crCtx.stroke();
    }
    for (var gy = 0; gy < H; gy += 40) {
      crCtx.beginPath();
      crCtx.moveTo(0, gy);
      crCtx.lineTo(W, gy);
      crCtx.stroke();
    }
    if (crPts.length < 2) return;
    var bust = crSt.busted,
      grad = crCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, bust ? "rgba(255,45,120,.3)" : "rgba(0,245,196,.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    crCtx.beginPath();
    crCtx.moveTo(crPts[0].x, H);
    crPts.forEach(function (p) {
      crCtx.lineTo(p.x, p.y);
    });
    crCtx.lineTo(crPts[crPts.length - 1].x, H);
    crCtx.closePath();
    crCtx.fillStyle = grad;
    crCtx.fill();
    crCtx.beginPath();
    crPts.forEach(function (p, i) {
      i === 0 ? crCtx.moveTo(p.x, p.y) : crCtx.lineTo(p.x, p.y);
    });
    crCtx.strokeStyle = bust ? "#ff2d78" : "#00f5c4";
    crCtx.lineWidth = 3;
    crCtx.lineJoin = "round";
    crCtx.stroke();
    var last = crPts[crPts.length - 1];
    crCtx.beginPath();
    crCtx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    crCtx.fillStyle = bust ? "#ff2d78" : "#00f5c4";
    crCtx.shadowColor = bust ? "#ff2d78" : "#00f5c4";
    crCtx.shadowBlur = 12;
    crCtx.fill();
    crCtx.shadowBlur = 0;
  }
  function genCrashPt() {
    var mn = 1.05 + WIN_DIFFICULTY * 0.8,
      mx = 1.5 + WIN_DIFFICULTY * 25;
    return parseFloat((mn + Math.random() * (mx - mn)).toFixed(2));
  }
  function startCrash() {
    var bet = Math.min(
      parseInt(document.getElementById("crash-bet-input").value) || 50,
      casinoSaldo,
    );
    var autoOn = isCrashAutoEnabled();
    var autoAt = autoOn
      ? clampNumber(parseFloat(document.getElementById("crash-auto-input").value) || 2.0, 1.1, 100)
      : Infinity;
    if (casinoSaldo < 1 || bet < 1) {
      document.getElementById("crash-result").textContent = "Saldo insuficiente!";
      return;
    }
    atualizarSaldo(-bet);
    crSt = {
      running: true,
      busted: false,
      mult: 1.0,
      crashAt: genCrashPt(),
      bet: bet,
      cashedOut: false,
      autoAt: autoAt,
      autoEnabled: autoOn,
    };
    crPts = [];
    document.getElementById("crash-mult").className = "crash-mult-overlay";
    document.getElementById("btn-crash-bet").classList.add("disabled");
    document.getElementById("btn-crash-out").classList.remove("disabled");
    document.getElementById("btn-crash-out").textContent = "SACAR";
    document.getElementById("crash-result").textContent = autoOn
      ? "Multiplicador subindo... auto-saque em " + autoAt.toFixed(1) + "x"
      : "Multiplicador subindo... Saque a tempo!";
    document.getElementById("crash-result").style.color = "var(--muted)";
    document.getElementById("crash-result").style.borderColor = "";
    somGiro();
    var elapsed = 0,
      speed = 40,
      W = crCvs.width,
      H = crCvs.height;
    function tick() {
      if (!crSt.running) return;
      elapsed += speed;
      var t = elapsed / 1000;
      crSt.mult = parseFloat(Math.pow(Math.E, 0.42 * t).toFixed(2));
      var xR = Math.min(elapsed / 8000, 1),
        yR = Math.min((crSt.mult - 1) / Math.max(crSt.crashAt, 3), 1);
      crPts.push({ x: 20 + xR * (W - 40), y: H - 20 - yR * (H - 40) });
      drawCrash();
      document.getElementById("crash-mult").textContent = crSt.mult.toFixed(2) + "x";
      if (
        crSt.autoEnabled &&
        !crSt.cashedOut &&
        crSt.autoAt < crSt.crashAt &&
        crSt.mult >= crSt.autoAt
      ) {
        cashoutCrash(true);
      }
      if (crSt.mult >= crSt.crashAt) {
        crSt.running = false;
        crSt.busted = true;
        drawCrash();
        document.getElementById("crash-mult").classList.add("crashed");
        document.getElementById("crash-mult").textContent = crSt.crashAt.toFixed(2) + "x CRASH!";
        if (!crSt.cashedOut) {
          somErro();
          document.getElementById("crash-result").textContent =
            "CRASH em " + crSt.crashAt.toFixed(2) + "x - Perdeu $" + bet;
          document.getElementById("crash-result").style.color = "var(--pink)";
          document.getElementById("crash-result").style.borderColor = "var(--pink)";
        }
        addCrChip(crSt.crashAt);
        document.getElementById("btn-crash-bet").classList.remove("disabled");
        document.getElementById("btn-crash-out").classList.add("disabled");
        document.getElementById("btn-crash-out").textContent = "SACAR";
        return;
      }
      setTimeout(tick, speed);
    }
    setTimeout(tick, speed);
  }
  function finishCrashRound() {
    crSt.running = false;
    document.getElementById("btn-crash-bet").classList.remove("disabled");
    document.getElementById("btn-crash-out").classList.add("disabled");
  }
  function cashoutCrash(auto) {
    if (!crSt.running || crSt.cashedOut || crSt.busted) return;
    crSt.cashedOut = true;
    var gain = Math.floor(crSt.bet * crSt.mult);
    atualizarSaldo(gain);
    somOk();
    confetti();
    document.getElementById("crash-result").textContent =
      (auto ? "Auto-saque em " : "Sacou em ") + crSt.mult.toFixed(2) + "x - Ganhou $" + gain + "!";
    document.getElementById("crash-result").style.color = "var(--cyan)";
    document.getElementById("crash-result").style.borderColor = "var(--cyan)";
    document.getElementById("btn-crash-bet").classList.add("disabled");
    document.getElementById("btn-crash-out").classList.add("disabled");
    document.getElementById("btn-crash-out").textContent = "SACOU";
  }
  function addCrChip(m) {
    var ch = document.createElement("div");
    ch.className = "cr-chip " + (m < 1.5 ? "low" : m < 3 ? "mid" : "high");
    ch.textContent = m.toFixed(2) + "x";
    var h = document.getElementById("crash-history");
    h.insertBefore(ch, h.firstChild);
    if (h.children.length > 10) h.removeChild(h.lastChild);
  }
  document.getElementById("btn-crash-bet").addEventListener("click", function () {
    if (!crSt.running) startCrash();
  });
  document.getElementById("btn-crash-out").addEventListener("click", cashoutCrash);
  drawCrash();

  /* =====================================================================
     UNDERTALE JS -- Sistema de Batalha v2
     ===================================================================== */

  /* -- Estado -- */
  var UT = {
    currentBoss: null,
    playerMaxHP: 5, playerHP: 5,
    bossMaxHP: 10, bossHP: 10,
    phase: 'idle',
    actUnlocked: false,
    totalFightMs: 0,
    killed: { toriel: false, sans: false, final: false },
    roundDialogIdx: 0,
    actionIdx: 0,
    heart: { x: 160, y: 200, size: 8 },
  };

  /* -- Bosses -- */
  var UT_BOSSES = {
    toriel: {
      name: 'TORIEL', maxHP: 10, attack: 1, color: '#cc88ff',
      introDialogs: [
        ['Meu filho... por que você insiste em lutar?', 'Eu só quero te manter em segurança.'],
        ['Não me force a usar toda minha força...'],
      ],
      roundDialogs: [
        ['Isso não precisa continuar.', 'Por favor, reconsidere sua escolha.'],
        ['Você está me machucando...', 'Mas não vou desistir de te proteger.'],
        ['*Toriel lança uma bola de fogo com pesar.*'],
        ['Por favor, pare de lutar comigo!'],
      ],
      actOptions: [
        { text: 'Perguntar sobre as Ruínas', resp: 'Toriel suspira e conta as histórias das Ruínas com carinho.' },
        { text: 'Pedir proteção', resp: 'Toriel hesita. Ela parece profundamente comovida com sua vulnerabilidade.', correct: true },
        { text: 'Falar de si mesmo', resp: 'Toriel te escuta com atenção e genuína curiosidade.' },
        { text: 'Ficar em silêncio', resp: 'Toriel olha para você com preocupação e tristeza.' },
      ],
      correctActDialog: ['Toriel baixa a guarda por um momento.', '"Você... realmente precisa de mim?"'],
      winText: 'Toriel cai de joelhos, em lágrimas.\n"Vá em frente, meu filho.\nO mundo lá fora te espera."',
      mercyText: 'Você poupou Toriel.\nEla sorri aliviada, com lágrimas nos olhos.\n"Obrigada... por me entender."',
      heartColor: '#ff9944', heartColorLast: '#ff4400', heartGlow: '#ff6600',
      patterns: ['fire_orb', 'fire_spread'],
      patternsMed: ['fire_spread', 'fire_orb', 'fire_spread'],
      patternsHard: ['fire_ring', 'fire_spread', 'fire_ring'],
      patternsExtreme: ['fire_ring', 'fire_spread', 'fire_ring', 'fire_orb', 'fire_ring'],
    },
    sans: {
      name: 'SANS', maxHP: 10, attack: 1, color: '#88ccff',
      introDialogs: [
        ['ei.', 'acho que você já sabe o que vai acontecer aqui.'],
        ['não vou deixar você passar.', 'simples assim.'],
      ],
      roundDialogs: [
        ['heh...', 'você é persistente, né?'],
        ['continue tentando.', '...ou não.'],
        ['*Sans desvia do ataque com facilidade.*', '"cansou já?"'],
        ['você tem determinação, vou dar isso pra você.'],
      ],
      actOptions: [
        { text: 'Fazer uma piada', resp: '"heh... não foi ruim." Sans pisca levemente.' },
        { text: 'Falar sobre Papyrus', resp: '"meu irmão..." Sans para por um momento, com um olhar distante.', correct: true },
        { text: 'Questionar o julgamento', resp: '"você sabe o que fez. Eu sei o que você fez." O sorriso some por um instante.' },
        { text: 'Ameaçar', resp: '"heh. pode tentar." Os olhos piscam em azul brilhante.' },
      ],
      correctActDialog: ['"papyrus...', 'ele acreditava em você, sabia?"'],
      winText: 'Sans senta no chão lentamente.\n"heh... não é mais engraçado.\nboa sorte lá na frente, parceiro."',
      mercyText: 'Você poupou Sans.\n"...tudo bem."\nEle fecha os olhos e descansa.',
      heartColor: '#aaddff', heartColorLast: '#0088ff', heartGlow: '#0055ff',
      patterns: ['bone_sweep'],
      patternsMed: ['bone_sweep', 'gaster_h', 'bone_sweep'],
      patternsHard: ['bone_rain', 'gaster_h', 'bone_rain', 'bone_sweep_fast'],
      patternsExtreme: ['bone_rain_fast', 'gaster_h', 'chaos_bone', 'bone_rain', 'gaster_h'],
    },
    final: {
      name: 'FLOWEY', maxHP: 20, attack: 2, color: '#ffff44',
      introDialogs: [
        ['Olá! Eu sou Flowey!', 'Flowey, a Florzinha!'],
        ['Neste mundo... é matar ou ser morto.', 'Que ingênuo você é!'],
      ],
      roundDialogs: [
        ['HAHAHA!', 'Você acha mesmo que pode me vencer?!'],
        ['Que patético.', 'Continue tentando -- sua alma é MINHA!'],
        ['*Flowey sorri de forma perturbadora.*', '"Está ficando divertido!"'],
        ['IMPOSSÍVEL!', 'Como você ainda está de pé?!'],
        ['Não vou deixar você vencer!', 'NUNCA!'],
      ],
      actOptions: [
        { text: 'Chamar de flor', resp: '"EU NÃO SOU SÓ UMA FLOR, IDIOTA!" Flowey fica furioso.' },
        { text: 'Lembrar da amizade', resp: 'Flowey congela por um instante. "Isso não... não significa nada!"', correct: true },
        { text: 'Oferecer paz', resp: '"Que ingênuo!" Flowey ri maliciosamente da sua oferta.' },
        { text: 'Ignorar completamente', resp: 'Flowey fica ainda mais furioso com sua indiferença.' },
      ],
      correctActDialog: ['"Eu... eu tive amigos uma vez."', '"Mas isso não muda NADA!" Ele ataca com raiva redobrada.'],
      winText: 'Flowey se desfaz lentamente em pétalas douradas.\n"N-Não... impossível...!"\n\n* VERDADEIRO FINAL ALCANÇADO *',
      mercyText: 'Você poupou Flowey.\nPor um instante, algo humano passa por sua expressão.\n"...por quê?"',
      heartColor: '#ffee44', heartColorLast: '#aaff00', heartGlow: '#ffaa00',
      patterns: ['pellets', 'vine_grab'],
      patternsMed: ['pellets_fast', 'vine_grab', 'pellets'],
      patternsHard: ['pellets_fast', 'vine_chaos', 'chaos'],
      patternsExtreme: ['chaos', 'pellets_fast', 'vine_chaos', 'chaos', 'pellets_fast', 'chaos'],
    },
  };

  /* -- Hub navigation -- */
  var utHubIdx = 0;
  var utHubOrder = ['toriel', 'final', 'sans'];

  function utHubGetCards() {
    return [
      document.getElementById('ut-card-toriel'),
      document.getElementById('ut-card-final'),
      document.getElementById('ut-card-sans'),
    ];
  }

  function utHubSetFoco(idx) {
    var cards = utHubGetCards();
    var dir = idx < utHubIdx ? -1 : 1;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    var attempts = 0;
    while (attempts < cards.length) {
      var card = cards[idx];
      if (!card || !card.classList.contains('ut-boss-locked') || card.classList.contains('unlocked')) break;
      idx = ((idx + dir) % cards.length + cards.length) % cards.length;
      attempts++;
    }
    cards.forEach(function (c) { if (c) c.classList.remove('kb-focus'); });
    if (cards[idx]) cards[idx].classList.add('kb-focus');
    utHubIdx = idx;
  }

  function utHubSelect() {
    var bossKey = utHubOrder[utHubIdx];
    var card = utHubGetCards()[utHubIdx];
    if (!card) return;
    if (card.classList.contains('ut-boss-locked') && !card.classList.contains('unlocked')) { somErro(); return; }
    somNav();
    utStartBattle(bossKey);
  }

  document.getElementById('ut-card-toriel').addEventListener('click', function () { somNav(); utStartBattle('toriel'); });
  document.getElementById('ut-card-sans').addEventListener('click', function () { somNav(); utStartBattle('sans'); });
  document.getElementById('ut-card-final').addEventListener('click', function () {
    var card = document.getElementById('ut-card-final');
    if (card && card.classList.contains('unlocked')) { somNav(); utStartBattle('final'); }
    else somErro();
  });

  /* -- Hub refresh -- */
  function utRefreshHub() {
    var killed = 0;
    ['toriel', 'sans'].forEach(function (k) {
      var card = document.getElementById('ut-card-' + k);
      var badge = document.getElementById('ut-badge-' + k);
      if (UT.killed[k]) {
        killed++;
        if (card) card.classList.add('ut-boss-killed');
        if (badge) { badge.textContent = 'DERROTADO'; badge.classList.add('killed'); }
      }
    });
    var pct = (killed / 2) * 100;
    var fill = document.getElementById('ut-progress-fill');
    var txt = document.getElementById('ut-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (txt) txt.textContent = killed + ' / 2 BOSSES DERROTADOS';
    var finalCard = document.getElementById('ut-card-final');
    if (killed >= 2 && !UT.killed.final) {
      if (finalCard) { finalCard.classList.remove('ut-boss-locked'); finalCard.classList.add('unlocked'); }
      var fName = document.getElementById('ut-final-name');
      var fFlavor = document.getElementById('ut-final-flavor');
      var fCta = document.getElementById('ut-final-cta');
      var lockSym = document.getElementById('ut-lock-symbol');
      if (fName) { fName.textContent = 'FLOWEY'; fName.style.color = '#ffd700'; }
      if (fFlavor) fFlavor.textContent = 'A flor mais poderosa.\nO verdadeiro inimigo.';
      if (fCta) { fCta.style.borderColor = '#ffd700'; fCta.style.color = '#ffd700'; fCta.textContent = 'ENTRAR'; }
      if (lockSym) lockSym.style.display = 'none';
      var finalArtWrap = document.getElementById('ut-art-final-wrap');
      if (finalArtWrap) finalArtWrap.style.display = 'flex';
      setTimeout(function () { utDrawFloweyHubArt(); }, 50);
    }
    utHubSetFoco(0);
    utDrawBossArts();
  }

  /* -- Pixel art hub cards -- */
  function utDrawBossArts() { utDrawTorielArt(); utDrawSansArt(); if (UT.killed.final || (document.getElementById('ut-card-final') && document.getElementById('ut-card-final').classList.contains('unlocked'))) utDrawFloweyHubArt(); }

  function utDrawFloweyHubArt() {
    var c = document.getElementById('ut-art-final');
    if (!c) return;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 80, 88);
    ctx.save();
    ctx.translate(40, 52);
    /* stem */
    ctx.fillStyle = '#44aa44'; ctx.fillRect(-3, 8, 6, 26);
    /* petals */
    for (var i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate((i / 6) * Math.PI * 2);
      ctx.fillStyle = '#ffff44';
      ctx.beginPath(); ctx.ellipse(0, -22, 6, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    /* face */
    ctx.fillStyle = '#ffee00'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 3, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }

  function utDrawTorielArt() {
    var c = document.getElementById('ut-art-toriel');
    if (!c) return;
    var x = c.getContext('2d');
    x.clearRect(0, 0, 80, 88);
    x.fillStyle = '#aa77cc'; x.fillRect(22, 30, 36, 40);
    x.fillStyle = '#ddaaee'; x.fillRect(24, 8, 32, 28);
    x.fillStyle = '#330044'; x.fillRect(30, 18, 7, 7); x.fillRect(44, 18, 7, 7);
    x.fillStyle = '#ff4444'; x.fillRect(32, 20, 3, 3); x.fillRect(46, 20, 3, 3);
    x.fillStyle = '#ddaaee'; x.fillRect(20, 4, 8, 12); x.fillRect(52, 4, 8, 12);
    x.fillStyle = '#ffaaaa'; x.fillRect(22, 6, 4, 8); x.fillRect(54, 6, 4, 8);
    x.fillStyle = '#cc99dd'; x.fillRect(16, 60, 48, 18);
    x.fillStyle = '#ff8800'; x.fillRect(8, 44, 10, 16); x.fillRect(62, 44, 10, 16);
    x.fillStyle = '#ffcc00'; x.fillRect(10, 46, 6, 10); x.fillRect(64, 46, 6, 10);
    x.fillStyle = '#9900bb';
    x.beginPath(); x.moveTo(40, 35); x.lineTo(34, 50); x.lineTo(46, 50); x.closePath(); x.fill();
  }

  function utDrawSansArt() {
    var c = document.getElementById('ut-art-sans');
    if (!c) return;
    var x = c.getContext('2d');
    x.clearRect(0, 0, 80, 88);
    x.fillStyle = '#4466aa'; x.fillRect(18, 38, 44, 34);
    x.fillStyle = '#eeeedd'; x.fillRect(18, 8, 44, 36);
    x.strokeStyle = '#ccccbb'; x.lineWidth = 2; x.strokeRect(18, 8, 44, 36);
    x.fillStyle = '#222222'; x.fillRect(26, 18, 12, 12); x.fillRect(44, 18, 12, 12);
    x.fillStyle = '#0088ff'; x.fillRect(28, 20, 8, 8); x.fillRect(46, 20, 8, 8);
    x.fillStyle = '#ffffff'; x.fillRect(30, 22, 4, 4); x.fillRect(48, 22, 4, 4);
    x.fillStyle = '#222222'; x.fillRect(24, 32, 32, 6);
    x.fillStyle = '#eeeedd';
    for (var i = 0; i < 6; i++) x.fillRect(26 + i * 5, 34, 3, 4);
    x.fillStyle = '#334488'; x.fillRect(14, 38, 52, 12); x.fillRect(10, 36, 60, 8);
    x.fillStyle = '#5577bb'; x.fillRect(30, 52, 20, 18);
    x.fillStyle = '#334488'; x.fillRect(20, 50, 10, 22); x.fillRect(50, 50, 10, 22);
  }

  /* -- Boss sprites (battle screen) -- */
  var utSpriteAnimT = 0, utSpriteAnimRAF = null;

  function utDrawBossSprite(t) {
    var c = document.getElementById('ut-boss-sprite-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 320, 160);
    if (!UT.currentBoss) return;
    ctx.save();
    ctx.translate(160, 80);
    if (UT.bossHurt) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.3);
    if (UT.currentBoss === 'toriel') utDrawTorielSpriteLarge(ctx, t);
    else if (UT.currentBoss === 'sans') utDrawSansSpriteLarge(ctx, t);
    else utDrawFloweySpriteLarge(ctx, t);
    ctx.restore();
  }

  function utDrawTorielSpriteLarge(ctx, t) {
    var bob = Math.sin(t * 0.05) * 3;
    ctx.translate(0, bob);
    ctx.fillStyle = '#cc99dd'; ctx.fillRect(-30, 20, 60, 58);
    ctx.fillStyle = '#aa77cc'; ctx.fillRect(-22, -8, 44, 34);
    ctx.fillStyle = '#ddaaee'; ctx.fillRect(-24, -48, 48, 46);
    ctx.fillStyle = '#ddaaee'; ctx.fillRect(-34, -52, 14, 20); ctx.fillRect(20, -52, 14, 20);
    ctx.fillStyle = '#ffaaaa'; ctx.fillRect(-30, -48, 6, 14); ctx.fillRect(24, -48, 6, 14);
    ctx.fillStyle = '#330044'; ctx.fillRect(-18, -30, 10, 10); ctx.fillRect(8, -30, 10, 10);
    ctx.fillStyle = '#ff4444'; ctx.fillRect(-16, -28, 5, 5); ctx.fillRect(10, -28, 5, 5);
    ctx.fillStyle = '#9900bb';
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-10, 20); ctx.lineTo(10, 20); ctx.closePath(); ctx.fill();
    if (UT.phase === 'arena' || UT.phase === 'dialog') {
      var fx = Math.sin(t * 0.08) * 15;
      ctx.fillStyle = '#ff8800';
      ctx.beginPath(); ctx.arc(-50 + fx, 10, 10 + Math.sin(t * 0.1) * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(-50 + fx, 10, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(50 - fx, 10, 10 + Math.cos(t * 0.1) * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(50 - fx, 10, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function utDrawSansSpriteLarge(ctx, t) {
    var bob = Math.sin(t * 0.04) * 2;
    ctx.translate(0, bob);
    ctx.fillStyle = '#4466aa'; ctx.fillRect(-30, 2, 60, 54);
    ctx.fillStyle = '#334488'; ctx.fillRect(-36, -4, 72, 14); ctx.fillRect(-32, -6, 64, 8);
    ctx.fillStyle = '#eeeedd'; ctx.fillRect(-26, -50, 52, 52);
    if (UT.bossHurt || UT.phase === 'arena') {
      ctx.fillStyle = '#0088ff'; ctx.fillRect(-20, -34, 16, 16); ctx.fillRect(4, -34, 16, 16);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-16, -30, 8, 8); ctx.fillRect(8, -30, 8, 8);
    } else {
      ctx.fillStyle = '#222'; ctx.fillRect(-20, -34, 16, 16); ctx.fillRect(4, -34, 16, 16);
    }
    ctx.fillStyle = '#222'; ctx.fillRect(-18, -12, 36, 8);
    ctx.fillStyle = '#eeeedd';
    for (var i = 0; i < 6; i++) ctx.fillRect(-16 + i * 6, -10, 4, 6);
    if (UT.phase === 'arena' || UT.phase === 'dialog') {
      ctx.fillStyle = '#eeeedd';
      ctx.fillRect(-56, 10 + Math.sin(t * 0.07) * 6, 22, 8);
      ctx.fillRect(34, 10 + Math.cos(t * 0.07) * 6, 22, 8);
    }
  }

  function utDrawFloweySpriteLarge(ctx, t) {
    var sway = Math.sin(t * 0.04) * 8;
    ctx.fillStyle = '#44aa44'; ctx.fillRect(-4, 30, 8, 40);
    ctx.save(); ctx.translate(sway, 0);
    for (var i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate((i / 6) * Math.PI * 2 + t * 0.02);
      ctx.fillStyle = '#ffff44';
      ctx.beginPath(); ctx.ellipse(0, -42, 14, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ffee00'; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-10, -6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    if (UT.bossHurt) {
      ctx.beginPath(); ctx.arc(0, 6, 14, Math.PI + 0.3, -0.3); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, 6, 14, 0.3, Math.PI - 0.3); ctx.stroke();
    }
    ctx.restore();
  }

  function utAnimateSprite() {
    if (telaAtiva !== TELA.UT_BATTLE) { utSpriteAnimRAF = null; return; }
    utSpriteAnimT++;
    utDrawBossSprite(utSpriteAnimT);
    utSpriteAnimRAF = requestAnimationFrame(utAnimateSprite);
  }

  /* -- Battle start -- */
  function utStartBattle(bossKey) {
    var boss = UT_BOSSES[bossKey];
    if (!boss) return;
    UT.currentBoss = bossKey;
    UT.playerHP = UT.playerMaxHP;
    UT.bossMaxHP = boss.maxHP;
    UT.bossHP = boss.maxHP;
    UT.phase = 'dialog';
    UT.actUnlocked = false;
    UT.totalFightMs = 0;
    UT.roundDialogIdx = 0;
    UT.actionIdx = 0;
    UT.bossHurt = false;
    utBossHearts = []; utBullets = [];

    var titleEl = document.getElementById('ut-battle-title');
    if (titleEl) titleEl.textContent = boss.name;
    document.getElementById('ut-action-menu').style.display = 'none';
    document.getElementById('ut-act-menu').style.display = 'none';
    document.getElementById('ut-arena-container').style.display = 'none';
    document.getElementById('ut-btn-mercy').style.display = 'none';
    utUpdateHPBars();

    irPara(TELA.UT_BATTLE);

    var introLines = boss.introDialogs[Math.floor(Math.random() * boss.introDialogs.length)];
    setTimeout(function () { utTypeLines(introLines, function () { utShowActionMenu(); }); }, 400);
  }

  /* -- Dialog system -- */
  var utDialogInterval = null;
  var utDialogCb = null;

  function utTypeLines(lines, cb) {
    UT.phase = 'dialog';
    document.getElementById('ut-action-menu').style.display = 'none';
    document.getElementById('ut-act-menu').style.display = 'none';

    var fullText = lines.join('\n');
    var el = document.getElementById('ut-dialog-text');
    var cursor = document.getElementById('ut-dialog-cursor');
    if (el) el.textContent = '';
    if (cursor) cursor.style.display = 'none';
    if (utDialogInterval) { clearInterval(utDialogInterval); utDialogInterval = null; }

    var i = 0;
    utDialogCb = cb;
    utDialogInterval = setInterval(function () {
      if (i >= fullText.length) {
        clearInterval(utDialogInterval); utDialogInterval = null;
        if (cursor) cursor.style.display = 'block';
        bipe(440, 'square', 0.03, 0.05);
        return;
      }
      if (el) el.textContent += fullText[i];
      if (fullText[i] !== '\n') bipe(280 + Math.random() * 160, 'square', 0.035, 0.04);
      i++;
    }, 36);
  }

  function utAdvanceDialog() {
    if (utDialogInterval) {
      clearInterval(utDialogInterval); utDialogInterval = null;
      var cursor = document.getElementById('ut-dialog-cursor');
      if (cursor) cursor.style.display = 'block';
      return;
    }
    if (utDialogCb) {
      var cb = utDialogCb; utDialogCb = null;
      var cursor = document.getElementById('ut-dialog-cursor');
      if (cursor) cursor.style.display = 'none';
      cb();
    }
  }

  /* -- Action menu -- */
  function utShowActionMenu() {
    UT.phase = 'menu';
    document.getElementById('ut-action-menu').style.display = 'grid';
    document.getElementById('ut-act-menu').style.display = 'none';
    var mercy = document.getElementById('ut-btn-mercy');
    if (mercy) mercy.style.display = UT.actUnlocked ? 'block' : 'none';
    utSetActionFocus(0);
  }

  function utSetActionFocus(idx) {
    var maxIdx = UT.actUnlocked ? 2 : 1;
    idx = Math.max(0, Math.min(maxIdx, idx));
    var ids = ['ut-btn-fight', 'ut-btn-act', 'ut-btn-mercy'];
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.remove('kb-focus'); });
    var el = document.getElementById(ids[idx]);
    if (el) el.classList.add('kb-focus');
    UT.actionIdx = idx;
  }

  /* -- ACT system -- */
  function utShowActMenu() {
    UT.phase = 'act';
    document.getElementById('ut-action-menu').style.display = 'none';
    document.getElementById('ut-act-menu').style.display = 'grid';
    var boss = UT_BOSSES[UT.currentBoss];
    boss.actOptions.forEach(function (opt, i) {
      var el = document.getElementById('ut-act-' + i);
      if (el) { el.textContent = '\u2665 ' + opt.text; el.classList.remove('kb-focus'); }
    });
    var el = document.getElementById('ut-act-0');
    if (el) el.classList.add('kb-focus');
    UT.actionIdx = 0;
  }

  function utSetActFocus(idx) {
    idx = Math.max(0, Math.min(3, idx));
    for (var i = 0; i < 4; i++) {
      var el = document.getElementById('ut-act-' + i);
      if (el) el.classList.remove('kb-focus');
    }
    var el = document.getElementById('ut-act-' + idx);
    if (el) el.classList.add('kb-focus');
    UT.actionIdx = idx;
  }

  function utDoActOption(idx) {
    var boss = UT_BOSSES[UT.currentBoss];
    var opt = boss.actOptions[idx];
    if (!opt) return;
    if (opt.correct) {
      UT.actUnlocked = true;
      utTypeLines(boss.correctActDialog, function () { utShowActionMenu(); });
    } else {
      utTypeLines([opt.resp], function () { utShowActionMenu(); });
    }
  }

  function utDoMercy() {
    var boss = UT_BOSSES[UT.currentBoss];
    UT.phase = 'dialog';
    document.getElementById('ut-action-menu').style.display = 'none';
    utTypeLines([boss.mercyText], function () { utVictory(true); });
  }

  /* -- Arena fight -- */
  var utBossHearts = [];
  var utBullets = [];
  var utArenaRAF = null;
  var utArenaStartMs = 0;
  var utHeartSpawnDelay = 0;
  var utHeartTimer = 0;
  var utBulletTimer = 0;
  var utAnimT = 0;
  var utArenaKeys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };

  document.addEventListener('keydown', function (e) {
    if (UT.phase === 'arena' && utArenaKeys.hasOwnProperty(e.key)) {
      utArenaKeys[e.key] = true;
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) {
    if (utArenaKeys.hasOwnProperty(e.key)) utArenaKeys[e.key] = false;
  });

  /* Heart path helper */
  function utHeartPath(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.2);
    ctx.bezierCurveTo(cx, cy - s, cx - s * 1.1, cy - s, cx - s * 1.1, cy - s * 0.2);
    ctx.bezierCurveTo(cx - s * 1.1, cy + s * 0.4, cx, cy + s * 0.9, cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx + s * 1.1, cy + s * 0.4, cx + s * 1.1, cy - s * 0.2, cx + s * 1.1, cy - s * 0.2);
    ctx.bezierCurveTo(cx + s * 1.1, cy - s, cx, cy - s, cx, cy - s * 0.2);
    ctx.closePath();
  }

  /* Draw collectible boss heart themed to boss */
  function utDrawCollectibleHeart(ctx, h) {
    if (!h.active) return;
    var pulse = 1 + 0.12 * Math.sin(utAnimT * 0.09 + h.phase);
    var s = h.size * pulse;
    var bossKey = UT.currentBoss;
    ctx.save();
    ctx.translate(h.x, h.y);

    if (bossKey === 'toriel') {
      /* Fire heart: warm orange gradient */
      ctx.shadowColor = h.isLast ? '#ff4400' : '#ff8800';
      ctx.shadowBlur = h.isLast ? 16 : 9;
      var g = ctx.createRadialGradient(0, -s * 0.2, 0, 0, 0, s * 1.2);
      g.addColorStop(0, h.isLast ? '#ffdd44' : '#ffcc88');
      g.addColorStop(1, h.isLast ? '#ff3300' : '#ff8844');
      ctx.fillStyle = g;
      utHeartPath(ctx, 0, 0, s); ctx.fill();
      if (h.isLast) {
        /* Flame wisps above the heart */
        ctx.fillStyle = '#ffee00'; ctx.shadowBlur = 6;
        for (var i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(-s * 0.4 + i * s * 0.4, -s * 0.85 - Math.abs(Math.sin(utAnimT * 0.12 + i)) * 3, s * 0.12, s * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bossKey === 'sans') {
      /* Bone/ice heart: white-blue */
      ctx.shadowColor = h.isLast ? '#0066ff' : '#88aaff';
      ctx.shadowBlur = h.isLast ? 18 : 9;
      ctx.fillStyle = h.isLast ? '#aaddff' : '#ddeeff';
      utHeartPath(ctx, 0, 0, s); ctx.fill();
      /* Bone texture line */
      ctx.strokeStyle = h.isLast ? '#0066ff' : '#99aacc';
      ctx.lineWidth = h.isLast ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(-s * 0.55, 0); ctx.lineTo(s * 0.55, 0); ctx.stroke();
      if (h.isLast) {
        /* Gaster blaster eye detail */
        ctx.fillStyle = '#0088ff';
        ctx.beginPath(); ctx.ellipse(0, -s * 0.08, s * 0.26, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(s * 0.07, -s * 0.08, s * 0.1, s * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      /* Flowey heart: yellow-green */
      ctx.shadowColor = h.isLast ? '#88ff00' : '#ffee00';
      ctx.shadowBlur = h.isLast ? 18 : 9;
      if (h.isLast) {
        /* Petal rim behind heart */
        for (var p = 0; p < 5; p++) {
          ctx.save(); ctx.rotate((p / 5) * Math.PI * 2 + utAnimT * 0.015);
          ctx.fillStyle = '#ffee44'; ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.ellipse(0, -s * 1.45, s * 0.22, s * 0.48, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = h.isLast ? '#aaff44' : '#ffee44';
      utHeartPath(ctx, 0, 0, s); ctx.fill();
      /* Vine swirl detail */
      ctx.strokeStyle = '#44aa00'; ctx.lineWidth = h.isLast ? 1.8 : 1.2; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.25); ctx.quadraticCurveTo(0, -s * 0.1, s * 0.5, s * 0.25); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* Spawn a boss collectible heart */
  function utSpawnBossHeart() {
    var AW = 320, AH = 240;
    var isLast = UT.bossHP <= 2;
    var size = isLast ? 11 : 7;
    var x, y, tries = 0;
    do {
      x = size + 20 + Math.random() * (AW - size * 2 - 40);
      y = size + 15 + Math.random() * (AH * 0.65);
      tries++;
    } while (tries < 10 && Math.sqrt(Math.pow(x - UT.heart.x, 2) + Math.pow(y - UT.heart.y, 2)) < 60);
    var speed = 0.55 + Math.random() * 0.4;
    var angle = Math.random() * Math.PI * 2;
    utBossHearts.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: size, isLast: isLast,
      phase: Math.random() * Math.PI * 2, active: true,
    });
  }

  /* Helpers — pick random edge point and aim velocity at player */
  function utRandEdge(AW, AH) {
    var side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: Math.random() * AW, y: -12, side: 0 };
    if (side === 1) return { x: Math.random() * AW, y: AH + 12, side: 1 };
    if (side === 2) return { x: -12, y: Math.random() * AH, side: 2 };
    return { x: AW + 12, y: Math.random() * AH, side: 3 };
  }
  function utAimAtPlayer(ox, oy, spd) {
    var dx = UT.heart.x - ox, dy = UT.heart.y - oy;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { vx: dx / len * spd, vy: dy / len * spd };
  }
  /* Build evenly-spaced sweep rows with random offset so they never land on the same Y */
  function utSweepRows(n, AH) {
    var spacing = Math.floor(AH / n);
    var offset = Math.floor(Math.random() * spacing);
    var rows = [];
    for (var i = 0; i < n; i++) rows.push(offset + i * spacing);
    return rows;
  }

  /* Spawn bullet pattern */
  function utSpawnPattern(name) {
    var AW = 320, AH = 240;
    var px = UT.heart.x, py = UT.heart.y;

    if (name === 'fire_orb') {
      /* 2-4 fireballs from random edge positions, all aimed at player */
      var count = 2 + Math.floor(Math.random() * 3);
      for (var fi = 0; fi < count; fi++) {
        (function (i) {
          setTimeout(function () {
            if (UT.phase !== 'arena') return;
            var e = utRandEdge(AW, AH);
            var spd = 2.8 + Math.random() * 0.8;
            var v = utAimAtPlayer(e.x, e.y, spd);
            utBullets.push({ x: e.x, y: e.y, vx: v.vx, vy: v.vy, r: 8, color: '#ff8800', glow: '#ff4400', active: true });
          }, i * 180);
        })(fi);
      }

    } else if (name === 'fire_spread') {
      /* Fan of 5 from a random edge point, center aimed at player */
      var e = utRandEdge(AW, AH);
      var baseAngle = Math.atan2(py - e.y, px - e.x);
      var spd = 3.0 + Math.random() * 0.5;
      for (var i = -2; i <= 2; i++) {
        var ang = baseAngle + i * 0.22;
        utBullets.push({ x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7, color: '#ff6600', glow: '#ff2200', active: true });
      }

    } else if (name === 'fire_ring') {
      /* Ring from a random spot, not always center */
      var ox = 60 + Math.random() * (AW - 120);
      var oy = 30 + Math.random() * (AH * 0.5);
      var count = 8 + Math.floor(Math.random() * 5);
      var spd = 2.5 + Math.random() * 0.8;
      var rotOffset = Math.random() * Math.PI * 2;
      for (var i = 0; i < count; i++) {
        var ang = rotOffset + (i / count) * Math.PI * 2;
        utBullets.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7, color: '#ff8800', glow: '#ff4400', active: true });
      }

    } else if (name === 'bone_sweep') {
      /* Horizontal sweep — random direction (L>R or R>L), random Y spacing */
      var rows = utSweepRows(5, AH);
      var safeIdx = Math.floor(Math.random() * rows.length);
      var fromLeft = Math.random() < 0.5;
      var spd = 4.0 + Math.random() * 1.2;
      rows.forEach(function (y, ri) {
        if (ri === safeIdx) return;
        var startX = fromLeft ? -AW : AW * 2;
        utBullets.push({ x: startX, y: y, vx: fromLeft ? spd : -spd, vy: (Math.random() - 0.5) * 0.4, r: 5, boneLen: AW, boneH: 11, color: '#eeeedd', glow: '#aaaaaa', active: true, bone: true, sweeping: true, sweepLeft: fromLeft });
      });

    } else if (name === 'bone_sweep_fast') {
      var rows = utSweepRows(5, AH);
      var safeIdx = Math.floor(Math.random() * rows.length);
      var fromLeft = Math.random() < 0.5;
      var spd = 6.5 + Math.random() * 1.5;
      rows.forEach(function (y, ri) {
        if (ri === safeIdx) return;
        var startX = fromLeft ? -AW : AW * 2;
        utBullets.push({ x: startX, y: y, vx: fromLeft ? spd : -spd, vy: (Math.random() - 0.5) * 0.5, r: 5, boneLen: AW, boneH: 11, color: '#aaddff', glow: '#0088ff', active: true, bone: true, sweeping: true, sweepLeft: fromLeft });
      });

    } else if (name === 'bone_rain') {
      /* Vertical rain — random X spread, one aimed at player, random delays */
      var capturedPX = px;
      var count = 5 + Math.floor(Math.random() * 3);
      var fromTop = Math.random() < 0.6;
      var spd = 3.5 + Math.random() * 0.8;
      for (var i = 0; i < count; i++) {
        (function (ii) {
          var delay = Math.random() * 600;
          setTimeout(function () {
            if (UT.phase !== 'arena') return;
            var bx = ii === 1 ? capturedPX + (Math.random() - 0.5) * 30 : 20 + Math.random() * (AW - 40);
            var by = fromTop ? -12 : AH + 12;
            var vyDir = fromTop ? spd : -spd;
            utBullets.push({ x: bx, y: by, vx: (Math.random() - 0.5) * 0.8, vy: vyDir, r: 5, boneLen: 26, boneH: 8, color: '#ccddff', glow: '#0088ff', active: true, bone: true, vertical: true });
          }, delay);
        })(i);
      }

    } else if (name === 'gaster_h') {
      /* Gaster blaster — random Y, random direction L or R */
      var gy = 25 + Math.random() * (AH - 50);
      var fromLeft = Math.random() < 0.5;
      utBullets.push({ x: AW / 2, y: gy, vx: 0, vy: 0, r: AW / 2, color: 'rgba(0,136,255,0.12)', glow: '', active: true, warning: true, life: 48 });
      setTimeout(function () {
        if (UT.phase !== 'arena') return;
        utBullets.push({ x: fromLeft ? -30 : AW + 30, y: gy, vx: fromLeft ? 9 : -9, vy: (Math.random() - 0.5) * 0.6, r: 10, color: '#0088ff', glow: '#00aaff', active: true, laser: true, laserH: 16 + Math.floor(Math.random() * 8) });
      }, 800);

    } else if (name === 'pellets') {
      /* Ring from random position, rotated randomly */
      var ox = 40 + Math.random() * (AW - 80);
      var oy = 20 + Math.random() * (AH * 0.6);
      var count = 7 + Math.floor(Math.random() * 4);
      var spd = 2.0 + Math.random() * 0.6;
      var rot = Math.random() * Math.PI * 2;
      for (var i = 0; i < count; i++) {
        var ang = rot + (i / count) * Math.PI * 2;
        utBullets.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7, color: '#ffff44', glow: '#ffaa00', active: true, face: true });
      }

    } else if (name === 'pellets_fast') {
      /* Double ring: one aimed at player, one offset */
      var ox = 30 + Math.random() * (AW - 60);
      var oy = 15 + Math.random() * (AH * 0.55);
      var count = 9 + Math.floor(Math.random() * 4);
      var spd = 3.4 + Math.random() * 0.6;
      var baseAng = Math.atan2(py - oy, px - ox);
      for (var i = 0; i < count; i++) {
        var ang = baseAng + (i / count) * Math.PI * 2;
        utBullets.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7, color: '#ffff00', glow: '#ffaa00', active: true, face: true });
      }

    } else if (name === 'vine_grab') {
      /* Vines from random sides/heights aimed at player */
      var numVines = 2 + Math.floor(Math.random() * 2);
      for (var i = 0; i < numVines; i++) {
        var e = utRandEdge(AW, AH);
        var spd = 2.5 + Math.random() * 1.2;
        var v = utAimAtPlayer(e.x, e.y, spd);
        /* slight random drift */
        v.vx += (Math.random() - 0.5) * 0.8;
        v.vy += (Math.random() - 0.5) * 0.8;
        utBullets.push({ x: e.x, y: e.y, vx: v.vx, vy: v.vy, r: 7, color: '#44cc44', glow: '#00aa00', active: true });
      }

    } else if (name === 'vine_chaos') {
      /* Many vines from all edges, some aimed, some random */
      var count = 5 + Math.floor(Math.random() * 3);
      for (var i = 0; i < count; i++) {
        var e = utRandEdge(AW, AH);
        var aimed = Math.random() < 0.5;
        var spd = 2.8 + Math.random() * 1.4;
        var vx, vy;
        if (aimed) {
          var v = utAimAtPlayer(e.x, e.y, spd);
          vx = v.vx; vy = v.vy;
        } else {
          var ang = Math.random() * Math.PI * 2;
          vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd;
        }
        utBullets.push({ x: e.x, y: e.y, vx: vx, vy: vy, r: 8, color: '#44cc44', glow: '#00ff44', active: true });
      }

    } else if (name === 'bone_rain_fast') {
      var capturedPX2 = px;
      for (var i = 0; i < 8; i++) {
        (function (ii) {
          var delay = Math.random() * 400;
          setTimeout(function () {
            if (UT.phase !== 'arena') return;
            var fromTop = Math.random() < 0.65;
            var bx = ii < 2 ? capturedPX2 + (Math.random() - 0.5) * 40 : 15 + Math.random() * (AW - 30);
            var by = fromTop ? -12 : AH + 12;
            var spd = 5.0 + Math.random() * 1.5;
            utBullets.push({ x: bx, y: by, vx: (Math.random() - 0.5) * 1.2, vy: fromTop ? spd : -spd, r: 5, boneLen: 24, boneH: 8, color: '#aaddff', glow: '#0088ff', active: true, bone: true, vertical: true });
          }, delay);
        })(i);
      }

    } else if (name === 'chaos_bone') {
      /* Bones from random directions + bone rain combo */
      var count = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < count; i++) {
        var fromLeft = Math.random() < 0.5;
        var y = 20 + Math.random() * (AH - 40);
        var spd = 4.5 + Math.random() * 2;
        utBullets.push({ x: fromLeft ? -AW : AW * 2, y: y, vx: fromLeft ? spd : -spd, vy: (Math.random() - 0.5) * 1.2, r: 5, boneLen: AW * (0.4 + Math.random() * 0.5), boneH: 9, color: '#eeeedd', glow: '#0088ff', active: true, bone: true, sweeping: true, sweepLeft: fromLeft });
      }
      /* Plus vertical rain */
      for (var i = 0; i < 3; i++) {
        (function (ii) {
          setTimeout(function () {
            if (UT.phase !== 'arena') return;
            var bx = 20 + Math.random() * (AW - 40);
            utBullets.push({ x: bx, y: -12, vx: 0, vy: 5, r: 5, boneLen: 22, boneH: 8, color: '#ccddff', glow: '#0088ff', active: true, bone: true, vertical: true });
          }, ii * 220);
        })(i);
      }

    } else if (name === 'chaos') {
      var cols = ['#ffff44', '#ff4444', '#44ffaa', '#ff44ff', '#44ffff', '#ff8800'];
      var count = 10 + Math.floor(Math.random() * 8);
      for (var i = 0; i < count; i++) {
        var e = utRandEdge(AW, AH);
        var aimed = Math.random() < 0.4;
        var spd = 2.2 + Math.random() * 2.5;
        var vx, vy;
        if (aimed) {
          var v = utAimAtPlayer(e.x, e.y, spd);
          vx = v.vx; vy = v.vy;
        } else {
          var ang = Math.random() * Math.PI * 2;
          vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd;
        }
        utBullets.push({ x: e.x, y: e.y, vx: vx, vy: vy, r: 6, color: cols[i % cols.length], glow: cols[i % cols.length], active: true });
      }
    }
  }

  /* Draw arena canvas */
  function utDrawArena() {
    var c = document.getElementById('ut-arena-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var AW = c.width, AH = c.height;
    ctx.clearRect(0, 0, AW, AH);
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, AW, AH);

    /* Bullets */
    utBullets.forEach(function (b) {
      if (!b.active) return;
      ctx.save();
      if (b.warning) {
        ctx.fillStyle = b.color; ctx.fillRect(0, b.y - 14, AW, 28);
        ctx.restore(); return;
      }
      ctx.shadowColor = b.glow || b.color; ctx.shadowBlur = 10;
      if (b.laser) {
        ctx.fillStyle = b.color;
        var lh = b.laserH || 18;
        ctx.fillRect(0, b.y - lh / 2, AW, lh);
      } else if (b.bone) {
        ctx.fillStyle = b.color;
        if (!b.vertical) {
          /* horizontal bone */
          var bh = b.boneH || 10;
          ctx.fillRect(b.x, b.y - bh / 2, b.boneLen || 40, bh);
          ctx.beginPath(); ctx.arc(b.x, b.y, bh / 2 + 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x + (b.boneLen || 40), b.y, bh / 2 + 2, 0, Math.PI * 2); ctx.fill();
        } else {
          /* vertical bone */
          var bh = b.boneH || 8;
          var blen = b.boneLen || 26;
          ctx.fillRect(b.x - bh / 2, b.y, bh, blen);
          ctx.beginPath(); ctx.arc(b.x, b.y, bh / 2 + 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x, b.y + blen, bh / 2 + 2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (b.face) {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(b.x - 2.5, b.y - 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(b.x + 2.5, b.y - 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(b.x, b.y + 1, 2.5, 0, Math.PI); ctx.stroke();
      } else {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });

    /* Boss hearts (collectibles) */
    utBossHearts.forEach(function (h) { utDrawCollectibleHeart(ctx, h); });

    /* Player heart */
    ctx.save();
    ctx.shadowColor = '#ff0044'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff0044';
    utHeartPath(ctx, UT.heart.x, UT.heart.y, UT.heart.size);
    ctx.fill();
    ctx.restore();
  }

  /* Start arena fight phase */
  function utStartArenaFight() {
    UT.phase = 'arena';
    UT.heart = { x: 160, y: 120, size: 8, vx: 0, vy: 0 };
    utBossHearts = []; utBullets = [];
    utHeartTimer = 360;   /* 6s at 60fps */
    utBulletTimer = 40;   /* first attack after ~0.7s */
    utAnimT = 0;
    document.getElementById('ut-action-menu').style.display = 'none';
    document.getElementById('ut-act-menu').style.display = 'none';
    document.getElementById('ut-arena-container').style.display = 'flex';
    var diagEl = document.getElementById('ut-dialog-text');
    if (diagEl) diagEl.textContent = 'Colete os coracoes do inimigo e desvie dos ataques!';
    var cursor = document.getElementById('ut-dialog-cursor');
    if (cursor) cursor.style.display = 'none';
    utArenaStartMs = Date.now();
    if (utArenaRAF) { cancelAnimationFrame(utArenaRAF); utArenaRAF = null; }
    utArenaRAF = requestAnimationFrame(utArenaFrame);
  }

  /* Arena game loop */
  function utArenaFrame() {
    if (UT.phase !== 'arena') return;
    var AW = 320, AH = 240;
    var elapsed = Date.now() - utArenaStartMs;
    var pctKilled = (UT.bossMaxHP - UT.bossHP) / UT.bossMaxHP;
    var medium = pctKilled >= 0.5;
    var hard = pctKilled >= 0.75;
    utAnimT++;

    /* Move player — acceleration + friction for fluid feel */
    var accel = 0.85, friction = 0.78, maxSpd = 4.2;
    if (utArenaKeys.ArrowLeft) UT.heart.vx -= accel;
    if (utArenaKeys.ArrowRight) UT.heart.vx += accel;
    if (utArenaKeys.ArrowUp) UT.heart.vy -= accel;
    if (utArenaKeys.ArrowDown) UT.heart.vy += accel;
    /* Clamp max speed */
    var spd = Math.sqrt(UT.heart.vx * UT.heart.vx + UT.heart.vy * UT.heart.vy);
    if (spd > maxSpd) { UT.heart.vx = UT.heart.vx / spd * maxSpd; UT.heart.vy = UT.heart.vy / spd * maxSpd; }
    /* Apply friction when no key held */
    if (!utArenaKeys.ArrowLeft && !utArenaKeys.ArrowRight) UT.heart.vx *= friction;
    if (!utArenaKeys.ArrowUp && !utArenaKeys.ArrowDown) UT.heart.vy *= friction;
    /* Snap to zero to avoid infinite drift */
    if (Math.abs(UT.heart.vx) < 0.08) UT.heart.vx = 0;
    if (Math.abs(UT.heart.vy) < 0.08) UT.heart.vy = 0;
    /* Apply velocity with boundary clamp */
    UT.heart.x = Math.max(UT.heart.size + 3, Math.min(AW - UT.heart.size - 3, UT.heart.x + UT.heart.vx));
    UT.heart.y = Math.max(UT.heart.size + 3, Math.min(AH - UT.heart.size - 3, UT.heart.y + UT.heart.vy));
    /* Bounce off walls to kill velocity */
    if (UT.heart.x <= UT.heart.size + 3 || UT.heart.x >= AW - UT.heart.size - 3) UT.heart.vx *= -0.2;
    if (UT.heart.y <= UT.heart.size + 3 || UT.heart.y >= AH - UT.heart.size - 3) UT.heart.vy *= -0.2;

    /* Hearts spawn on fixed 6s interval regardless of difficulty */
    utHeartTimer--;
    var activeH = utBossHearts.filter(function (h) { return h.active; }).length;
    var maxActiveHearts = hard ? 2 : 1;
    if (utHeartTimer <= 0 && activeH < maxActiveHearts) {
      utSpawnBossHeart();
      utHeartTimer = hard ? 240 : medium ? 300 : 360;  /* 4s/5s/6s */
    }

    /* Move boss hearts + check collection */
    var won = false;
    utBossHearts.forEach(function (h) {
      if (!h.active || won) return;
      h.x += h.vx; h.y += h.vy;
      var hs = h.size + 3;
      if (h.x < hs || h.x > AW - hs) { h.vx *= -1; h.x = Math.max(hs, Math.min(AW - hs, h.x)); }
      if (h.y < hs || h.y > AH - hs) { h.vy *= -1; h.y = Math.max(hs, Math.min(AH - hs, h.y)); }
      var dx = h.x - UT.heart.x, dy = h.y - UT.heart.y;
      if (Math.sqrt(dx * dx + dy * dy) < h.size + UT.heart.size - 2) {
        h.active = false;
        UT.bossHP = Math.max(0, UT.bossHP - 2);
        UT.bossHurt = true; setTimeout(function () { UT.bossHurt = false; }, 300);
        utUpdateHPBars();
        utHeartTimer = hard ? 240 : medium ? 300 : 360;
        bipe(680, 'sine', 0.2, 0.1);
        if (UT.bossHP <= 0) {
          won = true;
          UT.totalFightMs += elapsed;
          UT.phase = 'won';
          cancelAnimationFrame(utArenaRAF); utArenaRAF = null;
          setTimeout(function () { utVictory(false); }, 350);
        }
      }
    });
    if (won) return;

    /* Spawn bullets — main threat, fires frequently */
    utBulletTimer--;
    var spawnEvery = hard ? 55 : medium ? 80 : 110;
    if (utBulletTimer <= 0) {
      var boss = UT_BOSSES[UT.currentBoss];
      var pats = hard && boss.patternsExtreme ? boss.patternsExtreme :
        hard ? boss.patternsHard :
          medium && boss.patternsMed ? boss.patternsMed :
            boss.patterns;
      utSpawnPattern(pats[Math.floor(Math.random() * pats.length)]);
      utBulletTimer = spawnEvery + Math.floor(Math.random() * 30);
    }

    /* Move bullets + collision */
    var dead = false;
    utBullets.forEach(function (b) {
      if (!b.active || dead) return;
      if (b.warning) { b.life--; if (b.life <= 0) b.active = false; return; }
      b.x += b.vx; b.y += b.vy;
      if (b.sweeping ? (b.sweepLeft ? b.x > AW + 10 : b.x < -AW - 10) : (b.x < -80 || b.x > AW + 80 || b.y < -80 || b.y > AH + 80)) { b.active = false; return; }
      var collide = false;
      var hx = UT.heart.x, hy = UT.heart.y, hr = UT.heart.size - 2;
      if (b.laser) {
        collide = Math.abs(hy - b.y) < (b.laserH || 18) / 2 + hr - 2;
      } else if (b.bone && !b.vertical) {
        collide = hy > b.y - (b.boneH || 10) / 2 - hr && hy < b.y + (b.boneH || 10) / 2 + hr && hx > b.x - hr && hx < b.x + (b.boneLen || 40) + hr;
      } else if (b.bone && b.vertical) {
        collide = hx > b.x - (b.boneH || 8) / 2 - hr && hx < b.x + (b.boneH || 8) / 2 + hr && hy > b.y - hr && hy < b.y + (b.boneLen || 26) + hr;
      } else {
        var dx = b.x - hx, dy = b.y - hy;
        collide = Math.sqrt(dx * dx + dy * dy) < b.r + hr;
      }
      if (collide) {
        b.active = false;
        var dmg = UT_BOSSES[UT.currentBoss].attack;
        UT.playerHP = Math.max(0, UT.playerHP - dmg);
        utUpdateHPBars();
        bipe(150, 'sawtooth', 0.22, 0.1);
        if (UT.playerHP <= 0) {
          dead = true;
          UT.totalFightMs += elapsed;
          UT.phase = 'dead';
          cancelAnimationFrame(utArenaRAF); utArenaRAF = null;
          setTimeout(utGameOver, 350);
        }
      }
    });
    if (dead) return;



    utDrawArena();
    utArenaRAF = requestAnimationFrame(utArenaFrame);
  }

  /* -- HP bars -- */
  function utUpdateHPBars() {
    var bPct = Math.max(0, UT.bossHP / UT.bossMaxHP * 100);
    var pPct = Math.max(0, UT.playerHP / UT.playerMaxHP * 100);
    var bossBar = document.getElementById('ut-boss-hpbar');
    var playerBar = document.getElementById('ut-player-hpbar');
    var bossVal = document.getElementById('ut-boss-hp-val');
    var playerVal = document.getElementById('ut-player-hp-val');
    var pill = document.getElementById('ut-hp-pill');
    if (bossBar) bossBar.style.width = bPct + '%';
    if (playerBar) playerBar.style.width = pPct + '%';
    if (bossVal) bossVal.textContent = Math.max(0, UT.bossHP) + '/' + UT.bossMaxHP;
    if (playerVal) playerVal.textContent = Math.max(0, UT.playerHP) + '/' + UT.playerMaxHP;
    if (pill) pill.textContent = Math.max(0, UT.playerHP) + '/' + UT.playerMaxHP;
  }

  /* -- Counters for endings -- */
  UT.mercyCount = 0;
  UT.killCount = 0;

  /* -- Death animation + last words -- */
  var utDeathAnimRAF = null;
  var utDeathT = 0;
  var utDeathParticles = [];

  function utInitDeathParticles(bossKey) {
    utDeathParticles = [];
    var n = bossKey === 'final' ? 60 : 38;
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      var speed = 0.8 + Math.random() * 2.8;
      var color = bossKey === 'toriel' ? ['#ff8800', '#ffcc00', '#ff4400'][i % 3] :
        bossKey === 'sans' ? ['#eeeedd', '#aaddff', '#0088ff'][i % 3] :
          ['#ffff44', '#aaff00', '#ffee00'][i % 3];
      utDeathParticles.push({
        x: 160, y: 80,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 5,
        color: color, alpha: 1, life: 60 + Math.random() * 60
      });
    }
  }

  function utPlayDeathAnim(spared) {
    UT.phase = 'dying';
    utDeathT = 0;
    utInitDeathParticles(UT.currentBoss);
    if (utDeathAnimRAF) cancelAnimationFrame(utDeathAnimRAF);

    function frame() {
      utDeathT++;
      var c = document.getElementById('ut-boss-sprite-canvas');
      if (!c) return;
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 320, 160);

      /* Draw boss fading/shaking */
      ctx.save();
      ctx.translate(160, 80);
      var shake = utDeathT < 25 ? (Math.random() - 0.5) * 6 : 0;
      ctx.translate(shake, 0);
      ctx.globalAlpha = Math.max(0, 1 - utDeathT / 55);

      if (UT.currentBoss === 'toriel') {
        /* Toriel fades while fire dies */
        utDrawTorielSpriteLarge(ctx, utDeathT);
        ctx.restore();
        /* Fire particles */
        utDeathParticles.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.alpha -= 1 / p.life; p.size *= 0.97;
          if (p.alpha <= 0) return;
          ctx.save(); ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });
      } else if (UT.currentBoss === 'sans') {
        /* Sans crumbles to dust */
        utDrawSansSpriteLarge(ctx, utDeathT);
        ctx.restore();
        /* Bone-dust particles */
        if (utDeathT % 2 === 0 && utDeathT < 45) {
          for (var i = 0; i < 3; i++) {
            utDeathParticles.push({
              x: 140 + Math.random() * 40, y: 60 + Math.random() * 60,
              vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2,
              size: 1 + Math.random() * 3, color: '#eeeedd', alpha: 1, life: 30 + Math.random() * 20
            });
          }
        }
        utDeathParticles.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.alpha -= 1 / p.life;
          if (p.alpha <= 0) return;
          ctx.save(); ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        });
      } else {
        /* Flowey explodes into petals */
        if (utDeathT < 30) utDrawFloweySpriteLarge(ctx, utDeathT);
        ctx.restore();
        utDeathParticles.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vx *= 0.99; p.alpha -= 1 / p.life; p.size *= 0.985;
          if (p.alpha <= 0) return;
          ctx.save(); ctx.globalAlpha = p.alpha; ctx.translate(p.x, p.y); ctx.rotate(utDeathT * 0.1);
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.ellipse(0, 0, Math.max(0.5, p.size * 0.6), Math.max(0.5, p.size * 1.6), 0, 0, Math.PI * 2);
          ctx.fill(); ctx.restore();
        });
        /* Dark closing circle for Flowey */
        if (utDeathT > 30) {
          var radius = Math.max(0, 160 - (utDeathT - 30) * 4);
          ctx.save(); ctx.globalAlpha = Math.min(1, (utDeathT - 30) / 20);
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(160, 80, 200, 0, Math.PI * 2); ctx.fill();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath(); ctx.arc(160, 80, radius, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      if (utDeathT < 70) {
        utDeathAnimRAF = requestAnimationFrame(frame);
      } else {
        utDeathAnimRAF = null;
        utShowDeathDialog(spared);
      }
    }
    utDeathAnimRAF = requestAnimationFrame(frame);
  }

  function utShowDeathDialog(spared) {
    UT.phase = 'dialog';
    var boss = UT_BOSSES[UT.currentBoss];
    var lines = spared ? [boss.mercyText] : [boss.winText];
    /* Clear boss canvas */
    var c = document.getElementById('ut-boss-sprite-canvas');
    if (c) { var ctx = c.getContext('2d'); ctx.clearRect(0, 0, 320, 160); }
    somOk();
    utTypeLines(lines, function () {
      UT.killed[UT.currentBoss] = true;
      if (spared) UT.mercyCount++; else UT.killCount++;
      if (UT.currentBoss === 'final') {
        utShowEnding();
      } else {
        utRefreshHub();
        irPara(TELA.UT_HUB);
      }
    });
  }

  /* -- Ending screen -- */
  function utShowEnding() {
    var mercy = UT.mercyCount;
    var kills = UT.killCount;
    var endType = (mercy >= 2) ? 'pacifist' : (kills >= 2) ? 'genocide' : 'neutral';
    var el = document.getElementById('ut-ending-screen');
    if (!el) { irPara(TELA.UT_HUB); return; }
    var title = el.querySelector('.ut-ending-title');
    var sub = el.querySelector('.ut-ending-sub');
    var bg = el.querySelector('.ut-ending-bg');
    el.className = 'screen ut-ending-' + endType;
    if (endType === 'pacifist') {
      if (title) title.textContent = 'ROTA PACIFISTA VERDADEIRA';
      if (sub) sub.textContent = 'Você escolheu poupar a todos.\nSem derramar uma gota de sangue.\nTalvez exista esperança neste mundo, afinal.';
      if (bg) bg.style.background = 'radial-gradient(ellipse at 50% 40%, #ffff88, #88ffaa, #003300)';
      setTimeout(confetti, 800);
    } else if (endType === 'genocide') {
      if (title) title.textContent = 'ROTA SOMBRIA';
      if (sub) sub.textContent = 'Você destruiu tudo que encontrou.\nO subterrâneo ficou em silêncio.\nEste é o peso das suas escolhas.';
      if (bg) bg.style.background = 'radial-gradient(ellipse at 50% 40%, #220000, #000000)';
      utPlayDarkEnding(el);
    } else {
      if (title) title.textContent = 'FINAL';
      if (sub) sub.textContent = 'A jornada chegou ao fim.\nAlgumas escolhas foram feitas.\nO que elas significam... só você sabe.';
      if (bg) bg.style.background = 'radial-gradient(ellipse at 50% 40%, #222244, #000000)';
    }
    irPara('ut-ending');
  }

  function utPlayDarkEnding(container) {
    var c = document.getElementById('ut-ending-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height;
    var drops = [];
    for (var i = 0; i < 80; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, speed: 1 + Math.random() * 3, len: 8 + Math.random() * 18 });
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#550000'; ctx.lineWidth = 1.5;
      drops.forEach(function (d) {
        ctx.globalAlpha = 0.5 + Math.random() * 0.4;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + d.len); ctx.stroke();
        d.y += d.speed;
        if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* -- Victory / Defeat -- */
  function utVictory(spared) {
    UT.phase = 'dying';
    if (utArenaRAF) { cancelAnimationFrame(utArenaRAF); utArenaRAF = null; }
    utBossHearts = []; utBullets = [];
    document.getElementById('ut-arena-container').style.display = 'none';
    document.getElementById('ut-action-menu').style.display = 'none';
    document.getElementById('ut-act-menu').style.display = 'none';
    setTimeout(function () { utPlayDeathAnim(spared); }, 250);
  }

  function utGameOver() {
    UT.phase = 'lost';
    if (utArenaRAF) { cancelAnimationFrame(utArenaRAF); utArenaRAF = null; }
    utBossHearts = []; utBullets = [];
    document.getElementById('ut-arena-container').style.display = 'none';
    somErro();
    /* Flash heart red then show GAME OVER dialog */
    var diagEl = document.getElementById('ut-dialog-text');
    var cursor = document.getElementById('ut-dialog-cursor');
    if (diagEl) diagEl.textContent = '';
    if (cursor) cursor.style.display = 'none';
    /* Animate player heart fading on boss canvas */
    var c = document.getElementById('ut-boss-sprite-canvas');
    if (c) {
      var ctx = c.getContext('2d');
      var alpha = 1, frame = 0;
      (function fadeHeart() {
        if (UT.phase !== 'lost') return;
        ctx.clearRect(0, 0, 320, 160);
        if (frame < 40) {
          /* Draw fading heart */
          ctx.save(); ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ff0044'; ctx.shadowColor = '#ff0044'; ctx.shadowBlur = 16;
          var hx = 160, hy = 80, hs = 14 + frame * 0.3;
          ctx.beginPath();
          ctx.moveTo(hx, hy - hs * 0.2);
          ctx.bezierCurveTo(hx, hy - hs, hx - hs * 1.1, hy - hs, hx - hs * 1.1, hy - hs * 0.2);
          ctx.bezierCurveTo(hx - hs * 1.1, hy + hs * 0.4, hx, hy + hs * 0.9, hx, hy + hs * 0.9);
          ctx.bezierCurveTo(hx + hs * 1.1, hy + hs * 0.4, hx + hs * 1.1, hy - hs * 0.2, hx + hs * 1.1, hy - hs * 0.2);
          ctx.bezierCurveTo(hx + hs * 1.1, hy - hs, hx, hy - hs, hx, hy - hs * 0.2);
          ctx.closePath(); ctx.fill(); ctx.restore();
          /* Crack lines */
          if (frame > 15) {
            ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + (frame - 15) / 25 + ')'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(160, 65); ctx.lineTo(148, 85); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(160, 65); ctx.lineTo(172, 82); ctx.stroke();
            ctx.restore();
          }
          alpha -= 0.025; frame++;
          requestAnimationFrame(fadeHeart);
        } else {
          ctx.clearRect(0, 0, 320, 160);
          /* Show GAME OVER text */
          ctx.fillStyle = '#ff4040'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
          ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 12;
          ctx.fillText('GAME OVER', 160, 75);
          ctx.font = '11px monospace'; ctx.fillStyle = '#aaaaaa'; ctx.shadowBlur = 0;
          ctx.fillText('Você foi derrotado...', 160, 98);
        }
      })();
    }
    setTimeout(function () {
      if (UT.phase !== 'lost') return;
      utTypeLines(['GAME OVER', 'Você não sobreviveu desta vez.', 'Mas a determinação nunca morre.'], function () {
        /* Show retry option in dialog */
        var diagEl = document.getElementById('ut-dialog-text');
        if (diagEl) diagEl.textContent = 'Pressione Z para tentar novamente.';
        UT.phase = 'retry';
      });
    }, 900);
  }

  function utBattleAbort() {
    UT.phase = 'aborted';
    if (utArenaRAF) { cancelAnimationFrame(utArenaRAF); utArenaRAF = null; }
    if (typeof utDeathAnimRAF !== 'undefined' && utDeathAnimRAF) { cancelAnimationFrame(utDeathAnimRAF); utDeathAnimRAF = null; }
    if (utDialogInterval) { clearInterval(utDialogInterval); utDialogInterval = null; }
    if (utSpriteAnimRAF) { cancelAnimationFrame(utSpriteAnimRAF); utSpriteAnimRAF = null; }
    utBossHearts = []; utBullets = [];
    /* overlays removed from this flow */
  }

  /* -- Keyboard handler -- */
  function utBattleKey(k) {
    if (UT.phase === 'dialog') {
      if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') utAdvanceDialog();
    } else if (UT.phase === 'menu') {
      if (k === 'ArrowLeft') { utSetActionFocus(UT.actionIdx - 1); somNav(); }
      else if (k === 'ArrowRight') { utSetActionFocus(UT.actionIdx + 1); somNav(); }
      else if (k === 'ArrowDown' && UT.actUnlocked) { utSetActionFocus(2); somNav(); }
      else if (k === 'ArrowUp') { utSetActionFocus(Math.min(1, UT.actionIdx)); somNav(); }
      else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') {
        if (UT.actionIdx === 0) utStartArenaFight();
        else if (UT.actionIdx === 1) utShowActMenu();
        else if (UT.actionIdx === 2 && UT.actUnlocked) utDoMercy();
      }
    } else if (UT.phase === 'act') {
      if (k === 'ArrowUp') { utSetActFocus(UT.actionIdx - 1); somNav(); }
      else if (k === 'ArrowDown') { utSetActFocus(UT.actionIdx + 1); somNav(); }
      else if (k === 'ArrowLeft') { utSetActFocus(UT.actionIdx - 2); somNav(); }
      else if (k === 'ArrowRight') { utSetActFocus(UT.actionIdx + 2 < 4 ? UT.actionIdx + 2 : UT.actionIdx); somNav(); }
      else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') utDoActOption(UT.actionIdx);
      else if (k === 'Escape' || k === 'x') { UT.phase = 'menu'; utShowActionMenu(); }
    } else if (UT.phase === 'retry') {
      if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') {
        var bk = UT.currentBoss;
        setTimeout(function () { utStartBattle(bk); }, 100);
      } else if (k === 'Escape') {
        somEsc(); utBattleAbort(); irPara(TELA.UT_HUB);
      }
    }
  }

  /* -- Button listeners -- */
  document.getElementById('ut-btn-fight').addEventListener('click', function () {
    if (UT.phase === 'menu') utStartArenaFight();
  });
  document.getElementById('ut-btn-act').addEventListener('click', function () {
    if (UT.phase === 'menu') utShowActMenu();
  });
  document.getElementById('ut-btn-mercy').addEventListener('click', function () {
    if (UT.phase === 'menu' && UT.actUnlocked) utDoMercy();
  });
  [0, 1, 2, 3].forEach(function (i) {
    var el = document.getElementById('ut-act-' + i);
    if (el) el.addEventListener('click', function () { if (UT.phase === 'act') utDoActOption(i); });
    if (el) el.addEventListener('mouseenter', function () { if (UT.phase === 'act') utSetActFocus(i); });
  });
  document.getElementById('ut-ending-back').addEventListener('click', function () {
    somEsc();
    UT.mercyCount = 0; UT.killCount = 0;
    UT.killed = { toriel: false, sans: false, final: false };
    utRefreshHub();
    irPara(TELA.ARCADE_GAMES);
  });

  document.getElementById('ut-win-btn').addEventListener('click', function () {
    document.getElementById('ut-win-overlay').classList.remove('show');
    utRefreshHub();
    irPara(TELA.UT_HUB);
  });
  document.getElementById('ut-lose-btn').addEventListener('click', function () {
    document.getElementById('ut-lose-overlay').classList.remove('show');
    var bk = UT.currentBoss;
    setTimeout(function () { utStartBattle(bk); }, 200);
  });
  utHubGetCards().forEach(function (card, i) {
    if (card) card.addEventListener('mouseenter', function () { utHubSetFoco(i); });
  });

  /* -- Init -- */
  /* =====================================================================
   CHATBOT ARCADE AI
   ===================================================================== */
  function initAiChat() {
    var chat = document.getElementById("ai-chat");
    var toggle = document.getElementById("ai-chat-toggle");
    var panel = document.getElementById("ai-chat-panel");
    var close = document.getElementById("ai-chat-close");
    var form = document.getElementById("ai-chat-form");
    var input = document.getElementById("ai-chat-input");
    var send = document.getElementById("ai-chat-send");
    var log = document.getElementById("ai-chat-log");

    if (!chat || !toggle || !panel || !close || !form || !input || !send || !log) return;

    var GROK_MODEL = "x-ai/grok-4-1-fast";
    var LOCAL_STATE_KEY = "playground-js-chatbot-state";
    var CHAT_AI_TIMEOUT_MS = 14000;
    var DIFFICULTY_MAP = { facil: 1, medio: 0.5, dificil: 0.08 };
    var chatContextPromise = null;
    var fallbackContext = {
      model: GROK_MODEL,
      rules:
        "Responda em português do Brasil. Ajude somente com o Playground JS. Mude a facilidade quando o usuário pedir fácil, médio ou difícil.",
      siteContext:
        "Playground JS é um site em HTML, CSS e JavaScript puro com Clássicos, Arcade e Cassino. Clássicos inclui Jokenpo, Batalha de Dados e Cara ou Coroa. Arcade inclui Undertale, Geometry Race e CupShock, um boss fight cartunesco com intro, diálogo, tiros, dash direcional e especial. Cassino inclui Caça-Níquel, Roleta e Crash com saldo fictício, verificação de idade e dificuldade ajustável. Controles: setas navegam, Enter seleciona, Esc volta e mouse também funciona.",
    };

    var classifierSystemPrompt = [
      "Você é um classificador de intenção para o chatbot do site Playground JS.",
      "Sua resposta DEVE ser somente um objeto JSON válido, sem markdown, sem texto antes e sem texto depois.",
      'Schema obrigatorio: {"eh_pergunta": boolean, "mudanca_dificuldade": "facil" | "medio" | "dificil" | "nao_detectado"}',
      'Use "eh_pergunta": true quando o usuario fizer pergunta, saudação (como olá, oi), conversa casual, pedir explicacao, ajuda, regras, controles, jogos, saldo, cassino, arcade ou qualquer parte do site.',
      'Use "mudanca_dificuldade": "facil" quando o usuario pedir para deixar facil, mais facil, ganhar mais, aumentar facilidade, modo facil ou vantagem para o jogador.',
      'Use "mudanca_dificuldade": "medio" quando o usuario pedir medio, normal, balanceado, justo ou padrao.',
      'Use "mudanca_dificuldade": "dificil" quando o usuario pedir dificil, mais dificil, casa vencer mais, reduzir chance, modo hard ou impossivel.',
      'Se nao houver pedido de mudanca de dificuldade, use "nao_detectado".',
      "Mesmo que haja pergunta e mudanca de dificuldade na mesma frase, preencha os dois campos corretamente.",
      "Nunca invente chaves extras.",
    ].join("\n");

    function openChat() {
      chat.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-label", "Chat aberto");
      setTimeout(function () {
        input.focus();
      }, 40);
      somNav();
    }

    window.openAiChat = openChat;

    function closeChat() {
      chat.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-label", "Abrir chat");
      somEsc();
    }

    function addMessage(kind, text) {
      var msg = document.createElement("div");
      msg.className = "ai-msg " + kind;
      msg.textContent = text;
      log.appendChild(msg);
      log.scrollTop = log.scrollHeight;
      return msg;
    }

    function setLoading(isLoading) {
      send.disabled = isLoading;
      input.disabled = isLoading;
    }

    function growInput() {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 112) + "px";
    }

    function makeDifficultyState(level) {
      var safeLevel = Object.prototype.hasOwnProperty.call(DIFFICULTY_MAP, level)
        ? level
        : "medio";
      return {
        dificuldade: safeLevel,
        winDifficulty: DIFFICULTY_MAP[safeLevel],
        updatedAt: new Date().toISOString(),
      };
    }

    function readLocalState() {
      try {
        var saved = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || "null");
        if (saved && Object.prototype.hasOwnProperty.call(DIFFICULTY_MAP, saved.dificuldade)) {
          return makeDifficultyState(saved.dificuldade);
        }
      } catch (error) { }
      return makeDifficultyState("medio");
    }

    function storeLocalState(state) {
      try {
        localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
      } catch (error) { }
    }

    function syncDifficulty(state) {
      if (!state) return;
      var normalized = makeDifficultyState(state.dificuldade);
      normalized.winDifficulty =
        typeof state.winDifficulty === "number" && !isNaN(state.winDifficulty)
          ? state.winDifficulty
          : normalized.winDifficulty;

      /* Hook para aplicar dificuldade no Casino se a função existir */
      if (typeof window.applyCasinoDifficulty === "function") {
        window.applyCasinoDifficulty(normalized.dificuldade, normalized.winDifficulty);
      }
      storeLocalState(normalized);
    }

    function loadState() {
      fetch("/api/state")
        .then(function (res) {
          if (!res.ok) throw new Error("Falha ao carregar estado");
          return res.json();
        })
        .then(function (payload) {
          syncDifficulty(payload.state);
        })
        .catch(function () {
          syncDifficulty(readLocalState());
        });
    }

    function loadChatContext() {
      if (chatContextPromise) return chatContextPromise;
      chatContextPromise = fetch("/api/chat-context")
        .then(function (res) {
          if (!res.ok) throw new Error("Falha ao carregar contexto");
          return res.json();
        })
        .then(function (payload) {
          return {
            model: payload.model || GROK_MODEL,
            rules: payload.rules || fallbackContext.rules,
            siteContext: payload.siteContext || fallbackContext.siteContext,
          };
        })
        .catch(function () {
          return fallbackContext;
        });
      return chatContextPromise;
    }

    function extractGrokText(response) {
      if (typeof response === "string") return response.trim();
      if (!response) return "";

      var content = response.message && response.message.content;
      if (typeof content === "string") return content.trim();
      if (Array.isArray(content)) {
        return content
          .map(function (part) {
            return part && (part.text || part.content || "");
          })
          .join("")
          .trim();
      }
      if (typeof response.text === "string") return response.text.trim();
      return "";
    }

    function withTimeout(promise, ms, message) {
      var timer = null;
      var timeout = new Promise(function (_, reject) {
        timer = setTimeout(function () {
          reject(new Error(message || "A IA demorou demais para responder."));
        }, ms);
      });
      return Promise.race([promise, timeout]).finally(function () {
        if (timer) clearTimeout(timer);
      });
    }

    function callGrok(prompt, context, options) {
      if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== "function") {
        throw new Error("Puter.js nao foi carregado. Verifique a conexao com a internet.");
      }

      return withTimeout(
        window.puter.ai.chat(prompt, {
          model: (context && context.model) || GROK_MODEL,
          temperature: options && typeof options.temperature === "number" ? options.temperature : 0.2,
          max_tokens: options && options.maxTokens ? options.maxTokens : 600,
        }),
        (options && options.timeoutMs) || CHAT_AI_TIMEOUT_MS,
        "A IA nao respondeu a tempo. Tente de novo em alguns segundos.",
      ).then(extractGrokText);
    }

    function parseClassifierJson(rawText) {
      var cleaned = String(rawText || "")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      var firstBrace = cleaned.indexOf("{");
      var lastBrace = cleaned.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      try {
        var parsed = JSON.parse(cleaned);
        var difficulty = Object.prototype.hasOwnProperty.call(
          DIFFICULTY_MAP,
          parsed.mudanca_dificuldade,
        )
          ? parsed.mudanca_dificuldade
          : "nao_detectado";

        return {
          eh_pergunta: Boolean(parsed.eh_pergunta),
          mudanca_dificuldade: difficulty,
        };
      } catch (error) {
        return {
          eh_pergunta: true,
          mudanca_dificuldade: "nao_detectado",
        };
      }
    }

    function buildClassifierPrompt(context, userText) {
      return [
        classifierSystemPrompt,
        "REGRAS DO SITE:",
        context.rules,
        context.siteContext,
        "MENSAGEM DO USUARIO:",
        userText,
      ].join("\n\n");
    }

    function buildAnswerPrompt(context, userText) {
      return [
        "Você é o assistente do site Playground JS.",
        "Responda em português do Brasil, em texto natural, com frases curtas.",
        "Use somente as regras e o contexto fornecidos. Se não souber, diga que não encontrou essa informação no site.",
        "Não altere dificuldade nesta etapa.",
        "REGRAS DO SITE:",
        context.rules,
        context.siteContext,
        "PERGUNTA DO USUARIO:",
        userText,
      ].join("\n\n");
    }

    function classifyLocally(userText) {
      var text = String(userText || "").toLowerCase();
      var difficulty = "nao_detectado";
      if (/\b(f[aá]cil|facil|mais f[aá]cil|ganhar mais|vantagem|aumentar facilidade)\b/.test(text)) {
        difficulty = "facil";
      } else if (/\b(m[eé]dio|medio|normal|balanceado|justo|padr[aã]o|padrao)\b/.test(text)) {
        difficulty = "medio";
      } else if (/\b(dif[ií]cil|dificil|hard|imposs[ií]vel|impossivel|mais dif[ií]cil|casa vencer)\b/.test(text)) {
        difficulty = "dificil";
      }
      return {
        eh_pergunta: /[?]|como|qual|quais|onde|quando|por que|porque|ajuda|explica|regras|controles|oi|ola|ol[aá]|jogo|cassino|arcade|multiplayer|undertale|teclado|pomodoro/.test(text),
        mudanca_dificuldade: difficulty,
      };
    }

    function localAnswer(userText) {
      var text = String(userText || "").toLowerCase();
      if (/undertale|multiplayer|sala|boss|alma/.test(text)) {
        return "Nao consegui acessar a IA agora, mas pelo contexto local: o Undertale Multiplayer usa salas online, um Boss contra Almas, Socket.IO em tempo real e servidor autoritativo para validar movimentos, ataques, dano e vitoria.";
      }
      if (/teclado|musical|piano|nota/.test(text)) {
        return "Nao consegui acessar a IA agora, mas pelo contexto local: o Teclado Virtual e um piano/synth com duas oitavas, teclas brancas e pretas, gravacao, reproducao e ajuste de oitava.";
      }
      if (/pomodoro|timer|foco|pausa/.test(text)) {
        return "Nao consegui acessar a IA agora, mas pelo contexto local: o Pomodoro permite configurar tempo de foco e pausa, iniciar, pausar e resetar o timer.";
      }
      if (/cassino|roleta|slot|crash|dificuldade|facilidade/.test(text)) {
        return "Nao consegui acessar a IA agora, mas pelo contexto local: o Cassino tem Caca-Niquel, Roleta e Crash com saldo ficticio. Tambem posso mudar a dificuldade para facil, medio ou dificil.";
      }
      return "Nao consegui acessar a IA agora. Ainda posso ajudar com informacoes locais do site: jogos Arcade, Cassino, Projetos Web, Undertale Multiplayer e controles.";
    }

    function saveDifficulty(level) {
      var fallbackState = makeDifficultyState(level);
      return fetch("/api/difficulty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dificuldade: level }),
      })
        .then(function (res) {
          return res.json().then(function (payload) {
            if (!res.ok) throw new Error(payload.error || "Falha ao salvar dificuldade");
            return payload;
          });
        })
        .catch(function () {
          syncDifficulty(fallbackState);
          return {
            message: "Facilidade alterada para " + level,
            state: fallbackState,
          };
        });
    }

    function askAi(userText) {
      var localClassification = classifyLocally(userText);
      if (localClassification.mudanca_dificuldade !== "nao_detectado") {
        return saveDifficulty(localClassification.mudanca_dificuldade).then(function (payload) {
          return {
            message: payload.message || "Facilidade alterada.",
            classification: localClassification,
            state: payload.state,
          };
        });
      }

      return loadChatContext()
        .then(function (context) {
          return callGrok(buildClassifierPrompt(context, userText), context, {
            temperature: 0,
            maxTokens: 120,
            timeoutMs: 9000,
          }).then(function (rawClassification) {
            return {
              context: context,
              classification: parseClassifierJson(rawClassification),
            };
          });
        })
        .then(function (result) {
          var classification = result.classification;
          if (classification.mudanca_dificuldade !== "nao_detectado") {
            return saveDifficulty(classification.mudanca_dificuldade).then(function (payload) {
              return {
                message: payload.message || "Facilidade alterada.",
                classification: classification,
                state: payload.state,
              };
            });
          }

          if (!classification.eh_pergunta) {
            return {
              message:
                "Olá! Sou o assistente do Playground JS. Posso te ajudar com dúvidas sobre os jogos ou mudar a dificuldade do Casino para fácil, médio ou difícil. Como posso te ajudar agora?",
              classification: classification,
              state: readLocalState(),
            };
          }

          return callGrok(buildAnswerPrompt(result.context, userText), result.context, {
            temperature: 0.35,
            maxTokens: 500,
            timeoutMs: CHAT_AI_TIMEOUT_MS,
          }).then(function (answer) {
            return {
              message: answer || "Nao encontrei essa informacao no site.",
              classification: classification,
              state: readLocalState(),
            };
          });
        })
        .catch(function () {
          return {
            message: localAnswer(userText),
            classification: localClassification,
            state: readLocalState(),
          };
        });
    }

    toggle.addEventListener("click", function () {
      if (chat.classList.contains("open")) closeChat();
      else openChat();
    });

    close.addEventListener("click", closeChat);

    input.addEventListener("input", growInput);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeChat();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      addMessage("user", text);
      input.value = "";
      growInput();
      setLoading(true);
      var thinking = addMessage("bot thinking", "PROCESSANDO...");

      askAi(text)
        .then(function (payload) {
          thinking.remove();
          syncDifficulty(payload.state);
          addMessage("bot", payload.message || "Sem resposta.");
          somOk();
        })
        .catch(function (err) {
          thinking.remove();
          addMessage("error", err.message || "Nao foi possivel falar com a IA.");
          somErro();
        })
        .finally(function () {
          setLoading(false);
          input.focus();
        });
    });

    loadState();
  }

  initAiChat();
  utRefreshHub();

  (function restaurarTelaPersistida() {
    var saved = telaInicialPersistida;
    if (!saved || saved === TELA.HUB || !telasPersistiveis[saved] || !document.getElementById(saved)) {
      return;
    }
    if (telaAtiva === saved) {
      if (saved === TELA.ARCADE_GAMES) setTimeout(function () { arcadeGamesEnter(); }, 60);
      if (saved === TELA.PROJECTS) setTimeout(function () { projectsEnter(); }, 60);
      if (saved === TELA.LIGHT) setTimeout(function () { lightInit(); }, 60);
      if (saved === TELA.PIGGY) setTimeout(function () { piggyInit(); }, 60);
      if (saved === TELA.POMO) setTimeout(function () { pomoInit(); }, 60);
      if (saved === TELA.KEYBOARD) setTimeout(function () { synthInit(); }, 60);
      if (saved === TELA.CASINO) setTimeout(function () { casinoSetFocoInicial(); }, 60);
      return;
    }
    setTimeout(function () {
      irPara(saved);
    }, 120);
  })();

})();
