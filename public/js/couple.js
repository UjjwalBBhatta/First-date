// The two of them side by side, holding hands. (x, y) = midpoint between them at feet level.
import { ctx, drawHeart } from './engine.js'
import * as S from './sprites.js'

export function drawCouple(x, y, t, { walking = false, sitting = false, holding = true, heart = true } = {}) {
  const fA = sitting ? 'sit' : walking ? (Math.floor(t * 6) % 2 ? 'walk1' : 'walk2') : 'idle'
  const fB = sitting ? 'sit' : walking ? (Math.floor(t * 6 + 1) % 2 ? 'walk1' : 'walk2') : 'idle'
  const bob = walking ? (Math.floor(t * 6) % 2) : 0
  S.draw('bf', blinkFrame(fA, t), x - 8, y - bob)
  S.draw('gf', blinkFrame(fB, t + 1.3), x + 8, y - (1 - bob))
  if (holding) {
    // joined hands
    const hy = Math.round(y - 8 - bob * 0.5)
    ctx.fillStyle = '#1a1020'
    ctx.fillRect(Math.round(x) - 3, hy - 1, 6, 4)
    ctx.fillStyle = '#ffc98e'
    ctx.fillRect(Math.round(x) - 2, hy, 4, 2)
    if (heart) drawHeart(x, y - 30 + Math.sin(t * 3) * 2, 1)
  }
}

export function blinkFrame(f, t) {
  return f === 'idle' && (t % 3.2) > 3.05 ? 'blink' : f
}
