const fs = require("fs");
const http = require("http");
const path = require("path");

const express = require("express");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT || 3000);
const GROK_MODEL = "x-ai/grok-4-1-fast";

const ROOT_DIR = __dirname;
const CONFIG_FILE = path.join(ROOT_DIR, "config", "chatbot-rules.txt");
const DB_FILE = path.join(ROOT_DIR, "data", "chatbot-state.json");

const DIFFICULTY_VALUES = {
  facil: 1,
  medio: 0.5,
  dificil: 0.08,
};

function readTextFile(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return fallback;
  }
}

function ensureDb() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          dificuldade: "medio",
          winDifficulty: DIFFICULTY_VALUES.medio,
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  }
}

function readDb() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (error) {
    return {
      dificuldade: "medio",
      winDifficulty: DIFFICULTY_VALUES.medio,
      updatedAt: new Date().toISOString(),
    };
  }
}

function updateDifficulty(dificuldade) {
  if (!Object.prototype.hasOwnProperty.call(DIFFICULTY_VALUES, dificuldade)) {
    throw new Error("Dificuldade invalida");
  }

  const state = {
    ...readDb(),
    dificuldade,
    winDifficulty: DIFFICULTY_VALUES[dificuldade],
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  return state;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "-")
    .replace(/&larr;/g, "<-")
    .replace(/&rarr;/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

function getSiteContext() {
  const readme = readTextFile(path.join(ROOT_DIR, "README.md"));
  const index = stripHtml(readTextFile(path.join(ROOT_DIR, "index.html")));
  const css = readTextFile(path.join(ROOT_DIR, "css", "style.css"));
  const colorVars = (css.match(/--[a-z-]+:\s*[^;]+;/g) || [])
    .slice(0, 24)
    .join("\n");

  return [
    "CONTEXTO DO SITE:",
    "Nome: Playground JS, com areas Arcade JS, Casino JS, Projetos Web e Multiplayer.",
    "Multiplayer inclui Undertale Multiplayer com salas via Socket.IO, 1 boss contra 1 a 4 almas.",
    "Resumo extraido do README:",
    readme.slice(0, 5000),
    "Texto extraido da pagina:",
    index.slice(0, 5000),
    "Identidade visual extraida do CSS:",
    colorVars,
  ].join("\n\n");
}

function getRules() {
  return readTextFile(
    CONFIG_FILE,
    "Responda em portugues do Brasil. Seja direto, util e fiel ao funcionamento do site.",
  );
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json({ limit: "1mb" }));

app.get("/api/state", (req, res) => {
  res.json({ state: readDb() });
});

app.get("/api/chat-context", (req, res) => {
  res.json({
    model: GROK_MODEL,
    rules: getRules(),
    siteContext: getSiteContext(),
  });
});

app.post("/api/difficulty", (req, res) => {
  const dificuldade = String(req.body.dificuldade || req.body.difficulty || "")
    .trim()
    .toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(DIFFICULTY_VALUES, dificuldade)) {
    res.status(400).json({ error: "Dificuldade invalida." });
    return;
  }

  const state = updateDifficulty(dificuldade);
  res.json({
    message: `Facilidade alterada para ${dificuldade}`,
    state,
  });
});

app.post("/api/chat", (req, res) => {
  res.status(410).json({
    error: "O chatbot agora usa Grok via Puter.js diretamente no navegador.",
  });
});

/* =====================================================================
   UNDERTALE MULTIPLAYER - servidor autoritativo
   ===================================================================== */
const ARENA = {
  width: 720,
  height: 420,
  bossSize: 28,
  soulSize: 12,
  bossBaseHp: 20,
  bossHpPerSoul: 5,
};
const TICK_MS = 1000 / 20;
const MAX_SOULS = 4;
const SELECTION_MS = 4200;
const SOUL_COLORS = ["#ff4040", "#00f5c4", "#ffee44", "#9d5cff"];
const rooms = new Map();
const socketRooms = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 4; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (rooms.has(code));
  return code;
}

function cleanName(name, fallback) {
  const value = String(name || "").trim().slice(0, 18);
  return value || fallback;
}

function getRoomForSocket(socket) {
  const roomId = socketRooms.get(socket.id);
  return roomId ? rooms.get(roomId) : null;
}

function getBoss(room) {
  return room.bossId ? room.players.get(room.bossId) : null;
}

function getSouls(room) {
  return Array.from(room.players.values()).filter((player) => player.role === "soul");
}

function makePlayer(socket, name) {
  return {
    id: socket.id,
    name: cleanName(name, `Jogador ${socket.id.slice(0, 4)}`),
    role: null,
    connected: true,
    maxHp: 5,
    hp: 5,
    alive: true,
    x: ARENA.width / 2,
    y: ARENA.height - 86,
    vx: 0,
    vy: 0,
    size: ARENA.soulSize,
    input: {},
    dashCooldown: 0,
    dashTimer: 0,
    invuln: 0,
    attackCooldown: 0,
    ringCooldown: 0,
    wallCooldown: 0,
    facingX: 0,
    facingY: -1,
    color: "#ff4040",
  };
}

function resetActorForRole(player, role, index) {
  player.role = role;
  player.maxHp = role === "boss" ? ARENA.bossBaseHp : 5;
  player.hp = player.maxHp;
  player.alive = true;
  player.input = {};
  player.vx = 0;
  player.vy = 0;
  player.dashCooldown = 0;
  player.dashTimer = 0;
  player.invuln = 0;
  player.attackCooldown = 0;
  player.ringCooldown = 0;
  player.wallCooldown = 0;
  player.size = role === "boss" ? ARENA.bossSize : ARENA.soulSize;
  player.facingX = 0;
  player.facingY = role === "boss" ? 1 : -1;
  player.color = role === "boss" ? "#ff4040" : SOUL_COLORS[index % SOUL_COLORS.length];

  if (role === "boss") {
    player.x = ARENA.width / 2;
    player.y = 86;
    return;
  }

  const slots = [
    [ARENA.width / 2 - 54, ARENA.height - 82],
    [ARENA.width / 2 + 54, ARENA.height - 82],
    [ARENA.width / 2 - 108, ARENA.height - 126],
    [ARENA.width / 2 + 108, ARENA.height - 126],
  ];
  const slot = slots[index % slots.length];
  player.x = slot[0];
  player.y = slot[1];
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    role: player.role,
    connected: player.connected,
    hp: player.hp,
    maxHp: player.maxHp,
    alive: player.alive,
    x: Math.round(player.x),
    y: Math.round(player.y),
    vx: Math.round(player.vx),
    vy: Math.round(player.vy),
    size: player.size,
    invuln: Number(player.invuln.toFixed(2)),
    dashCooldown: Number(player.dashCooldown.toFixed(2)),
    attackCooldown: Number(player.attackCooldown.toFixed(2)),
    ringCooldown: Number(player.ringCooldown.toFixed(2)),
    wallCooldown: Number(player.wallCooldown.toFixed(2)),
    facingX: player.facingX,
    facingY: player.facingY,
    color: player.color,
  };
}

function publicSelection(room) {
  if (room.status !== "selecting") return null;
  return {
    selectedBossId: room.selectedBossId,
    startedAt: room.selectionStartedAt,
    durationMs: room.selectionDurationMs,
    order: room.selectionOrder || [],
  };
}

function publicRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    bossId: room.bossId,
    status: room.status,
    winner: room.winner,
    selection: publicSelection(room),
    players: Array.from(room.players.values()).map(publicPlayer),
  };
}

function publicState(room) {
  return {
    roomId: room.id,
    arena: ARENA,
    status: room.status,
    winner: room.winner,
    selection: publicSelection(room),
    boss: getBoss(room) ? publicPlayer(getBoss(room)) : null,
    souls: getSouls(room).map(publicPlayer),
    bullets: room.bullets.map((bullet) => ({
      id: bullet.id,
      x: Math.round(bullet.x),
      y: Math.round(bullet.y),
      r: bullet.r,
      color: bullet.color,
      type: bullet.type,
      ownerId: bullet.ownerId,
      ownerRole: bullet.ownerRole,
    })),
  };
}

function emitRoom(room) {
  io.to(room.id).emit("utm:room", publicRoom(room));
}

function emitState(room) {
  io.to(room.id).emit("utm:state", publicState(room));
}

function emitDamage(room, target, amount) {
  if (!room || !target) return;
  io.to(room.id).emit("utm:damage", {
    targetId: target.id,
    targetRole: target.role,
    amount,
    hp: target.hp,
    maxHp: target.maxHp,
    x: Math.round(target.x),
    y: Math.round(target.y),
    color: target.color,
    at: Date.now(),
  });
}

function createRoom(socket, payload = {}) {
  leaveRoom(socket);

  const id = randomCode();
  const room = {
    id,
    hostId: socket.id,
    bossId: null,
    players: new Map(),
    bullets: [],
    status: "lobby",
    winner: null,
    startedAt: 0,
    lastTickAt: Date.now(),
    nextBulletId: 1,
    idleSince: null,
    selectedBossId: null,
    selectionStartedAt: 0,
    selectionDurationMs: SELECTION_MS,
    selectionOrder: [],
    selectionTimer: null,
  };
  rooms.set(id, room);
  joinExistingRoom(socket, id, payload);
}

function joinExistingRoom(socket, roomId, payload = {}) {
  const normalizedId = String(roomId || payload.roomId || "").trim().toUpperCase();
  const room = rooms.get(normalizedId);

  if (!room) {
    socket.emit("utm:error", { message: "Sala nao encontrada." });
    return;
  }

  if (!room.players.has(socket.id)) {
    if (room.status !== "lobby") {
      socket.emit("utm:error", { message: "Partida em andamento. Aguarde a proxima sala." });
      return;
    }
    leaveRoom(socket);
    socket.join(room.id);
    socketRooms.set(socket.id, room.id);
    room.players.set(socket.id, makePlayer(socket, payload.name));
  }

  room.idleSince = null;
  socket.emit("utm:joined", { roomId: room.id, selfId: socket.id });
  emitRoom(room);
  emitState(room);
}

function chooseRole(socket, role) {
  const room = getRoomForSocket(socket);
  const player = room ? room.players.get(socket.id) : null;
  if (!room || !player) {
    socket.emit("utm:error", { message: "Entre em uma sala primeiro." });
    return;
  }
  if (room.status === "playing") {
    socket.emit("utm:error", { message: "Nao e possivel trocar funcao durante a partida." });
    return;
  }
  socket.emit("utm:error", { message: "Boss e Almas agora sao sorteados quando o host inicia." });
}

function clearSelection(room) {
  if (room.selectionTimer) clearTimeout(room.selectionTimer);
  room.selectionTimer = null;
  room.selectedBossId = null;
  room.selectionStartedAt = 0;
  room.selectionDurationMs = SELECTION_MS;
  room.selectionOrder = [];
}

function assignMatchRoles(room, bossId) {
  const players = Array.from(room.players.values());
  room.bossId = bossId;

  let soulIndex = 0;
  players.forEach((player) => {
    if (player.id === bossId) {
      resetActorForRole(player, "boss", 0);
    } else {
      resetActorForRole(player, "soul", soulIndex);
      soulIndex += 1;
    }
  });

  const boss = getBoss(room);
  if (boss) {
    boss.maxHp = ARENA.bossBaseHp + soulIndex * ARENA.bossHpPerSoul;
    boss.hp = boss.maxHp;
  }
}

function beginSelectedMatch(roomId, bossId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== "selecting") return;
  if (!room.players.has(bossId) || room.players.size < 2) {
    clearSelection(room);
    room.status = "lobby";
    room.winner = null;
    room.bossId = null;
    Array.from(room.players.values()).forEach((player) => {
      player.role = null;
      player.input = {};
    });
    emitRoom(room);
    emitState(room);
    return;
  }

  assignMatchRoles(room, bossId);
  clearSelection(room);
  room.status = "playing";
  room.winner = null;
  room.startedAt = Date.now();
  room.lastTickAt = Date.now();
  room.bullets = [];
  room.nextBulletId = 1;

  emitRoom(room);
  emitState(room);
}

function startRoom(socket) {
  const room = getRoomForSocket(socket);
  if (!room) {
    socket.emit("utm:error", { message: "Crie ou entre em uma sala." });
    return;
  }
  if (room.hostId !== socket.id) {
    socket.emit("utm:error", { message: "Apenas o host pode iniciar." });
    return;
  }
  if (room.status === "selecting") {
    socket.emit("utm:error", { message: "Sorteio ja em andamento." });
    return;
  }

  const players = Array.from(room.players.values());
  if (players.length < 2) {
    socket.emit("utm:error", { message: "Precisa de pelo menos 2 jogadores para sortear o Boss." });
    return;
  }

  clearSelection(room);
  room.status = "selecting";
  room.winner = null;
  room.bossId = null;
  room.selectedBossId = players[Math.floor(Math.random() * players.length)].id;
  room.selectionStartedAt = Date.now();
  room.selectionDurationMs = SELECTION_MS;
  room.selectionOrder = players.map((player) => ({
    id: player.id,
    name: player.name,
    host: player.id === room.hostId,
  }));
  room.lastTickAt = Date.now();
  room.bullets = [];
  room.nextBulletId = 1;
  players.forEach((player) => {
    player.role = null;
    player.input = {};
  });
  room.selectionTimer = setTimeout(() => beginSelectedMatch(room.id, room.selectedBossId), SELECTION_MS);

  emitRoom(room);
  emitState(room);
}

function leaveRoom(socket) {
  const roomId = socketRooms.get(socket.id);
  if (!roomId) return;

  const room = rooms.get(roomId);
  socketRooms.delete(socket.id);
  socket.leave(roomId);
  if (!room) return;

  const player = room.players.get(socket.id);
  room.players.delete(socket.id);

  if (room.bossId === socket.id) {
    room.bossId = null;
    if (room.status === "playing") finishRoom(room, "souls");
  } else if (player && player.role === "soul" && room.status === "playing") {
    const livingSouls = getSouls(room).filter((soul) => soul.alive);
    if (!livingSouls.length) finishRoom(room, "boss");
  }

  if (room.hostId === socket.id) {
    const nextHost = room.players.keys().next().value;
    room.hostId = nextHost || null;
  }

  if (room.status === "selecting") {
    clearSelection(room);
    room.status = "lobby";
    room.winner = null;
    room.bossId = null;
    Array.from(room.players.values()).forEach((currentPlayer) => {
      currentPlayer.role = null;
      currentPlayer.input = {};
    });
  }

  if (!room.players.size) {
    clearSelection(room);
    room.idleSince = Date.now();
    setTimeout(() => {
      const current = rooms.get(roomId);
      if (current && !current.players.size && current.idleSince) {
        rooms.delete(roomId);
      }
    }, 30_000);
    return;
  }

  emitRoom(room);
  emitState(room);
}

function sanitizeInput(input) {
  input = input || {};
  return {
    up: Boolean(input.up),
    down: Boolean(input.down),
    left: Boolean(input.left),
    right: Boolean(input.right),
    dash: Boolean(input.dash),
    attack: Boolean(input.attack),
    pattern1: Boolean(input.pattern1),
    pattern2: Boolean(input.pattern2),
  };
}

function moveActor(actor, dt, baseSpeed) {
  const input = actor.input || {};
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const inputLen = Math.hypot(dx, dy);
  if (inputLen) {
    dx /= inputLen;
    dy /= inputLen;
  }

  if (dx || dy) {
    actor.facingX = dx;
    actor.facingY = dy;
  }

  const accel = actor.role === "boss" ? baseSpeed * 7.2 : baseSpeed * 8.4;
  const friction = Math.pow(inputLen ? 0.955 : 0.78, dt * 60);

  if (actor.role === "soul" && input.dash && actor.dashCooldown <= 0) {
    actor.dashTimer = 0.16;
    actor.dashCooldown = 1.1;
    actor.invuln = Math.max(actor.invuln, 0.22);
    const dashX = dx || actor.facingX || 0;
    const dashY = dy || actor.facingY || -1;
    const dashLen = Math.hypot(dashX, dashY) || 1;
    actor.vx += (dashX / dashLen) * 300;
    actor.vy += (dashY / dashLen) * 300;
  }

  const dashActive = actor.role === "soul" && actor.dashTimer > 0;
  const maxSpeed = dashActive ? 430 : baseSpeed;
  actor.vx = (actor.vx || 0) * friction + dx * accel * dt;
  actor.vy = (actor.vy || 0) * friction + dy * accel * dt;

  const velocityLen = Math.hypot(actor.vx, actor.vy);
  if (velocityLen > maxSpeed) {
    actor.vx = (actor.vx / velocityLen) * maxSpeed;
    actor.vy = (actor.vy / velocityLen) * maxSpeed;
  }

  actor.x = clamp(actor.x + actor.vx * dt, actor.size + 8, ARENA.width - actor.size - 8);
  actor.y = clamp(actor.y + actor.vy * dt, actor.size + 8, ARENA.height - actor.size - 8);

  if (actor.x <= actor.size + 8 || actor.x >= ARENA.width - actor.size - 8) actor.vx *= -0.18;
  if (actor.y <= actor.size + 8 || actor.y >= ARENA.height - actor.size - 8) actor.vy *= -0.18;

  if (Math.abs(actor.vx) < 2 && !inputLen) actor.vx = 0;
  if (Math.abs(actor.vy) < 2 && !inputLen) actor.vy = 0;
}

function nearestLivingSoul(room, boss) {
  const souls = getSouls(room).filter((soul) => soul.alive);
  souls.sort((a, b) => Math.hypot(a.x - boss.x, a.y - boss.y) - Math.hypot(b.x - boss.x, b.y - boss.y));
  return souls[0] || null;
}

function addBullet(room, bullet) {
  room.bullets.push({
    id: room.nextBulletId++,
    ttl: 5,
    r: 7,
    color: "#ff8844",
    type: "fire",
    ...bullet,
  });
}

function resolveAimVector(actor, fallbackTarget) {
  let dx = actor.facingX || 0;
  let dy = actor.facingY || 0;
  if (!dx && !dy) dy = 1;
  const len = Math.hypot(dx, dy) || 1;
  return { dx: dx / len, dy: dy / len };
}

function spawnAimedShot(room, boss) {
  const aim = resolveAimVector(boss, nearestLivingSoul(room, boss));
  addBullet(room, {
    x: boss.x,
    y: boss.y,
    vx: aim.dx * 280,
    vy: aim.dy * 280,
    r: 8,
    ttl: 4.5,
    color: "#ff8844",
    type: "fire",
  });
}

function spawnSpread(room, boss) {
  const aim = resolveAimVector(boss, nearestLivingSoul(room, boss));
  const center = Math.atan2(aim.dy, aim.dx);
  for (let i = -3; i <= 3; i++) {
    const angle = center + i * 0.22;
    addBullet(room, {
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 210,
      vy: Math.sin(angle) * 210,
      r: 6,
      ttl: 4,
      color: i % 2 ? "#ff4040" : "#ffee44",
      type: "spread",
    });
  }
}

function spawnBoneWall(room, boss) {
  const target = nearestLivingSoul(room, boss);
  const aim = resolveAimVector(boss, target);
  const horizontal = Math.abs(aim.dx) >= Math.abs(aim.dy);
  const gap = target
    ? horizontal
      ? target.y
      : target.x
    : horizontal
      ? ARENA.height / 2
      : ARENA.width / 2;

  if (horizontal) {
    const fromLeft = aim.dx >= 0;
    const x = fromLeft ? -20 : ARENA.width + 20;
    const vx = fromLeft ? 230 : -230;
    for (let y = 36; y <= ARENA.height - 36; y += 30) {
      if (Math.abs(y - gap) < 54) continue;
      addBullet(room, {
        x,
        y,
        vx,
        vy: 0,
        r: 11,
        ttl: 4.8,
        color: "#e9e9d8",
        type: "bone",
      });
    }
    return;
  }

  const fromTop = aim.dy >= 0;
  const y = fromTop ? -20 : ARENA.height + 20;
  const vy = fromTop ? 230 : -230;
  for (let x = 36; x <= ARENA.width - 36; x += 30) {
    if (Math.abs(x - gap) < 54) continue;
    addBullet(room, {
      x,
      y,
      vx: 0,
      vy,
      r: 11,
      ttl: 4.8,
      color: "#e9e9d8",
      type: "bone",
    });
  }
}

function spawnSoulShot(room, soul) {
  const aim = resolveAimVector(soul, getBoss(room));
  addBullet(room, {
    x: soul.x + aim.dx * (soul.size + 6),
    y: soul.y + aim.dy * (soul.size + 6),
    vx: aim.dx * 360,
    vy: aim.dy * 360,
    r: 6,
    ttl: 1.9,
    color: soul.color || "#00f5c4",
    type: "soul-shot",
    ownerId: soul.id,
    ownerRole: "soul",
    damage: 1,
  });
}

function applySoulAttacks(room, boss, souls) {
  souls.forEach((soul) => {
    if (!soul.alive || !soul.input.attack || soul.attackCooldown > 0) return;
    soul.attackCooldown = 0.48;
    spawnSoulShot(room, soul);
  });
}

function updateCooldowns(player, dt) {
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.dashTimer = Math.max(0, player.dashTimer - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.ringCooldown = Math.max(0, player.ringCooldown - dt);
  player.wallCooldown = Math.max(0, player.wallCooldown - dt);
}

function finishRoom(room, winner) {
  if (room.status !== "playing") return;
  room.status = "ended";
  room.winner = winner;
  room.bullets = [];
  Array.from(room.players.values()).forEach((player) => {
    player.input = {};
  });
  emitRoom(room);
  emitState(room);
}

function updateRoom(room, dt) {
  if (room.status !== "playing") return;

  const boss = getBoss(room);
  const souls = getSouls(room);
  if (!boss) {
    finishRoom(room, "souls");
    return;
  }
  if (!souls.length) {
    finishRoom(room, "boss");
    return;
  }

  updateCooldowns(boss, dt);
  moveActor(boss, dt, 150);

  if (boss.input.attack && boss.attackCooldown <= 0) {
    spawnAimedShot(room, boss);
    boss.attackCooldown = 0.42;
  }
  if (boss.input.pattern1 && boss.ringCooldown <= 0) {
    spawnSpread(room, boss);
    boss.ringCooldown = 2.2;
  }
  if (boss.input.pattern2 && boss.wallCooldown <= 0) {
    spawnBoneWall(room, boss);
    boss.wallCooldown = 3.1;
  }

  souls.forEach((soul) => {
    updateCooldowns(soul, dt);
    if (soul.alive) moveActor(soul, dt, 190);
  });

  applySoulAttacks(room, boss, souls);
  if (room.status !== "playing") return;

  room.bullets = room.bullets
    .map((bullet) => ({
      ...bullet,
      x: bullet.x + bullet.vx * dt,
      y: bullet.y + bullet.vy * dt,
      ttl: bullet.ttl - dt,
    }))
    .filter(
      (bullet) =>
        bullet.ttl > 0 &&
        bullet.x > -80 &&
        bullet.x < ARENA.width + 80 &&
        bullet.y > -80 &&
        bullet.y < ARENA.height + 80,
    );

  const remainingBullets = [];
  for (const bullet of room.bullets) {
    if (bullet.ownerRole === "soul") {
      const distance = Math.hypot(boss.x - bullet.x, boss.y - bullet.y);
      if (distance <= boss.size + bullet.r) {
        const damage = bullet.damage || 1;
        boss.hp = Math.max(0, boss.hp - damage);
        emitDamage(room, boss, damage);
        continue;
      }
    }
    remainingBullets.push(bullet);
  }
  room.bullets = remainingBullets;

  if (boss.hp <= 0) {
    finishRoom(room, "souls");
    return;
  }

  souls.forEach((soul) => {
    if (!soul.alive || soul.invuln > 0) return;
    for (const bullet of room.bullets) {
      if (bullet.ownerRole === "soul") continue;
      const distance = Math.hypot(soul.x - bullet.x, soul.y - bullet.y);
      if (distance <= soul.size + bullet.r) {
        soul.hp -= 1;
        soul.invuln = 0.8;
        if (soul.hp <= 0) {
          soul.hp = 0;
          soul.alive = false;
        }
        emitDamage(room, soul, 1);
        break;
      }
    }
  });

  if (!souls.some((soul) => soul.alive)) {
    finishRoom(room, "boss");
    return;
  }

  emitState(room);
}

setInterval(() => {
  const now = Date.now();
  rooms.forEach((room) => {
    const dt = Math.min(0.1, Math.max(0.001, (now - room.lastTickAt) / 1000));
    room.lastTickAt = now;
    updateRoom(room, dt);
  });
}, TICK_MS);

io.on("connection", (socket) => {
  socket.emit("utm:hello", { selfId: socket.id });

  socket.on("utm:create-room", (payload) => createRoom(socket, payload));
  socket.on("utm:join-room", (payload) => joinExistingRoom(socket, payload && payload.roomId, payload));
  socket.on("utm:choose-role", (payload) => chooseRole(socket, payload && payload.role));
  socket.on("utm:start-game", () => startRoom(socket));

  socket.on("utm:set-name", (payload) => {
    const room = getRoomForSocket(socket);
    const player = room ? room.players.get(socket.id) : null;
    if (!room || !player) return;
    player.name = cleanName(payload && payload.name, player.name);
    emitRoom(room);
    emitState(room);
  });

  socket.on("utm:input", (payload) => {
    const room = getRoomForSocket(socket);
    const player = room ? room.players.get(socket.id) : null;
    if (!room || !player || room.status !== "playing") return;
    player.input = sanitizeInput(payload);
  });

  socket.on("utm:leave-room", () => leaveRoom(socket));
  socket.on("disconnect", () => leaveRoom(socket));
});

app.use("/vendor/phaser", express.static(path.join(ROOT_DIR, "node_modules", "phaser", "dist")));
app.use(express.static(ROOT_DIR));

app.use((req, res) => {
  res.status(404).type("text/plain; charset=utf-8").send("Arquivo nao encontrado");
});

ensureDb();

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
