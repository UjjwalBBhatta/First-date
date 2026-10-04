// Core engine: canvas, input, audio, drawing helpers, particles, banners.
export const W = 384
export const H = 216

export const canvas = document.getElementById('game')
canvas.width = W
canvas.height = H
export const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

export const FONT = '"Press Start 2P", monospace'

// ---------------------------------------------------------------- input
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyZ: 'jump', KeyK: 'jump',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyX: 'dash', KeyL: 'dash',
  KeyF: 'attack', KeyJ: 'attack', KeyC: 'attack',
  Enter: 'ok', KeyE: 'ok', NumpadEnter: 'ok',
  KeyI: 'inv', Tab: 'inv',
  KeyM: 'mute',
  Digit1: 'd1', Digit2: 'd2', Digit3: 'd3', Digit4: 'd4', Digit5: 'd5', Digit6: 'd6',
}
const held = new Set()
const pressed = new Set()

function press(a) {
  if (!held.has(a)) pressed.add(a)
  held.add(a)
  audio.unlock()
}
function release(a) { held.delete(a) }

addEventListener('keydown', (e) => {
  const a = KEYMAP[e.code]
  if (!a) return
  e.preventDefault()
  press(a)
})
addEventListener('keyup', (e) => {
  const a = KEYMAP[e.code]
  if (a) release(a)
})
addEventListener('blur', () => held.clear())

// On-screen touch buttons: any element with data-key="<action>"
document.querySelectorAll('[data-key]').forEach((el) => {
  const a = el.dataset.key
  const on = (e) => { e.preventDefault(); press(a); el.classList.add('on') }
  const off = (e) => { e.preventDefault(); release(a); el.classList.remove('on') }
  el.addEventListener('pointerdown', on)
  el.addEventListener('pointerup', off)
  el.addEventListener('pointerleave', off)
  el.addEventListener('pointercancel', off)
})
canvas.addEventListener('pointerdown', () => { press('tap'); setTimeout(() => release('tap'), 50) })

export const input = {
  down: (a) => held.has(a),
  hit: (a) => pressed.has(a),
  // "confirm" = Enter, E, Space, Z or a tap on the canvas
  confirm: () => pressed.has('ok') || pressed.has('jump') || pressed.has('tap'),
  endFrame: () => pressed.clear(),
}

// ---------------------------------------------------------------- audio
export const audio = (() => {
  let ac = null
  let master = null
  let musicGain = null
  let muted = localStorage.getItem('kq-muted') === '1'
  let song = null
  let songTimer = null

  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return }
    ac = new (window.AudioContext || window.webkitAudioContext)()
    master = ac.createGain()
    master.gain.value = muted ? 0 : 0.5
    master.connect(ac.destination)
    musicGain = ac.createGain()
    musicGain.gain.value = 0.16
    musicGain.connect(master)
    if (song) startSong(song)
  }

  function tone({ type = 'square', f = 440, f2 = null, t = 0.1, v = 0.3, delay = 0, dest = null }) {
    if (!ac) return
    const now = ac.currentTime + delay
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = type
    o.frequency.setValueAtTime(f, now)
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t)
    g.gain.setValueAtTime(v, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + t)
    o.connect(g).connect(dest || master)
    o.start(now)
    o.stop(now + t + 0.02)
  }

  function noise({ t = 0.1, v = 0.3, f = 1200, delay = 0 }) {
    if (!ac) return
    const now = ac.currentTime + delay
    const len = Math.floor(ac.sampleRate * t)
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const s = ac.createBufferSource()
    s.buffer = buf
    const fl = ac.createBiquadFilter()
    fl.type = 'bandpass'
    fl.frequency.value = f
    const g = ac.createGain()
    g.gain.value = v
    s.connect(fl).connect(g).connect(master)
    s.start(now)
  }

  const N = (n) => 440 * Math.pow(2, (n - 69) / 12)

  const sfx = {
    jump: () => tone({ f: 300, f2: 700, t: 0.12, v: 0.18 }),
    land: () => noise({ t: 0.06, v: 0.25, f: 400 }),
    dash: () => { noise({ t: 0.18, v: 0.3, f: 2500 }); tone({ type: 'sawtooth', f: 200, f2: 90, t: 0.15, v: 0.08 }) },
    momo: () => { tone({ f: N(84), t: 0.07, v: 0.15 }); tone({ f: N(91), t: 0.12, v: 0.15, delay: 0.06 }) },
    heart: () => [72, 76, 79, 84].forEach((n, i) => tone({ type: 'triangle', f: N(n), t: 0.15, v: 0.25, delay: i * 0.06 })),
    checkpoint: () => [67, 72, 76, 79, 84].forEach((n, i) => tone({ f: N(n), t: 0.14, v: 0.14, delay: i * 0.07 })),
    hurt: () => { tone({ type: 'sawtooth', f: 400, f2: 80, t: 0.3, v: 0.2 }); noise({ t: 0.15, v: 0.2, f: 800 }) },
    stomp: () => tone({ type: 'square', f: 150, f2: 600, t: 0.15, v: 0.2 }),
    boing: () => tone({ type: 'triangle', f: 180, f2: 900, t: 0.25, v: 0.3 }),
    pop: () => tone({ f: 900, f2: 200, t: 0.1, v: 0.15 }),
    crumble: () => noise({ t: 0.3, v: 0.25, f: 300 }),
    swing: () => noise({ t: 0.12, v: 0.25, f: 3200 }),
    clang: () => { tone({ type: 'square', f: 1800, f2: 1500, t: 0.25, v: 0.12 }); tone({ type: 'square', f: 2400, f2: 2000, t: 0.2, v: 0.08 }) },
    bonk: () => { tone({ type: 'triangle', f: 600, f2: 120, t: 0.18, v: 0.35 }); noise({ t: 0.05, v: 0.3, f: 1500 }) },
    whomp: () => { tone({ type: 'sine', f: 120, f2: 40, t: 0.35, v: 0.5 }); noise({ t: 0.3, v: 0.3, f: 200 }) },
    kazoo: () => [64, 62, 60, 55].forEach((n, i) => tone({ type: 'sawtooth', f: N(n), f2: N(n) * 0.97, t: 0.22, v: 0.12, delay: i * 0.22 })),
    paper: () => noise({ t: 0.2, v: 0.2, f: 5000 }),
    blip: () => tone({ f: 660, t: 0.04, v: 0.08 }),
    ahem: () => { tone({ type: 'sawtooth', f: 160, f2: 120, t: 0.15, v: 0.2 }); tone({ type: 'sawtooth', f: 180, f2: 130, t: 0.2, v: 0.2, delay: 0.18 }) },
    shh: () => noise({ t: 0.5, v: 0.15, f: 6000 }),
    sparkle: () => [88, 91, 96].forEach((n, i) => tone({ type: 'triangle', f: N(n), t: 0.2, v: 0.12, delay: i * 0.05 })),
    fanfare: () => [[72, 0], [72, 0.12], [72, 0.24], [79, 0.4], [76, 0.7], [79, 0.85], [84, 1.0]].forEach(([n, d]) => {
      tone({ f: N(n), t: 0.25, v: 0.15, delay: d }); tone({ type: 'triangle', f: N(n - 12), t: 0.25, v: 0.2, delay: d })
    }),
    love: () => [76, 79, 83, 88].forEach((n, i) => tone({ type: 'triangle', f: N(n), t: 0.4, v: 0.18, delay: i * 0.12 })),
    step: () => noise({ t: 0.03, v: 0.08, f: 600 }),
  }

  // Tiny chiptune sequencer. Each song: bpm, lead[], bass[] (midi or 0 = rest), one entry per 8th note.
  function startSong(s) {
    stopSong()
    song = s
    if (!ac) return
    const step = 60 / s.bpm / 2
    let i = 0
    let next = ac.currentTime + 0.05
    songTimer = setInterval(() => {
      while (next < ac.currentTime + 0.2) {
        const l = s.lead[i % s.lead.length]
        const b = s.bass[i % s.bass.length]
        const d = next - ac.currentTime
        if (l) tone({ type: s.leadType || 'square', f: N(l), t: step * 0.9, v: 0.25, delay: d, dest: musicGain })
        if (b) tone({ type: 'triangle', f: N(b), t: step * 1.6, v: 0.45, delay: d, dest: musicGain })
        next += step
        i++
      }
    }, 50)
  }
  function stopSong() { if (songTimer) clearInterval(songTimer); songTimer = null }

  return {
    unlock,
    play: (name) => sfx[name] && sfx[name](),
    music: (s) => { if (song === s && songTimer) return; song = s; if (ac) startSong(s) },
    stopMusic: () => { song = null; stopSong() },
    toggleMute: () => {
      muted = !muted
      localStorage.setItem('kq-muted', muted ? '1' : '0')
      if (master) master.gain.value = muted ? 0 : 0.5
      return muted
    },
    get muted() { return muted },
  }
})()

// ---------------------------------------------------------------- images
const imgCache = {}
// Backdrops go through the Netlify Image CDN so we never ship the full-res originals.
// Falls back to the original file if the CDN isn't available (e.g. a plain static server).
export function cdn(path, w = 768) {
  return `/.netlify/images?url=${encodeURIComponent(path)}&w=${w}&fm=webp`
}
export function img(path, w) {
  const key = path + (w || '')
  if (!imgCache[key]) {
    const im = new Image()
    im.onerror = () => { if (im.src.includes('.netlify/images')) im.src = path }
    im.src = cdn(path, w)
    imgCache[key] = im
  }
  return imgCache[key]
}
export const ready = (im) => im && im.complete && im.naturalWidth > 0

// Draw a backdrop that fills the screen height, scrolled by `scroll` px, mirrored-tiled so it extends forever.
export function backdrop(im, scroll = 0, alpha = 1, yOff = 0) {
  if (!ready(im)) return
  const h = H
  const w = Math.round(im.naturalWidth * (h / im.naturalHeight))
  let x = -(((scroll % (w * 2)) + w * 2) % (w * 2))
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.imageSmoothingEnabled = true
  for (let k = 0; x < W; k++, x += w) {
    const tile = Math.floor((x + scroll) / w + 0.5)
    if (tile % 2 === 0) ctx.drawImage(im, Math.round(x), yOff, w, h)
    else {
      ctx.save()
      ctx.translate(Math.round(x) + w, yOff)
      ctx.scale(-1, 1)
      ctx.drawImage(im, 0, 0, w, h)
      ctx.restore()
    }
  }
  ctx.restore()
}

// ---------------------------------------------------------------- text
export function text(str, x, y, opts = {}) {
  const { size = 8, color = '#fff', align = 'center', outline = '#1a1020', base = 'top', alpha = 1 } = opts
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = `${size}px ${FONT}`
  ctx.textAlign = align
  ctx.textBaseline = base
  x = Math.round(x); y = Math.round(y)
  if (outline) {
    ctx.fillStyle = outline
    const o = size >= 16 ? 2 : 1
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, o], [o, -o], [-o, o], [0, o + 1], [o, o + 1]]) ctx.fillText(str, x + dx, y + dy)
  }
  ctx.fillStyle = color
  ctx.fillText(str, x, y)
  ctx.restore()
}

export function wrap(str, maxChars) {
  const words = str.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w } else cur += ' ' + w
  }
  if (cur.trim()) lines.push(cur.trim())
  return lines
}

// Chunky pixel box with a dark outline and a lighter inner bevel.
export function box(x, y, w, h, fill = '#2b1b4a', border = '#ffd23f') {
  x = Math.round(x); y = Math.round(y)
  ctx.fillStyle = '#1a1020'
  ctx.fillRect(x - 2, y - 1, w + 4, h + 2)
  ctx.fillRect(x - 1, y - 2, w + 2, h + 4)
  ctx.fillStyle = border
  ctx.fillRect(x - 1, y, w + 2, h)
  ctx.fillRect(x, y - 1, w, h + 2)
  ctx.fillStyle = fill
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(x + 1, y + 1, w - 2, 2)
}

// Speech bubble anchored at (x,y) = the tip, in screen space.
export function bubble(str, x, y, opts = {}) {
  const { color = '#1a1020', fill = '#fff', max = 22 } = opts
  const lines = wrap(str, max)
  const w = Math.max(...lines.map((l) => l.length)) * 6 + 10
  const h = lines.length * 9 + 7
  let bx = Math.round(Math.min(Math.max(x - w / 2, 4), W - w - 4))
  const by = Math.round(y - h - 5)
  box(bx, by, w, h, fill, '#1a1020')
  ctx.fillStyle = fill
  ctx.fillRect(x - 2, by + h, 5, 2); ctx.fillRect(x - 1, by + h + 2, 3, 2); ctx.fillRect(x, by + h + 4, 1, 1)
  lines.forEach((l, i) => text(l, bx + w / 2, by + 5 + i * 9, { size: 6, color, outline: null }))
}

// ---------------------------------------------------------------- particles
export class Particles {
  constructor() { this.list = [] }
  add(p) { this.list.push({ vx: 0, vy: 0, g: 0, life: 1, max: p.life || 1, size: 2, color: '#fff', ...p }) }
  burst(x, y, n, colors, speed = 80, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.4 + Math.random() * 0.8)
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, g: 200, life: 0.4 + Math.random() * 0.4, color: colors[i % colors.length], size: 2, ...opts })
    }
  }
  pop(x, y, str, color = '#ffd23f', size = 8) {
    this.add({ x, y, vy: -40, life: 0.9, kind: 'text', str, color, size })
  }
  hearts(x, y, n = 6) {
    for (let i = 0; i < n; i++) this.add({ x: x + (Math.random() - 0.5) * 30, y: y + Math.random() * 10, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 40, life: 1.2 + Math.random(), kind: 'heart' })
  }
  update(dt) {
    for (const p of this.list) {
      p.vy += p.g * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life -= dt
    }
    this.list = this.list.filter((p) => p.life > 0)
  }
  draw(camX = 0, camY = 0) {
    for (const p of this.list) {
      const x = Math.round(p.x - camX), y = Math.round(p.y - camY)
      const a = Math.min(1, p.life / (p.max * 0.5))
      if (p.kind === 'text') { text(p.str, x, y, { size: p.size, color: p.color, alpha: a }); continue }
      if (p.kind === 'heart') { ctx.globalAlpha = a; drawHeart(x, y, 1); ctx.globalAlpha = 1; continue }
      if (p.kind === 'ring') {
        ctx.strokeStyle = p.color; ctx.globalAlpha = a; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(x, y, (1 - p.life / p.max) * p.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; continue
      }
      ctx.globalAlpha = a
      ctx.fillStyle = p.color
      ctx.fillRect(x, y, p.size, p.size)
      ctx.globalAlpha = 1
    }
  }
}

const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']
export function drawHeart(x, y, s = 1, color = '#ff2e63', empty = false) {
  for (let r = 0; r < HEART.length; r++) for (let c = 0; c < 7; c++) {
    if (HEART[r][c] !== '#') continue
    const edge = r === 0 || c === 0 || c === 6 || HEART[r + 1]?.[c] !== '#' || HEART[r][c - 1] !== '#' || HEART[r][c + 1] !== '#'
    ctx.fillStyle = empty ? (edge ? '#1a1020' : '#4a3355') : edge ? '#1a1020' : r === 1 && c === 1 ? '#fff' : color
    ctx.fillRect(Math.round(x - 3.5 * s) + c * s, Math.round(y - 3 * s) + r * s, s, s)
  }
}

// ---------------------------------------------------------------- banners (big center text)
export class Banners {
  constructor() { this.list = [] }
  show(lines, dur = 2.5, opts = {}) {
    this.list.push({ lines: Array.isArray(lines) ? lines : [lines], t: 0, dur, ...opts })
  }
  clear() { this.list = [] }
  get busy() { return this.list.length > 0 }
  update(dt) {
    for (const b of this.list) b.t += dt
    this.list = this.list.filter((b) => b.t < b.dur)
  }
  draw() {
    for (const b of this.list) {
      const inT = Math.min(1, b.t / 0.25)
      const outT = Math.min(1, (b.dur - b.t) / 0.3)
      const a = Math.min(inT, outT)
      const scale = 1 + (1 - inT) * 0.6
      const y0 = b.y ?? 70
      b.lines.forEach((l, i) => {
        const big = i === 0 && !b.small
        const size = big ? (b.size || 16) : 8
        ctx.save()
        ctx.translate(W / 2, y0 + i * 22)
        ctx.scale(scale, scale)
        const wob = big ? Math.sin(b.t * 6) * 1.5 : 0
        text(l, 0, wob, { size, color: big ? (b.color || '#ffd23f') : '#fff', alpha: a, outline: '#1a1020' })
        ctx.restore()
      })
    }
  }
}

// ---------------------------------------------------------------- misc
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
