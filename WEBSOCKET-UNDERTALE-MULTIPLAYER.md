# WebSocket e Undertale Multiplayer

Este arquivo explica de forma objetiva como o multiplayer funciona no projeto e por que o WebSocket/Socket.IO e importante para o jogo.

## 1. Ideia do Jogo

O Undertale Multiplayer e uma batalha assimetrica:

- 1 jogador vira o **Boss**.
- 1 a 4 jogadores viram **Almas**.
- O Boss vence se eliminar todas as Almas.
- As Almas vencem se zerarem a vida do Boss.
- A partida acontece em uma sala online com codigo.

Nao existe vitoria por tempo. O resultado depende de HP, dano e sobrevivencia.

## 2. O que e WebSocket

WebSocket e uma conexao aberta entre navegador e servidor.

Em uma API HTTP comum, o navegador pede algo e o servidor responde. Depois disso a conexao termina.

No WebSocket, a conexao fica viva:

```txt
cliente <-> servidor
```

Isso permite enviar eventos em tempo real, como:

- jogador apertou uma tecla;
- Boss atacou;
- Alma usou dash;
- alguem tomou dano;
- estado da sala mudou.

No projeto foi usado **Socket.IO**, que facilita esse realtime em cima de WebSocket e ainda ajuda com salas, eventos e reconexao.

## 3. Por que WebSocket no Jogo

O jogo precisa que todos vejam quase a mesma coisa ao mesmo tempo.

Exemplo:

```txt
Boss aperta Z
-> cliente envia input
-> servidor cria o tiro
-> servidor atualiza a posicao do tiro
-> servidor envia o estado para todos
-> todos renderizam o mesmo tiro
```

Se cada navegador calculasse sozinho, poderiam acontecer diferencas:

- em uma tela a Alma tomou dano;
- em outra tela ela desviou;
- um jogador veria vitoria e outro nao.

Por isso o servidor e **autoritativo**.

## 4. Servidor Autoritativo

O cliente nao decide dano, colisao ou vencedor.

O cliente envia apenas comandos:

```js
socket.emit("utm:input", input);
```

O servidor guarda o estado real:

- salas;
- jogadores;
- Boss;
- Almas;
- HP;
- cooldowns;
- tiros;
- colisao;
- vencedor.

Depois o servidor envia uma copia publica do estado:

```js
io.to(room.id).emit("utm:state", publicState(room));
```

## 5. Fluxo de Sala

1. Um jogador cria a sala.
2. O servidor gera um codigo.
3. Outros jogadores entram pelo codigo.
4. O host inicia.
5. O servidor sorteia quem sera o Boss.
6. Os demais jogadores viram Almas.
7. A partida comeca.

O sorteio evita que a escolha de Boss dependa de disputa manual no lobby.

## 6. Loop do Servidor

O servidor atualiza o jogo 20 vezes por segundo:

```js
const TICK_MS = 1000 / 20;

setInterval(() => {
  rooms.forEach((room) => updateRoom(room, dt));
}, TICK_MS);
```

Cada tick faz:

- ler inputs atuais;
- mover jogadores;
- aplicar cooldowns;
- criar ataques;
- mover projeteis;
- checar colisao;
- aplicar dano;
- verificar vitoria;
- enviar o estado novo para a sala.

20 ticks por segundo e suficiente para um jogo simples e reduz trafego de rede.

## 7. Movimento

O jogador envia direcoes como booleanos:

```js
{
  up: true,
  down: false,
  left: false,
  right: true
}
```

O servidor transforma isso em vetor:

```txt
dx = right - left
dy = down - up
```

Se o jogador anda na diagonal, o vetor e normalizado para nao ficar mais rapido que andar reto.

O personagem tambem guarda a ultima direcao olhada:

```txt
facingX / facingY
```

Essa direcao define para onde os tiros saem.

## 8. Ataques do Boss

O Boss tem tres ataques principais.

### Z - Tiro

Cria um projetil unico na direcao em que o Boss esta olhando:

```txt
posicao inicial: boss.x, boss.y
velocidade: facing * 280
cooldown: 0.42s
```

Trajetoria:

```txt
Boss -> tiro reto -> Alma
```

### X - Leque

Cria varios projeteis em angulos proximos.

O servidor pega a direcao central do Boss e abre um arco:

```txt
angulo central + variacoes pequenas
```

Trajetoria:

```txt
        tiro
Boss -> tiro
        tiro
```

Serve para cobrir area maior, por isso tem cooldown maior.

### C - Ossos

Cria uma parede de ossos vindo de um lado da arena.

O servidor decide se a parede vem na horizontal ou vertical conforme a direcao do Boss:

- olhando para esquerda/direita: ossos cruzam na horizontal;
- olhando para cima/baixo: ossos cruzam na vertical.

A parede deixa um vao perto da posicao da Alma alvo, criando uma rota de desvio.

Trajetoria horizontal:

```txt
ossos -> -> -> arena
```

Trajetoria vertical:

```txt
ossos
  |
  v
arena
```

## 9. Ataques das Almas

As Almas tambem podem atirar.

Ao apertar `Z`, a Alma cria um projetil na ultima direcao olhada:

```txt
posicao inicial: alma + frente
velocidade: facing * 360
dano: 1
cooldown: 0.48s
```

Esse tiro e mais rapido, mas precisa acertar o Boss.

## 10. Dash das Almas

As Almas usam dash para escapar.

O dash:

- aumenta a velocidade por pouco tempo;
- aplica invulnerabilidade curta;
- tem cooldown;
- usa a direcao atual ou a ultima direcao olhada.

Isso deixa o jogador escapar de padroes mais fechados sem ficar invencivel o tempo todo.

## 11. Trajetoria dos Projeteis

Todo projetil possui:

```txt
x, y      posicao
vx, vy    velocidade
r         raio de colisao
ttl       tempo de vida
type      tipo visual
ownerRole quem disparou
```

A cada tick:

```js
bullet.x += bullet.vx * dt;
bullet.y += bullet.vy * dt;
bullet.ttl -= dt;
```

Isso significa que a trajetoria nao e animacao falsa no cliente. Ela nasce no servidor, anda no servidor e depois e enviada para todos.

## 12. Colisao e Dano

A colisao usa distancia entre centro do projetil e centro do alvo:

```txt
distancia <= tamanhoDoAlvo + raioDoProjetil
```

Regras:

- tiro da Alma acerta Boss;
- tiro do Boss acerta Almas;
- Alma invulneravel pelo dash ou dano recente nao toma dano;
- quando HP chega a 0, o servidor decide o vencedor.

O servidor tambem emite um evento de dano:

```js
io.to(room.id).emit("utm:damage", payload);
```

Esse evento faz a animacao de dano aparecer para todos.

## 13. O que o Cliente Faz

O front-end fica responsavel por:

- desenhar a arena com Phaser ou fallback Canvas;
- ler teclado;
- mostrar lobby, HP, cooldowns e mensagens;
- renderizar Boss, Almas e projeteis;
- suavizar movimento visual entre estados recebidos.

O cliente **nao** decide se acertou ou matou.

## 14. Interpolacao de Frames

O servidor envia estado em 20 ticks por segundo. Para o movimento nao parecer travado, o cliente guarda pequenos snapshots dos estados recebidos e desenha cerca de 100ms no passado.

Assim ele consegue interpolar entre dois estados:

```txt
estado A: x 100
estado B: x 130
render:   x 106, 112, 118, 124...
```

Essa interpolacao e segura porque so muda o desenho:

- colisao continua no servidor;
- dano continua no servidor;
- vitoria continua no servidor;
- cliente apenas calcula posicoes intermediarias para renderizar.

Se a distancia entre dois estados for grande demais, o cliente nao interpola e usa a posicao oficial. Isso evita bugs visuais em morte, reinicio, troca de sala ou teleporte.

## 15. Resumo em Uma Linha

O cliente envia input, o servidor simula a partida, calcula trajetorias/colisoes/dano e manda o estado oficial para todos renderizarem sincronizados.
