"use strict";

(function () {
  const details = {
    input: {
      title: "Entrada",
      text: "Toda interação começa pequena: uma tecla, clique, nome digitado ou mensagem. O código transforma esse sinal em intenção.",
      code: 'document.addEventListener("keydown", handleGlobalKey);'
    },
    rules: {
      title: "Regra",
      text: "A regra decide se a ação pode acontecer. Exemplo: o host pode iniciar a sala, mas outro jogador não.",
      code: 'if (room.hostId !== socket.id) return emitError("Apenas o host pode iniciar.");'
    },
    state: {
      title: "Estado",
      text: "Estado é a memória atual da tela: seleção do menu, vida do boss, jogadores da sala, timer ou saldo do cassino.",
      code: "state.bossHp -= damage;\nstate.players.set(socket.id, player);"
    },
    render: {
      title: "Render",
      text: "Render é desenhar o resultado. No site isso aparece como DOM, Canvas ou Phaser, dependendo do módulo.",
      code: "drawSoul(player.x, player.y, player.color);\nupdateBossBar(room.bossHp);"
    },
    feedback: {
      title: "Feedback",
      text: "Feedback confirma que algo aconteceu: foco no botão, animação de dano, resposta do chatbot, som ou mudança visual.",
      code: 'element.classList.add("damage-flash");\nshowToast("Dificuldade atualizada.");'
    },
    message: {
      title: "Mensagem do usuário",
      text: "O chatbot recebe texto livre. Antes de chamar IA, o site tenta detectar comandos objetivos de forma local.",
      code: "const local = classifyLocally(userText);"
    },
    "local-ai": {
      title: "Leitura local",
      text: "É uma camada simples de regras: se a frase pede para facilitar ou dificultar, o site resolve sem gastar chamada externa.",
      code: 'if (local.mudanca_dificuldade !== "nao_detectado") applyDifficulty(local);'
    },
    puter: {
      title: "Puter / Grok",
      text: "Puter funciona como ponte para usar IA no navegador. Ele ajuda o chatbot a responder perguntas abertas sobre o projeto.",
      code: 'await puter.ai.chat(prompt, { model: "grok-beta" });'
    },
    fallback: {
      title: "Fallback",
      text: "Fallback é o plano B. Se a IA, rede ou API falhar, o site ainda responde com uma explicação local.",
      code: "catch (error) {\n  return localFallback(userText);\n}"
    },
    answer: {
      title: "Resposta final",
      text: "A resposta é exibida no chat e, quando necessário, também muda estado do site, como dificuldade dos jogos.",
      code: "appendBotMessage(answer);\nsaveDifficulty(nextDifficulty);"
    },
    "client-boss": {
      title: "Cliente Boss",
      text: "O Boss não manda dano pronto. Ele manda intenção: direção e ataque. O servidor calcula se acertou alguém.",
      code: 'socket.emit("utm:input", { left, right, attackZ, attackX });'
    },
    "client-soul": {
      title: "Cliente Alma",
      text: "A Alma envia movimento, dash e tiro. A vida e a vitória continuam sendo decisão do servidor.",
      code: 'socket.emit("utm:input", { up, down, left, right, dash, shoot });'
    },
    rooms: {
      title: "Salas",
      text: "Cada sala guarda host, jogadores, boss sorteado, projéteis e status. Isso permite várias partidas separadas.",
      code: 'rooms.set(code, { hostId, players: new Map(), projectiles: [], status: "lobby" });'
    },
    simulation: {
      title: "Simulação",
      text: "A cada tick, o servidor move jogadores, aplica cooldowns, cria ataques e prepara o próximo estado.",
      code: "updatePlayers(room, dt);\nupdateProjectiles(room, dt);"
    },
    collision: {
      title: "Colisões",
      text: "O servidor confere se tiro acertou boss ou ataque acertou Alma. Assim todos recebem o mesmo resultado.",
      code: "if (circleHitsPlayer(projectile, player)) applyDamage(room, player);"
    },
    victory: {
      title: "Vitória",
      text: "A partida termina por regra de jogo: boss elimina todas as Almas ou as Almas zeram a vida do boss.",
      code: 'if (boss.hp <= 0) finishRoom(room, "souls");'
    },
    "boss-draw": {
      title: "Sorteio do Boss",
      text: "O host só inicia a sala. A função de Boss é definida pelo servidor, então ninguém escolhe vantagem manualmente.",
      code: "room.bossId = pickBossByCarousel(room.players);\nassignSoulRoles(room);"
    },
    "client-input": {
      title: "Input do cliente",
      text: "O navegador envia teclas e intenção. Ele não envia 'acertei' nem 'matei', porque isso abriria espaço para dessincronização.",
      code: 'socket.emit("utm:input", { up, down, left, right, attackZ, dash, shoot });'
    },
    "server-tick": {
      title: "Tick do servidor",
      text: "Tick é uma atualização curta. A cada rodada, o servidor aplica regras, cooldowns, movimento e colisões.",
      code: "setInterval(() => updateRoom(room, dt), 1000 / 20);"
    },
    "public-state": {
      title: "Estado público",
      text: "Depois de calcular a verdade da partida, o servidor envia só o necessário para cada tela renderizar igual.",
      code: 'io.to(room.id).emit("utm:state", publicState(room));'
    },
    api: {
      title: "APIs do server.js",
      text: "APIs são rotas HTTP usadas pelo frontend para ler ou alterar dados do projeto, sem recarregar a página inteira.",
      code: 'app.get("/api/state", (req, res) => res.json(publicState));'
    },
    socket: {
      title: "Socket.IO",
      text: "Socket.IO mantém um canal realtime. Ele é melhor para multiplayer do que ficar fazendo fetch repetidamente.",
      code: 'io.to(room.id).emit("utm:state", publicState(room));'
    },
    keyboard: {
      title: "Teclado musical",
      text: "O projeto de teclado usa mapeamento de teclas para tocar notas, alterar oitava e dar feedback visual de tecla pressionada.",
      code: 'const note = keyMap[event.key.toLowerCase()];\nplayOscillator(note.frequency);'
    },
    pomodoro: {
      title: "Pomodoro",
      text: "É um exemplo de estado temporal: o contador muda a cada segundo e a tela reflete ciclo, pausa e foco.",
      code: "secondsLeft -= 1;\nrenderPomodoro(secondsLeft, currentMode);"
    },
    piggy: {
      title: "Cofrinho",
      text: "Mostra manipulação de dados locais: saldo, metas e histórico viram estado salvo no navegador.",
      code: "localStorage.setItem('piggy-state', JSON.stringify(state));"
    },
    light: {
      title: "Lâmpada",
      text: "É a lógica mais direta: evento do usuário altera uma classe CSS e a interface muda imediatamente.",
      code: 'lamp.classList.toggle("is-on");'
    }
  };

  const glossary = {
    api: {
      label: "API",
      title: "Ponte de comunicação entre partes do sistema",
      text: "No projeto, uma API é o caminho que o frontend usa para pedir ou enviar dados ao servidor, como dificuldade, estado salvo ou contexto do chatbot."
    },
    node: {
      label: "Node.js",
      title: "JavaScript rodando fora do navegador",
      text: "Node.js permite criar o backend em JavaScript. Aqui ele executa o server.js, abre a porta 3000 e mantém a lógica online do multiplayer."
    },
    express: {
      label: "Express",
      title: "Biblioteca para criar servidor web",
      text: "Express entrega os arquivos do site e cria rotas como /api/state. Ele simplifica o trabalho de responder requisições HTTP."
    },
    socket: {
      label: "Socket.IO",
      title: "Comunicação em tempo real para salas online",
      text: "Socket.IO cria eventos entre navegador e servidor. No Undertale Multiplayer ele envia inputs e recebe o estado atualizado da sala."
    },
    websocket: {
      label: "WebSocket",
      title: "Canal aberto entre cliente e servidor",
      text: "Diferente de uma requisição comum, o canal fica vivo. Isso permite atualizar jogo, chat ou sala sem ficar recarregando."
    },
    puter: {
      label: "Puter",
      title: "Camada de serviços no navegador",
      text: "No projeto, Puter é usado para acessar IA pelo frontend. Ele permite que o chatbot consulte um modelo e responda perguntas sobre o site."
    },
    phaser: {
      label: "Phaser",
      title: "Engine de jogos 2D para navegador",
      text: "Phaser cuida de cena, renderização, input e loop visual. No multiplayer ele facilita desenhar arena, boss, Almas e projéteis."
    },
    tick: {
      label: "Tick",
      title: "Uma rodada curta do loop do jogo",
      text: "A cada tick o servidor lê inputs, atualiza posições, testa colisões e envia novo estado. No multiplayer isso roda cerca de 20 vezes por segundo."
    },
    state: {
      label: "Estado",
      title: "Memória atual da aplicação",
      text: "Estado é o conjunto de dados que descreve a tela naquele momento: jogador selecionado, vida, sala, cartas, timer ou mensagens."
    },
    dom: {
      label: "DOM",
      title: "Estrutura HTML que o JavaScript altera",
      text: "DOM é a árvore de elementos da página. Quando o JS muda texto, classe ou botão, ele está manipulando o DOM."
    }
  };

  const games = {
    jokenpo: {
      hub: "Clássicos",
      title: "Jokenpô",
      lead: "Exemplo direto de regra condicional: o jogador escolhe uma opção, a máquina sorteia outra e o JS compara os dois valores.",
      concept: "Mostra como uma entrada simples vira decisão de vitória, derrota ou empate.",
      tech: "Usa click/keydown, sorteio com Math.random, atualização de placar e troca de classes para feedback visual.",
      flow: ["jogador escolhe", "máquina sorteia", "compara regras", "atualiza placar"],
      code: 'const cpu = opcoes[Math.floor(Math.random() * opcoes.length)];\nconst resultado = decidirVencedor(jogador, cpu);\nrenderResultado(resultado);'
    },
    dados: {
      hub: "Clássicos",
      title: "Dados",
      lead: "Dois valores aleatórios são gerados e comparados. O interesse técnico está no feedback visual e na atualização do histórico.",
      concept: "É probabilidade básica com resultado imediato.",
      tech: "Math.random cria os dados; o DOM recebe animação, placar e mensagem final.",
      flow: ["enter/click", "gera dado 1", "gera dado 2", "define vencedor"],
      code: "const player = rollDice();\nconst cpu = rollDice();\nscore += player > cpu ? 1 : 0;"
    },
    undertale: {
      hub: "Arcade",
      title: "Undertale",
      lead: "Batalha em tempo real no navegador: a alma se move dentro da arena e precisa sobreviver aos padrões do boss.",
      concept: "Mostra loop de jogo: ler input, mover personagem, desenhar frame e testar colisão.",
      tech: "Usa canvas para renderizar arena, projéteis, coração e animações com requestAnimationFrame.",
      flow: ["keydown", "atualiza posição", "testa colisão", "desenha frame"],
      code: "function loop() {\n  updateSoul(keys);\n  checkHits();\n  drawBattle(ctx);\n  requestAnimationFrame(loop);\n}"
    },
    geometry: {
      hub: "Arcade",
      title: "Geometry Race",
      lead: "Jogo de reflexo com obstáculo, velocidade e timing.",
      concept: "A dificuldade aparece como ritmo: quanto mais rápido, menor a margem de erro.",
      tech: "Controla posição, velocidade, colisão e reinício de partida em um loop visual.",
      flow: ["velocidade sobe", "obstáculos avançam", "colisão decide", "pontuação muda"],
      code: "player.y += velocity;\nobstacle.x -= speed;\nif (hit(player, obstacle)) endRun();"
    },
    "undertale-mp": {
      hub: "Multiplayer",
      title: "Undertale Multiplayer",
      lead: "A versão online separa visual do jogo e regra oficial: o cliente renderiza, mas o servidor decide o resultado.",
      concept: "Um Boss enfrenta 1 a 4 Almas. Todos veem a mesma sala porque recebem o mesmo estado do servidor.",
      tech: "Socket.IO envia inputs; server.js simula ticks, colisões, dano, cooldowns, sorteio e vitória.",
      flow: ["sala", "sorteio", "inputs", "tick servidor", "state para todos"],
      code: 'socket.emit("utm:input", keys);\nio.to(room.id).emit("utm:state", publicState(room));'
    },
    slots: {
      hub: "Cassino",
      title: "Caça-Níquel",
      lead: "Interface de rolos girando com resultado controlado por probabilidade.",
      concept: "Dá para explicar aleatoriedade, saldo fictício e retorno visual.",
      tech: "Combina sorteio, animação de rolos, cálculo de prêmio e atualização de saldo.",
      flow: ["aposta", "gira rolos", "calcula combinação", "paga ou perde"],
      code: "const symbols = reels.map(spinReel);\nconst prize = getPrize(symbols, bet);\nbalance += prize - bet;"
    },
    crash: {
      hub: "Cassino",
      title: "Crash",
      lead: "O multiplicador sobe até quebrar. O jogador decide sacar antes disso.",
      concept: "Mostra risco/recompensa em tempo real.",
      tech: "Timer aumenta multiplicador, evento de saque trava ganho e evento de crash encerra rodada.",
      flow: ["inicia rodada", "multiplicador sobe", "saca ou espera", "crash encerra"],
      code: "multiplier += delta * speed;\nif (cashout) lockPrize(multiplier);\nif (multiplier >= crashAt) endCrash();"
    },
    teclado: {
      hub: "Projetos Web",
      title: "Teclado Musical",
      lead: "Cada tecla do computador aciona uma nota musical no teclado virtual.",
      concept: "Mostra mapeamento entre input físico e resposta audiovisual.",
      tech: "Usa keydown/keyup, Web Audio API, classes CSS e gravação simples de sequência.",
      flow: ["tecla", "nota", "oscilador", "feedback visual"],
      code: "const note = keyMap[event.key.toLowerCase()];\nplayNote(note.frequency);\nhighlightKey(note.id);"
    },
    pomodoro: {
      hub: "Projetos Web",
      title: "Pomodoro",
      lead: "Timer de foco com duração configurável e estados de execução.",
      concept: "Mostra como tempo também é estado de interface.",
      tech: "setInterval reduz segundos, renderiza MM:SS e alterna estados como rodando, pausado e finalizado.",
      flow: ["define tempo", "inicia", "decrementa", "troca estado"],
      code: "timer = setInterval(() => {\n  secondsLeft -= 1;\n  renderTime(secondsLeft);\n}, 1000);"
    },
    cofrinho: {
      hub: "Projetos Web",
      title: "Cofrinho",
      lead: "Controle de saldo fictício com depósito, saque, meta e histórico.",
      concept: "Mostra formulário, validação e persistência local.",
      tech: "O estado é salvo em localStorage para continuar existindo depois de recarregar a página.",
      flow: ["digita valor", "valida", "atualiza saldo", "salva local"],
      code: "state.balance += value;\nlocalStorage.setItem('piggy-state', JSON.stringify(state));"
    }
  };

  const keyMeanings = {
    ArrowUp: "cima: navega, move personagem ou muda seleção",
    ArrowDown: "baixo: navega, move personagem ou muda seleção",
    ArrowLeft: "esquerda: volta opção ou move personagem",
    ArrowRight: "direita: avança opção ou move personagem",
    Enter: "enter: confirma a ação focada",
    z: "Z: ataque principal do boss ou ação rápida",
    x: "X: ataque alternativo ou habilidade",
    c: "C: terceira ação em jogos",
    " ": "space: dash, pausa ou interação",
    i: "I: abre o chat IA no hub"
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const detailTitle = $("[data-detail-title]");
  const detailText = $("[data-detail-text]");
  const detailCode = $("[data-detail-code]");

  function setDetail(topic) {
    const data = details[topic];
    if (!data || !detailTitle || !detailText || !detailCode) return;

    detailTitle.textContent = data.title;
    detailText.textContent = data.text;
    detailCode.textContent = data.code;

    $$("[data-topic]").forEach((button) => {
      button.classList.toggle("active", button.dataset.topic === topic);
    });
  }

  $$("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => setDetail(button.dataset.topic));
  });

  const termLabel = $("[data-term-label]");
  const termTitle = $("[data-term-title]");
  const termText = $("[data-term-text]");

  function setTerm(term) {
    const data = glossary[term];
    if (!data || !termLabel || !termTitle || !termText) return;

    termLabel.textContent = data.label;
    termTitle.textContent = data.title;
    termText.textContent = data.text;

    $$(".term-chip").forEach((button) => {
      button.classList.toggle("active", button.dataset.term === term);
    });
  }

  $$(".term-chip").forEach((button) => {
    button.addEventListener("click", () => setTerm(button.dataset.term));
  });

  const gameModal = $("#game-modal");
  const modalKicker = $("[data-modal-kicker]");
  const modalTitle = $("[data-modal-title]");
  const modalLead = $("[data-modal-lead]");
  const modalConcept = $("[data-modal-concept]");
  const modalTech = $("[data-modal-tech]");
  const modalFlow = $("[data-modal-flow]");
  const modalCode = $("[data-modal-code]");
  let lastModalTrigger = null;

  function openGameModal(gameId, trigger) {
    const data = games[gameId];
    if (!data || !gameModal) return;

    lastModalTrigger = trigger || null;
    if (modalKicker) modalKicker.textContent = data.hub;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalLead) modalLead.textContent = data.lead;
    if (modalConcept) modalConcept.textContent = data.concept;
    if (modalTech) modalTech.textContent = data.tech;
    if (modalCode) modalCode.textContent = data.code;
    if (modalFlow) {
      modalFlow.innerHTML = data.flow
        .map((item, index) => `<span><b>${index + 1}</b>${item}</span>`)
        .join("");
    }

    gameModal.classList.add("show");
    gameModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const closeButton = $(".modal-close", gameModal);
    if (closeButton) closeButton.focus();
  }

  function closeGameModal() {
    if (!gameModal) return;
    gameModal.classList.remove("show");
    gameModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (lastModalTrigger) lastModalTrigger.focus();
  }

  $$("[data-game-modal]").forEach((button) => {
    button.addEventListener("click", () => openGameModal(button.dataset.gameModal, button));
  });

  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeGameModal);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && gameModal && gameModal.classList.contains("show")) {
      closeGameModal();
    }
  });

  const navLinks = $$("[data-nav]");
  const sections = $$("[data-section]");
  const scrollMeter = $("#scrollMeter");

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);

      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === id));
      }
    });
  }, { rootMargin: "-35% 0px -48% 0px", threshold: 0 });

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  function updateScrollEffects() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / maxScroll;

    if (scrollMeter) scrollMeter.style.width = `${progress * 100}%`;

    document.body.style.setProperty("--scroll-drift", `${window.scrollY * -0.035}px`);

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const localProgress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
      const lift = (0.5 - localProgress) * 10;
      section.style.setProperty("--section-progress", localProgress.toFixed(3));
      section.style.setProperty("--section-lift", `${lift.toFixed(2)}px`);
    });
  }

  let scrollQueued = false;
  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      updateScrollEffects();
    });
  }

  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);
  updateScrollEffects();

  let mouseQueued = false;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 22;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 16;

    if (mouseQueued) return;
    mouseQueued = true;
    requestAnimationFrame(() => {
      mouseQueued = false;
      document.body.style.setProperty("--parallax-x", `${mouseX.toFixed(2)}px`);
      document.body.style.setProperty("--parallax-y", `${mouseY.toFixed(2)}px`);
      document.body.style.setProperty("--parallax-x-neg", `${(-mouseX).toFixed(2)}px`);
      document.body.style.setProperty("--parallax-y-neg", `${(-mouseY).toFixed(2)}px`);
      document.body.style.setProperty("--parallax-x-soft", `${(mouseX * 0.8).toFixed(2)}px`);
      document.body.style.setProperty("--parallax-y-soft", `${(mouseY * 0.7).toFixed(2)}px`);
    });
  }, { passive: true });

  const lastKey = $("#lastKey");
  const keyMeaning = $("#keyMeaning");

  function flashKey(key) {
    const normalized = key.toLowerCase();
    $$(".kbd-key").forEach((element) => {
      element.classList.toggle("hit", element.dataset.key === normalized);
    });
    window.setTimeout(() => {
      $$(".kbd-key.hit").forEach((element) => element.classList.remove("hit"));
    }, 180);
  }

  window.addEventListener("keydown", (event) => {
    const display = event.key === " " ? "SPACE" : event.key.toUpperCase();
    if (lastKey) lastKey.textContent = display;
    if (keyMeaning) keyMeaning.textContent = keyMeanings[event.key] || "tecla capturada pelo navegador";
    flashKey(event.key);
  });

  const names = ["Dirt", "Xiru", "Ana", "Lua", "Kai", "Mia"];
  const slots = $$(".carousel-track span");
  let carouselIndex = 0;

  if (slots.length) {
    window.setInterval(() => {
      carouselIndex = (carouselIndex + 1) % names.length;
      slots.forEach((slot, index) => {
        slot.textContent = names[(carouselIndex + index) % names.length];
        slot.classList.toggle("center-slot", index === 1);
      });
    }, 1500);
  }

  const simSteps = [
    {
      title: "ACOES DOS CLIENTES",
      text: "No WebSocket, varios jogadores podem agir quase ao mesmo tempo. O cliente nao decide dano nem vitoria, ele so envia intencao.",
      code: 'boss.emit("attack")\n// Alma 1: -> move\n// Alma 4: attack',
      serverLabel: "IDLE",
      serverCode: "aguardando inputs"
    },
    {
      title: "INPUTS VIA SOCKET",
      text: "Cada cliente envia apenas input. O servidor recebe as intencoes e guarda para processar no tick.",
      code: 'socket.emit("utm:input", keys)',
      serverLabel: "INPUT BUFFER",
      serverCode: 'socket.emit("utm:input", keys)'
    },
    {
      title: "SERVER PROCESSA",
      text: "O servidor e autoritativo. Ele valida inputs, simula a partida, calcula dano e decide o estado real da sala.",
      code: "processTick(room)\nprocessando: boss.attack + alma1.right + alma4.shoot",
      serverLabel: "PROCESS",
      serverCode: "processTick(room)"
    },
    {
      title: "STATE DISTRIBUIDO",
      text: "Depois do tick, o servidor envia uma unica verdade oficial da partida para todos os clientes da sala.",
      code: 'io.to(room).emit("state")',
      serverLabel: "STATE EMIT",
      serverCode: 'io.to(room).emit("state")'
    },
    {
      title: "CLIENTES RENDERIZAM",
      text: "Os clientes nao decidem o resultado. Eles apenas desenham na tela o state oficial recebido do servidor.",
      code: "render(state)",
      serverLabel: "SYNC OK",
      serverCode: "render(state)"
    }
  ];

  const simShell = $(".sim-reference[data-sim-step]");
  const simButtons = $$("[data-sim-step-target]");
  const simKicker = $("[data-sim-kicker]");
  const simTitle = $("[data-sim-title]");
  const simText = $("[data-sim-text]");
  const simCode = $("[data-sim-code]");
  const serverPopLabel = $("[data-server-pop-label]");
  const serverPopCode = $("[data-server-pop-code]");
  let currentSimStep = 0;

  function setSimStep(step) {
    if (!simShell || !simSteps.length) return;
    currentSimStep = clamp(step, 0, simSteps.length - 1);
    const data = simSteps[currentSimStep];

    simShell.dataset.simStep = String(currentSimStep);
    if (simKicker) simKicker.textContent = `step ${currentSimStep + 1} / ${simSteps.length}`;
    if (simTitle) simTitle.textContent = data.title;
    if (simText) simText.textContent = data.text;
    if (simCode) simCode.textContent = data.code;
    if (serverPopLabel) serverPopLabel.textContent = data.serverLabel;
    if (serverPopCode) serverPopCode.textContent = data.serverCode;

    simButtons.forEach((button) => {
      const isActive = Number(button.dataset.simStepTarget) === currentSimStep;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  }

  function simIsInView() {
    if (!simShell) return false;
    if (simShell.contains(document.activeElement)) return true;
    const rect = simShell.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.24;
  }

  if (simShell && simButtons.length) {
    simButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setSimStep(Number(button.dataset.simStepTarget));
        simShell.focus({ preventScroll: true });
      });
    });

    window.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft"].includes(event.key) || !simIsInView()) return;
      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;

      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setSimStep(currentSimStep + delta);
    });

    setSimStep(0);
  }

  setDetail("input");
  setTerm("api");
})();

