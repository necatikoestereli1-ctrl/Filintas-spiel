"use strict";
const W = 800, H = 450, GY = 380;
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const INK = "#111";

// ---------- Eingabe ----------
const keys = {};
const touch = {};
const KEYMAP = {
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
  KeyJ: "attack", KeyF: "attack", KeyK: "special", KeyG: "special",
  KeyL: "block", KeyS: "block", ArrowDown: "block", KeyH: "block",
};
addEventListener("keydown", e => {
  initAudio();
  if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.code === "Enter") confirmKey();
  if (scene === "select") {
    if (e.code === "ArrowLeft") cursor = (cursor + FRIENDS.length - 1) % FRIENDS.length;
    if (e.code === "ArrowRight") cursor = (cursor + 1) % FRIENDS.length;
    if (e.code === "Digit1") level = 0;
    if (e.code === "Digit2") level = 1;
    if (e.code === "Digit3") level = 2;
  }
});
addEventListener("keyup", e => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
document.querySelectorAll("#pad button").forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); initAudio(); touch[k] = true; b.classList.add("on"); };
  const off = e => { e.preventDefault(); touch[k] = false; b.classList.remove("on"); };
  b.addEventListener("pointerdown", on);
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => b.addEventListener(ev, off));
});
function playerInput() {
  const g = k => !!(keys[k] || touch[k]);
  return { left: g("left"), right: g("right"), jump: g("jump"), attack: g("attack"), special: g("special"), block: g("block") };
}

// ---------- Sound ----------
let actx = null;
function initAudio() {
  if (actx) return;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
}
function beep(freq, dur, type = "square", vol = 0.06, slide = 0) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), actx.currentTime + dur);
  g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
}
const sfx = {
  hit: () => beep(180, 0.12, "sawtooth", 0.08, -100),
  block: () => beep(400, 0.06, "square", 0.05),
  swing: () => beep(500, 0.08, "triangle", 0.04, -250),
  special: () => { beep(300, 0.25, "square", 0.06, 500); },
  ko: () => beep(400, 0.8, "sawtooth", 0.08, -350),
  win: () => { beep(523, 0.15); setTimeout(() => beep(659, 0.15), 150); setTimeout(() => beep(784, 0.3), 300); },
};

// ---------- Bilder ----------
FRIENDS.forEach(f => {
  f.img = new Image();
  f.img.onload = () => { f.imgOk = true; };
  f.img.src = f.photo;
});

// ---------- Hintergrund ----------
const bg = document.createElement("canvas");
bg.width = W; bg.height = H;
(function () {
  const g = bg.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, GY);
  grad.addColorStop(0, "#ffe66d"); grad.addColorStop(1, "#ff9a5c");
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // Strahlen
  g.save(); g.translate(W / 2, GY - 120);
  for (let i = 0; i < 24; i++) {
    g.rotate(Math.PI * 2 / 24);
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0)";
    g.beginPath(); g.moveTo(0, 0); g.lineTo(900, -40); g.lineTo(900, 40); g.fill();
  }
  g.restore();
  // Halftone
  g.fillStyle = "rgba(200,40,40,0.22)";
  for (let y = 0; y < GY; y += 14) for (let x = (y / 14 % 2) * 7; x < W; x += 14) {
    const r = 1 + (y / GY) * 3.2;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  // Skyline
  g.fillStyle = "rgba(60,30,80,0.55)"; g.strokeStyle = INK; g.lineWidth = 3;
  const hs = [90, 140, 70, 170, 110, 150, 80, 130, 100, 160];
  hs.forEach((h, i) => { g.fillRect(i * 85 - 10, GY - h, 70, h); g.strokeRect(i * 85 - 10, GY - h, 70, h); });
  // Boden
  g.fillStyle = "#3d2c4d"; g.fillRect(0, GY, W, H - GY);
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, GY); g.lineTo(W, GY); g.stroke();
  g.strokeStyle = "rgba(255,255,255,0.15)"; g.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - 30 + (x - W / 2) * 0.2, H); g.stroke(); }
})();

// ---------- Hilfsfunktionen ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function outlinedText(txt, x, y, size, fill = "#fff", stroke = INK, lw = 6) {
  ctx.font = `bold ${size}px "Comic Sans MS", "Chalkboard SE", system-ui, sans-serif`;
  ctx.lineJoin = "round"; ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function burst(x, y, r, fill) {
  ctx.beginPath();
  const n = 12;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.65 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
}
function limb(x1, y1, x2, y2, w, col) {
  ctx.lineCap = "round";
  ctx.strokeStyle = INK; ctx.lineWidth = w + 6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

// ---------- Kämpfer ----------
const REACH = 78;
class Fighter {
  constructor(def, x, facing, isCPU) {
    this.def = def; this.cpu = isCPU;
    this.x = x; this.y = GY; this.vx = 0; this.vy = 0; this.facing = facing;
    this.maxHp = def.hp; this.hp = def.hp; this.meter = 0;
    this.atk = 0; this.atkHit = true; this.stun = 0; this.sp = 0; this.spHit = true; this.spTick = 0;
    this.blocking = false; this.walkT = 0; this.bubble = null; this.slam = false;
    this.wins = 0; this.ai = { t: 0, inp: {} };
  }
  get onGround() { return this.y >= GY; }
  say(txt, t = 1.3) { this.bubble = { txt, t }; }
  update(dt, inp, foe) {
    this.atk = Math.max(0, this.atk - dt);
    this.stun = Math.max(0, this.stun - dt);
    if (this.bubble && (this.bubble.t -= dt) <= 0) this.bubble = null;
    const spActive = this.sp > 0;
    if (spActive) this.sp -= dt;

    if (this.stun > 0) {
      this.blocking = false;
      this.vx *= Math.pow(0.002, dt);
    } else {
      this.blocking = inp.block && this.onGround && !spActive;
      if (!spActive) this.facing = foe.x >= this.x ? 1 : -1;
      if (!spActive) {
        const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
        this.vx = this.blocking ? 0 : dir * 230 * this.def.speed;
        if (dir && this.onGround) this.walkT += dt;
        if (inp.jump && this.onGround && !this.blocking) { this.vy = -640; sfx.swing(); }
        if (inp.attack && this.atk <= 0 && !this.blocking) {
          this.atk = 0.32; this.atkHit = false; sfx.swing();
        }
        if (inp.special && this.meter >= 100 && this.atk <= 0 && !this.blocking) this.startSpecial(foe);
      }
    }

    // Physik
    this.vy += 1700 * dt;
    this.x = clamp(this.x + this.vx * dt, 40, W - 40);
    this.y += this.vy * dt;
    if (this.y >= GY) {
      if (this.slam) { this.slam = false; this.shockwave(foe); }
      this.y = GY; this.vy = 0;
    }

    // normaler Treffer
    if (!this.atkHit && this.atk < 0.2 && this.atk > 0) {
      this.atkHit = true;
      if (this.inReach(foe, REACH)) this.hurt(foe, 7 * this.def.power, 260, "POW!");
    }

    // Spezial
    if (spActive) this.specialTick(dt, foe);
  }
  inReach(foe, r) { return Math.abs(foe.x - this.x) < r && Math.abs(foe.y - this.y) < 80; }
  startSpecial(foe) {
    const s = this.def.special;
    this.meter = 0; this.spHit = false; this.spTick = 0;
    this.say(s.shout, 1.2); sfx.special();
    if (s.type === "projectile") {
      this.sp = 0.35;
      projectiles.push({ x: this.x + this.facing * 40, y: this.y - 80, vx: this.facing * 520, owner: this, icon: s.icon, dmg: 14 * this.def.power, rot: 0 });
    } else if (s.type === "butt") {
      this.sp = 0.5; this.vx = this.facing * 560;
    } else if (s.type === "kick") {
      this.sp = 0.55; this.vx = this.facing * 520; this.vy = -330;
    } else if (s.type === "combo") {
      this.sp = 0.85; this.vx = 0; this.spTick = 0.1;
    }
  }
  specialTick(dt, foe) {
    const t = this.def.special.type;
    if (t === "projectile") return;
    if (t === "butt" || t === "kick") {
      if (!this.spHit && this.inReach(foe, 70)) {
        this.spHit = true;
        this.hurt(foe, (t === "butt" ? 18 : 17) * this.def.power, 520, t === "butt" ? "BOOOM!" : "WHAM!", true);
      }
      if (this.sp <= 0) this.vx = 0;
    } else if (t === "combo") {
      this.spTick -= dt;
      if (this.spTick <= 0 && this.sp > 0.05) {
        this.spTick = 0.17;
        this.facing = foe.x >= this.x ? 1 : -1;
        if (this.inReach(foe, 85)) this.hurt(foe, 5 * this.def.power, 90, pick(["PAF!", "BAM!", "PENG!"]), false, true);
      }
    }
  }
  shockwave(foe) {}
  hurt(foe, dmg, kb, label, strong = false, quiet = false) {
    const dir = foe.x >= this.x ? 1 : -1;
    if (foe.blocking && foe.facing === -dir) {
      dmg *= 0.15; kb *= 0.2;
      foe.stun = 0.08; foe.vx = dir * kb; foe.meter = Math.min(100, foe.meter + 3);
      fx.push({ x: foe.x - foe.facing * -20, y: foe.y - 90, t: 0.4, txt: "BLOCK", col: "#9be7ff" });
      sfx.block();
    } else {
      foe.stun = strong ? 0.45 : 0.28; foe.vx = dir * kb;
      if (strong || foe.onGround) foe.vy = strong ? -280 : -140;
      foe.sp = 0; foe.atk = 0; foe.slam = false;
      this.meter = Math.min(100, this.meter + 11);
      foe.meter = Math.min(100, foe.meter + 6);
      fx.push({ x: foe.x, y: foe.y - 100, t: 0.5, txt: label, col: strong ? "#ff5252" : "#fff35c" });
      shake = Math.max(shake, strong ? 10 : 4);
      sfx.hit();
      if (!quiet && Math.random() < 0.28 && !foe.bubble) foe.say(pick(foe.def.quips));
    }
    foe.hp = Math.max(0, foe.hp - dmg);
  }

  // ----- Zeichnen -----
  draw() {
    const d = this.def, s = d.special.type, f = this.facing;
    ctx.save();
    // Schatten
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    const sh = clamp(1 - (GY - this.y) / 300, 0.3, 1);
    ctx.beginPath(); ctx.ellipse(this.x, GY + 4, 42 * sh, 9 * sh, 0, 0, 7); ctx.fill();

    ctx.translate(this.x, this.y);
    ctx.scale(f, 1);
    if (this.stun > 0) { ctx.rotate(-0.18); if (Math.floor(this.stun * 30) % 2) ctx.globalAlpha = 0.75; }
    const bob = this.onGround && Math.abs(this.vx) < 5 ? Math.sin(performance.now() / 180) * 2 : 0;
    ctx.translate(0, bob);

    // Beine
    const sw = this.onGround ? Math.sin(this.walkT * 14) * 14 : 10;
    const kicking = s === "kick" && this.sp > 0;
    limb(-8, -48, -12 - sw, -4, 11, "#2b2b3a");
    if (kicking) limb(8, -48, 72, -62, 11, "#2b2b3a");
    else limb(8, -48, 12 + sw, -4, 11, "#2b2b3a");
    // Schuhe
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    if (!kicking) { ctx.beginPath(); ctx.ellipse(12 + sw + 5, -2, 12, 6, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(-12 - sw + 5, -2, 12, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
    if (kicking) { ctx.beginPath(); ctx.ellipse(76, -64, 13, 8, -0.3, 0, 7); ctx.fill(); ctx.stroke(); }

    // Hintere Hand
    limb(-14, -86, -28, -62 + Math.sin(performance.now() / 200) * 2, 9, d.color);

    // Körper
    ctx.fillStyle = d.color; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-22, -98, 44, 56, 12); ctx.fill(); ctx.stroke();

    // Arsch-Attacke
    if (s === "butt" && this.sp > 0) {
      ctx.font = "56px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(d.special.icon, -34, -52);
    }

    // Kopf mit Foto
    const hx = 0, hy = -132, hr = 40;
    ctx.save();
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.closePath();
    ctx.fillStyle = "#f2c9a0"; ctx.fill();
    ctx.clip();
    if (d.imgOk) ctx.drawImage(d.img, hx - hr, hy - hr, hr * 2, hr * 2);
    ctx.restore();
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.stroke();
    // Schmerz-Gesicht
    if (this.stun > 0) {
      ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-20, -158); ctx.lineTo(-6, -151); ctx.moveTo(20, -158); ctx.lineTo(6, -151); ctx.stroke();
    }

    // Vordere Hand
    const gl = d.color;
    if (this.blocking) {
      limb(14, -88, 30, -112, 10, gl); limb(30, -112, 24, -132, 10, gl);
      ctx.fillStyle = "rgba(120,220,255,0.35)"; ctx.strokeStyle = "#9be7ff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(34, -100, 52, -1.2, 1.2); ctx.stroke();
    } else if (s === "combo" && this.sp > 0) {
      const a = Math.floor(this.sp * 12) % 2;
      limb(14, -90, 66, -96 + a * 14, 10, gl); fist(70, -96 + a * 14, gl);
      limb(-10, -90, 60, -80 - a * 14, 10, gl); fist(64, -80 - a * 14, gl);
    } else if (this.atk > 0) {
      const p = Math.sin((1 - this.atk / 0.32) * Math.PI);
      limb(14, -90, 14 + 52 * p, -90 - 4 * p, 10, gl); fist(18 + 52 * p, -90 - 4 * p, gl);
    } else if (this.sp > 0 && s === "projectile") {
      limb(14, -90, 48, -100, 10, gl); fist(52, -100, gl);
    } else {
      limb(14, -88, 30, -64 + bob, 10, gl); fist(32, -62 + bob, gl);
    }
    ctx.restore();

    // Sprechblase
    if (this.bubble) this.drawBubble();
  }
  drawBubble() {
    const txt = this.bubble.txt;
    ctx.font = 'bold 16px "Comic Sans MS", system-ui, sans-serif';
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const w = ctx.measureText(txt).width + 24, h = 32;
    const bx = clamp(this.x, w / 2 + 6, W - w / 2 - 6), by = this.y - 230;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(bx - w / 2, by - h, w, h, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.x - 8, by - 1); ctx.lineTo(this.x, by + 14); ctx.lineTo(this.x + 8, by - 1);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(this.x - 7, by - 4, 14, 5);
    ctx.fillStyle = INK; ctx.fillText(txt, bx, by - 10);
  }
}
function fist(x, y, col) {
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.stroke();
}

// ---------- KI ----------
const LEVELS = [
  { name: "LEICHT", think: 0.45, atk: 0.35, block: 0.12, special: 0.4 },
  { name: "NORMAL", think: 0.25, atk: 0.55, block: 0.3, special: 0.7 },
  { name: "SCHWER", think: 0.12, atk: 0.75, block: 0.5, special: 0.95 },
];
function cpuInput(f, foe, dt) {
  const L = LEVELS[level], a = f.ai;
  a.t -= dt;
  const inp = a.inp;
  inp.jump = false; inp.attack = false; inp.special = false;
  if (a.t > 0) return inp;
  a.t = L.think * rnd(0.6, 1.4);
  const dist = Math.abs(foe.x - f.x), dir = foe.x > f.x ? 1 : -1;
  inp.left = inp.right = inp.block = false;
  const st = f.def.special.type;
  if (f.meter >= 100 && Math.random() < L.special) {
    const ok = st === "projectile" ? dist > 160 : dist < 280 && dist > 70;
    if (ok) { inp.special = true; return inp; }
  }
  if (foe.atk > 0.1 && dist < 130 && Math.random() < L.block) { inp.block = true; a.t = 0.3; return inp; }
  if (dist > 85) {
    if (dir > 0) inp.right = true; else inp.left = true;
    if (Math.random() < 0.08) inp.jump = true;
  } else {
    if (Math.random() < L.atk) inp.attack = true;
    else if (Math.random() < 0.3) { if (dir > 0) inp.left = true; else inp.right = true; }
  }
  return inp;
}

// ---------- Spielzustand ----------
let scene = "select";        // select | fight
let phase = "intro";         // intro | fight | ko | end
let cursor = 0, level = 1;
let p1, p2, round = 1, timer = 60, phaseT = 0, banner = "", resultText = "";
let fx = [], projectiles = [], shake = 0;

function startMatch(idx) {
  const cpuIdx = pick(FRIENDS.map((_, i) => i).filter(i => i !== idx));
  p1 = new Fighter(FRIENDS[idx], 220, 1, false);
  p2 = new Fighter(FRIENDS[cpuIdx], 580, -1, true);
  round = 1; scene = "fight"; startRound();
}
function startRound() {
  for (const [f, x, d] of [[p1, 220, 1], [p2, 580, -1]]) {
    f.x = x; f.y = GY; f.vx = f.vy = 0; f.facing = d; f.hp = f.maxHp; f.meter = 0;
    f.atk = f.stun = f.sp = 0; f.bubble = null; f.slam = false; f.blocking = false;
  }
  fx = []; projectiles = []; timer = 60; phase = "intro"; phaseT = 1.6;
  banner = "RUNDE " + round;
}
function confirmKey() {
  if (scene === "select") startMatch(cursor);
  else if (phase === "end") { scene = "select"; }
}
function endRound(winner) {
  phase = "ko"; phaseT = 2.2;
  if (winner) { winner.wins++; banner = winner === p1 ? "K.O.! DU!" : "K.O.! " + winner.def.name.toUpperCase() + "!"; winner.say(pick(winner.def.quips), 2); }
  else banner = "UNENTSCHIEDEN";
  sfx.ko();
}

function updateFight(dt) {
  phaseT -= dt;
  if (phase === "intro") {
    if (phaseT <= 0) { phase = "fight"; banner = "FIGHT!"; phaseT = 0.8; }
    p1.update(dt, {}, p2); p2.update(dt, {}, p1);
    return;
  }
  if (phase === "fight") {
    if (phaseT <= 0) banner = "";
    timer -= dt;
    p1.update(dt, playerInput(), p2);
    p2.update(dt, cpuInput(p2, p1, dt), p1);
    // Projektile
    for (const pr of projectiles) {
      pr.x += pr.vx * dt; pr.rot += dt * 12;
      const foe = pr.owner === p1 ? p2 : p1;
      if (!pr.dead && Math.abs(pr.x - foe.x) < 34 && Math.abs(pr.y - (foe.y - 80)) < 70) {
        pr.dead = true; pr.owner.hurt(foe, pr.dmg, 380, "KA-CHING!", true);
      }
      if (pr.x < -40 || pr.x > W + 40) pr.dead = true;
    }
    projectiles = projectiles.filter(p => !p.dead);
    if (p1.hp <= 0 || p2.hp <= 0) endRound(p1.hp <= 0 && p2.hp <= 0 ? null : p1.hp <= 0 ? p2 : p1);
    else if (timer <= 0) endRound(p1.hp === p2.hp ? null : p1.hp > p2.hp ? p1 : p2);
    return;
  }
  if (phase === "ko") {
    p1.update(dt, {}, p2); p2.update(dt, {}, p1);
    if (phaseT <= 0) {
      if (p1.wins >= 2 || p2.wins >= 2) {
        phase = "end"; sfx.win();
        resultText = p1.wins >= 2 ? "DU GEWINNST!" : p2.def.name.toUpperCase() + " GEWINNT!";
      } else { round++; startRound(); }
    }
  }
}

// ---------- Zeichnen ----------
function drawHud() {
  const bw = 300, by = 20;
  for (const [f, left] of [[p1, true], [p2, false]]) {
    const x = left ? 20 : W - 20 - bw;
    ctx.save();
    ctx.fillStyle = "#222"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(x, by, bw, 24, 6); ctx.fill(); ctx.stroke();
    const pct = f.hp / f.maxHp, w = (bw - 6) * pct;
    ctx.fillStyle = pct > 0.5 ? "#4cd964" : pct > 0.25 ? "#ffcc00" : "#ff3b30";
    ctx.fillRect(left ? x + 3 : x + bw - 3 - w, by + 3, w, 18);
    // Spezial-Leiste
    const cw = bw * 0.6, cx = left ? x : x + bw - cw;
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.roundRect(cx, by + 30, cw, 12, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = f.meter >= 100 ? (Math.floor(performance.now() / 150) % 2 ? "#fff35c" : "#ff9f1c") : "#4dabf7";
    const mw = (cw - 4) * f.meter / 100;
    ctx.fillRect(left ? cx + 2 : cx + cw - 2 - mw, by + 32, mw, 8);
    ctx.restore();
    ctx.textAlign = left ? "left" : "right"; ctx.textBaseline = "alphabetic";
    outlinedText((left ? "" : "") + f.def.name + (f.cpu ? " (CPU)" : ""), left ? x : x + bw, by + 68, 20, "#fff", INK, 5);
    // Siege
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.arc((left ? x + 10 : x + bw - 10) + (left ? 1 : -1) * i * 22, by + 86, 8, 0, 7);
      ctx.fillStyle = i < f.wins ? "#ffd23f" : "#333"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    }
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(W / 2 - 28, 14, 56, 44, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.font = 'bold 28px "Comic Sans MS", system-ui, sans-serif'; ctx.textBaseline = "middle";
  ctx.fillText(Math.max(0, Math.ceil(timer)), W / 2, 37);
}

function drawFight() {
  ctx.save();
  if (shake > 0.3) { ctx.translate(rnd(-shake, shake), rnd(-shake, shake)); shake *= 0.85; }
  ctx.drawImage(bg, 0, 0);
  const order = [p1, p2].sort((a, b) => a.y - b.y);
  order.forEach(f => f.draw());
  for (const pr of projectiles) {
    ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.rot);
    ctx.font = "44px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(pr.icon, 0, 0);
    ctx.restore();
  }
  for (const e of fx) {
    const k = e.t / 0.5, sc = 1 + (1 - Math.min(1, k)) * 0.4;
    ctx.save(); ctx.translate(e.x, e.y - (1 - k) * 20); ctx.rotate(-0.15); ctx.scale(sc, sc);
    burst(0, 0, 44, e.col === "#fff35c" || e.col === "#ff5252" ? e.col : "#fff");
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    outlinedText(e.txt, 0, 2, e.txt.length > 5 ? 18 : 24, "#111", "#fff", 3);
    ctx.restore();
  }
  ctx.restore();
  drawHud();
  if (banner && (phase !== "fight" || phaseT > 0)) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.save(); ctx.translate(W / 2, 190); ctx.rotate(-0.05);
    outlinedText(banner, 0, 0, 64, "#ffd23f", INK, 10);
    ctx.restore();
  }
  if (phase === "end") {
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    outlinedText(resultText, W / 2, 170, 56, "#ffd23f", INK, 10);
    outlinedText("Tippen oder Enter für das Menü", W / 2, 250, 22, "#fff", INK, 5);
  }
}

// ---------- Auswahl ----------
const CARD = { w: 172, h: 226, y: 98, gap: 12 };
function cardX(i) { return (W - (FRIENDS.length * CARD.w + (FRIENDS.length - 1) * CARD.gap)) / 2 + i * (CARD.w + CARD.gap); }
const LVL_BTN = i => ({ x: W / 2 - 195 + i * 135, y: 352, w: 125, h: 36 });

function drawSelect() {
  ctx.drawImage(bg, 0, 0);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.save(); ctx.translate(W / 2, 48); ctx.rotate(-0.03);
  outlinedText("FREUNDE-KAMPF", 0, 0, 58, "#ffd23f", INK, 10);
  ctx.restore();
  outlinedText("Wähle deinen Kämpfer", W / 2, 88, 18, "#fff", INK, 4);
  FRIENDS.forEach((f, i) => {
    const x = cardX(i), y = CARD.y + (i === cursor ? -6 : 0);
    ctx.fillStyle = i === cursor ? "#fff7c2" : "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(x, y + 6, CARD.w, CARD.h, 14); ctx.fill(); ctx.stroke();
    if (f.imgOk) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(x + 14, y + 20, CARD.w - 28, CARD.w - 28, 10); ctx.clip();
      ctx.drawImage(f.img, x + 14, y + 20, CARD.w - 28, CARD.w - 28); ctx.restore();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x + 14, y + 20, CARD.w - 28, CARD.w - 28, 10); ctx.stroke();
    }
    ctx.fillStyle = f.color; ctx.fillRect(x + 5, y + CARD.w - 2, CARD.w - 10, 6);
    outlinedText(f.name, x + CARD.w / 2, y + CARD.w + 22, 22, "#fff", INK, 5);
    ctx.font = 'bold 13px "Comic Sans MS", system-ui, sans-serif'; ctx.fillStyle = INK;
    ctx.fillText(f.special.icon + " " + f.special.name, x + CARD.w / 2, y + CARD.w + 42);
  });
  outlinedText("Schwierigkeit:", W / 2, 337, 16, "#fff", INK, 4);
  LEVELS.forEach((L, i) => {
    const b = LVL_BTN(i);
    ctx.fillStyle = i === level ? "#ffd23f" : "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = 'bold 16px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillText(L.name, b.x + b.w / 2, b.y + b.h / 2 + 1);
  });
  outlinedText("Pfeile + Enter oder antippen   |   Steuerung: A/D laufen, W springen, J Schlag, K Spezial, L Block", W / 2, 415, 13, "#fff", INK, 4);
}

canvas.addEventListener("pointerdown", e => {
  initAudio();
  const r = canvas.getBoundingClientRect();
  const px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
  if (scene === "select") {
    for (let i = 0; i < LEVELS.length; i++) {
      const b = LVL_BTN(i);
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) { level = i; return; }
    }
    for (let i = 0; i < FRIENDS.length; i++) {
      const x = cardX(i);
      if (px >= x && px <= x + CARD.w && py >= CARD.y && py <= CARD.y + CARD.h + 10) { cursor = i; startMatch(i); return; }
    }
  } else if (phase === "end") scene = "select";
});

// ---------- Loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (scene === "fight") {
    updateFight(dt);
    fx.forEach(e => e.t -= dt); fx = fx.filter(e => e.t > 0);
    drawFight();
  } else drawSelect();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
