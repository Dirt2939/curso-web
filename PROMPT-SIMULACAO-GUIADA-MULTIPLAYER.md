# Prompt para criar a Simulacao Guiada do Multiplayer

Crie uma secao interativa chamada **Simulacao Guiada: Multiplayer Realtime** para um site academico com estetica arcade/pixel art/neon.

A simulacao deve explicar visualmente como funciona um jogo multiplayer via **WebSocket/Socket.IO** com servidor autoritativo. A ideia nao e parecer uma API tradicional de request/response, mas sim um fluxo realtime onde varios clientes mandam inputs e o servidor devolve o estado oficial da sala.

## Estilo visual

Use uma estetica escura, futurista e arcade:

- fundo escuro com grid sutil;
- bordas neon quadradas, nao use circulos genericos;
- cores principais:
  - azul para `INPUT`;
  - rosa/vermelho para `STATE`;
  - cyan para `SERVER`;
  - roxo para cards das Almas;
- fontes com sensacao pixel/arcade;
- popups pequenos, modulares e presos ao elemento que representam;
- nada de cards sobrepostos ou popups soltos atravessando a tela.

## Layout da simulacao

A composicao deve ter:

- Boss no topo;
- `server.js` no centro;
- 4 Almas na parte inferior;
- linhas retas conectando servidor e clientes;
- legenda:
  - `INPUT`: cliente -> servidor;
  - `STATE`: servidor -> clientes;
- card de tick mostrando:
  - `20 TICKS / SEG`;
  - `50ms por tick`;
- botoes/steps inferiores:
  1. `ACOES`
  2. `INPUTS`
  3. `SERVER`
  4. `STATE`
  5. `CLIENTES`

A navegacao deve funcionar por clique nos steps e tambem por teclado:

- seta direita avanca;
- seta esquerda volta.

## Sequencia da animacao

### Step 1 - ACOES DOS CLIENTES

Mostre que varios jogadores podem agir quase ao mesmo tempo:

- Boss executa um ataque;
- Alma 1 move para a direita;
- Alma 4 executa um ataque.

Visual:

- Boss ganha glow vermelho;
- popup do Boss mostra:

```js
boss.emit("attack")
```

- popup da Alma 1 mostra `-> move`;
- popup da Alma 4 mostra `attack`;
- Alma 1 e Alma 4 recebem destaque nos cards.

Texto conceitual:

> No WebSocket, varios jogadores podem agir quase ao mesmo tempo. O cliente nao decide dano nem vitoria, ele so envia intencao.

### Step 2 - INPUTS VIA SOCKET

Mostre 3 inputs azuis indo para o servidor.

Importante:

- NAO faca tres inputs sairem do Boss.
- Deve sair:
  - 1 input azul do Boss para o servidor;
  - 1 input azul da Alma 1 para o servidor;
  - 1 input azul da Alma 4 para o servidor.

Visual:

- input do Boss desce pelo trilho vertical superior ate o `server.js`;
- input da Alma 1 sobe pela sua linha, entra no barramento horizontal e converge para o servidor;
- input da Alma 4 faz o mesmo pelo lado direito;
- os inputs devem seguir linhas retas, com movimento frio e tecnico;
- nada de movimento curvo, aleatorio ou decorativo.

Trecho exibido:

```js
socket.emit("utm:input", keys)
```

Texto conceitual:

> Cada cliente envia apenas input. O servidor recebe as intencoes e guarda para processar no tick.

### Step 3 - SERVER PROCESSA

O servidor processa os tres acontecimentos no mesmo tick.

Visual:

- `server.js` pulsa em cyan;
- terminal bars internas animam;
- popup do servidor mostra:

```js
processTick(room)
```

- texto pequeno:

```txt
processando: boss.attack + alma1.right + alma4.shoot
```

Importante:

- neste step NAO mostrar `io.to(room).emit("state")`;
- este step e apenas processamento/validacao;
- o servidor calcula colisao, movimento, dano e regras.

Texto conceitual:

> O servidor e autoritativo. Ele valida inputs, simula a partida, calcula dano e decide o estado real da sala.

### Step 4 - STATE DISTRIBUIDO

Agora o servidor envia o estado oficial para todos.

Visual:

- mostrar o trecho:

```js
io.to(room).emit("state")
```

- criar 4 quadrados rosas de `STATE`, um para cada Alma;
- os 4 quadrados ja devem nascer separados no inicio dos seus proprios ramos;
- cada quadrado deve descer direto para sua Alma;
- nao fazer 1 quadrado virar 4 no meio da animacao;
- nao fazer os 4 quadrados irem para o mesmo ponto antes de se separar;
- tambem enviar 1 pacote de state para o Boss, subindo pelo trilho central.

Texto conceitual:

> Depois do tick, o servidor envia uma unica verdade oficial da partida para todos os clientes da sala.

### Step 5 - CLIENTES RENDERIZAM

Todos os clientes renderizam o mesmo estado.

Visual:

- os coracoes das Almas fazem bounce/pulse;
- cards das Almas piscam com flash cyan;
- cada Alma mostra:

```js
render(state)
```

- o Boss tambem deve piscar e pulsar, mostrando que ele recebeu o state;
- olhos do Boss piscam em loop.

Texto conceitual:

> Os clientes nao decidem o resultado. Eles apenas desenham na tela o state oficial recebido do servidor.

## Regras importantes

- A simulacao deve ter 5 steps, nao 6.
- Remova qualquer step de "fila" se existir.
- Evite visual de API comum. O foco e WebSocket realtime.
- Inputs sao azuis e vao de clientes para servidor.
- State e rosa e vai do servidor para os clientes.
- O servidor deve ser o centro autoritativo do fluxo.
- Popups devem ser pequenos, legiveis e presos aos seus elementos.
- Nao sobrepor popup do servidor com texto de processamento.
- Nao usar curvas exageradas; prefira hierarquia com linhas retas.
- Nao usar circulos grandes se o design do site trabalha com quadrados/cards neon.

## Resultado esperado

Ao final, a pessoa deve entender visualmente que:

1. jogadores executam acoes;
2. clientes enviam apenas inputs;
3. o servidor processa tudo no tick;
4. o servidor distribui o state oficial;
5. todos renderizam a mesma partida sincronizada.
