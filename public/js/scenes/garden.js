// The garden: sitting together, secretly passing notes while the nosy garden uncle isn't looking.
// Ends with her handmade bookmark → inventory.
import { W, H, ctx, input, audio, Particles, Banners, text, box, bubble, drawHeart, img, backdrop, clamp, lerp, wrap } from '../engine.js'
import * as S from '../sprites.js'
import { game } from '../game.js'
import { STORY, SONGS } from '../story.js'

const GROUND = 190
const BENCH_X = 172
const BF_X = BENCH_X - 22
const GF_X = BENCH_X + 22
const UNCLE_X = 318
const UNCLE_PAL = { K: '#c8c8d0', k: '#ffffff', H: '#2f8a3a', h: '#1f5a28', J: '#6b4a2a', j: '#4a3018', T: '#3a2a1a' }

export function garden() {
  const bg = img('/img/bg-garden.png')
  const parts = new Particles()
  const banners = new Banners()
  const notes = STORY.garden.notes
  let t = 0
  let i = 0 // current note
  let prog = 0
  let card = null // { note, t }
  let phase = 'intro' // intro, notes, gift, reward, summary
  let phaseT = 0
  let uncle = { state: 'away', t: 2.5 }
  let uncleTalk = null
  let caught = 0
  let bfTalk = null
  let gift = null
  const flies = Array.from({ length: 5 }, (_, k) => ({ x: 40 + k * 70, y: 80 + (k % 3) * 20, s: Math.random() * 6, c: ['#ff2e88', '#ffd23f', '#45e8ff', '#ff8a1e', '#fff'][k] }))

  audio.music(SONGS.garden)
  banners.show(['THE GARDEN 🌳', STORY.garden.intro], 3, { size: 16, color: '#8cff5a', y: 54 })

  function updateUncle(dt) {
    uncle.t -= dt
    if (uncle.t > 0) return
    if (uncle.state === 'away') { uncle.state = 'turning'; uncle.t = 0.65; audio.play('blip') }
    else if (uncle.state === 'turning') { uncle.state = 'watching'; uncle.t = 1.3 + Math.random() * 1.2 }
    else { uncle.state = 'away'; uncle.t = 1.8 + Math.random() * 2.2 }
  }

  function deliver() {
    audio.play('paper')
    parts.hearts(notes[i].from === 'bf' ? GF_X : BF_X, GROUND - 40, 3)
    card = { note: notes[i], t: 0 }
    prog = 0
  }

  function update(dt) {
    t += dt; phaseT += dt
    audio.music(SONGS.garden)
    for (const f of flies) { f.s += dt; f.x += Math.cos(f.s * 0.7) * 20 * dt; f.y += Math.sin(f.s * 2.1) * 14 * dt }
    if (uncleTalk) { uncleTalk.t -= dt; if (uncleTalk.t <= 0) uncleTalk = null }
    if (bfTalk) { bfTalk.t -= dt; if (bfTalk.t <= 0) bfTalk = null }

    if (phase === 'intro') {
      updateUncle(dt)
      if (phaseT > 3) { phase = 'notes'; phaseT = 0 }
    } else if (phase === 'notes') {
      if (card) {
        card.t += dt
        if (card.t > 0.4 && input.confirm()) {
          card = null
          audio.play('blip')
          i++
          if (i >= notes.length) { phase = 'gift'; phaseT = 0; uncle = { state: 'away', t: 99 } }
        }
      } else {
        updateUncle(dt)
        const n = notes[i]
        const sliding = n.from === 'bf' ? input.down('jump') || input.down('ok') || input.down('right') : uncle.state === 'away' && uncle.t > 0.5
        if (sliding) {
          prog += dt / 1.2
          if (Math.floor(prog * 8) !== Math.floor((prog - dt / 1.2) * 8)) audio.play('step')
        }
        if (uncle.state === 'watching' && prog > 0.02) {
          prog = 0; caught++
          audio.play('ahem')
          uncleTalk = { str: ['AHEM!', 'what is that?!', 'no notes in my garden', 'young people these days...'][caught % 4], t: 1.6 }
          bfTalk = { str: n.from === 'bf' ? '🎵 *whistles innocently*' : '(she hid it so fast)', t: 1.6 }
          parts.pop(BENCH_X, GROUND - 46, 'CAUGHT!', '#ff3b3b')
        }
        if (prog >= 1) deliver()
      }
    } else if (phase === 'gift') {
      if (phaseT > 0.4 && !gift) { gift = { t: 0 }; bfTalk = { str: STORY.garden.gift, t: 2.2, gf: true } }
      if (gift) {
        gift.t += dt
        if (gift.t > 2.2 && !gift.flew) { gift.flew = true; audio.play('sparkle') }
        if (gift.t > 3.6 && !gift.done) {
          gift.done = true
          phase = 'reward'; phaseT = 0
          audio.stopMusic(); audio.play('fanfare')
          game.addItem('bookmark')
          parts.hearts(BENCH_X, GROUND - 30, 16)
          parts.burst(BENCH_X, GROUND - 50, 30, ['#ffd23f', '#ff2e88', '#fff', '#45e8ff'], 140)
        }
      }
    } else if (phase === 'reward') {
      if (Math.random() < dt * 6) parts.burst(Math.random() * W, -4, 3, ['#ffd23f', '#ff2e88', '#45e8ff', '#8cff5a'], 30, { g: 60, life: 2.5 })
      if (phaseT > 4.5 && input.confirm()) { phase = 'summary'; phaseT = 0; audio.play('blip') }
    } else if (phase === 'summary') {
      if (phaseT > 0.5 && input.confirm()) game.go('title')
    }
    parts.update(dt)
    banners.update(dt)
  }

  function drawBench() {
    const x = BENCH_X - 44, y = GROUND - 14
    ctx.fillStyle = '#1a1020'
    ctx.fillRect(x - 1, y - 19, 90, 6); ctx.fillRect(x - 1, y - 1, 90, 6)
    ctx.fillRect(x + 4, y + 4, 5, 11); ctx.fillRect(x + 79, y + 4, 5, 11)
    ctx.fillStyle = '#c47a2c'; ctx.fillRect(x, y - 18, 88, 4); ctx.fillRect(x, y, 88, 4)
    ctx.fillStyle = '#e8a050'; ctx.fillRect(x, y - 18, 88, 1); ctx.fillRect(x, y, 88, 1)
    ctx.fillStyle = '#7a3b12'; ctx.fillRect(x + 5, y + 4, 3, 11); ctx.fillRect(x + 80, y + 4, 3, 11)
    ctx.fillRect(x + 8, y - 14, 3, 14); ctx.fillRect(x + 77, y - 14, 3, 14)
  }

  function drawCard() {
    const c = card
    const k = Math.min(1, c.t * 5)
    const w = 220, h = 110
    const x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - k) * 30
    ctx.globalAlpha = k
    ctx.fillStyle = 'rgba(26,16,32,0.5)'; ctx.fillRect(0, 0, W, H)
    box(x, y, w, h, '#fffbea', '#1a1020')
    ctx.fillStyle = '#ffb3c8'; for (let ly = y + 30; ly < y + h - 12; ly += 12) ctx.fillRect(x + 8, ly, w - 16, 1)
    ctx.fillStyle = '#ff5d8f'; ctx.fillRect(x + 22, y + 4, 1, h - 8)
    const from = c.note.from === 'bf' ? `from ${STORY.boyName.toLowerCase()} → to ${STORY.girlName.toLowerCase()}` : `from ${STORY.girlName.toLowerCase()} → to ${STORY.boyName.toLowerCase()}`
    text(from, x + 30, y + 10, { size: 5, color: '#b8106a', align: 'left', outline: null })
    wrap(c.note.text, 28).forEach((l, n) => text(l, x + 30, y + 22 + n * 12, { size: 8, color: '#1a1020', align: 'left', outline: null }))
    drawHeart(x + w - 16, y + h - 16, 2)
    if (Math.floor(t * 2) % 2 === 0) text('ENTER ▶', x + w - 30, y + h - 12, { size: 5, color: '#1a1020', outline: null, align: 'right' })
    ctx.globalAlpha = 1
  }

  function draw() {
    ctx.fillStyle = '#3cd23c'; ctx.fillRect(0, 0, W, H)
    backdrop(bg, Math.sin(t * 0.2) * 6 + 40, 1, 0)
    ctx.fillStyle = 'rgba(255,170,60,0.08)'; ctx.fillRect(0, 0, W, H)
    for (const f of flies) {
      const flap = Math.floor(t * 10 + f.s) % 2
      ctx.fillStyle = f.c; ctx.fillRect(f.x - 2, f.y - flap, 2, 2); ctx.fillRect(f.x + 1, f.y - flap, 2, 2)
      ctx.fillStyle = '#1a1020'; ctx.fillRect(f.x, f.y, 1, 2)
    }
    drawBench()
    // the couple, sitting a shy distance apart
    const seatY = GROUND - 13
    const lean = phase === 'reward' || phase === 'summary' ? 10 : gift ? 6 : 0
    S.draw('bf', 'sit', BF_X + lean, seatY)
    S.draw('gf', 'sit', GF_X - lean, seatY, { flip: !!gift || phase === 'reward' || phase === 'summary' })
    // nosy uncle
    const ux = UNCLE_X
    const facingCouple = uncle.state === 'watching'
    S.draw('bf', 'idle', ux, GROUND + 1, { pal: UNCLE_PAL, flip: facingCouple })
    ctx.fillStyle = '#c8c8d0'; ctx.fillRect(ux - 4, GROUND - 11, 8, 2) // mustache
    if (!facingCouple) {
      // watering the marigolds
      ctx.fillStyle = '#1a1020'; ctx.fillRect(ux + 8, GROUND - 10, 9, 7)
      ctx.fillStyle = '#45a0ff'; ctx.fillRect(ux + 9, GROUND - 9, 7, 5)
      if (Math.floor(t * 8) % 2) { ctx.fillStyle = '#9fe8ff'; ctx.fillRect(ux + 19, GROUND - 6, 1, 2); ctx.fillRect(ux + 21, GROUND - 3, 1, 2) }
    }
    for (let k = 0; k < 4; k++) { ctx.fillStyle = '#1a1020'; ctx.fillRect(ux + 18 + k * 7, GROUND - 6, 6, 6); ctx.fillStyle = k % 2 ? '#ff8a1e' : '#ffd23f'; ctx.fillRect(ux + 19 + k * 7, GROUND - 5, 4, 4) }
    if (phase === 'notes' || phase === 'intro') {
      if (uncle.state === 'turning') text('?', ux, GROUND - 40 + Math.sin(t * 12) * 2, { size: 12, color: '#ffd23f' })
      if (uncle.state === 'watching') text('👀', ux, GROUND - 40, { size: 12, outline: null })
    }
    // the note on the bench
    if (phase === 'notes' && !card) {
      const n = notes[i]
      const fromX = n.from === 'bf' ? BF_X + 8 : GF_X - 8
      const toX = n.from === 'bf' ? GF_X - 8 : BF_X + 8
      const nx = lerp(fromX, toX, clamp(prog, 0, 1))
      S.draw('note', 'idle', nx, GROUND - 13 + (prog > 0 ? Math.sin(t * 20) * 0.5 : 0))
    }
    // the bookmark gift
    if (gift && phase === 'gift') {
      const k = clamp((gift.t - 2.2) / 1.2, 0, 1)
      const gx = lerp(GF_X - 6, BF_X + 6, k)
      const gy = lerp(GROUND - 30, GROUND - 30, k) - Math.sin(k * Math.PI) * 30 + Math.sin(t * 4) * 2
      if (gift.t > 1) {
        S.draw('bookmark', 'idle', gx, gy, { scale: 1.5 })
        if (Math.random() < 0.3) parts.burst(gx, gy - 10, 1, ['#fff', '#ffd23f'], 20, { g: 0 })
      }
    }
    parts.draw()
    drawHeart(BENCH_X, GROUND - 46 + Math.sin(t * 3) * 2, phase === 'reward' || phase === 'summary' ? 2 : 1)
    if (uncleTalk) bubble(uncleTalk.str, ux, GROUND - 26)
    if (bfTalk) bubble(bfTalk.str, bfTalk.gf ? GF_X : BF_X, GROUND - 34)

    // HUD
    if (phase === 'notes' && !card) {
      const n = notes[i]
      text(`NOTE ${i + 1}/${notes.length}`, 8, 8, { size: 6, color: '#ffd23f', align: 'left' })
      const msg = n.from === 'bf' ? "HOLD SPACE to slide the note... not while he's looking 👀" : 'she is sneaking a reply back...'
      box(W / 2 - 150, H - 22, 300, 14, '#2b1b4a', '#ffd23f')
      text(msg, W / 2, H - 18, { size: 5, color: '#fff' })
      // progress bar
      ctx.fillStyle = '#1a1020'; ctx.fillRect(W / 2 - 41, 24, 82, 6)
      ctx.fillStyle = '#ff2e88'; ctx.fillRect(W / 2 - 40, 25, 80 * clamp(prog, 0, 1), 4)
      text('📝', W / 2, 10, { size: 8, outline: null })
    }
    if (card) drawCard()
    if (phase === 'reward') drawReward()
    if (phase === 'summary') drawSummary()
    banners.draw()
  }

  function drawReward() {
    const k = Math.min(1, phaseT * 3)
    ctx.fillStyle = `rgba(26,16,32,${0.45 * k})`; ctx.fillRect(0, 0, W, H)
    const s = 1 + (1 - k) * 0.8
    ctx.save(); ctx.translate(W / 2, 46); ctx.scale(s, s)
    text(STORY.reward[0], 0, Math.sin(t * 5) * 2, { size: 16, color: '#ffd23f' })
    ctx.restore()
    if (phaseT > 0.8) {
      box(W / 2 - 110, 76, 220, 74, '#d2112f', '#ffd23f')
      text(STORY.reward[1], W / 2, 84, { size: 8, color: '#fff' })
      S.draw('bookmark', 'idle', W / 2, 140 + Math.sin(t * 3) * 2, { scale: 3 })
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      for (let r = 0; r < 8; r++) { const a = t + (r * Math.PI) / 4; ctx.fillRect(W / 2 + Math.cos(a) * 34, 120 + Math.sin(a) * 18, 2, 2) }
    }
    if (phaseT > 1.6) text('🎒 added to inventory — it comes with you to future levels', W / 2, 160, { size: 5, color: '#8cff5a' })
    if (phaseT > 4.5 && Math.floor(t * 2) % 2 === 0) text('ENTER ▶', W / 2, 176, { size: 8 })
  }

  function drawSummary() {
    ctx.fillStyle = 'rgba(26,16,32,0.8)'; ctx.fillRect(0, 0, W, H)
    box(W / 2 - 130, 26, 260, 160, '#2b1b4a', '#ffd23f')
    text('LEVEL 1 — GO PICK HER UP', W / 2, 36, { size: 8, color: '#ffd23f' })
    const secs = Math.round((performance.now() - (game.run.start || performance.now())) / 1000)
    const rows = [
      ['🥟 MOMOS', `${game.run.momos} / ${game.run.momoTotal || '?'}`],
      ['💥 OOPSIES', `${game.run.oops}`],
      ['👀 TIMES CAUGHT', `${caught}`],
      ['⏱ DATE LENGTH', `${Math.floor(secs / 60)}m ${secs % 60}s`],
      ['📖 REWARD', 'HANDMADE BOOKMARK'],
    ]
    rows.forEach(([a, b], n) => {
      text(a, W / 2 - 112, 58 + n * 16, { size: 6, align: 'left' })
      text(b, W / 2 + 112, 58 + n * 16, { size: 6, align: 'right', color: '#ff8fc8' })
    })
    text('LEVEL 2 COMING SOON ❤️', W / 2, 146, { size: 8, color: '#8cff5a' })
    if (Math.floor(t * 2) % 2 === 0) text('ENTER: back to title', W / 2, 166, { size: 6 })
  }

  return { update, draw }
}
