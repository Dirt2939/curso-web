# Playground JS

**Colégio ULBRA São Lucas - Curso Técnico em Informática**
_Projeto desenvolvido para o módulo de Lógica e Programação Web._

---

## Sobre o Projeto

O **Playground JS** é uma aplicação web interativa feita com HTML, CSS, JavaScript, Node.js, Express e Socket.IO. O projeto funciona como um hub de minijogos com visual arcade neon, navegação por teclado e mouse, efeitos sonoros, animações em canvas, renderização com Phaser no modo multiplayer e controle de estado no front-end e no servidor.

A tela inicial organiza a experiência em cinco hubs:

- **Clássicos:** jogos rápidos de sorte, escolha e placar.
- **Arcade:** jogos de ação, reflexo, sobrevivência e boss fight.
- **Multiplayer:** partidas online em salas com sincronização realtime.
- **Cassino:** jogos com saldo fictício, apostas simuladas e verificação de idade.
- **Projetos Web:** quatro atividades avaliativas de DOM, eventos e estado.

O objetivo principal é aplicar conceitos fundamentais de desenvolvimento web, como manipulação do DOM, eventos, funções, objetos, arrays, condicionais, temporizadores, `requestAnimationFrame`, Canvas API, Web Audio API, servidor HTTP, WebSocket e sincronização cliente-servidor.

---

## Funcionalidades

- Tela inicial com cards para **Clássicos**, **Arcade**, **Multiplayer**, **Cassino** e **Projetos Web**.
- Cards com descrições curtas para cada hub e jogo.
- Navegação por teclado e mouse.
- Feedback visual de foco, seleção, vitória, derrota e estados de bloqueio.
- Efeitos sonoros gerados com Web Audio API.
- Animações e jogos renderizados com Canvas API.
- Visual retrofuturista com grid, brilho neon, cards, HUDs e painéis temáticos.
- Layout responsivo.
- Chat de ajuda acessível pela tecla `I`, com Puter.js/Grok quando disponível e fallback local quando a IA externa falha.
- Modal de verificação de idade antes de acessar o Cassino.
- Sistema de saldo fictício nos jogos de cassino.
- Sistema de salas online para o Undertale Multiplayer.
- Servidor autoritativo para validar movimento, ataques, dano, vitória e desconexões do multiplayer.

---

## Jogos Disponíveis

### Clássicos

**Jokenpô**

- O jogador escolhe entre pedra, papel ou tesoura.
- O computador faz uma escolha aleatória.
- O sistema compara as jogadas e atualiza o placar de vitórias, derrotas e empates.

**Batalha de Dados**

- O jogador e o computador lançam dados.
- Vence quem tirar o maior número.
- O jogo registra rodadas, placar e empates.

**Cara ou Coroa**

- O jogador escolhe um lado da moeda.
- O sistema sorteia o resultado.
- A moeda recebe animação e o placar é atualizado.

### Arcade

**Undertale**

- Hub de bosses com combates inspirados em Undertale.
- Inclui movimentação em arena, ataques, ações, spare/kill e estados de progresso.
- O boss final fica bloqueado até os requisitos serem cumpridos.

**Geometry Race**

- Corrida split-screen inspirada em Geometry Dash.
- Dois jogadores competem no mesmo mapa.
- Quem sobreviver por mais tempo vence.
- Inclui contagem regressiva, contador de metros e modos como cube, ship, gravity e wave.

**CupShock**

- Boss fight lateral inspirada na leitura de padrões de jogos como Cuphead e Undertale.
- O jogador se aproxima do Sentinela Nexus, passa por uma introdução curta e entra na luta.
- A luta usa fases progressivas, tiros, pulo, dash direcional, especial e padrões de ataque desviáveis.
- Os ataques incluem lasers rasantes, orbes em arco, drones, impactos verticais e investida do núcleo.
- A dificuldade aumenta por fase, mas os golpes possuem ritmo e aviso visual para o jogador reagir.
- Ao vencer, o jogador desativa o núcleo e volta para o hub Arcade com `Enter`.

### Multiplayer

**Undertale Multiplayer**

- Jogo realtime inspirado em Undertale, com salas online via Socket.IO.
- A partida funciona como 1 Boss contra 1 a 4 Almas.
- O host cria a sala e inicia o sorteio; o Boss é escolhido por carrossel aleatório.
- O Boss usa ataques com cooldown: tiro, leque e ossos.
- As Almas desviam, usam dash e podem atirar para reduzir a vida do Boss.
- O servidor é autoritativo: ele valida inputs, colisões, dano, HP, vitória e remoção de jogadores desconectados.
- A renderização principal usa Phaser em um canvas 2D; existe fallback em Canvas API se Phaser não carregar.
- O Boss vence ao eliminar todas as Almas. As Almas vencem ao zerar a vida do Boss.

### Cassino

**Caça-Níquel**

- O jogador usa saldo fictício para girar os rolos.
- O resultado é calculado a partir das combinações sorteadas.
- Prêmios variam conforme os símbolos obtidos.

**Roleta**

- O jogador escolhe uma cor e define o valor da aposta.
- A roleta gira e sorteia um número.
- O resultado atualiza saldo, histórico e mensagem da rodada.

**Crash**

- O jogador aposta em um multiplicador crescente.
- É necessário sacar antes do multiplicador quebrar.
- O jogo possui auto-saque e histórico de multiplicadores.

### Projetos Web

**Controle de Luz**

- Interruptor digital com imagem de lampada apagada e acesa.
- Botao com texto dinamico para ligar/desligar.
- Troca visual com `classList.toggle`, fade e contador de vezes acesa.

**Cofrinho Digital**

- Botoes para adicionar R$0,10, R$0,25, R$0,50 e R$1,00.
- Total formatado em reais, saque com validacao de saldo e botao para esvaziar.
- Contador por moeda, preenchimento visual do cofre e persistencia em `localStorage`.

**Pomodoro**

- Timer regressivo de 25:00 com iniciar, pausar e resetar.
- Alterna entre foco e pausa, com aviso sonoro ao finalizar.
- Permite configurar tempos de foco e pausa.
- Inclui lista de tarefas lateral com adicionar, marcar como feita, remover, limpar concluidas e persistencia em `localStorage`.

**Teclado Virtual**

- Simula um piano/synth com duas oitavas, teclas brancas e pretas.
- Cada nota pode ser tocada por clique ou por teclas físicas mapeadas no layout musical.
- As teclas brancas usam `Z`, `X`, `C`, `V`, `B`, `N`, `M` e `Q`, `W`, `E`, `R`, `T`, `Y`, `U`.
- As teclas pretas usam `S`, `D`, `G`, `H`, `J` e `2`, `3`, `5`, `6`, `7`.
- Inclui contador de toques, gravação, reprodução, limpeza de sequência, ajuste de oitava e músicas prontas como `PARABENS`, `BRILHA`, `ODE` e `JINGLE`.

---

## Controles

### Navegação Geral

- **Seta para esquerda / direita:** navegar entre cards e opções.
- **Seta para cima / baixo:** mover em jogos ou ajustar controles específicos.
- **Enter:** confirmar seleção, iniciar rodada, avançar diálogo ou reiniciar quando aplicável.
- **Espaço:** ação principal em alguns jogos.
- **Esc:** voltar para a tela anterior.
- **F5:** recarregar a página.
- **I:** abrir o chat de ajuda.
- **Mouse:** clicar em cards, botões e opções.
- **Teclado Virtual:** `Z/X/C/V/B/N/M` e `Q/W/E/R/T/Y/U` tocam teclas brancas; `S/D/G/H/J` e `2/3/5/6/7` tocam teclas pretas.
- **Controles do Teclado Virtual:** `CapsLock` grava, `P` reproduz a gravação, `Backspace` limpa, `Tab` reduz oitava, `Shift` aumenta oitava, setas navegam nas músicas prontas e `Enter` toca a música focada.
- **Pomodoro:** setas navegam entre controles; `Enter` confirma; a área de tarefas permite adicionar, marcar como feita, remover e limpar concluidas.

### Jogos Específicos

- **Undertale:** setas para navegar/mover, `Enter` para selecionar e `Esc` para voltar.
- **Geometry Race:** `W` ou `Espaço` para o Player 1; `Seta para cima` para o Player 2.
- **CupShock:** `A/D` ou setas para mover; `W`, `Seta para cima` ou `Espaço` para pular; `J/Z` para atirar; `Shift` para dash direcional; `K/X` para especial; `Enter` para avançar diálogo, voltar após vencer ou reiniciar após perder.
- **Undertale Multiplayer:** `WASD` ou setas movem e miram; Boss usa `Z` para tiro, `X` para leque e `C` para ossos; Almas usam `Z` para atirar e `Shift` para dash.

---

## Tecnologias Utilizadas

- **HTML5:** estrutura das telas, hubs, jogos, modais, SVGs e canvases.
- **CSS3:** layout, responsividade, animações, variáveis visuais e estilo neon.
- **JavaScript:** regras dos jogos, navegação, eventos, estado, placares, sons e animações.
- **Canvas API:** renderização de jogos e efeitos visuais.
- **Phaser:** renderização 2D do Undertale Multiplayer.
- **Web Audio API:** efeitos sonoros gerados no navegador.
- **Node.js + Express:** servidor local, arquivos estáticos e APIs auxiliares.
- **Socket.IO:** WebSocket/realtime para salas e sincronização do Undertale Multiplayer.
- **Puter.js/Grok:** chat de ajuda no navegador, com timeout e fallback local.

---

## Logica dos Modulos Principais

Esta parte resume como os modulos mais importantes do projeto funcionam por dentro.

### Projetos Web

Os Projetos Web demonstram DOM, eventos, estado local e feedback visual no navegador.

**Controle de Luz**

Manipula estado visual com classes CSS e contador:

```js
lightOn = !lightOn;
room.classList.toggle("on", lightOn);
if (lightOn) lightCount++;
```

**Cofrinho Digital**

Atualiza saldo, valida valores e persiste os dados:

```js
piggyTotal += value;
localStorage.setItem("piggy-state", JSON.stringify(piggyState));
```

**Pomodoro**

Usa temporizador, estado de execucao, pausa e lista de tarefas:

```js
pomoTimer = setInterval(function () {
  pomoRemaining--;
  if (pomoRemaining <= 0) pomoFinishCycle();
  pomoRender();
}, 1000);
```

**Teclado Virtual**

Usa Web Audio API para gerar som no navegador:

```js
function synthTone(freq) {
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
}
```

### Undertale Multiplayer

O Undertale Multiplayer usa uma logica assimetrica:

- 1 jogador vira **Boss**.
- 1 a 4 jogadores viram **Almas**.
- O Boss tenta eliminar todas as Almas.
- As Almas vencem ao zerar a vida do Boss.

A diferenca para um jogo local e que varios navegadores precisam enxergar a mesma partida. Para evitar resultados diferentes em cada tela, o servidor e autoritativo.

Responsabilidades:

- **Cliente:** le teclado, desenha arena, mostra lobby, HP, cooldowns e mensagens.
- **Servidor:** guarda salas, jogadores, tiros, HP, cooldowns, colisao, dano e vencedor.
- **Socket.IO:** mantem a comunicacao realtime entre navegadores e servidor.

Fluxo tecnico:

```text
teclado -> input -> servidor -> simulacao -> estado oficial -> renderizacao
```

Cliente envia apenas comandos:

```js
socket.emit("utm:input", {
  up: keys.up,
  down: keys.down,
  left: keys.left,
  right: keys.right,
  attack: keys.attack,
  dash: keys.dash
});
```

Servidor recebe e valida:

```js
socket.on("utm:input", (payload) => {
  const room = getRoomForSocket(socket);
  const player = room ? room.players.get(socket.id) : null;
  if (!room || !player || room.status !== "playing") return;
  player.input = sanitizeInput(payload);
});
```

Servidor atualiza a partida em ticks:

```js
setInterval(() => {
  rooms.forEach((room) => {
    updateRoom(room, dt);
  });
}, TICK_MS);
```

Servidor replica o estado oficial para todos:

```js
io.to(room.id).emit("utm:state", publicState(room));
```

Recursos do multiplayer:

- Criacao e entrada em salas por codigo.
- Sorteio do Boss por carrossel.
- Movimento e mira por teclado.
- Ataques com cooldown.
- Dash das Almas.
- Barra de vida do Boss.
- Cores diferentes para cada Alma.
- Animacao de dano replicada para todos.
- Remocao de jogador desconectado.

---

## Estrutura do Projeto

```text
Desafio-Master/
|-- config/
|-- css/
|   `-- style.css
|-- data/
|-- js/
|   `-- script.js
|-- node_modules/
|-- index.html
|-- package.json
|-- package-lock.json
|-- README.md
|-- GUIA-JS.md
`-- server.js
```

### Responsabilidade dos Arquivos

- `index.html`: estrutura HTML das telas, hubs, jogos, modais, SVGs e canvases.
- `css/style.css`: visual do projeto, incluindo layout, cores, responsividade e animações.
- `js/script.js`: lógica de navegação, jogos, placares, controles, sons, Phaser e renderização em canvas.
- `server.js`: servidor Node.js/Express, APIs do chat/dificuldade e servidor autoritativo do Undertale Multiplayer.
- `config/`: regras do chatbot.
- `data/`: estado persistido da dificuldade do cassino.
- `README.md`: documentação do projeto.
- `GUIA-JS.md`: guia de estudo da arquitetura JavaScript.

---

## Como Executar

### Abrindo direto no navegador

1. Abra a pasta do projeto.
2. Abra o arquivo `index.html` no navegador.

Esse modo permite visualizar a maioria das telas estáticas e jogos front-end, mas o **Undertale Multiplayer**, APIs do chat e persistência de dificuldade dependem do servidor local.

### Usando o servidor local

1. Instale as dependências, se necessário:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

3. Acesse:

```text
http://localhost:3000
```

### Usando Ngrok para multiplayer externo

1. Com o servidor rodando em `localhost:3000`, execute:

```bash
ngrok http 3000
```

2. Copie a URL pública gerada pelo Ngrok.
3. No lobby do Undertale Multiplayer, use essa URL no campo **Servidor** quando os jogadores estiverem fora da mesma rede/origem.

### Usando o site

Acesse: 
```text
https://desafio-master-2ppl.onrender.com/
````

## Como Jogar

1. Acesse a tela inicial do **Playground JS**.
2. Escolha um hub: **Clássicos**, **Arcade**, **Multiplayer**, **Cassino** ou **Projetos Web**.
3. Em **Clássicos**, insira a moeda para liberar os jogos.
4. Em **Arcade**, escolha entre Undertale, Geometry Race ou CupShock.
5. Em **Multiplayer**, escolha Undertale MP, crie ou entre em uma sala e espere o host iniciar.
6. Em **Cassino**, confirme a idade e insira o ticket.
7. Use teclado ou mouse para jogar.

---

## Conceitos de Programação Aplicados

- Declaração e chamada de funções.
- Variáveis de controle de estado.
- Objetos para placares, configurações e entidades dos jogos.
- Arrays para opções, mapas, obstáculos, históricos e resultados.
- Estruturas condicionais para definir regras, estados e vencedores.
- Sorteios e geração dinâmica com `Math.random()`.
- Manipulação de classes CSS com `classList`.
- Manipulação de conteúdo com `textContent` e `innerHTML`.
- Eventos com `addEventListener`.
- Temporizadores com `setTimeout` e `setInterval`.
- Loops de animação com `requestAnimationFrame`.
- Renderização 2D com Canvas API.
- Renderização 2D com Phaser no modo multiplayer.
- Efeitos sonoros com Web Audio API.
- Comunicação realtime com Socket.IO.
- Validação autoritativa de estado no servidor.

- Apresentação de principais conceitos em: [https://www.canva.com/design/DAHJeeXVn-s/QdmbhgV8kYZv5kT0r53w5A/edit](https://canva.link/l6rtkru1izvh2o2)

---

## Organização do Código

O projeto separa responsabilidades de forma simples:

- A estrutura fica em `index.html`.
- A aparência fica em `css/style.css`.
- O comportamento fica em `js/script.js`.

O JavaScript é dividido em blocos comentados para facilitar manutenção:

- Áudio e efeitos.
- Sistema de telas.
- Hub principal.
- Hub Clássicos.
- Hub Arcade.
- Hub Multiplayer.
- Jogos Clássicos.
- Geometry Race.
- CupShock.
- Cassino e seus jogos.
- Undertale.
- Undertale Multiplayer.
- Chat de ajuda.

Essa organização facilita leitura, apresentação e evolução do projeto.
