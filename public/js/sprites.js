// Hand-made pixel sprites. Each sprite is a list of strings; each char is a palette key ('.' = transparent).
// All sprites face RIGHT; pass { flip: true } to face left.
//
// To use your own character art, drop transparent PNGs in /img/custom/ (boyfriend.png, girlfriend.png, noob.png).
// They are auto-detected and replace the matching pixel sprite everywhere.
import { ctx } from './engine.js'

const BASE = {
  O: '#1a1020', K: '#2a1630', k: '#57306b', S: '#ffc98e', s: '#e89a64', E: '#1a1020', W: '#ffffff',
  B: '#ff5d8f', M: '#b8324a',
  // boyfriend: MIT cardinal hoodie + jeans + white kicks
  H: '#d2112f', h: '#8a0c21', J: '#2f3a9f', j: '#1f2766', T: '#ffffff',
  // girlfriend: hot-pink dress, sunflower ribbon, purple shoes
  D: '#ff2e88', d: '#b8106a', R: '#ffd23f', P: '#7a2bff',
  // noobs
  Y: '#ffd800', C: '#1e6bff', c: '#1347b0', G: '#2fbf3a', V: '#45e8ff',
  // props
  w: '#d8ccb8', r: '#ff6b6b', X: '#e8323c', Q: '#ffd23f',
}

const legsIdle = ['..OJJJJJJJJO..', '..OJJjOOjJJO..', '..OJJO..OJJO..', '.OTTTO..OTTTO.', '.OOOOO..OOOOO.']
const BF_TOP = [
  '....OOOOOO....',
  '...OKKKKKKO...',
  '..OKKkkKKKKO..',
  '.OKKKKKKKKKKO.',
  '.OKKSKKKKSKKO.',
  '.OKSSSSSSSSKO.',
  '.OSSWESSSWESO.',
  '.OSSEESSSEESO.',
  '.OSBSSSMSSBSO.',
  '..OSSSSSSSSO..',
  '...OOHHHHOO...',
  '..OHHWHHWHHO..',
  '.OSHHHHHHHHSO.',
  '.OSHhHHHHhHSO.',
  '..OHHHHHHHHO..',
]
const GF_TOP = [
  '....OOOOOOOOO.',
  '...OKKKKKKORRO',
  '..OKKkkKKKKORO',
  '.OKKKKKKKKKKKO',
  '.OKKKSSKSSKKKO',
  '.OKKSSSSSSSSKO',
  '.OKSWESSSWESKO',
  '.OKSEESSSEESKO',
  '.OKBSSSMSSSBKO',
  '.OKKSSSSSSSKKO',
  '.OKKOODDDOOKKO',
  '.OKODDWDDDDOKO',
  '.OSDDDDDDDDDSO',
  '.OSDdDDDDDdDSO',
  '..ODDDDDDDDDO.',
  '.ODDDDDDDDDDDO',
  '.OOOOOOOOOOOO.',
]
const NOOB_TOP = [
  '..OOOOOOOO..',
  '.OYYYYYYYYO.',
  '.OYYYYYYYYO.',
  '.OYEEYYEEYO.',
  '.OYEEYYWEYO.',
  '.OYYYYYYYYO.',
  '.OYMYYYYMYO.',
  '.OYYMMMMYYO.',
  '..OOOOOOOO..',
  'OOCCCCCCCCOO',
  'OYCCCCCCCCYO',
  'OYCcCCCCcCYO',
  'OOCCCCCCCCOO',
]

export const SPRITES = {
  bf: {
    idle: [...BF_TOP, ...legsIdle],
    walk1: [...BF_TOP, '..OJJJJJJJJO..', '.OJJjOOOOjJJO.', '.OJJO....OJJO.', 'OTTTO....OTTTO', 'OOOOO....OOOOO'],
    walk2: [...BF_TOP, '..OJJJJJJJJO..', '...OJJjjJJO...', '....OJJJJO....', '...OTTTTTTO...', '...OOOOOOOO...'],
    jump: [...BF_TOP.slice(0, 12), 'OSOHHHHHHHHOSO', '..OHhHHHHhHO..', '..OHHHHHHHHO..', '..OJJJJJJJJO..', '..OJJjOOjJJO..', '.OTTTO..OTTTO.', '.OOOOO..OOOOO.', '..............'],
    sit: [...BF_TOP, '..OJJJJJJJJJJO', '..OOOOOOOOOTTO', '...........OO.'],
    blink: [...BF_TOP.slice(0, 6), '.OSSSSSSSSSSO.', '.OSSEESSSEESO.', ...BF_TOP.slice(8), ...legsIdle],
  },
  gf: {
    idle: [...GF_TOP, '...OSO..OSO...', '..OPPO..OPPO..', '..OOOO..OOOO..'],
    walk1: [...GF_TOP, '..OSO....OSO..', '.OPPO....OPPO.', '.OOOO....OOOO.'],
    walk2: [...GF_TOP, '.....OSSO.....', '....OPPPPO....', '....OOOOOO....'],
    sit: [...GF_TOP.slice(0, 15), '.ODDDDDDDDDDSO', '.OOOOOOOOOOOPO', '...........OO.'],
    blink: [...GF_TOP.slice(0, 6), '.OKSSSSSSSSSKO', '.OKSEESSSEESKO', ...GF_TOP.slice(8), '...OSO..OSO...', '..OPPO..OPPO..', '..OOOO..OOOO..'],
  },
  noob: {
    idle: [...NOOB_TOP, '.OGGGOOGGGO.', '.OGGGOOGGGO.', '.OOOOOOOOOO.'],
    walk1: [...NOOB_TOP, '.OGGGOOGGGO.', '.OGGO..OGGO.', '.OOO....OOO.'],
    walk2: [...NOOB_TOP, '..OGGGGGGO..', '...OGGGGO...', '...OOOOOO...'],
    squish: ['..OOOOOOOO..', '.OYYYYYYYYO.', '.OYEYYYYEYO.', '.OYYMMMMYYO.', 'OOCCCCCCCCOO', 'OYCCCCCCCCYO', '.OGGGOOGGGO.', '.OOOOOOOOOO.'],
  },
  ghost: {
    idle: ['...OOOOOO...', '..OVVVVVVO..', '.OVVVVVVVVO.', '.OVEEVVEEVO.', '.OVEWVVEWVO.', '.OVBVVVVBVO.', '.OVVVMMVVVO.', '.OVVVVVVVVO.', '.OVOOVVOOVO.', '.OO..OO..OO.'],
  },
  reader: {
    idle: ['..OOOOOO..', '.OKKKKKKO.', 'OKKKKKKKKO', 'OKSSSSSSKO', 'OSOOSSOOSO', 'OSBSSSSBSO', '.OSSMMSSO.', '..OOOOOO..', '.OCCCCCCO.', 'OCCCCCCCCO', 'OCCCCCCCCO'],
    sleep: ['..OOOOOO..', '.OKKKKKKO.', 'OKKKKKKKKO', 'OKSSSSSSKO', 'OSOOSSOOSO', 'OSSSSSSSSO', '.OSSOOSSO.', '..OOOOOO..', '.OCCCCCCO.', 'OCCCCCCCCO', 'OCCCCCCCCO'],
  },
  momo: {
    idle: ['....OO....', '...OWWO...', '..OWWwWO..', '.OWwWWwWO.', 'OWWWWWWWWO', 'OWWWWWWWWO', '.OwwwwwwO.', '..OOOOOO..'],
  },
  bookmark: {
    idle: ['OOOOOOO', 'OrXXXrO', 'OXXXXXO', 'OXWXWXO', 'OXWWWXO', 'OXXWXXO', 'OXXXXXO', 'OXQQQXO', 'OXXXXXO', 'OXQQQXO', 'OXXXXXO', 'OXXOXXO', 'OXO.OXO', 'OO...OO'],
  },
  note: {
    idle: ['OOOOOOOOOO', 'OWWWWWWWwO', 'OWOOOOOWwO', 'OWWWWWWWwO', 'OWOOOOWXwO', 'OWWWWWXXXO', 'OwwwwwwXwO', 'OOOOOOOOOO'],
  },
  cow: {
    idle: [
      '..OO.........OO.',
      '.OWWOOOOOOOOOWWO',
      '.OWWWWWKKWWWWWWO',
      'OWWKKWWWWWWKWWWO',
      'OWWKKWWWWWWWWWWOOO',
      'OWWWWWWWKKWWWWWWBO',
      'OWWWWWWKKKWWWWWWWO',
      '.OOWWOOOOOOOWWOOO.',
      '..OWWO.....OWWO...',
      '..OKKO.....OKKO...',
    ],
  },
  dog: {
    idle: ['.......OO...', '......OssO..', 'O....OsssEO.', 'Os..OsssssO.', '.OsssssssO..', '.OsssssssO..', '.OsO.OsO....', '.OO..OO.....'],
  },
}

// Palette variants for noob types
export const PALS = {
  classic: {},
  chaser: { C: '#ff3b3b', c: '#b01e1e' },
  jumper: { C: '#9b3bff', c: '#6a1fd1', G: '#ff8a1e', g: '#b85a00' },
  popper: { C: '#ff8a1e', c: '#b85a00' },
  boss: { C: '#1a1a1a', c: '#000', G: '#444', g: '#222' },
}
export const READER_PALS = [
  { C: '#2fbf3a', K: '#2a1630' }, { C: '#ff8a1e', K: '#6b3a1e' }, { C: '#7a2bff', K: '#1a1020' },
  { C: '#1e6bff', K: '#c08a2e' }, { C: '#ff2e88', K: '#2a1630' }, { C: '#00a6a6', K: '#888' },
]

const cache = new Map()
function build(name, frame, pal, flash) {
  const key = `${name}|${frame}|${JSON.stringify(pal)}|${flash ? 1 : 0}`
  if (cache.has(key)) return cache.get(key)
  const rows = SPRITES[name][frame] || SPRITES[name].idle
  const w = Math.max(...rows.map((r) => r.length))
  const c = document.createElement('canvas')
  c.width = w
  c.height = rows.length
  const g = c.getContext('2d')
  const P = { ...BASE, ...pal }
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.' || !P[ch]) continue
      g.fillStyle = flash ? (ch === 'O' ? '#fff' : '#ffffff') : P[ch]
      g.fillRect(x, y, 1, 1)
    }
  })
  cache.set(key, c)
  return c
}

export function spriteSize(name, frame = 'idle') {
  const rows = SPRITES[name][frame] || SPRITES[name].idle
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length }
}

// ---- custom art overrides
const OVERRIDES = { bf: 'boyfriend', gf: 'girlfriend', noob: 'noob' }
const overrideImgs = {}
for (const [k, file] of Object.entries(OVERRIDES)) {
  const im = new Image()
  im.onload = () => { overrideImgs[k] = im }
  im.onerror = () => {}
  im.src = `/img/custom/${file}.png`
}

// Draw a sprite so that (x, y) is its bottom-center (feet).
export function draw(name, frame, x, y, opts = {}) {
  const { flip = false, scale = 1, pal = {}, alpha = 1, flash = false, rot = 0, sy = 1 } = opts
  const ov = overrideImgs[name]
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(Math.round(x), Math.round(y))
  if (rot) ctx.rotate(rot)
  ctx.scale(flip ? -scale : scale, scale * sy)
  if (ov && frame !== 'squish') {
    const ref = spriteSize(name, 'idle')
    const h = ref.h
    const w = (ov.naturalWidth / ov.naturalHeight) * h
    const bob = frame === 'walk1' || frame === 'walk2' ? -1 : 0
    const sit = frame === 'sit' ? 0.85 : 1
    ctx.imageSmoothingEnabled = false
    if (flash) ctx.filter = 'brightness(3)'
    ctx.drawImage(ov, -w / 2, -h * sit + bob, w, h * sit)
  } else {
    const c = build(name, frame, pal, flash)
    ctx.drawImage(c, -Math.floor(c.width / 2), -c.height)
  }
  ctx.restore()
}

// Pixel sword held by a character; angle in radians (0 = pointing forward/right).
export function drawSword(x, y, angle, flip = false, len = 16, glow = false) {
  ctx.save()
  ctx.translate(Math.round(x), Math.round(y))
  ctx.scale(flip ? -1 : 1, 1)
  ctx.rotate(angle)
  ctx.fillStyle = '#1a1020'
  ctx.fillRect(-2, -2, len + 4, 5)
  ctx.fillStyle = glow ? '#fff7a8' : '#dfe8ff'
  ctx.fillRect(2, -1, len, 3)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(2, -1, len, 1)
  ctx.fillStyle = '#ffd23f'
  ctx.fillRect(0, -4, 2, 9)
  ctx.fillStyle = '#7a3b12'
  ctx.fillRect(-4, -1, 4, 3)
  ctx.restore()
}
