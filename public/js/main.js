import { W, H, ctx, input, audio, text, box, img, backdrop, drawHeart } from './engine.js'
import { game } from './game.js'
import { STORY, ITEMS, SONGS } from './story.js'
import * as S from './sprites.js'
import { platformer } from './scenes/platformer.js'
import { walk } from './scenes/walk.js'
import { library } from './scenes/library.js'
import { battle } from './scenes/battle.js'
import { garden } from './scenes/garden.js'

// ---------------------------------------------------------------- title
function title() {
  const bg = img('/img/bg-mit.png')
  let t = 0
  return {
    update(dt) {
      t += dt
      audio.music(SONGS.walk)
      if (input.confirm()) { audio.play('checkpoint'); game.run = { momos: 0, momoTotal: 0, oops: 0, start: performance.now() }; game.go('platformer') }
      const jump = { d1: 'platformer', d2: 'walk', d3: 'library', d4: 'battle', d5: 'garden' }
      for (const k in jump) if (input.hit(k)) { game.run.start = performance.now(); game.go(jump[k]) }
    },
    draw() {
      ctx.fillStyle = '#1a1020'
      ctx.fillRect(0, 0, W, H)
      backdrop(bg, t * 6)
      ctx.fillStyle = 'rgba(26,16,32,0.35)'
      ctx.fillRect(0, 0, W, H)
      const wob = Math.sin(t * 2) * 2
      text(STORY.title, W / 2, 24 + wob, { size: 16, color: '#ffd23f' })
      text(STORY.subtitle, W / 2, 46, { size: 8, color: '#ff8fc8' })
      box(W / 2 - 92, 66, 184, 52, '#d2112f', '#ffd23f')
      text(STORY.level[0], W / 2, 74, { size: 16, color: '#fff' })
      text(STORY.level[1], W / 2, 98, { size: 8, color: '#ffd23f' })
      // characters on the title
      S.draw('bf', Math.floor(t * 4) % 2 ? 'walk1' : 'walk2', 150 + Math.sin(t) * 4, 176, { scale: 2 })
      S.draw('gf', (t % 3) > 2.85 ? 'blink' : 'idle', 234, 176, { scale: 2, flip: true })
      drawHeart(192, 130 + Math.sin(t * 3) * 3, 2)
      if (Math.floor(t * 2) % 2 === 0) text('PRESS ENTER / TAP TO START', W / 2, 186, { size: 8 })
      text('1-5: jump to a chapter   I: inventory   M: mute', W / 2, 204, { size: 5, color: '#ffe0a8' })
      if (game.save.inventory.length) {
        text('INVENTORY:', 8, 8, { size: 6, align: 'left', color: '#ffd23f' })
        game.save.inventory.forEach((id, i) => S.draw(ITEMS[id].sprite, 'idle', 76 + i * 12, 22))
      }
    },
  }
}

game.scenes = { title, platformer, walk, library, battle, garden }
game.now('title')

// ---------------------------------------------------------------- inventory overlay
function drawInventory() {
  ctx.fillStyle = 'rgba(26,16,32,0.75)'
  ctx.fillRect(0, 0, W, H)
  box(W / 2 - 120, 40, 240, 136, '#2b1b4a', '#ffd23f')
  text('🎒 INVENTORY', W / 2, 50, { size: 8, color: '#ffd23f' })
  const inv = game.save.inventory
  for (let i = 0; i < 6; i++) {
    const x = W / 2 - 105 + i * 36, y = 70
    box(x, y, 30, 30, '#3d2a63', '#7a5cb0')
    const id = inv[i]
    if (id) S.draw(ITEMS[id].sprite, 'idle', x + 15, y + 26, { scale: 1.5 })
  }
  if (inv[0]) {
    text(ITEMS[inv[0]].name, W / 2, 116, { size: 8, color: '#fff' })
    text(ITEMS[inv[0]].desc, W / 2, 132, { size: 6, color: '#ffb3d9' })
  } else text('empty... for now 👀', W / 2, 122, { size: 8, color: '#bba' })
  text('press I to close', W / 2, 160, { size: 6, color: '#bba' })
}

// ---------------------------------------------------------------- loop
let last = performance.now()
function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000)
  last = now
  game.time += dt
  if (input.hit('mute')) audio.toggleMute()
  if (input.hit('inv')) game.paused = !game.paused
  if (!game.paused && !game.pending) game.scene.update(dt)
  game.updateFade(dt)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  game.scene.draw()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (game.paused) drawInventory()
  if (audio.muted) text('🔇', W - 10, 4, { size: 8, outline: null })
  game.drawFade()
  input.endFrame()
  requestAnimationFrame(frame)
}
document.fonts?.load(`8px "Press Start 2P"`).finally(() => requestAnimationFrame(frame))
