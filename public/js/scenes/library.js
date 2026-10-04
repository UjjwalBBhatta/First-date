// Kaiser Library: three floors, zero seats. Then back downstairs... where the LAST SEAT awaits.
import { W, H, ctx, input, audio, Particles, Banners, text, box, bubble, drawHeart, img, backdrop, clamp } from '../engine.js'
import * as S from '../sprites.js'
import { game } from '../game.js'
import { STORY, SONGS } from '../story.js'
import { drawCouple } from '../couple.js'

const GROUND = 184
const FL = 660
const TABLES = [120, 260, 400, 540]
const TINTS = ['rgba(0,0,0,0)', 'rgba(30,80,255,0.12)', 'rgba(140,40,255,0.16)']
const LAST_SEAT = 260 + 26

function seatsFor(floor) {
  const seats = []
  TABLES.forEach((tx, ti) => {
    for (const side of [-1, 1]) {
      const i = ti * 2 + (side > 0 ? 1 : 0)
      let kind = 'reader'
      if (floor === 0 && i === 3) kind = 'bag'
      if (floor === 1 && i % 3 !== 0) kind = 'bag'
      if (floor === 2 && (i === 0 || i === 1)) kind = 'sleeper'
      if (floor === 2 && i === 3) kind = 'paper'
      if (floor === 3 && i === 3) kind = 'empty'
      seats.push({ x: tx + side * 26, side, kind, pal: S.READER_PALS[(i + floor * 3) % S.READER_PALS.length], tx })
    }
  })
  return seats
}

export function library(args = {}) {
  const floor = args.floor ?? 0 // 0,1,2 = floors 1–3; 3 = back on floor 1
  const shownFloor = floor === 3 ? 0 : floor
  const bg = img('/img/bg-library.png')
  const parts = new Particles()
  const banners = new Banners()
  const seats = seatsFor(floor)
  const data = STORY.library.floors[shownFloor]
  let x = 50
  let t = 0
  let camX = 0
  let moving = false
  let talk = null
  const said = new Set()
  let verdict = false
  let leaving = false
  let seatScene = null // revisit: { t, phase }
  let rival = null

  if (floor === 3) {
    banners.show(['FLOOR 3...', ''], 0.8, { size: 16, y: 70 })
    setTimeout(() => banners.show(['FLOOR 2...', ''], 0.8, { size: 16, y: 70 }), 800)
    setTimeout(() => { banners.show(['FLOOR 1', STORY.library.back], 2.2, { size: 16, y: 70 }) }, 1600)
  } else {
    banners.show([data.name, floor === 0 ? 'OBJECTIVE: FIND A SEAT 🪑' : 'FIND A SEAT 🪑'], 2.4, { size: 16, y: 60 })
  }

  function update(dt) {
    t += dt
    audio.music(SONGS.library)
    moving = false
    if (!leaving && !seatScene) {
      const ax = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0)
      const nx = clamp(x + ax * 54 * dt, 40, FL - 34)
      moving = nx !== x
      if (moving && Math.floor(t * 6) !== Math.floor((t - dt) * 6)) audio.play('step')
      x = nx
    }
    if (floor < 3) {
      for (const g of data.gags) if (x >= g.x && !said.has(g.x)) {
        said.add(g.x); talk = { ...g, t: 2.8 }
        audio.play(g.text.startsWith('SHH') ? 'shh' : 'blip')
      }
      if (x >= FL - 110 && !verdict) {
        verdict = true
        audio.play('kazoo')
        banners.show([floor === 2 ? 'NOPE.' : 'NOPE!', data.verdict], 2.4, { size: 16, color: '#ff5d8f', y: 60 })
      }
      const goKey = floor === 2 ? input.hit('down') : input.hit('up')
      if (verdict && x >= FL - 60 && !leaving && (goKey || input.confirm())) {
        leaving = true
        audio.play('step')
        game.go('library', { floor: floor + 1 })
      }
    } else {
      if (!seatScene && x >= LAST_SEAT - 70) {
        seatScene = { t: 0, phase: 'spot' }
        audio.stopMusic()
        audio.play('sparkle')
        banners.show(['WAIT...', STORY.library.spotted], 2.4, { size: 16, color: '#ffd23f', y: 50 })
      }
      if (seatScene) {
        seatScene.t += dt
        if (Math.floor(seatScene.t * 8) !== Math.floor((seatScene.t - dt) * 8)) parts.burst(LAST_SEAT, GROUND - 22, 2, ['#fff', '#ffd23f'], 30, { g: 0 })
        if (seatScene.phase === 'spot' && seatScene.t > 2.4) {
          seatScene.phase = 'rival'; seatScene.t = 0
          rival = { x: camX + W + 30, y: GROUND, vy: 0, landed: false }
          audio.play('boing')
        }
        if (seatScene.phase === 'rival') {
          rival.x += (LAST_SEAT + 26 - rival.x) * Math.min(1, dt * 5)
          if (seatScene.t > 0.7 && !rival.landed) { rival.landed = true; audio.play('whomp'); parts.burst(rival.x, GROUND, 14, ['#fff', '#c9b8a0'], 80) }
          if (seatScene.t > 2.2) {
            seatScene.phase = 'title'; seatScene.t = 0
            audio.play('clang')
            banners.show([STORY.battle.title, 'LET THE SEAT BATTLE BEGIN!'], 2.6, { size: 16, color: '#ff3b3b', y: 60 })
          }
        }
        if (seatScene.phase === 'title' && seatScene.t > 2.4 && !leaving) { leaving = true; game.go('battle') }
      }
    }
    if (talk) { talk.t -= dt; if (talk.t <= 0) talk = null }
    parts.update(dt)
    banners.update(dt)
    camX += (clamp(x - W / 2, 0, FL - W) - camX) * Math.min(1, dt * 4)
  }

  function drawSeat(s) {
    const cx = s.x
    // chair
    const backX = s.side < 0 ? cx - 9 : cx + 7
    ctx.fillStyle = '#1a1020'; ctx.fillRect(backX - 1, GROUND - 37, 5, 37); ctx.fillRect(cx - 9, GROUND - 16, 19, 4)
    ctx.fillStyle = '#7a3b12'; ctx.fillRect(backX, GROUND - 36, 3, 36)
    ctx.fillStyle = '#d2112f'; ctx.fillRect(cx - 8, GROUND - 15, 17, 2)
    ctx.fillStyle = '#7a3b12'; ctx.fillRect(cx - 7, GROUND - 12, 2, 12); ctx.fillRect(cx + 5, GROUND - 12, 2, 12)
    if (s.kind === 'reader' || s.kind === 'paper') {
      S.draw('reader', 'idle', cx, GROUND - 15, { pal: s.pal })
      if (s.kind === 'paper') {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(cx - 9, GROUND - 27, 18, 13)
        ctx.fillStyle = '#e8e2d0'; ctx.fillRect(cx - 8, GROUND - 26, 16, 11)
        ctx.fillStyle = '#888'; for (let i = 0; i < 4; i++) ctx.fillRect(cx - 6, GROUND - 24 + i * 2.5, 12, 1)
        text('1998', cx, GROUND - 34, { size: 4, color: '#fff' })
      }
    } else if (s.kind === 'bag') {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(cx - 7, GROUND - 28, 14, 14)
      ctx.fillStyle = s.pal.C; ctx.fillRect(cx - 6, GROUND - 27, 12, 12)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx - 6, GROUND - 21, 12, 1)
      ctx.fillStyle = '#1a1020'; ctx.fillRect(cx - 3, GROUND - 31, 6, 4)
    } else if (s.kind === 'empty' && floor === 3) {
      const glow = 0.5 + Math.sin(t * 6) * 0.3
      ctx.fillStyle = `rgba(255,230,120,${glow * 0.5})`
      ctx.beginPath(); ctx.moveTo(cx - 6, 0); ctx.lineTo(cx + 6, 0); ctx.lineTo(cx + 18, GROUND); ctx.lineTo(cx - 18, GROUND); ctx.fill()
    }
  }

  function draw() {
    ctx.fillStyle = '#2b1b10'; ctx.fillRect(0, 0, W, H)
    backdrop(bg, camX * 0.3 + shownFloor * 220, 1, -10)
    ctx.fillStyle = TINTS[shownFloor]; ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.translate(-Math.round(camX), 0)
    // floor
    ctx.fillStyle = '#1a1020'; ctx.fillRect(0, GROUND - 1, FL, 1)
    ctx.fillStyle = '#8a1630'; ctx.fillRect(0, GROUND, FL, 10)
    ctx.fillStyle = '#ffd23f'; for (let i = 0; i < FL; i += 12) ctx.fillRect(i, GROUND + 4, 6, 1)
    ctx.fillStyle = '#3d1f10'; ctx.fillRect(0, GROUND + 10, FL, H - GROUND)
    ctx.fillStyle = '#2b1508'; for (let i = 0; i < FL; i += 48) ctx.fillRect(i, GROUND + 12, 44, 18)
    // stairs
    const sx = FL - 54
    for (let i = 0; i < 6; i++) {
      const up = floor === 2 ? 5 - i : i
      ctx.fillStyle = '#1a1020'; ctx.fillRect(sx + i * 9 - 1, GROUND - 8 - up * 8 - 1, 11, 10 + up * 8)
      ctx.fillStyle = '#a0612c'; ctx.fillRect(sx + i * 9, GROUND - 8 - up * 8, 9, 8 + up * 8)
      ctx.fillStyle = '#d08a4a'; ctx.fillRect(sx + i * 9, GROUND - 8 - up * 8, 9, 2)
    }
    if (floor < 3) text(floor === 2 ? '▼ DOWN' : '▲ UP', sx + 26, GROUND - 70, { size: 6, color: '#ffd23f' })
    // tables + seats
    for (const s of seats) drawSeat(s)
    for (const tx of TABLES) {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(tx - 17, GROUND - 22, 34, 6); ctx.fillRect(tx - 14, GROUND - 17, 4, 17); ctx.fillRect(tx + 10, GROUND - 17, 4, 17)
      ctx.fillStyle = '#9a5a28'; ctx.fillRect(tx - 16, GROUND - 21, 32, 4); ctx.fillRect(tx - 13, GROUND - 17, 2, 17); ctx.fillRect(tx + 11, GROUND - 17, 2, 17)
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(tx - 3, GROUND - 28, 6, 6)
      ctx.fillStyle = '#ff2e88'; ctx.fillRect(tx + 6, GROUND - 24, 7, 2); ctx.fillStyle = '#1e6bff'; ctx.fillRect(tx + 6, GROUND - 26, 7, 2)
    }
    // floor 3's sleeper sprawled across two chairs
    if (floor === 2) {
      const tx = TABLES[0]
      S.draw('noob', 'idle', tx - 10, GROUND - 16, { rot: -Math.PI / 2, pal: S.PALS.jumper })
      text('Z', tx - 14 + Math.sin(t * 2) * 3, GROUND - 46 - (t * 8) % 12, { size: 6, color: '#fff' })
      text('z', tx - 6 + Math.sin(t * 2 + 1) * 3, GROUND - 38 - (t * 8 + 6) % 12, { size: 5, color: '#fff' })
    }
    if (rival) {
      const hop = rival.landed ? 0 : Math.sin(Math.min(1, seatScene.t / 0.7) * Math.PI) * 50
      S.draw('noob', 'idle', rival.x, GROUND - hop, { scale: 2, flip: true, pal: S.PALS.boss })
      S.drawSword(rival.x - 14, GROUND - 14 - hop, -0.9, true, 18)
      drawCrown(rival.x - 4, GROUND - 34 - hop)
    }
    drawCouple(x, GROUND + 1, t, { walking: moving })
    parts.draw()
    ctx.restore()
    if (talk) {
      const near = talk.who === 'npc' ? seats.reduce((a, s) => (Math.abs(s.x - talk.x - 40) < Math.abs(a.x - talk.x - 40) ? s : a)).x : talk.who === 'bf' ? x - 8 : x + 8
      bubble(talk.text, near - camX, GROUND - (talk.who === 'npc' ? 30 : 30))
    }
    if (rival && seatScene.phase !== 'spot') bubble(STORY.library.rival, rival.x - camX, GROUND - 36)
    // HUD
    text(`FIND A SEAT 🪑   ${floor === 3 ? 'FLOOR 1 (AGAIN)' : data.name}`, 8, 8, { size: 6, color: '#ffd23f', align: 'left' })
    if (verdict && x >= FL - 60 && !leaving && Math.floor(t * 2) % 2 === 0) text(floor === 2 ? '▼ / ENTER: BACK DOWNSTAIRS' : '▲ / ENTER: GO UPSTAIRS', W / 2, 150, { size: 8 })
    banners.draw()
  }

  return { update, draw }
}

export function drawCrown(x, y) {
  ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 7, y - 7, 15, 8)
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 6, y - 3, 13, 3)
  for (const ox of [-6, 0, 6]) { ctx.fillStyle = '#1a1020'; ctx.fillRect(x + ox - 1, y - 9, 3, 6); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + ox, y - 8, 1, 5) }
  ctx.fillStyle = '#ff2e63'; ctx.fillRect(x, y - 2, 1, 1)
}
