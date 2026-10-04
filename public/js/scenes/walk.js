// Calm walk from the pickup spot through Thamel to Kaiser Library, holding hands.
import { W, H, ctx, input, audio, Particles, Banners, text, box, bubble, drawHeart, img, backdrop, clamp } from '../engine.js'
import * as S from '../sprites.js'
import { game } from '../game.js'
import { STORY, SONGS } from '../story.js'
import { drawCouple } from '../couple.js'

const GROUND = 184
const END = 2240
const SPEED = 46

const SHOPS = ['THAMEL', 'MOMO', 'CAFE', 'BOOKS', 'CHIYA', 'PASHMINA', 'THANGKA', 'LASSI', 'MOMO', 'TEA']
const SHOP_COLORS = ['#ff2e88', '#1e6bff', '#2fbf3a', '#ff8a1e', '#7a2bff', '#d2112f', '#00a6a6']

export function walk() {
  const city = img('/img/bg-city.png')
  const kaiser = img('/img/bg-kaiser-out.png')
  const parts = new Particles()
  const banners = new Banners()
  let x = 60
  let t = 0
  let camX = 0
  let moving = false
  let said = new Set()
  let talk = null
  let dog = null
  let entering = false
  let heartCD = 1

  banners.show(['WALK TOGETHER 🤝', 'hold → to walk to the library'], 3, { size: 16, color: '#ff8fc8', y: 60 })

  function update(dt) {
    t += dt
    audio.music(SONGS.walk)
    const ax = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0)
    moving = false
    if (!entering && ax !== 0) {
      const nx = clamp(x + ax * SPEED * dt, 40, END)
      moving = nx !== x
      if (moving && Math.floor(t * 6) !== Math.floor((t - dt) * 6)) audio.play('step')
      x = nx
    }
    for (const w of STORY.walk) {
      if (x >= w.x && !said.has(w.x)) { said.add(w.x); talk = { ...w, t: 3 }; audio.play('blip') }
    }
    if (talk) { talk.t -= dt; if (talk.t <= 0) talk = null }
    if (!dog && x > 1480) { dog = { x: x - 120 }; parts.pop(x - 100, GROUND - 30, 'woof!', '#fff', 6) }
    if (dog) dog.x += (x - 46 - dog.x) * Math.min(1, dt * 2)
    heartCD -= dt
    if (moving && heartCD <= 0) { parts.hearts(x, GROUND - 26, 1); heartCD = 1.2 + Math.random() }
    if (x >= END && !entering && (input.hit('up') || input.confirm())) {
      entering = true
      audio.play('fanfare')
      banners.show(['KAISER LIBRARY', 'Kathmandu, est. 1907 📚'], 2.2, { size: 16, color: '#ffd23f', y: 60 })
      setTimeout(() => game.go('library'), 2000)
    }
    parts.update(dt)
    banners.update(dt)
    camX += (clamp(x - W / 2, 0, END + 80 - W) - camX) * Math.min(1, dt * 4)
  }

  function drawShops() {
    const off = camX * 0.6
    const fadeOut = clamp((x - 1650) / 400, 0, 1)
    if (fadeOut >= 1) return
    ctx.globalAlpha = 1 - fadeOut
    for (let i = 0; i < 26; i++) {
      const sx = Math.round(i * 74 - off)
      if (sx > W || sx + 70 < 0) continue
      const h = 64 + ((i * 37) % 30)
      const top = GROUND - h
      const c = SHOP_COLORS[i % SHOP_COLORS.length]
      ctx.fillStyle = '#1a1020'; ctx.fillRect(sx - 1, top - 1, 68, h + 2)
      ctx.fillStyle = i % 2 ? '#c9603a' : '#b5462c'; ctx.fillRect(sx, top, 66, h)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      for (let y = top + 4; y < GROUND; y += 6) ctx.fillRect(sx, y, 66, 1)
      // signboard
      box(sx + 6, top + 8, 54, 14, c, '#fff')
      text(SHOPS[i % SHOPS.length], sx + 33, top + 12, { size: 5, color: '#fff' })
      // shop front with awning
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#fff' : c; ctx.fillRect(sx + 4 + k * 10, GROUND - 34, 10, 6) }
      ctx.fillStyle = '#1a1020'; ctx.fillRect(sx + 8, GROUND - 28, 50, 28)
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(sx + 10, GROUND - 26, 46, 26)
      ctx.fillStyle = '#7a3b12'
      for (let k = 0; k < 4; k++) ctx.fillRect(sx + 12 + k * 11, GROUND - 22, 8, 4)
      // prayer flags strung across
      const cols = ['#1e6bff', '#fff', '#ff2e2e', '#2fbf3a', '#ffd800']
      for (let k = 0; k < 18; k++) {
        ctx.fillStyle = cols[k % 5]
        ctx.fillRect(sx + 66 + k * 0.5 + k * 3 - 70, top - 4 + Math.sin(k / 5.7 * Math.PI) * 6, 3, 4)
      }
    }
    ctx.globalAlpha = 1
  }

  function drawMap() {
    const mx = W - 104, my = 6
    box(mx, my, 98, 38, '#fff2c8', '#7a3b12')
    text('MAP', mx + 4, my + 3, { size: 5, color: '#7a3b12', align: 'left', outline: null })
    const stops = [['MIT', 0], ['PICKUP', 0.25], ['THAMEL', 0.6], ['KAISER', 1]]
    const lx = mx + 10, lw = 78, ly = my + 22
    ctx.fillStyle = '#7a3b12'
    for (let i = 0; i < lw; i += 4) ctx.fillRect(lx + i, ly, 2, 1)
    for (const [name, f] of stops) {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(lx + lw * f - 2, ly - 2, 5, 5)
      ctx.fillStyle = f === 1 ? '#ffd23f' : '#ff2e88'; ctx.fillRect(lx + lw * f - 1, ly - 1, 3, 3)
      text(name, lx + lw * f, ly + 6, { size: 4, color: '#1a1020', outline: null })
    }
    const f = 0.25 + 0.75 * clamp(x / END, 0, 1)
    drawHeart(lx + lw * f, ly - 6 + Math.sin(t * 4), 1)
  }

  function draw() {
    ctx.fillStyle = '#ffcf3f'; ctx.fillRect(0, 0, W, H)
    const blend = clamp((x - 1750) / 350, 0, 1)
    backdrop(city, camX * 0.15 + 900, 1, -14)
    if (blend > 0) backdrop(kaiser, 0, blend, 0)
    drawShops()
    ctx.save()
    ctx.translate(-Math.round(camX), 0)
    // road + sidewalk
    ctx.fillStyle = '#1a1020'; ctx.fillRect(camX - 2, GROUND - 1, W + 4, 1)
    for (let sx = Math.floor(camX / 16) * 16; sx < camX + W + 16; sx += 16) {
      ctx.fillStyle = (sx / 16) % 2 ? '#c9b8a0' : '#b8a68c'; ctx.fillRect(sx, GROUND, 16, 8)
      ctx.fillStyle = '#8a7a66'; ctx.fillRect(sx, GROUND + 7, 16, 1)
    }
    ctx.fillStyle = '#4a4458'; ctx.fillRect(camX, GROUND + 8, W, H - GROUND - 8)
    for (let sx = Math.floor(camX / 40) * 40; sx < camX + W + 40; sx += 40) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(sx, GROUND + 19, 20, 2) }
    // the cow
    S.draw('cow', 'idle', 720, GROUND + 2)
    if (Math.abs(x - 720) < 90) bubbleAt('MOO.', 724, GROUND - 14)
    // library door marker
    if (x > END - 140) {
      const ex = END + 10
      ctx.fillStyle = '#1a1020'; ctx.fillRect(ex - 13, GROUND - 40, 26, 40)
      ctx.fillStyle = '#7a3b12'; ctx.fillRect(ex - 12, GROUND - 39, 24, 39)
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(ex + 6, GROUND - 22, 2, 3)
      text('📚', ex, GROUND - 52 + Math.sin(t * 4) * 2, { size: 8, outline: null })
    }
    if (dog) S.draw('dog', Math.floor(t * 5) % 2 ? 'idle' : 'idle', dog.x, GROUND + 1, { flip: false })
    drawCouple(x, GROUND + 1, t, { walking: moving })
    parts.draw()
    ctx.restore()
    if (talk) bubble(talk.text, (talk.who === 'bf' ? x - 8 : x + 8) - camX, GROUND - 30)
    // HUD
    text("NOW LET'S GO TO THE LIBRARY 📚", 8, 8, { size: 6, color: '#ffd23f', align: 'left' })
    drawMap()
    if (x >= END && !entering && Math.floor(t * 2) % 2 === 0) text('▲ / ENTER: GO INSIDE', W / 2, 150, { size: 8, color: '#fff' })
    banners.draw()
  }

  function bubbleAt(str, wx, wy) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0)
    bubble(str, wx - camX, wy)
    ctx.restore()
  }

  return { update, draw }
}
