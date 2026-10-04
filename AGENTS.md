# AGENTS.md
Static canvas game, no bundler. `netlify.toml` publishes `public/`.

- `public/js/engine.js` — canvas (384x216 internal), input, WebAudio sfx/music, text/box/bubble helpers, particles, banners, CDN image helper.
- `public/js/sprites.js` — pixel sprites as string arrays + palettes; optional PNG overrides from `public/img/custom/`.
- `public/js/story.js` — ALL user-facing story text, items, songs. Edit text here, not in scenes.
- `public/js/game.js` — scene switching (`game.go(name,args)`), save/inventory in localStorage (`kq-save`).
- `public/js/scenes/` — platformer → walk → library (floor 0–3) → battle → garden. Each scene returns `{update, draw}`.
- Backdrops: `public/img/bg-*.png`, always loaded through `img()` which uses `/.netlify/images`.
Conventions: no frameworks, 2-space, no semicolons, sprites face right and are drawn by feet position.
