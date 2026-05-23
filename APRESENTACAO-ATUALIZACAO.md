# Apresentacao da Atualizacao: Projetos Web e Multiplayer

A atualizacao adiciona duas frentes principais ao Playground JS:

- **Projetos Web:** DOM, eventos, estado e Web Audio.
- **Multiplayer:** Undertale Multiplayer em salas online realtime.

O foco foi transformar o site de um conjunto de jogos locais em uma experiencia mais completa, com projetos avaliativos e arquitetura cliente-servidor.

## 2. Projetos Web

Demonstram conceitos fundamentais de JavaScript no navegador.

### Controle de Luz

Conceito: manipular classes, estado visual e contador.

```js
lightOn = !lightOn;
room.classList.toggle("on", lightOn);
if (lightOn) lightCount++;
```

### Cofrinho Digital

Conceito: atualizar valores, validar saldo e persistir estado.

```js
piggyTotal += value;
localStorage.setItem("piggy-state", JSON.stringify(piggyState));
```

### Pomodoro

Conceito: temporizador com estado de execucao, foco e pausa.

```js
pomoTimer = setInterval(function () {
  pomoRemaining--;
  if (pomoRemaining <= 0) pomoFinishCycle();
  pomoRender();
}, 1000);
```

### Teclado Virtual

Conceito: piano/synth com duas oitavas, gravacao e Web Audio API.

```js
function synthTone(freq) {
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
}
```

## 3. Multiplayer: Ideia Conceitual

O Undertale Multiplayer usa uma logica assimetrica:

- 1 jogador vira **Boss**.
- 1 a 4 jogadores viram **Almas**.
- O Boss tenta eliminar todas as Almas.
- As Almas vencem se zerarem a vida do Boss.

A diferenca principal para um jogo local e que varios navegadores precisam enxergar a mesma partida ao mesmo tempo. Para isso, o jogo nao pode deixar cada cliente decidir sozinho quem tomou dano ou quem venceu.

Por isso o servidor e **autoritativo**:

- clientes enviam apenas comandos;
- servidor calcula movimento, ataques, colisoes, dano e vitoria;
- servidor envia o estado atualizado para todos.

## 4. Fluxo Tecnico do Multiplayer

### Cliente envia inputs

O navegador transforma teclas em acoes e envia para o servidor.

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

### Servidor recebe e valida

```js
socket.on("utm:input", (payload) => {
  const room = getRoomForSocket(socket);
  const player = room ? room.players.get(socket.id) : null;
  if (!room || !player || room.status !== "playing") return;
  player.input = sanitizeInput(payload);
});
```

### Servidor atualiza a partida

```js
setInterval(() => {
  rooms.forEach((room) => {
    updateRoom(room, dt);
  });
}, TICK_MS);
```

### Servidor replica o estado

```js
io.to(room.id).emit("utm:state", publicState(room));
```

---

## 5. Recursos Implementados

- Criacao e entrada em salas por codigo.
- Sorteio do Boss por carrossel.
- Movimento e mira por teclado.
- Ataques com cooldown.
- Dash das Almas.
- Barra de vida do Boss.
- Cores diferentes para cada Alma.
- Animacao de dano para todos os jogadores.
- Remocao de jogador desconectado.

## 6. Tecnologias Usadas

- **JavaScript:** controle de estado, eventos e inputs.
- **Socket.IO:** comunicacao realtime entre cliente e servidor.
- **Node.js/Express:** servidor local e APIs auxiliares.
- **Phaser:** renderizacao 2D da arena multiplayer.
