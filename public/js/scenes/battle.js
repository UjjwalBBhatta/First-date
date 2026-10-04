// THE LAST SEAT ⚔️ — a silly cartoon sword fight against the Seat Noob.
import { W, H, ctx, input, audio, Particles, Banners, text, box, bubble, drawHeart, img, backdrop, clamp, lerp, overlap } from '../engine.js'
import * as S from '../sprites.js'
import { game } from '../game.js'
import { STORY, SONGS } from '../story.js'
import { drawCrown } from './library.js'

const GROUND = 184
const GRAV = 950
const SEAT_X = 340
const HITS = ['BONK!', 'WHACK!', 'PLINK!', 'BOP!', 'SMACK!', 'THWAP!']

export function battle() {
  const bg = img('/img/bg-library.png')
  const parts = new Particles()
  const banners = new Banners()
  let t = 0
  let phase = 'intro' // intro, fight, lose, ko, after
  let phaseT = 0
  let slow = 1
  let shake = 0
  const cam = { x: W / 2, y: 120, z: 1.25 }
  let punch = 0 // extra zoom kick on hits
  let cheer = null
  let cheerCD = 2
  let bossTalk = null
  let afterStep = 0

  const p = { x: 90, y: GROUND - 18, w: 10, h: 18, vx: 0, vy: 0, face: 1, onGround: true, hp: 100, ghost: 100, atk: 0, atkHit: false, dash: 0, dashCD: 0, inv: 0, knock: 0, combo: 0 }
  const b = { x: 270, y: GROUND - 32, w: 20, h: 32, vx: 0, vy: 0, face: -1, onGround: true, hp: 100, ghost: 100, state: 'idle', st: 1.2, flash: 0, hitCount: 0, slashHit: false }
  const books = []

  audio.music(SONGS.battle)
  banners.show([`${STORY.boyName}  VS  ${STORY.battle.boss}`, 'for the honor of the LAST SEAT'], 2, { size: 16, color: '#ff3b3b', y: 60 })

  function setState(s, dur) { b.state = s; b.st = dur }
  function say(str) { bossTalk = { str, t: 1.4 } }

  function hurtPlayer(dmg, fromX) {
    if (p.inv > 0 || p.dash > 0 || phase !== 'fight') return
    p.hp = Math.max(0, p.hp - dmg)
    p.inv = 0.9; p.knock = 0.25
    p.vx = (p.x + 5 < fromX ? -1 : 1) * 190; p.vy = -200
    audio.play('bonk'); shake = 0.3; punch = 0.12
    parts.pop(p.x + 5, p.y - 6, 'OUCH!', '#ff5d8f')
    parts.burst(p.x + 5, p.y + 8, 10, ['#fff', '#ffd23f'], 80)
    if (p.hp <= 0) {
      phase = 'lose'; phaseT = 0
      audio.play('kazoo')
      banners.show(['OH NO!', STORY.battle.lose], 2.6, { size: 16, color: '#ff5d8f', y: 60 })
    }
  }

  function hurtBoss() {
    const crit = Math.random() < 0.18
    const dmg = crit ? 12 : 7
    b.hp = Math.max(0, b.hp - dmg)
    b.flash = 0.12
    b.hitCount++
    const parried = b.state === 'windup' || b.state === 'slash'
    audio.play(parried ? 'clang' : 'bonk')
    punch = crit ? 0.18 : 0.08; shake = crit ? 0.25 : 0.12
    parts.pop(b.x + 10, b.y - 8, crit ? 'CRIT!!' : parried ? 'CLANG!' : HITS[Math.floor(Math.random() * HITS.length)], crit ? '#ff3b3b' : '#ffd23f', crit ? 12 : 8)
    parts.burst(b.x + 10, b.y + 12, 12, ['#fff', '#ffd23f', '#8cff5a'], 100)
    b.vx = p.face * 120
    if (Math.random() < 0.25) say(STORY.battle.bossLines[Math.floor(Math.random() * STORY.battle.bossLines.length)])
    if (b.hp <= 0) {
      phase = 'ko'; phaseT = 0
      slow = 0.25
      audio.stopMusic(); audio.play('whomp')
      setState('ko', 99)
      b.vy = -260; b.vx = p.face * 140
      banners.show(['K.O.!', ''], 1.6, { size: 16, color: '#ffd23f', y: 50 })
      return
    }
    if (b.hitCount % 4 === 0) { setState('dizzy', 1.1); parts.pop(b.x + 10, b.y - 18, '@_@', '#fff') } else if (b.state !== 'jump') setState('stagger', 0.28)
  }

  function updatePlayer(dt) {
    const ax = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0)
    p.inv -= dt; p.knock -= dt; p.dashCD -= dt
    if (p.atk <= 0 && ax) p.face = ax
    if (p.knock <= 0 && p.dash <= 0) p.vx += (ax * 115 - p.vx) * Math.min(1, dt * 14)
    if (input.hit('jump') && p.onGround) { p.vy = -340; p.onGround = false; audio.play('jump') }
    if (input.hit('dash') && p.dashCD <= 0) { p.dash = 0.22; p.dashCD = 0.55; audio.play('dash'); parts.pop(p.x + 5, p.y - 4, 'DODGE!', '#45e8ff', 6) }
    if (p.dash > 0) { p.dash -= dt; p.vx = p.face * 250 }
    if (input.hit('attack') && p.atk <= 0) { p.atk = 0.26; p.atkHit = false; audio.play('swing') }
    if (p.atk > 0) {
      p.atk -= dt
      const active = p.atk < 0.22 && p.atk > 0.06
      const hb = { x: p.face > 0 ? p.x + 6 : p.x - 22, y: p.y - 4, w: 26, h: 24 }
      if (active && !p.atkHit && b.state !== 'ko' && overlap(hb, b)) { p.atkHit = true; hurtBoss() }
    }
    p.vy += GRAV * dt
    if (!input.down('jump') && p.vy < -80) p.vy += GRAV * 1.4 * dt
    p.x = clamp(p.x + p.vx * dt, 12, W - 22)
    p.y += p.vy * dt
    const wasGround = p.onGround
    p.onGround = false
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; p.onGround = true; if (!wasGround) audio.play('land') }
  }

  function updateBoss(dt) {
    b.st -= dt; b.flash -= dt
    const dx = p.x + 5 - (b.x + 10)
    const dist = Math.abs(dx)
    const faceP = () => { b.face = Math.sign(dx) || b.face }
    switch (b.state) {
      case 'idle':
        b.vx *= 0.8; faceP()
        if (b.st <= 0) {
          const r = Math.random()
          if (dist < 56) r < 0.65 ? setState('windup', 0.5) : startJump()
          else if (r < 0.35) setState('walk', 1.1)
          else if (r < 0.65) setState('throwWind', 0.4)
          else startJump()
        }
        break
      case 'walk':
        faceP(); b.vx = b.face * 55
        if (dist < 44) setState('windup', 0.45)
        else if (b.st <= 0) setState('idle', 0.4)
        break
      case 'windup':
        b.vx = 0; faceP()
        if (b.st <= 0) { setState('slash', 0.26); b.slashHit = false; audio.play('swing') }
        break
      case 'slash': {
        b.vx = b.face * 230
        const hb = { x: b.face > 0 ? b.x + 14 : b.x - 22, y: b.y + 4, w: 28, h: 26 }
        if (!b.slashHit && overlap(hb, p)) { b.slashHit = true; hurtPlayer(12, b.x + 10) }
        if (b.st <= 0) setState('recover', 0.6)
        break
      }
      case 'recover': b.vx *= 0.85; if (b.st <= 0) setState('idle', 0.5 + Math.random() * 0.4); break
      case 'throwWind':
        b.vx = 0; faceP()
        if (b.st <= 0) {
          for (let i = 0; i < 3; i++) books.push({ x: b.x + 10, y: b.y + 6, vx: b.face * (110 + i * 45), vy: -170 - i * 50, rot: 0, c: ['#ff2e88', '#1e6bff', '#2fbf3a'][i] })
          audio.play('pop'); say('BOOK ATTACK!')
          setState('recover', 0.7)
        }
        break
      case 'jump':
        if (b.onGround && b.st < 0.6) {
          setState('recover', 0.7)
          audio.play('whomp'); shake = 0.35; punch = 0.1
          parts.add({ x: b.x + 10, y: GROUND - 2, kind: 'ring', r: 70, life: 0.4, color: '#fff' })
          parts.burst(b.x + 10, GROUND - 2, 16, ['#c9b8a0', '#fff'], 120)
          parts.pop(b.x + 10, b.y - 10, 'WHOMP!', '#fff')
          if (p.onGround && Math.abs(dx) < 64) hurtPlayer(14, b.x + 10)
        }
        break
      case 'stagger': if (b.st <= 0) setState('idle', 0.25); break
      case 'dizzy': b.vx *= 0.85; if (b.st <= 0) setState('idle', 0.3); break
      case 'ko': b.vx *= 0.96; break
      case 'toseat': case 'sit': break
    }
    b.vy += GRAV * dt
    b.x = clamp(b.x + b.vx * dt, 8, W - 30)
    b.y += b.vy * dt
    b.onGround = false
    if (b.y + b.h >= GROUND) { b.y = GROUND - b.h; b.vy = 0; b.onGround = true }
    if (b.state === 'stagger' || b.state === 'dizzy') b.vx *= 0.88

    function startJump() {
      setState('jump', 1.2)
      faceP()
      b.vy = -400; b.onGround = false
      b.vx = clamp(dx / 0.84, -220, 220)
      audio.play('boing'); say('NOOB SLAM!')
    }
  }

  function updateBooks(dt) {
    for (const k of books) {
      k.vy += 520 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.rot += dt * 12
      if (Math.abs(k.x - (p.x + 5)) < 9 && Math.abs(k.y - (p.y + 9)) < 11) { k.dead = true; hurtPlayer(7, k.x) }
      if (k.y > GROUND) { k.dead = true; parts.burst(k.x, GROUND - 2, 4, ['#fff', k.c], 40); audio.play('land') }
    }
    for (let i = books.length - 1; i >= 0; i--) if (books[i].dead) books.splice(i, 1)
  }

  function update(rawDt) {
    t += rawDt
    phaseT += rawDt
    const dt = rawDt * slow
    if (phase === 'intro') {
      cam.z = lerp(1.6, 1.15, Math.min(1, phaseT / 2))
      cam.x = lerp(b.x + 10, (p.x + b.x) / 2, Math.min(1, phaseT / 2))
      if (phaseT > 2.1) { phase = 'fight'; phaseT = 0; audio.play('clang'); banners.show(['FIGHT!', 'F = attack   SPACE = jump   SHIFT = dodge'], 1.8, { size: 16, color: '#ffd23f', y: 60 }) }
    } else if (phase === 'fight') {
      updatePlayer(dt); updateBoss(dt); updateBooks(dt)
      cheerCD -= dt
      if (cheerCD <= 0) { cheer = { str: STORY.battle.cheers[Math.floor(Math.random() * STORY.battle.cheers.length)], t: 1.6 }; cheerCD = 3 + Math.random() * 2 }
    } else if (phase === 'lose') {
      updateBoss(dt)
      if (phaseT > 2.8) {
        p.hp = 100; b.hp = Math.max(b.hp, 60); p.x = 90; b.x = 270; setState('idle', 1.2)
        phase = 'fight'; phaseT = 0; books.length = 0
        banners.show(['ROUND 2!', 'you got this ❤️'], 1.4, { size: 16, color: '#8cff5a', y: 60 })
        audio.music(SONGS.battle)
      }
    } else if (phase === 'ko') {
      updateBoss(dt)
      if (phaseT > 1.3) slow = 1
      if (phaseT > 2.2) { phase = 'after'; phaseT = 0; setState('dizzy', 99) }
    } else if (phase === 'after') {
      updateBoss(dt)
      if (afterStep === 0 && phaseT > 0.6) { afterStep = 1; banners.show(STORY.battle.wait, 2, { size: 16, color: '#fff', y: 70 }) }
      if (afterStep === 1 && phaseT > 2.8) { afterStep = 2; audio.play('love'); banners.show(['💡', STORY.battle.garden], 3.4, { size: 16, color: '#8cff5a', y: 60 }) }
      if (afterStep === 2 && phaseT > 3.4) {
        // the noob happily takes the seat
        if (b.state !== 'toseat' && b.state !== 'sit') setState('toseat', 99)
        b.face = Math.sign(SEAT_X - 10 - b.x) || 1
        b.x += (SEAT_X - 10 - b.x) * Math.min(1, rawDt * 2)
        if (Math.abs(b.x - (SEAT_X - 10)) < 3 && afterStep === 2) { afterStep = 3; setState('sit', 99); say('yay :D my seat'); parts.hearts(SEAT_X, GROUND - 30, 4) }
      }
      if (phaseT > 6.6 && afterStep >= 2) { afterStep = 9; game.go('garden') }
    }
    for (const s of [p, b]) s.ghost = Math.max(s.hp, s.ghost - rawDt * 30)
    if (cheer) { cheer.t -= rawDt; if (cheer.t <= 0) cheer = null }
    if (bossTalk) { bossTalk.t -= rawDt; if (bossTalk.t <= 0) bossTalk = null }
    parts.update(dt)
    banners.update(rawDt)
    shake = Math.max(0, shake - rawDt)
    punch = Math.max(0, punch - rawDt * 0.6)
    if (phase !== 'intro') {
      let tz = 1.08
      let tx = (p.x + 5 + b.x + 10) / 2
      if (b.state === 'windup' || b.state === 'throwWind') tz = 1.18
      if (phase === 'ko') { tz = 1.5; tx = b.x + 10 }
      if (phase === 'after') tz = 1.1
      cam.z += (tz + punch - cam.z) * Math.min(1, rawDt * 6)
      cam.x += (tx - cam.x) * Math.min(1, rawDt * 4)
    }
    const half = W / (2 * cam.z)
    cam.x = clamp(cam.x, half, W - half)
  }

  function drawBar(x, y, w, name, hp, ghost, color, right) {
    box(x, y, w, 10, '#2b1b4a', '#fff')
    const inner = w - 4
    const gx = right ? x + 2 + inner * (1 - ghost / 100) : x + 2
    const hx = right ? x + 2 + inner * (1 - hp / 100) : x + 2
    ctx.fillStyle = '#fff'; ctx.fillRect(gx, y + 2, inner * (ghost / 100), 6)
    ctx.fillStyle = color; ctx.fillRect(hx, y + 2, inner * (hp / 100), 6)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(hx, y + 2, inner * (hp / 100), 2)
    text(name, right ? x + w : x, y + 14, { size: 6, align: right ? 'right' : 'left' })
  }

  function draw() {
    ctx.fillStyle = '#2b1b10'; ctx.fillRect(0, 0, W, H)
    backdrop(bg, 600 + (cam.x - W / 2) * 0.3, 1, -10)
    ctx.fillStyle = 'rgba(40,0,20,0.25)'; ctx.fillRect(0, 0, W, H)
    const sx = shake > 0 ? (Math.random() - 0.5) * 6 : 0
    const sy = shake > 0 ? (Math.random() - 0.5) * 4 : 0
    ctx.save()
    ctx.translate(W / 2 + sx, H / 2 + sy)
    ctx.scale(cam.z, cam.z)
    ctx.translate(-cam.x, -cam.y - (cam.z - 1) * 40)
    // floor
    ctx.fillStyle = '#1a1020'; ctx.fillRect(-60, GROUND - 1, W + 120, 1)
    ctx.fillStyle = '#8a1630'; ctx.fillRect(-60, GROUND, W + 120, 10)
    ctx.fillStyle = '#ffd23f'; for (let i = -60; i < W + 60; i += 12) ctx.fillRect(i, GROUND + 4, 6, 1)
    ctx.fillStyle = '#3d1f10'; ctx.fillRect(-60, GROUND + 10, W + 120, 80)
    // THE seat, spotlit
    ctx.fillStyle = `rgba(255,230,120,${0.18 + Math.sin(t * 4) * 0.06})`
    ctx.beginPath(); ctx.moveTo(SEAT_X - 6, -40); ctx.lineTo(SEAT_X + 6, -40); ctx.lineTo(SEAT_X + 22, GROUND); ctx.lineTo(SEAT_X - 22, GROUND); ctx.fill()
    ctx.fillStyle = '#1a1020'; ctx.fillRect(SEAT_X + 6, GROUND - 37, 5, 37); ctx.fillRect(SEAT_X - 9, GROUND - 16, 19, 4)
    ctx.fillStyle = '#7a3b12'; ctx.fillRect(SEAT_X + 7, GROUND - 36, 3, 36)
    ctx.fillStyle = '#d2112f'; ctx.fillRect(SEAT_X - 8, GROUND - 15, 17, 2)
    ctx.fillStyle = '#7a3b12'; ctx.fillRect(SEAT_X - 7, GROUND - 12, 2, 12); ctx.fillRect(SEAT_X + 5, GROUND - 12, 2, 12)
    text('THE SEAT', SEAT_X, GROUND - 48, { size: 4, color: '#ffd23f' })
    // her, cheering from the side
    const hop = cheer ? Math.abs(Math.sin(t * 10)) * 4 : 0
    S.draw('gf', 'idle', 30, GROUND + 1 - hop)
    // books
    for (const k of books) {
      ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot)
      ctx.fillStyle = '#1a1020'; ctx.fillRect(-5, -4, 10, 8)
      ctx.fillStyle = k.c; ctx.fillRect(-4, -3, 8, 6)
      ctx.fillStyle = '#fff'; ctx.fillRect(-4, -3, 1, 6)
      ctx.restore()
    }
    // boss
    const bx = b.x + 10, by = b.y + b.h + 1
    const bFlash = b.flash > 0 || (b.state === 'windup' && Math.floor(t * 16) % 2 === 0)
    const bFrame = b.state === 'walk' || b.state === 'toseat' ? (Math.floor(t * 8) % 2 ? 'walk1' : 'walk2') : 'idle'
    const sitting = phase === 'after' && afterStep >= 3
    if (b.state === 'ko' && !b.onGround) S.draw('noob', 'idle', bx, by, { scale: 2, flip: b.face < 0, pal: S.PALS.boss, rot: b.face * 0.6 })
    else S.draw('noob', b.state === 'ko' || b.state === 'dizzy' ? 'squish' : bFrame, bx, sitting ? GROUND - 12 : by, { scale: 2, flip: b.face < 0, pal: S.PALS.boss, flash: bFlash })
    const crownY = b.state === 'ko' || b.state === 'dizzy' ? by - 18 : by - 34
    drawCrown(bx - b.face * 2, sitting ? GROUND - 12 - 34 : crownY)
    if (!['ko', 'dizzy', 'toseat', 'sit'].includes(b.state)) {
      let ang = -0.9
      if (b.state === 'windup') ang = -2.2
      if (b.state === 'slash') ang = 0.3
      if (b.state === 'jump') ang = -1.6
      S.drawSword(bx + b.face * 14, by - 14, ang, b.face < 0, 20, b.state === 'slash')
    }
    if (b.state === 'windup') text('!', bx, by - 52, { size: 16, color: '#ff3b3b' })
    if (b.state === 'dizzy' || b.state === 'ko') for (let i = 0; i < 3; i++) {
      const a = t * 6 + (i * Math.PI * 2) / 3
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(bx + Math.cos(a) * 12 - 1, by - 22 + Math.sin(a) * 4, 3, 3)
    }
    // player
    const blink = p.inv > 0 && Math.floor(t * 20) % 2 === 0
    if (!blink) {
      if (p.dash > 0) S.draw('bf', 'jump', p.x + 5 - p.face * 10, p.y + 19, { flip: p.face < 0, alpha: 0.4, flash: true })
      const pf = !p.onGround ? 'jump' : Math.abs(p.vx) > 15 ? (Math.floor(t * 9) % 2 ? 'walk1' : 'walk2') : 'idle'
      const lose = phase === 'lose'
      S.draw('bf', pf, p.x + 5, p.y + 19, { flip: p.face < 0, rot: lose ? -p.face * Math.PI / 2 : 0 })
      if (!lose) {
        let ang = -0.8
        if (p.atk > 0) ang = lerp(1.0, -2.0, p.atk / 0.26)
        S.drawSword(p.x + 5 + p.face * 6, p.y + 12, ang, p.face < 0, 16, p.atk > 0)
        if (p.atk > 0.06 && p.atk < 0.22) {
          ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3
          ctx.beginPath()
          const cx = p.x + 5 + p.face * 6, cy = p.y + 10
          if (p.face > 0) ctx.arc(cx, cy, 18, -1.6, 0.9); else ctx.arc(cx, cy, 18, Math.PI - 0.9, Math.PI + 1.6)
          ctx.stroke()
        }
      }
    }
    parts.draw()
    ctx.restore()

    // bubbles in screen space
    const toScreen = (wx, wy) => [(wx - cam.x) * cam.z + W / 2, (wy - cam.y - (cam.z - 1) * 40) * cam.z + H / 2]
    if (cheer) { const [x, y] = toScreen(30, GROUND - 24); bubble(cheer.str, x, y) }
    if (bossTalk) { const [x, y] = toScreen(bx, by - 40); bubble(bossTalk.str, x, y) }
    // HUD
    drawBar(10, 8, 150, STORY.boyName, p.hp, p.ghost, '#ff2e63', false)
    drawBar(W - 160, 8, 150, STORY.battle.boss, b.hp, b.ghost, '#ffd800', true)
    text('⚔️', W / 2, 8, { size: 8, outline: null })
    text('THE LAST SEAT', W / 2, 20, { size: 5, color: '#ffd23f' })
    if (phase === 'intro' || phase === 'ko') {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(0, H - 16, W, 16)
    }
    banners.draw()
  }

  return { update, draw }
}
