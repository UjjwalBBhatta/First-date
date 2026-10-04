// All story text lives here so it's easy to rewrite with your real lines.
export const STORY = {
  title: 'FIRST DATE QUEST',
  subtitle: 'a kathmandu love adventure',
  boyName: 'HIM',
  girlName: 'HER',

  level: ['LEVEL 1', 'GO PICK HER UP ❤️'],
  start: 'MIT College is out! Gotta go pick her up!!',

  // Little phone messages from her during the platformer (triggered at checkpoints)
  phone: [
    'Her: im at the pickup spot 🙂',
    'Her: r u close??',
    'Her: theres a weird yellow guy here lol',
    'Her: i can see u!! hurry 💕',
  ],

  noobLines: ['noob!', 'hi :D', 'oof', 'wher u going', 'bonk me pls', 'gg ez', 'lol', ':3', 'i am lost', 'free robux?'],

  found: 'FOUND HER ❤️',
  objectiveLibrary: "NOW LET'S GO TO THE LIBRARY",

  // Walk to Kaiser Library — thought bubbles that pop up along the way
  walk: [
    { x: 260, who: 'gf', text: 'Hiii!! you made it 🥺' },
    { x: 420, who: 'bf', text: 'of course! (dont look at my sweaty hoodie)' },
    { x: 700, who: 'gf', text: 'a cow!! 🐄 a whole cow in the road' },
    { x: 980, who: 'bf', text: '(her hand is so tiny omg)' },
    { x: 1250, who: 'gf', text: 'he is so awkward lol (cute tho)' },
    { x: 1520, who: 'bf', text: 'that dog is following us' },
    { x: 1760, who: 'gf', text: 'hes our bodyguard now 🐶' },
    { x: 2050, who: 'bf', text: 'there it is... KAISER LIBRARY!' },
  ],

  library: {
    floors: [
      {
        name: 'FLOOR 1',
        gags: [
          { x: 150, who: 'npc', text: 'SHHHHHH!' },
          { x: 330, who: 'npc', text: 'this seat is taken (by my bag)' },
          { x: 520, who: 'bf', text: 'every. single. chair.' },
        ],
        verdict: 'FLOOR 1: NO SEATS 😭',
      },
      {
        name: 'FLOOR 2',
        gags: [
          { x: 160, who: 'npc', text: 'saving these 6 for my cousins' },
          { x: 340, who: 'gf', text: 'is that guy... sleeping on a dictionary?' },
          { x: 520, who: 'npc', text: 'SHHH!!!' },
        ],
        verdict: 'FLOOR 2: NO SEATS 😩',
      },
      {
        name: 'FLOOR 3',
        gags: [
          { x: 150, who: 'npc', text: 'Zzz... 3 chairs... all mine... Zzz' },
          { x: 330, who: 'npc', text: 'reading this newspaper since 1998' },
          { x: 520, who: 'gf', text: 'ok this is getting ridiculous' },
        ],
        verdict: 'FLOOR 3: ABSOLUTELY NO SEATS 💀',
      },
    ],
    back: 'back downstairs... 🚶🚶',
    spotted: 'WAIT... IS THAT... AN EMPTY SEAT?!',
    rival: 'MINE.',
  },

  battle: {
    title: 'THE LAST SEAT ⚔️',
    boss: 'SEAT NOOB',
    cheers: ['GO BABE!!', 'BONK HIM!', 'you got this!!', 'not the face lol', 'MY HERO 😂', 'watch out!'],
    bossLines: ['MY SEAT.', 'noob power!', 'i was here first', 'u shall not sit', 'oof', 'ow my pride'],
    lose: 'he fainted dramatically... try again!',
    wait: 'Wait…',
    garden: 'We can just sit in the garden.',
  },

  garden: {
    intro: 'shh... the garden is quiet. pass notes secretly!',
    // Replace these with your real conversation.
    notes: [
      { from: 'bf', text: '[Note 1]' },
      { from: 'gf', text: '[Reply]' },
      { from: 'bf', text: '[Note 2]' },
      { from: 'gf', text: '[Reply]' },
      { from: 'bf', text: '[Note 3]' },
      { from: 'gf', text: '[Reply]' },
    ],
    gift: 'i made you something...',
  },

  reward: ['LEVEL COMPLETE!', 'REWARD: 📖 HANDMADE BOOKMARK'],
}

// Items that can live in the inventory (persist across levels).
export const ITEMS = {
  bookmark: { name: 'HANDMADE BOOKMARK', desc: 'Made by her, for you. Level 1 reward.', sprite: 'bookmark' },
}

// Chiptune loops: midi note per 8th (0 = rest)
export const SONGS = {
  platform: {
    bpm: 150,
    lead: [72, 0, 76, 79, 76, 0, 72, 0, 74, 0, 77, 81, 79, 0, 77, 76, 72, 0, 76, 79, 84, 0, 83, 81, 79, 77, 76, 74, 72, 0, 79, 0],
    bass: [48, 0, 55, 0, 48, 0, 55, 0, 50, 0, 57, 0, 55, 0, 55, 0, 48, 0, 55, 0, 53, 0, 57, 0, 55, 0, 55, 0, 48, 0, 43, 0],
  },
  walk: {
    bpm: 100, leadType: 'triangle',
    lead: [76, 0, 79, 0, 81, 0, 79, 76, 74, 0, 76, 0, 72, 0, 0, 0, 76, 0, 79, 0, 84, 0, 83, 81, 79, 0, 0, 0, 0, 0, 0, 0],
    bass: [48, 0, 0, 0, 52, 0, 0, 0, 53, 0, 0, 0, 55, 0, 0, 0, 48, 0, 0, 0, 52, 0, 0, 0, 55, 0, 0, 0, 43, 0, 0, 0],
  },
  library: {
    bpm: 112, leadType: 'triangle',
    lead: [60, 0, 63, 0, 65, 0, 63, 0, 60, 0, 58, 0, 60, 0, 0, 0, 67, 0, 66, 0, 65, 0, 63, 0, 60, 0, 0, 0, 0, 0, 0, 0],
    bass: [36, 0, 0, 36, 0, 0, 43, 0, 36, 0, 0, 36, 0, 0, 41, 0],
  },
  battle: {
    bpm: 176,
    lead: [69, 69, 72, 69, 74, 69, 72, 69, 69, 69, 72, 69, 76, 74, 72, 71, 69, 69, 72, 69, 74, 69, 77, 76, 74, 72, 71, 72, 69, 0, 68, 0],
    bass: [45, 0, 45, 0, 45, 0, 45, 0, 43, 0, 43, 0, 40, 0, 40, 0, 45, 0, 45, 0, 41, 0, 41, 0, 40, 0, 40, 0, 45, 0, 44, 0],
  },
  garden: {
    bpm: 84, leadType: 'triangle',
    lead: [79, 0, 76, 0, 72, 0, 76, 0, 77, 0, 74, 0, 71, 0, 74, 0, 76, 0, 72, 0, 67, 0, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0],
    bass: [48, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0],
  },
}
