// Shared game state + scene switching with a pixel "iris" fade.
import { W, H, ctx } from './engine.js'

const SAVE_KEY = 'kq-save'

function loadSave() {
  try { return { inventory: [], completed: [], ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') } } catch { return { inventory: [], completed: [] } }
}

export const game = {
  scenes: {},
  scene: null,
  sceneName: '',
  fade: 0, // 0 = clear, 1 = black
  fadeDir: 0,
  pending: null,
  save: loadSave(),
  run: { momos: 0, momoTotal: 0, oops: 0, start: 0 },
  time: 0,
  paused: false,

  go(name, args) {
    if (this.pending) return
    this.pending = { name, args }
    this.fadeDir = 1
  },
  now(name, args) {
    this.sceneName = name
    this.scene = this.scenes[name](args)
  },
  addItem(id) {
    if (!this.save.inventory.includes(id)) this.save.inventory.push(id)
    if (!this.save.completed.includes('level1')) this.save.completed.push('level1')
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.save))
  },
  updateFade(dt) {
    if (this.fadeDir === 1) {
      this.fade = Math.min(1, this.fade + dt * 2.5)
      if (this.fade >= 1) {
        const p = this.pending
        this.pending = null
        this.now(p.name, p.args)
        this.fadeDir = -1
      }
    } else if (this.fadeDir === -1) {
      this.fade = Math.max(0, this.fade - dt * 2.5)
      if (this.fade <= 0) this.fadeDir = 0
    }
  },
  drawFade() {
    if (this.fade <= 0) return
    // chunky checker-dissolve so it feels pixel-y
    const s = 12
    const f = this.fade
    ctx.fillStyle = '#1a1020'
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
      const d = ((x / s + y / s) % 4) / 4
      const k = Math.max(0, Math.min(1, f * 1.6 - d * 0.6))
      if (k <= 0) continue
      const sz = Math.ceil(s * k)
      ctx.fillRect(x + (s - sz) / 2, y + (s - sz) / 2, sz, sz)
    }
  },
}
