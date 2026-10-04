// LEVEL 1 — "GO PICK HER UP": the side-scrolling platformer from MIT College to the pickup spot.
import { W, H, ctx, input, audio, Particles, Banners, text, box, bubble, drawHeart, img, backdrop, clamp, overlap } from '../engine.js'
import * as S from '../sprites.js'
import { game } from '../game.js'
import { STORY, SONGS } from '../story.js'
import { drawCouple } from '../couple.js'

const GROUND = 184
const LEVEL_END = 6480
const GF_X = 6320
const GRAV = 900
const SPEED = 112
const JUMP = 335
const DASH_SPEED = 270

// ---------------------------------------------------------------- level layout
function buildLevel() {
  const L = { solids: [], planks: [], movers: [], crumbles: [], spikes: [], springs: [], momos: [], hearts: [], checkpoints: [], noobs: [], bushes: [], signs: [], props: [] }
  const ground = (a, b) => L.solids.push({ x: a, y: GROUND, w: b - a, h: 60, kind: 'ground' })
  const brick = (x, y, w, h = 16) => L.solids.push({ x, y, w, h, kind: 'brick' })
  const plank = (x, y, w) => L.planks.push({ x, y, w, h: 6 })
  const mover = (x, y, w, ax, ay, period, phase = 0) => L.movers.push({ x0: x, y0: y, x, y, w, h: 8, ax, ay, period, phase, dx: 0, dy: 0 })
  const crumble = (x, y, w) => L.crumbles.push({ x, y, w, h: 8, state: 'ok', t: 0 })
  const spike = (x, w, y = GROUND) => L.spikes.push({ x, y: y - 8, w, h: 8 })
  const spring = (x) => L.springs.push({ x, y: GROUND - 10, w: 16, h: 10, t: 0 })
  const momo = (x, y) => L.momos.push({ x, y, got: false })
  const row = (x, y, n, gap = 16) => { for (let i = 0; i < n; i++) momo(x + i * gap, y) }
  const heart = (x, y) => L.hearts.push({ x, y, got: false })
  const cp = (x, phone) => L.checkpoints.push({ x, active: false, phone })
  const noob = (type, x, minX, maxX, extra = {}) => L.noobs.push({ type, x, minX, maxX, ...extra, y: (extra.y ?? GROUND) - 16 })
  const sign = (x, str) => L.signs.push({ x, str })
  const prop = (kind, x, extra = {}) => L.props.push({ kind, x, ...extra })

  // --- A: easy start outside MIT College
  prop('mit', 20)
  ground(0, 700)
  sign(170, '← → MOVE')
  row(230, 168, 4)
  sign(320, 'SPACE = JUMP')
  brick(390, 152, 32, 32)
  momo(406, 136)
  sign(520, 'SHIFT = DASH (dodge!)')
  row(600, 168, 3)
  // gap 700–760
  ground(760, 1200)
  brick(860, 160, 32, 24)
  sign(930, 'JUMP ON NOOBS = BONK')
  spike(1000, 32)
  noob('classic', 1110, 1040, 1185)
  // gap 1200–1270
  ground(1270, 1720)
  plank(1350, 140, 64)
  row(1358, 128, 4)
  prop('chiya', 1430)
  noob('classic', 1520, 1430, 1640)
  cp(1620, 1)

  // --- B: gaps, moving platforms, noob groups
  mover(1780, 160, 48, 50, 0, 3)
  row(1760, 120, 5, 20)
  ground(1900, 2400)
  noob('classic', 2000, 1930, 2120)
  noob('classic', 2160, 2080, 2250)
  noob('jumper', 2310, 2260, 2385)
  plank(2100, 140, 48)
  plank(2190, 108, 48)
  row(2106, 128, 3)
  row(2196, 96, 3)
  heart(2214, 78)
  plank(2430, 160, 40)
  plank(2500, 140, 40)
  row(2440, 120, 2, 70)
  ground(2560, 3000)
  cp(2600, 2)
  prop('bell', 2650)
  L.bushes.push({ x: 2730 })
  noob('popper', 2734, 2620, 2990, { hidden: true })
  spike(2790, 48)
  row(2790, 140, 3)
  noob('chaser', 2930, 2870, 2990)
  mover(3050, 150, 40, 0, 30, 2.6)
  mover(3190, 130, 48, 40, 0, 3, 1)
  noob('ghost', 3150, 0, 0, { y: 92, fly: true })
  ground(3300, 3960)
  spring(3380)
  momo(3388, 110); momo(3388, 80); momo(3388, 50)
  plank(3440, 124, 128)
  noob('classic', 3500, 3442, 3556, { y: 124 })
  row(3460, 112, 4, 24)
  spike(3610, 64)
  plank(3600, 136, 80)
  prop('momostand', 3720)
  noob('classic', 3800, 3730, 3880)
  cp(3900, 3)

  // --- C: the tricky bit — crumbles, timing, a tower walk
  plank(4000, 150, 32)
  crumble(4070, 128, 32)
  mover(4190, 110, 40, 50, 0, 3.2)
  crumble(4320, 140, 32)
  row(4078, 112, 2); row(4180, 92, 3, 20)
  ground(4400, 4900)
  spike(4480, 32)
  noob('chaser', 4630, 4540, 4770)
  noob('jumper', 4810, 4770, 4890)
  noob('ghost', 4700, 0, 0, { y: 120, fly: true })
  row(4560, 168, 4)
  mover(4960, 140, 40, 0, 30, 2.4)
  brick(5060, 110, 48, 16)
  row(5068, 96, 3)
  mover(5180, 120, 48, 40, 0, 2.8, 2)
  ground(5300, 5620)
  cp(5330, 4)
  brick(5440, 160, 32, 24)
  brick(5480, 128, 32, 56)
  brick(5520, 100, 312, 12)
  noob('classic', 5640, 5530, 5810, { y: 100 })
  row(5560, 88, 10, 24)
  ground(5620, 5840)
  spike(5620, 220)
  ground(5840, LEVEL_END)
  heart(5900, 150)
  L.bushes.push({ x: 5990 })
  noob('popper', 5994, 5880, 6200, { hidden: true })
  noob('classic', 6080, 6020, 6180)
  prop('pickup', GF_X + 24)

  return L
}

// ---------------------------------------------------------------- tiles
function tile(draw) {
  const c = document.createElement('canvas')
  c.width = 16; c.height = 16
  draw(c.getContext('2d'))
  return c
}
function px(g, color, x, y, w = 1, h = 1) { g.fillStyle = color; g.fillRect(x, y, w, h) }
const TILES = {
  grass: tile((g) => {
    px(g, '#a0522d', 0, 0, 16, 16)
    for (const [x, y] of [[3, 9], [10, 12], [6, 14], [13, 8], [1, 13]]) px(g, '#7a3b1e', x, y, 2, 1)
    for (const [x, y] of [[8, 10], [2, 11], [12, 14]]) px(g, '#c46a3a', x, y, 1, 1)
    px(g, '#1a1020', 0, 0, 16, 1)
    px(g, '#3cd23c', 0, 1, 16, 5)
    px(g, '#8cff5a', 0, 1, 16, 1)
    for (const x of [1, 5, 9, 13]) px(g, '#3cd23c', x, 6, 2, 1)
    px(g, '#1f8a28', 0, 5, 16, 1)
  }),
  dirt: tile((g) => {
    px(g, '#a0522d', 0, 0, 16, 16)
    for (const [x, y] of [[3, 2], [10, 5], [6, 11], [13, 13], [1, 8]]) px(g, '#7a3b1e', x, y, 2, 1)
    for (const [x, y] of [[8, 1], [2, 14], [12, 9]]) px(g, '#c46a3a', x, y, 1, 1)
  }),
  brick: tile((g) => {
    px(g, '#6b2214', 0, 0, 16, 16)
    for (const [x, y, w] of [[0, 1, 7], [8, 1, 8], [0, 9, 3], [4, 9, 8], [13, 9, 3]]) {
      px(g, '#d04a2e', x, y, w, 6)
      px(g, '#ff7a4a', x, y, w, 1)
      px(g, '#9a2f1a', x, y + 5, w, 1)
    }
  }),
}

// Seeded random so the endless backdrop of houses is the same every time.
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647 }

function buildHouses() {
  const r = rng(42)
  const list = []
  let x = -40
  while (x < LEVEL_END * 0.5 + W + 100) {
    const w = 40 + Math.floor(r() * 40)
    const h = 40 + Math.floor(r() * 50)
    list.push({ x, w, h, color: ['#b5462c', '#c9603a', '#9e3b2b', '#d07a3e'][Math.floor(r() * 4)], pagoda: r() < 0.18, flags: r() < 0.5 })
    x += w + 4 + Math.floor(r() * 20)
  }
  return list
}

// ---------------------------------------------------------------- scene
export function platformer() {
  const L = buildLevel()
  const houses = buildHouses()
  const bg = img('/img/bg-city.png')
  const parts = new Particles()
  const banners = new Banners()
  game.run.momoTotal = L.momos.length

  const p = { x: 130, y: GROUND - 18, w: 10, h: 18, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buffer: 0, dashT: 0, dashCD: 0, inv: 0, knockT: 0, hearts: 3, anim: 0, ride: null, trail: [] }
  let respawn = { x: 130, y: GROUND - 18 }
  let camX = 0
  let shake = 0
  let t = 0
  let phone = null // { str, t }
  let talk = null // noob speech bubble
  let talkCD = 2
  let cut = null // ending cutscene state
  let introBubble = 3.5

  for (const n of L.noobs) Object.assign(n, { w: 10, h: 16, vx: 0, vy: 0, dir: -1, dizzy: 0, squash: 0, t: Math.random() * 5, chase: 0, cool: 0, x0: n.x, y0: n.y, onGround: false })

  banners.show(STORY.level, 3.2, { size: 16 })
  setTimeout(() => sayPhone(STORY.phone[0]), 3600)

  function sayPhone(str) { phone = { str, t: 0 }; audio.play('blip') }

  function hurt(fromX, kind) {
    if (p.inv > 0 || p.dashT > 0) return
    p.hearts--
    audio.play('hurt')
    shake = 0.3
    parts.burst(p.x + 5, p.y + 9, 10, ['#fff', '#ff2e63', '#ffd23f'])
    parts.pop(p.x + 5, p.y - 4, kind === 'spike' ? 'OUCH!' : 'OOF!', '#ff5d8f')
    if (p.hearts <= 0) { die(); return }
    p.inv = 1.3
    p.knockT = 0.25
    p.vx = (p.x + 5 < fromX ? -1 : 1) * 170
    p.vy = -220
  }

  function die() {
    game.run.oops++
    banners.show(['OOPS!', 'back to the last checkpoint ❤️'], 1.6)
    p.x = respawn.x; p.y = respawn.y; p.vx = 0; p.vy = 0
    p.hearts = 3
    p.inv = 1.5
    for (const n of L.noobs) if (!n.fly) { n.x = n.x0; n.y = n.y0; n.vy = 0; n.chase = 0; if (n.type === 'popper') n.hidden = true }
    for (const c of L.crumbles) { c.state = 'ok'; c.t = 0 }
  }

  // --- collision helpers
  function moveBody(b, dt, isPlayer) {
    const prevBottom = b.y + b.h
    b.x += b.vx * dt
    for (const s of L.solids) if (overlap(b, s)) {
      if (b.vx > 0) b.x = s.x - b.w
      else if (b.vx < 0) b.x = s.x + s.w
      if (!isPlayer) b.dir *= -1
      b.vx = 0
    }
    b.y += b.vy * dt
    const wasGround = b.onGround
    b.onGround = false
    b.ride = null
    for (const s of L.solids) if (overlap(b, s)) {
      if (b.vy > 0) { b.y = s.y - b.h; b.onGround = true } else b.y = s.y + s.h
      b.vy = 0
    }
    // one-way platforms
    if (b.vy >= 0) {
      const oneWay = [...L.planks, ...L.movers, ...L.crumbles.filter((c) => c.state !== 'gone')]
      for (const s of oneWay) {
        if (b.x + b.w <= s.x || b.x >= s.x + s.w) continue
        if (prevBottom <= s.y + 2 + (s.dy > 0 ? s.dy : 0) && b.y + b.h >= s.y) {
          b.y = s.y - b.h; b.vy = 0; b.onGround = true
          if (s.ax !== undefined) b.ride = s
          if (s.state && isPlayer && s.state === 'ok') { s.state = 'shake'; s.t = 0; audio.play('crumble') }
        }
      }
    }
    return wasGround
  }

  function updatePlatforms(dt) {
    for (const m of L.movers) {
      const a = (t / m.period) * Math.PI * 2 + m.phase
      const nx = m.x0 + Math.sin(a) * m.ax
      const ny = m.y0 + Math.sin(a) * m.ay
      m.dx = nx - m.x; m.dy = ny - m.y
      m.x = nx; m.y = ny
    }
    for (const c of L.crumbles) {
      c.t += dt
      if (c.state === 'shake' && c.t > 0.45) { c.state = 'gone'; c.t = 0; parts.burst(c.x + c.w / 2, c.y, 8, ['#d04a2e', '#6b2214'], 50) }
      if (c.state === 'gone' && c.t > 2.6) { c.state = 'ok'; c.t = 0 }
    }
  }

  function updatePlayer(dt) {
    const ax = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0)
    if (ax) p.face = ax
    p.coyote -= dt; p.buffer -= dt; p.dashCD -= dt; p.inv -= dt; p.knockT -= dt
    if (input.hit('jump')) p.buffer = 0.13
    if (input.hit('dash') && p.dashCD <= 0) {
      p.dashT = 0.17; p.dashCD = 0.6; audio.play('dash')
      parts.burst(p.x + 5, p.y + 14, 6, ['#fff', '#ffd23f'], 40)
    }
    if (p.ride) { p.x += p.ride.dx; p.y += p.ride.dy }
    if (p.dashT > 0) {
      p.dashT -= dt
      p.vx = p.face * DASH_SPEED
      p.vy = 0
      p.trail.push({ x: p.x, y: p.y, f: p.face, life: 0.25 })
    } else if (p.knockT <= 0) {
      const target = ax * SPEED
      p.vx += (target - p.vx) * Math.min(1, dt * (p.onGround ? 16 : 9))
    }
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -JUMP; p.buffer = 0; p.coyote = 0; p.onGround = false
      audio.play('jump')
      parts.burst(p.x + 5, p.y + 18, 5, ['#fff', '#e0d6c8'], 30, { g: 0 })
    }
    if (p.dashT <= 0) {
      p.vy += GRAV * dt
      if (!input.down('jump') && p.vy < -80) p.vy += GRAV * 1.6 * dt
      p.vy = Math.min(p.vy, 430)
    }
    const fallSpeed = p.vy
    const wasGround = moveBody(p, dt, true)
    if (p.onGround) {
      p.coyote = 0.1
      if (!wasGround && fallSpeed > 180) {
        audio.play('land')
        parts.burst(p.x + 5, p.y + 18, 6, ['#fff', '#e0d6c8'], 35, { g: 0, life: 0.3 })
      }
    }
    p.x = clamp(p.x, 0, LEVEL_END - p.w)
    if (p.y > H + 30) {
      parts.pop(p.x, H - 20, 'WHOOPS!', '#ff5d8f')
      p.inv = 0; p.dashT = 0
      hurt(p.x, 'fall')
      if (p.hearts > 0) { p.x = respawn.x; p.y = respawn.y; p.vx = 0; p.vy = 0; p.inv = 1.3 }
    }
    p.anim += Math.abs(p.vx) * dt
    for (const tr of p.trail) tr.life -= dt
    p.trail = p.trail.filter((tr) => tr.life > 0)
  }

  function updateNoobs(dt) {
    for (const n of L.noobs) {
      n.t += dt
      if (n.fly) {
        n.x = n.x0 + Math.sin(n.t * 0.9) * 60
        n.y = n.y0 + Math.sin(n.t * 2.4) * 16
        n.dir = Math.cos(n.t * 0.9) > 0 ? 1 : -1
        if (n.dizzy > 0) n.dizzy -= dt
      } else {
        const dx = p.x - n.x
        if (n.hidden) {
          if (Math.abs(dx) < 85) {
            n.hidden = false; n.vy = -300; n.dir = Math.sign(dx) || 1
            audio.play('pop'); parts.pop(n.x + 5, n.y - 10, 'SURPRISE!', '#ff8a1e')
            parts.burst(n.x + 5, n.y + 8, 10, ['#2fbf3a', '#8cff5a'], 70)
          }
          continue
        }
        if (n.dizzy > 0) { n.dizzy -= dt; n.vx = 0; if (n.dizzy <= 0) parts.pop(n.x + 5, n.y - 6, 'hmph!', '#fff', 6) }
        else {
          let speed = 28
          if (n.type === 'chaser') {
            n.cool -= dt
            if (n.chase <= 0 && n.cool <= 0 && Math.abs(dx) < 120 && Math.abs(p.y - n.y) < 40) {
              n.chase = 1.8; parts.pop(n.x + 5, n.y - 8, '!', '#ff3b3b', 12); audio.play('pop')
            }
            if (n.chase > 0) {
              n.chase -= dt; speed = 88; n.dir = Math.sign(dx) || n.dir
              if (n.chase <= 0) { n.cool = 2.5; parts.pop(n.x + 5, n.y - 8, '?', '#fff', 10) }
            }
          }
          if (n.type === 'popper') speed = 44
          if (n.type === 'jumper' && n.onGround && n.t % 1.7 < dt * 1.5) { n.vy = -270; }
          if (n.x < n.minX) n.dir = 1
          if (n.x > n.maxX) n.dir = -1
          n.vx = n.dir * speed
        }
        n.vy += GRAV * dt
        moveBody(n, dt, false)
        if (n.y > H + 40) { n.x = n.x0; n.y = n.y0 - 40; n.vy = 0 }
      }
      if (n.squash > 0) n.squash -= dt

      // player contact
      const hb = { x: n.x + 1, y: n.y + 2, w: n.w - 2, h: n.h - 2 }
      if (n.hidden || n.dizzy > 0 || !overlap(p, hb)) continue
      const feet = p.y + p.h
      if (p.vy > 30 && feet - p.vy * dt <= n.y + 7) {
        p.vy = input.down('jump') ? -390 : -280
        n.dizzy = 2.6; n.squash = 0.35
        audio.play('stomp'); shake = 0.12
        parts.pop(n.x + 5, n.y - 6, 'BONK!', '#ffd23f')
        parts.burst(n.x + 5, n.y, 8, ['#ffd23f', '#fff'], 60)
      } else hurt(n.x + 5)
    }
  }

  function updateStuff(dt) {
    for (const s of L.spikes) if (overlap(p, { x: s.x + 2, y: s.y + 3, w: s.w - 4, h: s.h - 3 })) { hurt(p.x + 5 + p.face * 4, 'spike'); if (p.inv > 0) p.vy = -280 }
    for (const s of L.springs) {
      s.t -= dt
      if (p.vy > 0 && overlap(p, s)) { p.vy = -560; s.t = 0.3; audio.play('boing'); parts.pop(s.x + 8, s.y - 10, 'BOING!', '#8cff5a') }
    }
    for (const m of L.momos) {
      if (m.got) continue
      if (Math.abs(p.x + 5 - m.x) < 10 && Math.abs(p.y + 9 - m.y) < 14) {
        m.got = true; game.run.momos++
        audio.play('momo')
        parts.burst(m.x, m.y, 6, ['#fff', '#ffd23f', '#ff8fc8'], 50, { g: 0 })
        parts.pop(m.x, m.y - 10, '+1 MOMO', '#fff', 6)
      }
    }
    for (const hp of L.hearts) {
      if (hp.got || Math.abs(p.x + 5 - hp.x) > 10 || Math.abs(p.y + 9 - hp.y) > 14) continue
      hp.got = true; p.hearts = Math.min(3, p.hearts + 1)
      audio.play('heart'); parts.hearts(hp.x, hp.y, 5); parts.pop(hp.x, hp.y - 10, '+1 HEART', '#ff5d8f', 6)
    }
    for (const c of L.checkpoints) {
      if (c.active || p.x < c.x - 4) continue
      c.active = true
      respawn = { x: c.x, y: GROUND - 18 }
      p.hearts = 3
      audio.play('checkpoint')
      parts.burst(c.x, GROUND - 40, 16, ['#1e6bff', '#fff', '#ff2e2e', '#2fbf3a', '#ffd800'], 90)
      banners.show(['CHECKPOINT!', 'hearts refilled ❤️❤️❤️'], 1.6, { size: 16, color: '#8cff5a', y: 60 })
      if (STORY.phone[c.phone]) setTimeout(() => sayPhone(STORY.phone[c.phone]), 1700)
    }
    // random noob chatter when one is near
    talkCD -= dt
    if (talk) { talk.t -= dt; if (talk.t <= 0) talk = null }
    if (!talk && talkCD <= 0) {
      const n = L.noobs.find((n) => !n.hidden && !n.fly && n.dizzy <= 0 && Math.abs(n.x - p.x) < 110 && Math.abs(n.x - p.x) > 30)
      if (n) { talk = { n, str: STORY.noobLines[Math.floor(Math.random() * STORY.noobLines.length)], t: 1.6 }; talkCD = 3 + Math.random() * 3 }
    }
  }

  // --- ending cutscene
  function startCutscene() {
    cut = { t: 0, phase: 'walk' }
    p.vx = 0; p.dashT = 0; p.inv = 0; p.trail = []
    audio.stopMusic()
  }
  function updateCutscene(dt) {
    cut.t += dt
    if (cut.phase === 'walk') {
      p.face = 1
      p.vx = 50
      p.anim += 50 * dt
      p.vy += GRAV * dt
      moveBody(p, dt, true)
      if (p.x >= GF_X - 22) {
        p.x = GF_X - 22; p.vx = 0
        cut.phase = 'found'; cut.t = 0
        audio.play('love')
        banners.show(STORY.found, 2.4, { size: 16, color: '#ff5d8f', y: 56 })
        parts.hearts(GF_X - 10, GROUND - 24, 14)
      }
    } else if (cut.phase === 'found') {
      if (cut.t > 2.6) { cut.phase = 'hold'; cut.t = 0; audio.play('sparkle'); parts.burst(GF_X - 8, GROUND - 8, 14, ['#fff', '#ffd23f', '#ff5d8f'], 60, { g: 0 }) }
    } else if (cut.phase === 'hold') {
      if (cut.t < 0.6) parts.hearts(GF_X - 8, GROUND - 26, 1)
      if (cut.t > 1.6 && !cut.obj) {
        cut.obj = true
        audio.play('fanfare')
        banners.show(['OBJECTIVE UPDATED!', STORY.objectiveLibrary + ' 📚'], 3.2, { size: 16, color: '#8cff5a', y: 56 })
      }
      if (cut.t > 4.8) game.go('walk')
    }
  }

  // ---------------------------------------------------------------- update/draw
  function update(dt) {
    t += dt
    if (!cut) audio.music(SONGS.platform)
    updatePlatforms(dt)
    if (cut) updateCutscene(dt)
    else {
      updatePlayer(dt)
      updateNoobs(dt)
      updateStuff(dt)
      if (p.x > GF_X - 70 && p.onGround) startCutscene()
    }
    introBubble -= dt
    if (phone) { phone.t += dt; if (phone.t > 4) phone = null }
    parts.update(dt)
    banners.update(dt)
    shake = Math.max(0, shake - dt)
    const target = clamp(p.x - W * 0.38 + p.face * 24, 0, LEVEL_END - W)
    camX += (target - camX) * Math.min(1, dt * 5)
  }

  function drawHouses() {
    const off = camX * 0.45
    for (const h of houses) {
      const x = Math.round(h.x - off)
      if (x > W || x + h.w < 0) continue
      const top = GROUND + 6 - h.h
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(x - 1, top - 1, h.w + 2, h.h + 2)
      ctx.fillStyle = h.color
      ctx.fillRect(x, top, h.w, h.h)
      // brick rows
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      for (let y = top + 4; y < top + h.h; y += 6) ctx.fillRect(x, y, h.w, 1)
      // roof
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(x - 5, top - 7, h.w + 10, 8)
      ctx.fillStyle = '#5a2a1a'
      ctx.fillRect(x - 4, top - 6, h.w + 8, 6)
      ctx.fillStyle = '#7a3b22'
      ctx.fillRect(x - 4, top - 6, h.w + 8, 2)
      if (h.pagoda) {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 4, top - 19, h.w - 8, 13)
        ctx.fillStyle = '#5a2a1a'; ctx.fillRect(x + 5, top - 18, h.w - 10, 6)
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 7, top - 12, h.w - 14, 6)
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + h.w / 2 - 1, top - 26, 3, 8)
      }
      // carved windows
      for (let wy = top + 8; wy < top + h.h - 18; wy += 18) for (let wx = x + 6; wx < x + h.w - 12; wx += 14) {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(wx - 1, wy - 1, 10, 12)
        ctx.fillStyle = '#4a2410'; ctx.fillRect(wx, wy, 8, 10)
        ctx.fillStyle = (wx + wy) % 3 === 0 ? '#ffd23f' : '#2b1b4a'; ctx.fillRect(wx + 2, wy + 2, 4, 6)
        ctx.fillStyle = '#7a3b12'; ctx.fillRect(wx + 3, wy + 2, 2, 6)
      }
      // door
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x + h.w / 2 - 6, GROUND - 14, 12, 20)
      ctx.fillStyle = '#6b3a1e'; ctx.fillRect(x + h.w / 2 - 5, GROUND - 13, 10, 19)
      if (h.flags) {
        const cols = ['#1e6bff', '#fff', '#ff2e2e', '#2fbf3a', '#ffd800']
        for (let i = 0; i < 10; i++) {
          const fx = x + h.w + i * 3
          const fy = top + 4 + Math.sin(i / 3) * 4 + i * 0.4
          ctx.fillStyle = cols[i % 5]
          ctx.fillRect(fx, fy, 3, 4)
        }
      }
    }
  }

  function drawProps() {
    for (const pr of L.props) {
      const x = pr.x
      if (pr.kind === 'mit') {
        for (const px0 of [x, x + 100]) {
          ctx.fillStyle = '#1a1020'; ctx.fillRect(px0 - 1, GROUND - 76, 16, 77)
          ctx.drawImage(TILES.brick, px0, GROUND - 75, 14, 16)
          ctx.drawImage(TILES.brick, px0, GROUND - 59, 14, 16)
          ctx.drawImage(TILES.brick, px0, GROUND - 43, 14, 16)
          ctx.drawImage(TILES.brick, px0, GROUND - 27, 14, 16)
          ctx.drawImage(TILES.brick, px0, GROUND - 11, 14, 11)
        }
        box(x - 6, GROUND - 98, 126, 26, '#d2112f', '#ffd23f')
        text('MIT COLLEGE', x + 57, GROUND - 92, { size: 8, color: '#fff' })
        text('est. our first date', x + 57, GROUND - 81, { size: 5, color: '#ffd23f', outline: null })
      } else if (pr.kind === 'pickup') {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 1, GROUND - 60, 4, 60)
        ctx.fillStyle = '#ccc'; ctx.fillRect(x, GROUND - 60, 2, 60)
        box(x - 30, GROUND - 78, 62, 22, '#ff2e88', '#fff')
        text('PICKUP', x + 1, GROUND - 74, { size: 6, color: '#fff' })
        text('SPOT ❤', x + 1, GROUND - 65, { size: 6, color: '#ffd23f' })
      } else if (pr.kind === 'chiya' || pr.kind === 'momostand') {
        const label = pr.kind === 'chiya' ? 'CHIYA ☕' : 'MOMO 🥟'
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 1, GROUND - 40, 52, 41)
        ctx.fillStyle = '#c47a2c'; ctx.fillRect(x, GROUND - 22, 50, 22)
        ctx.fillStyle = '#7a3b12'; ctx.fillRect(x, GROUND - 22, 50, 2)
        for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#2b9bff'; ctx.fillRect(x + i * 10, GROUND - 40, 10, 8) }
        ctx.fillStyle = '#7a3b12'; ctx.fillRect(x + 2, GROUND - 32, 2, 10); ctx.fillRect(x + 46, GROUND - 32, 2, 10)
        text(label, x + 25, GROUND - 17, { size: 6, color: '#ffd23f' })
      } else if (pr.kind === 'bell') {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 1, GROUND - 52, 30, 4); ctx.fillRect(x - 1, GROUND - 52, 4, 52); ctx.fillRect(x + 25, GROUND - 52, 4, 52)
        ctx.fillStyle = '#7a3b12'; ctx.fillRect(x, GROUND - 51, 28, 2); ctx.fillRect(x, GROUND - 51, 2, 51); ctx.fillRect(x + 26, GROUND - 51, 2, 51)
        const sw = Math.sin(t * 2) * 2
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 8 + sw, GROUND - 46, 12, 12)
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 9 + sw, GROUND - 45, 10, 10)
        ctx.fillStyle = '#fff7a8'; ctx.fillRect(x + 10 + sw, GROUND - 44, 3, 6)
      }
    }
    for (const s of L.signs) {
      const x = s.x
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 2, GROUND - 22, 5, 22)
      ctx.fillStyle = '#7a3b12'; ctx.fillRect(x - 1, GROUND - 22, 3, 22)
      const w = s.str.length * 5 + 10
      box(x - w / 2, GROUND - 36, w, 14, '#c47a2c', '#7a3b12')
      text(s.str, x, GROUND - 32, { size: 5, color: '#fff' })
    }
    for (const b of L.bushes) {
      for (const [ox, oy, r] of [[0, 0, 10], [12, -4, 12], [24, 0, 10]]) {
        ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(b.x - 6 + ox, GROUND - 6 + oy, r + 1, 0, Math.PI * 2); ctx.fill()
      }
      for (const [ox, oy, r] of [[0, 0, 10], [12, -4, 12], [24, 0, 10]]) {
        ctx.fillStyle = '#2fbf3a'; ctx.beginPath(); ctx.arc(b.x - 6 + ox, GROUND - 6 + oy, r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.fillStyle = '#8cff5a'; ctx.fillRect(b.x + 2, GROUND - 18, 4, 2); ctx.fillRect(b.x - 8, GROUND - 10, 3, 2)
    }
  }

  function drawWorld() {
    const x0 = camX - 16, x1 = camX + W + 16
    for (const s of L.solids) {
      if (s.x > x1 || s.x + s.w < x0) continue
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(s.x - 1, s.y - 1, s.w + 2, s.h + 2)
      for (let ty = s.y; ty < s.y + s.h; ty += 16) {
        for (let tx = s.x + Math.max(0, Math.floor((x0 - s.x) / 16) * 16); tx < Math.min(s.x + s.w, x1); tx += 16) {
          const tl = s.kind === 'ground' ? (ty === s.y ? TILES.grass : TILES.dirt) : TILES.brick
          const w = Math.min(16, s.x + s.w - tx), h = Math.min(16, s.y + s.h - ty)
          ctx.drawImage(tl, 0, 0, w, h, tx, ty, w, h)
        }
      }
    }
    const drawPlank = (s, color = '#c47a2c', alpha = 1) => {
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#1a1020'; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, s.w + 2, s.h + 2)
      ctx.fillStyle = color; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.w, s.h)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.w, 1)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      for (let i = 8; i < s.w; i += 12) ctx.fillRect(Math.round(s.x) + i, Math.round(s.y) + 1, 1, s.h - 1)
      ctx.globalAlpha = 1
    }
    for (const s of L.planks) drawPlank(s)
    for (const m of L.movers) {
      drawPlank(m, '#2b9bff')
      ctx.fillStyle = '#ffd23f'
      ctx.fillRect(Math.round(m.x) + m.w / 2 - 2, Math.round(m.y) + 2, 4, 3)
    }
    for (const c of L.crumbles) {
      if (c.state === 'gone') { if (c.t > 2.2) drawPlank(c, '#d04a2e', 0.3); continue }
      const jx = c.state === 'shake' ? Math.round(Math.sin(t * 60) * 1.5) : 0
      drawPlank({ ...c, x: c.x + jx }, '#d04a2e')
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(c.x + jx + 10, c.y + 1, 1, 4); ctx.fillRect(c.x + jx + 11, c.y + 4, 3, 1); ctx.fillRect(c.x + jx + 22, c.y + 2, 1, 5)
    }
    for (const s of L.spikes) {
      for (let i = 0; i < s.w; i += 8) {
        ctx.fillStyle = '#1a1020'
        ctx.beginPath(); ctx.moveTo(s.x + i - 1, s.y + 8); ctx.lineTo(s.x + i + 4, s.y - 1); ctx.lineTo(s.x + i + 9, s.y + 8); ctx.fill()
        ctx.fillStyle = '#c9d2e8'
        ctx.beginPath(); ctx.moveTo(s.x + i + 1, s.y + 8); ctx.lineTo(s.x + i + 4, s.y + 1); ctx.lineTo(s.x + i + 7, s.y + 8); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.fillRect(s.x + i + 3, s.y + 3, 1, 3)
      }
    }
    for (const s of L.springs) {
      const sq = s.t > 0 ? 4 : 0
      ctx.fillStyle = '#1a1020'; ctx.fillRect(s.x - 1, s.y - 1 + sq, 18, 12 - sq)
      ctx.fillStyle = '#ff2e2e'; ctx.fillRect(s.x, s.y + sq, 16, 4)
      ctx.fillStyle = '#fff'; ctx.fillRect(s.x + 2, s.y + sq, 12, 1)
      ctx.fillStyle = '#c9d2e8'; for (let i = 0; i < 3; i++) ctx.fillRect(s.x + 3 + i * 4, s.y + 5 + sq * 0.5, 2, 5 - sq * 0.5)
    }
    for (const c of L.checkpoints) {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(c.x - 2, GROUND - 52, 4, 52)
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(c.x - 1, GROUND - 51, 2, 51)
      const cols = ['#1e6bff', '#fff', '#ff2e2e', '#2fbf3a', '#ffd800']
      for (let i = 0; i < 5; i++) {
        const wave = Math.sin(t * 5 + i) * (c.active ? 2 : 0.5)
        ctx.fillStyle = '#1a1020'; ctx.fillRect(c.x + 2 + i * 7, GROUND - 50 + i * 3 + wave, 7, 9)
        ctx.fillStyle = c.active ? cols[i] : '#6b5a7a'; ctx.fillRect(c.x + 3 + i * 7, GROUND - 49 + i * 3 + wave, 5, 7)
      }
      if (c.active) drawHeart(c.x, GROUND - 58 + Math.sin(t * 3) * 2, 1)
    }
    for (const m of L.momos) if (!m.got) S.draw('momo', 'idle', m.x, m.y + 4 + Math.round(Math.sin(t * 4 + m.x) * 1.5))
    for (const hp of L.hearts) if (!hp.got) drawHeart(hp.x, hp.y + Math.sin(t * 4) * 2, 2)
  }

  function drawNoobs() {
    for (const n of L.noobs) {
      if (n.x < camX - 30 || n.x > camX + W + 30) continue
      if (n.hidden) {
        // peeking eyes from the bush
        if (Math.sin(t * 2 + n.x) > 0.3) { ctx.fillStyle = '#ffd800'; ctx.fillRect(n.x, GROUND - 14, 3, 3); ctx.fillRect(n.x + 7, GROUND - 14, 3, 3) }
        continue
      }
      const cx = n.x + n.w / 2, by = n.y + n.h
      if (n.fly) {
        S.draw('ghost', 'idle', cx, by + 1, { flip: n.dir < 0, alpha: n.dizzy > 0 ? 0.5 : 0.95 })
        continue
      }
      const frame = n.squash > 0 ? 'squish' : n.dizzy > 0 ? 'idle' : Math.floor(n.t * 6) % 2 ? 'walk1' : 'walk2'
      S.draw('noob', frame, cx, by + 1, { flip: n.dir < 0, pal: S.PALS[n.type] || {} })
      if (n.type === 'chaser' && n.chase > 0) { ctx.fillStyle = '#1a1020'; ctx.fillRect(cx - 4, by - 14, 3, 1); ctx.fillRect(cx + 2, by - 14, 3, 1) }
      if (n.dizzy > 0 && n.squash <= 0) {
        for (let i = 0; i < 3; i++) {
          const a = t * 6 + (i * Math.PI * 2) / 3
          ctx.fillStyle = '#ffd23f'
          ctx.fillRect(Math.round(cx + Math.cos(a) * 8) - 1, Math.round(by - 19 + Math.sin(a) * 3) - 1, 3, 3)
        }
      }
    }
  }

  function drawPlayer() {
    for (const tr of p.trail) S.draw('bf', 'jump', tr.x + 5, tr.y + 19, { flip: tr.f < 0, alpha: tr.life * 2, flash: true })
    if (p.inv > 0 && Math.floor(t * 20) % 2 === 0) return
    let frame = 'idle'
    if (!p.onGround) frame = 'jump'
    else if (Math.abs(p.vx) > 15) frame = Math.floor(p.anim / 10) % 2 ? 'walk1' : 'walk2'
    else if (t % 3 > 2.85) frame = 'blink'
    const stretch = !p.onGround ? (p.vy < 0 ? 1.08 : 0.96) : 1
    S.draw('bf', frame, p.x + 5, p.y + 19, { flip: p.face < 0, sy: stretch })
  }

  function drawHUD() {
    for (let i = 0; i < 3; i++) drawHeart(12 + i * 13, 12, 1.6, '#ff2e63', i >= p.hearts)
    S.draw('momo', 'idle', 14, 32)
    text(`x${game.run.momos}`, 22, 26, { size: 8, align: 'left' })
    // progress: MIT → her
    const bx = W / 2 - 70, bw = 140
    text('GO PICK HER UP ❤️', W / 2, 5, { size: 6, color: '#ffd23f' })
    ctx.fillStyle = '#1a1020'; ctx.fillRect(bx - 1, 16, bw + 2, 5)
    ctx.fillStyle = '#4a3355'; ctx.fillRect(bx, 17, bw, 3)
    const prog = clamp(p.x / GF_X, 0, 1)
    ctx.fillStyle = '#ff2e88'; ctx.fillRect(bx, 17, bw * prog, 3)
    for (const c of L.checkpoints) { ctx.fillStyle = c.active ? '#8cff5a' : '#bba'; ctx.fillRect(bx + bw * (c.x / GF_X) - 1, 15, 2, 7) }
    S.draw('bf', 'idle', bx + bw * prog, 22, { scale: 0.6 })
    drawHeart(bx + bw + 6, 18, 1)
    if (phone) {
      const slide = Math.min(1, phone.t * 4, (4 - phone.t) * 4)
      const w = phone.str.length * 5 + 26
      const x = W - (w + 6) * slide
      box(x, 30, w, 18, '#fff', '#1a1020')
      ctx.fillStyle = '#2fbf3a'; ctx.fillRect(x + 4, 34, 10, 10)
      text('💬', x + 9, 35, { size: 6, outline: null })
      text(phone.str, x + 18, 36, { size: 5, color: '#1a1020', align: 'left', outline: null })
    }
  }

  function draw() {
    ctx.fillStyle = '#ffcf3f'
    ctx.fillRect(0, 0, W, H)
    backdrop(bg, camX * 0.15, 1, -14)
    drawHouses()
    const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0
    const sy = shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0
    ctx.save()
    ctx.translate(-Math.round(camX) + sx, sy)
    drawProps()
    drawWorld()
    drawNoobs()
    // her, waiting at the pickup spot
    if (cut && cut.phase === 'hold') {
      drawCouple(GF_X - 14, GROUND + 1, t, { holding: true })
    } else {
      const hop = cut && cut.phase === 'found' ? Math.abs(Math.sin(cut.t * 8)) * 6 * Math.max(0, 1 - cut.t / 1.5) : 0
      S.draw('gf', t % 3.4 > 3.25 ? 'blink' : 'idle', GF_X, GROUND + 1 - hop, { flip: true })
      if (!cut) drawHeart(GF_X, GROUND - 28 + Math.sin(t * 3) * 2, 1)
      drawPlayer()
    }
    parts.draw()
    if (talk && !cut) {
      const n = talk.n
      ctx.restore(); ctx.save()
      bubble(talk.str, n.x + 5 - camX, n.y - 4)
    }
    if (introBubble > 0 && introBubble < 3) {
      ctx.restore(); ctx.save()
      bubble(STORY.start, p.x + 5 - camX, p.y - 6)
    }
    ctx.restore()
    if (cut) {
      const k = Math.min(1, cut.t * 3 + (cut.phase !== 'walk' ? 1 : 0))
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(0, 0, W, 18 * k)
      ctx.fillRect(0, H - 18 * k, W, 18 * k)
    } else drawHUD()
    banners.draw()
  }

  return { update, draw }
}
