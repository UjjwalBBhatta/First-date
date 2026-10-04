# First Date Quest — Level 1: Go Pick Her Up

A cute, bold-colored pixel-art adventure game recreating a real first date in Kathmandu: a side-scrolling platformer from MIT College to the pickup spot, a hand-in-hand walk to Kaiser Library, a three-floor seat hunt, a cartoon sword fight over the last seat, secret note-passing in the garden, and a handmade bookmark reward.

## Tech
- Plain HTML5 Canvas + ES modules (no build step), served from `public/`
- Hand-coded pixel sprites, WebAudio chiptune music and sound effects
- AI-generated pixel backdrops in `public/img/`, delivered via Netlify Image CDN
- Inventory saved in `localStorage` so rewards persist into future levels

## Run locally
`netlify dev --port 8889` (or any static server pointed at `public/`).

## Controls
← → move · SPACE jump · SHIFT dash · F attack · ENTER continue · I inventory · M mute · 1–5 jump to a chapter from the title screen.

## Customizing
- Real character art: drop `boyfriend.png`, `girlfriend.png`, `noob.png` into `public/img/custom/` (auto-detected).
- Real note conversation and all story text: `public/js/story.js`.

## Roadmap
- Swap in the couple's own character/monster art and reference backdrops
- Replace placeholder notes with the real conversation
- Level 2
