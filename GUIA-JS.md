# Guia de Estudo do JavaScript do Playground JS

Este material foi feito para servir como guia de estudo do projeto. A ideia é explicar **como o JavaScript organiza o site**, **como o servidor funciona**, **como a dificuldade do cassino é aplicada**, **como o Undertale Multiplayer sincroniza jogadores via Socket.IO** e **quais funções sustentam a navegação, os jogos e a interação por teclado**.

---

## 1. Visão Geral da Arquitetura

O projeto é dividido em quatro partes principais:

- `index.html`: estrutura das telas e dos elementos.
- `css/style.css`: aparência, layout e animações visuais.
- `js/script.js`: lógica da aplicação, jogos, controles, HUDs, sons e canvas.
- `server.js`: servidor Node.js/Express para servir arquivos, guardar dificuldade, fornecer contexto ao chat e gerenciar salas multiplayer.

Na prática:

- O HTML cria os elementos.
- O CSS define como tudo parece.
- O JavaScript transforma a página em uma aplicação interativa.
- O Node.js adiciona persistência simples, endpoints de apoio e o servidor autoritativo do Undertale Multiplayer.

---

## 2. Como o `server.js` Funciona

O arquivo `server.js` cria um servidor HTTP com Node.js:

```js
const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
```

### O que ele faz

1. Define a porta do servidor:

```js
const PORT = Number(process.env.PORT || 3000);
```

Se nada for informado, o projeto roda na porta `3000`.

2. Define arquivos importantes:

```js
const CONFIG_FILE = path.join(ROOT_DIR, "config", "chatbot-rules.txt");
const DB_FILE = path.join(ROOT_DIR, "data", "chatbot-state.json");
```

Esses arquivos guardam:

- regras do chatbot;
- estado da dificuldade do cassino.

3. Cria o app Express, o servidor HTTP e o Socket.IO:

```js
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
```

O Express entrega os arquivos estáticos e as APIs. O Socket.IO mantém conexões realtime para o Undertale Multiplayer.

4. Publica arquivos estáticos:

```js
app.use("/vendor/phaser", express.static(path.join(ROOT_DIR, "node_modules", "phaser", "dist")));
app.use(express.static(ROOT_DIR));
```

Isso permite abrir `index.html`, `css/style.css`, `js/script.js`, Phaser e demais assets pelo servidor local.

---

## 3. Persistência da Dificuldade

O servidor mantém um pequeno “banco” em JSON:

```json
{
  "dificuldade": "medio",
  "winDifficulty": 0.5,
  "updatedAt": "..."
}
```

Esse arquivo fica em:

- `data/chatbot-state.json`

### Funções principais

#### `ensureDb()`

Garante que o arquivo de estado exista.

Se não existir, cria com valores padrão:

- dificuldade média;
- `winDifficulty = 0.5`.

#### `readDb()`

Lê o arquivo JSON e devolve o estado atual.

#### `updateDifficulty(dificuldade)`

Atualiza o arquivo com a nova dificuldade.

O servidor trabalha com este mapa:

```js
const DIFFICULTY_VALUES = {
  facil: 1,
  medio: 0.5,
  dificil: 0.08,
};
```

Interpretação:

- `1`: forte vantagem para o jogador;
- `0.5`: equilíbrio;
- `0.08`: forte vantagem para a casa.

---

## 4. Endpoints do Servidor

O servidor expõe algumas rotas:

### `GET /api/state`

Retorna o estado atual da dificuldade.

Uso:

```js
fetch("/api/state")
```

### `POST /api/difficulty`

Recebe algo como:

```json
{
  "dificuldade": "facil"
}
```

E salva o novo estado.

### `GET /api/chat-context`

Entrega ao chat:

- regras do chatbot;
- trechos do README;
- texto extraído do HTML;
- variáveis visuais do CSS.

Isso ajuda o assistente do site a responder com base no próprio projeto.

### `POST /api/chat`

Essa rota existe apenas como compatibilidade e retorna status `410`.

O motivo é que o chatbot atual usa Puter.js/Grok diretamente no navegador. O servidor ainda fornece contexto e estado, mas a chamada de IA não passa mais por `/api/chat`.

---

## 5. Variável Central da Dificuldade do Cassino

No front-end, a dificuldade do cassino é aplicada pela variável:

```js
var WIN_DIFFICULTY = 1;
```

Ela é central para alterar a “sorte” do jogador no cassino.

---

## 6. Como `WIN_DIFFICULTY` Afeta o Cassino

O valor de `WIN_DIFFICULTY` interfere em três jogos:

- Caça-Níquel;
- Roleta;
- Crash.

---

## 7. A Função `calcWinChance(base)`

No cassino existe esta função:

```js
function calcWinChance(base) {
  if (WIN_DIFFICULTY <= 0) return 0;
  if (WIN_DIFFICULTY >= 1) return 1;
  return base + (WIN_DIFFICULTY - 0.5) * 2 * (1 - base) * 0.8;
}
```

### Ideia da função

Ela recebe uma chance base e ajusta conforme a dificuldade.

Exemplo na roleta:

```js
if (Math.random() < calcWinChance(0.46)) {
  // escolhe um resultado favorável ao jogador
}
```

Se a dificuldade estiver:

- fácil: a chance sobe;
- média: fica mais próxima do valor original;
- difícil: a chance cai.

### Como explicar no guia

Você pode dizer:

> “A função `calcWinChance` transforma uma chance normal em uma chance dinâmica. Em vez de o jogo usar sempre a mesma probabilidade, ele adapta o resultado ao nível de dificuldade selecionado.”

---

## 8. Efeito da Dificuldade em Cada Jogo do Cassino

### Caça-Níquel

A função `slotRandom()` muda os pesos dos símbolos.

Em dificuldade maior para o jogador:

- símbolos raros ficam mais prováveis;
- o jackpot aparece com mais frequência.

Em dificuldade difícil:

- símbolos comuns ganham mais peso;
- símbolos valiosos aparecem menos.

Ou seja, o jogo não altera só “ganha ou perde”; ele altera a distribuição dos resultados.

---

### Roleta

A roleta usa:

```js
Math.random() < calcWinChance(0.46)
```

Se o teste for verdadeiro, o número sorteado vem de um grupo favorável à cor escolhida pelo jogador.

Se for falso, ele vem do grupo desfavorável.

Isso deixa o comportamento da dificuldade muito claro de explicar.

---

### Crash

O Crash usa:

```js
function genCrashPt() {
  var mn = 1.05 + WIN_DIFFICULTY * 0.8,
      mx = 1.5 + WIN_DIFFICULTY * 25;
  return parseFloat((mn + Math.random() * (mx - mn)).toFixed(2));
}
```

Essa função decide em qual multiplicador a rodada vai “quebrar”.

Quanto maior `WIN_DIFFICULTY`:

- maior tende a ser o multiplicador final;
- o jogador ganha mais tempo para sacar.

Quanto menor:

- o crash acontece cedo;
- o risco aumenta.

---

## 9. Como a Dificuldade Sai do Chat e Chega ao Cassino

O fluxo é:

1. O usuário pede no chat:
   - “deixa o cassino fácil”;
   - “modo difícil”;
   - “quero dificuldade média”.

2. O JavaScript tenta classificar localmente primeiro com `classifyLocally(userText)`.

3. O JavaScript chama:

```js
saveDifficulty(level)
```

4. Essa função faz:

```js
fetch("/api/difficulty", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ dificuldade: level }),
})
```

5. O servidor salva a dificuldade.

6. O front-end sincroniza a nova configuração com:

```js
window.applyCasinoDifficulty(...)
```

### Como explicar em uma frase

> “O chat não muda o jogo diretamente. Ele identifica a intenção do usuário, salva a nova dificuldade no servidor, e o front-end aplica esse estado no cassino.”

### Fallback do chat

O chat usa Puter.js/Grok para responder perguntas abertas, mas o projeto não pode depender totalmente de um serviço externo. Por isso existem proteções:

- `CHAT_AI_TIMEOUT_MS`: tempo máximo para esperar a IA.
- `withTimeout(...)`: encerra uma chamada demorada.
- `classifyLocally(userText)`: detecta dificuldade sem chamar IA.
- `localAnswer(userText)`: responde com contexto local quando Puter/Grok falha.

Assim o usuário não fica preso em `PROCESSANDO...` quando a IA externa demora, pede autenticação ou perde conexão.

---

## 10. Sistema de Telas: `TELA` e `irPara()`

O `script.js` guarda os IDs das telas em um objeto:

```js
var TELA = {
  HUB: "hub",
  ARCADE: "arcade-hub",
  ARCADE_GAMES: "arcade-games-hub",
  MP_HUB: "multiplayer-hub",
  UT_MULTI: "undertale-multiplayer",
  PROJECTS: "projects-hub",
  CASINO: "casino",
  SLOTS: "slots",
  ROULETTE: "roulette-game",
  CRASH: "crash-game",
  UT_HUB: "undertale-hub",
  UT_BATTLE: "undertale-battle",
};
```

Depois usa:

```js
var telaAtiva = TELA.HUB;
```

### Função `irPara(id)`

Essa é uma das funções mais importantes do projeto.

Ela:

1. remove `.active` de todas as telas;
2. ativa a nova tela;
3. atualiza `telaAtiva`;
4. reposiciona focos de teclado;
5. inicia ou encerra jogos conforme necessário.

Exemplos:

- ao entrar em Geometry Race, chama `geoEnter()`;
- ao sair, chama `geoStop()`;
- ao entrar no CupShock, chama `cyberEnter()`;
- ao sair, chama `cyberStop()`.
- ao entrar no Undertale Multiplayer, chama `utmEnter()`.

### Como explicar

> “A navegação do site é feita como uma máquina de estados simples. O valor de `telaAtiva` diz onde o usuário está, e `irPara()` faz a troca de contexto.”

---

## 11. O Listener Global de Teclado

Uma das partes mais importantes do projeto é:

```js
document.addEventListener("keydown", function (e) {
  ...
}, true);
```

Esse listener decide o que fazer com cada tecla com base em:

- `e.key`;
- `telaAtiva`;
- estado do jogo atual.

### Exemplo de raciocínio

Se o usuário está no hub:

- `ArrowLeft` muda o foco para a esquerda;
- `ArrowRight` muda o foco para a direita;
- `Enter` seleciona o card.

Se está na roleta:

- setas trocam o botão em foco;
- `Enter` ativa o botão atual.

Se está no Undertale:

- o evento é enviado para `utBattleKey(k)`.

Se está no Undertale Multiplayer:

- no lobby, setas navegam entre campos e botões;
- durante a partida, o listener específico envia inputs para o servidor;
- `WASD` ou setas controlam movimento e mira;
- `Z`, `X`, `C` e `Shift` viram ações semânticas como ataque, padrão e dash.

---

## 12. Funções de Foco e Seleção

Há um padrão que se repete no projeto:

- `pgSetFoco()`
- `arcadeGamesSetFoco()`
- `casinoSetFoco()`
- `jkpSetFoco()`
- `ccSetFoco()`
- `rltSetFoco()`
- `crashSetFoco()`

Essas funções:

1. removem a classe de foco anterior;
2. calculam o novo índice;
3. adicionam a classe visual de foco;
4. atualizam a variável de índice correspondente.

Depois entram as funções de seleção:

- `pgSelect()`
- `arcadeGamesSelect()`
- `casinoSelect()`

### Padrão arquitetural

Esse padrão separa:

- navegação;
- foco visual;
- ação de confirmar.

É uma boa prática porque evita misturar toda a lógica em um bloco gigante.

---

## 13. Exemplo Completo: Playground Hub

No hub inicial:

```js
function pgSetFoco(idx) {
  ...
}

function pgSelect() {
  ...
}
```

No teclado:

```js
if (telaAtiva === TELA.HUB) {
  if (k === "ArrowLeft") pgSetFoco(pgIdx - 1);
  else if (k === "ArrowRight") pgSetFoco(pgIdx + 1);
  else if (k === "Enter" || k === " ") pgSelect();
}
```

### O que isso mostra no guia

- existe um índice atual;
- existe um foco visual;
- existe uma ação de confirmar;
- as teclas reutilizam a mesma lógica do clique.

---

## 14. Proteções no Teclado

O listener também evita alguns problemas:

```js
if (e.repeat) return;
```

Isso impede que segurar uma tecla dispare dezenas de ações não desejadas.

Também há o `guard`, que evita duplicações no mesmo ciclo.

E há tratamento especial para inputs:

- quando o usuário está digitando em campos;
- quando usa `F5` ou `F12`;
- quando abre o chat com `I`.
- quando está no Teclado Virtual, o `I` não abre o chat porque ele precisa tocar nota.

---

## 14.1. Projetos Web no JavaScript

Os projetos avaliativos ficam dentro do mesmo sistema de telas, mas cada um tem uma lógica pequena e isolada.

### Pomodoro

Funções principais:

- `pomoInit()`
- `pomoStart()`
- `pomoPause()`
- `pomoReset()`
- `pomoRender(message)`
- `pomoLoadTasks()`
- `pomoSaveTasks()`
- `pomoAddTask()`
- `pomoToggleTask(id)`
- `pomoRemoveTask(id)`
- `pomoClearDoneTasks()`
- `pomoRenderTasks()`

O Pomodoro controla:

- tempo restante;
- modo atual, foco ou pausa;
- inputs de duração de foco e pausa;
- botões de iniciar, pausar e resetar.
- uma lista lateral de tarefas persistida em `localStorage`;
- foco por teclado separado entre controles do timer e controles da lista.

Ele não tem mais alternância de tema. O foco do projeto é temporizador, configuração de tempo, tarefas de foco e feedback da contagem.

### Teclado Virtual

Funções principais:

- `synthInit()`
- `synthPlayKey(keyName, shouldRecord)`
- `synthTone(freq)`
- `synthToggleRecord()`
- `synthReplay()`
- `synthClearSequence()`
- `synthChangeOctave(delta)`
- `synthBuildPresetSequence(song)`
- `synthPlayPreset(songId)`
- `synthClearSongButtons()`

O Teclado Virtual funciona como um piano/synth de duas oitavas. O HTML define cada tecla com `data-synth-key` e `data-synth-index`; o JavaScript monta `synthKeyMap` para transformar tecla física em nota.

As músicas prontas ficam em `synthPresetSongs`. Cada música é uma lista de passos com tecla e duração. Ao clicar ou confirmar uma música pelo teclado, `synthPlayPreset(songId)` monta uma sequência temporária e reutiliza `synthReplay()` para tocar.

Controles importantes:

- teclas brancas: `Z/X/C/V/B/N/M` e `Q/W/E/R/T/Y/U`;
- teclas pretas: `S/D/G/H/J` e `2/3/5/6/7`;
- `CapsLock`: gravar;
- `P`: reproduzir gravação;
- `Backspace`: limpar;
- `Tab`: diminuir oitava;
- `Shift`: aumentar oitava.
- setas: navegar pelas músicas prontas;
- `Enter`: tocar a música pronta em foco.

O som é gerado com Web Audio API usando oscilador, filtro e ganho.

---

## 15. Como Funciona o Chat com a Tecla `I`

Quando o usuário pressiona:

```js
i ou I
```

O código chama:

```js
window.openAiChat()
```

Esse comportamento é interceptado antes da navegação normal, para o chat funcionar de qualquer tela.

O envio da mensagem passa por `askAi(userText)`. O fluxo atual é:

1. classificar dificuldade localmente, se possível;
2. se for mudança de dificuldade, chamar `saveDifficulty(level)`;
3. se for pergunta, tentar Puter.js/Grok;
4. se a IA falhar ou demorar, responder com `localAnswer(userText)`.

Esse modelo deixa o chat mais robusto porque as ações importantes do cassino não dependem da disponibilidade da IA externa.

---

## 16. Uso de Canvas nos Jogos

O projeto usa Canvas em várias partes:

- confete;
- Geometry Race;
- CupShock;
- roleta;
- Crash;
- Undertale.
- fallback visual do Undertale Multiplayer.

O Undertale Multiplayer usa Phaser quando a biblioteca está disponível:

```js
UTM.phaser = new window.Phaser.Game({
  type: window.Phaser.CANVAS,
  canvas: canvas,
  width: 720,
  height: 420,
});
```

Phaser fica responsável pela cena 2D, enquanto o estado real da partida continua vindo do servidor.

### Estrutura comum de um jogo em canvas

1. estado do jogo em um objeto;
2. função de atualização;
3. função de desenho;
4. loop com `requestAnimationFrame`.

Exemplo geral:

```js
function loop(now) {
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
```

### Undertale Multiplayer e Socket.IO

O Undertale Multiplayer separa responsabilidades:

- o cliente desenha a arena, mostra lobby, envia inputs e renderiza o estado recebido;
- o servidor guarda salas, jogadores, HP, projéteis, cooldowns, colisões e vencedor;
- os clientes não decidem dano nem vitória.

Eventos principais do cliente para o servidor:

```js
socket.emit("utm:create-room", payload);
socket.emit("utm:join-room", payload);
socket.emit("utm:start-game");
socket.emit("utm:input", input);
```

Eventos principais do servidor para os clientes:

```js
io.to(room.id).emit("utm:room", publicRoom(room));
io.to(room.id).emit("utm:state", publicState(room));
io.to(room.id).emit("utm:damage", payload);
```

O loop autoritativo fica no servidor:

```js
setInterval(() => {
  rooms.forEach((room) => updateRoom(room, dt));
}, TICK_MS);
```

Isso evita que cada navegador calcule um resultado diferente.

---

## 17. Geometry Race: Loop e Controle

O Geometry Race possui:

- dois jogadores;
- obstáculos gerados;
- distância acumulada;
- vencedor definido por sobrevivência.

Ele usa:

- `geoEnter()`;
- `geoRestart()`;
- `geoLoop()`;
- `geoUpdate(dt)`;
- `geoDraw()`.

Também existe um `keyup` separado para soltar as teclas de salto.

---

## 18. CupShock: Estados da Boss Fight

O CupShock é um bom exemplo de jogo baseado em estado.

Ele usa:

- `intro`;
- `dialog`;
- `transform`;
- `fight`;
- `win`;
- `lose`.

O estado atual fica em:

```js
cyberState.status
```

### Fluxo

1. jogador entra na arena;
2. aproxima-se do boss;
3. inicia diálogo;
4. boss se transforma;
5. começa a luta;
6. vence ou perde.

### Funções centrais

- `cyberEnter()`
- `cyberRestart()`
- `cyberConfirm()`
- `cyberStartDialog()`
- `cyberStartTransform()`
- `cyberStartFight()`
- `cyberWin()`
- `cyberLose()`

Isso mostra bem a diferença entre:

- navegação de tela;
- progressão interna do jogo.

---

## 19. Como os Controles do CupShock Funcionam

A função:

```js
cyberHandleKey(k, down)
```

transforma teclas físicas em ações internas:

- esquerda;
- direita;
- pulo;
- tiro;
- dash;
- especial.

Exemplo:

```js
if (k === "ArrowLeft" || k === "a" || k === "A") key = "left";
```

### Vantagem desse modelo

O jogo deixa de depender diretamente da tecla original e passa a trabalhar com ações semânticas:

- `left`;
- `shoot`;
- `dash`.

Isso melhora organização e facilita mudanças futuras.

---

## 20. Colisões e Dano

O CupShock possui funções específicas para colisão:

- `cyberRectHit(a, b)`
- `cyberCircleHitRect(c, r)`

E funções de dano:

- `cyberDamagePlayer(amount)`
- `cyberDamageBoss(amount)`

Essas funções concentram efeitos importantes:

- redução de HP;
- invencibilidade temporária;
- knockback;
- particles;
- sons;
- transição para vitória ou derrota.

---

## 21. Sons com Web Audio API

O projeto não depende só de arquivos de áudio.

Ele gera sons com:

```js
AudioContext
OscillatorNode
GainNode
```

Funções como:

- `somOk()`
- `somErro()`
- `somNav()`
- `somEsc()`
- `somMoeda()`

encapsulam padrões sonoros reutilizáveis.

### Como explicar

> “Em vez de tocar um `.mp3` pronto, o projeto sintetiza sons rápidos em tempo real com a Web Audio API.”

---

## 22. Funções Que Vale a Pena Citar no Guia

### Navegação e telas

- `irPara(id)`
- `pgSetFoco(idx)`
- `arcadeGamesSetFoco(idx)`
- `casinoSetFoco(idx)`

### Cassino

- `calcWinChance(base)`
- `slotRandom()`
- `genCrashPt()`
- `atualizarSaldo(delta)`

### Chat e dificuldade

- `loadState()`
- `saveDifficulty(level)`
- `syncDifficulty(state)`
- `classifyLocally(userText)`
- `localAnswer(userText)`

### Undertale Multiplayer

- `utmEnter()`
- `utmStartPhaser()`
- `utmSendInput(force)`
- `utmSetKey(key, down)`
- `updateRoom(room, dt)` no servidor
- `emitState(room)` no servidor
- `emitDamage(room, target, amount)` no servidor

### CupShock

- `cyberConfirm()`
- `cyberHandleKey(k, down)`
- `cyberDamagePlayer(amount)`
- `cyberDamageBoss(amount)`

---

## 23. Como Explicar o Projeto em 1 Minuto

Um resumo possível:

> “O Playground JS é uma aplicação web com múltiplos jogos organizados por hubs. O JavaScript controla a navegação entre telas, o foco por teclado, os loops de animação em canvas/Phaser, os sons e a lógica de cada jogo. O `server.js` serve arquivos, salva a dificuldade do cassino em JSON, fornece contexto ao chat e mantém o estado autoritativo do Undertale Multiplayer via Socket.IO. A variável `WIN_DIFFICULTY` conecta a dificuldade aos jogos de cassino, alterando probabilidades e comportamento dos resultados.”

---

## 24. Perguntas Que Podem Cair Durante o Estudo

### “Por que usar `telaAtiva`?”

Porque o site tem muitas áreas e cada uma responde às teclas de um jeito diferente. `telaAtiva` centraliza esse contexto.

### “Por que usar `requestAnimationFrame`?”

Porque ele sincroniza a renderização com a taxa de atualização do navegador e é mais adequado para animações de jogo.

### “Por que guardar dificuldade em JSON?”

Porque é uma persistência simples, suficiente para o escopo acadêmico do projeto e fácil de demonstrar.

### “Qual é a diferença entre front-end e server nesse projeto?”

O front-end executa a interface, jogos locais, renderização e inputs. O server entrega arquivos, gerencia dados auxiliares como estado/contexto do chat e mantém o estado autoritativo do Undertale Multiplayer.

### “A dificuldade muda somente texto?”

Não. Ela altera matematicamente as probabilidades dos jogos do cassino.

---

## 25. Observações Úteis para Estudo

- O projeto usa bastante o padrão “estado + renderização”.
- O código reutiliza muitas funções de foco visual.
- A lógica de teclado é centralizada em um único listener grande, mas distribuída por blocos conforme a tela ativa.
- O cassino tem uma mecânica interessante para explicar probabilidade e pesos.
- O CupShock é bom para explicar máquina de estados, colisão, HUD e loop de jogo.
- O Undertale Multiplayer é bom para explicar WebSocket, servidor autoritativo, salas, inputs e sincronização.

---

## 26. Arquivos Importantes para Revisar no Guia

- `server.js`
- `js/script.js`
- `data/chatbot-state.json`
- `config/chatbot-rules.txt`
- `README.md`
- `index.html`
- `css/style.css`

---

## 27. Sugestão de Ordem para Estudar

1. Leia o sistema de telas e `irPara()`.
2. Leia o listener global de `keydown`.
3. Entenda `WIN_DIFFICULTY` e o cassino.
4. Veja o fluxo do chat alterando a dificuldade.
5. Estude um jogo simples, como Cara ou Coroa.
6. Estude um jogo complexo, como CupShock ou Geometry Race.
7. Estude o Undertale Multiplayer para entender cliente-servidor, Socket.IO e estado autoritativo.
