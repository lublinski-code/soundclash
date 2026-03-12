# SoundClash

A real-time music battle game powered by the Deezer API. Two teams go head-to-head listening to short song snippets and racing to guess the track — the longer it takes, the more HP you lose.

> **No login or premium required** — music and metadata come from the [Deezer API](https://developers.deezer.com/).

---

## Features

- **Deezer API** — Play tracks by genre, era, and market with no account or subscription
- **Team vs team** — Name teams and players, take turns guessing
- **Progressive snippets** — Start with a short clip; request longer ones at the cost of higher damage on wrong guesses
- **HP system** — Wrong guesses and skips deal damage; artist-only guesses cost less than a full skip
- **Responsive UI** — Built with accessibility and touch targets in mind (WCAG AA, 44px minimum)

---

## How it works

1. **Set up teams** — Name your teams and assign players
2. **Pick genres, eras, and market** — The game pulls songs from Deezer matching your settings
3. **Battle** — Players take turns listening to increasingly longer snippets and guessing song or artist
4. **Survive** — Wrong guesses and skips cost HP; first team to zero loses

### Snippet levels & damage

Each round starts with the shortest snippet. Players can listen again for a longer clip, but the damage multiplier increases. Guessing artist-only costs less than a full skip but more than a correct guess.

---

## Tech stack

| Layer        | Tech |
|-------------|------|
| Framework   | **Next.js 16** (App Router) + **React 19** |
| Language    | **TypeScript** |
| State       | **Zustand** — client-side game state |
| Animation   | **Framer Motion** |
| Styling     | **Tailwind CSS v4** |
| Audio / API | **Deezer API** (no auth or premium required) |

---

## Getting started

### Prerequisites

- **Node.js 18+**

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/music-game.git
cd music-game
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub and [import the repo in Vercel](https://vercel.com/new)
2. No API keys or redirect URIs required — deploy and go

---

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing
│   ├── setup/page.tsx      # Team & game config
│   ├── game/page.tsx       # In-game screen
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── api/
│       ├── songs/route.ts  # Song pool & replenish
│       └── search/route.ts # Search (e.g. for tracks)
├── components/
│   ├── game/               # HpHud, SnippetPlayer, GuessInput, KoScreen, AlbumReveal, etc.
│   ├── landing/            # HeroSection
│   └── setup/              # TeamSetup, GameConfig, GenrePicker, EraPicker, CountryPicker
├── lib/
│   ├── game/               # Engine, damage logic, types, constants
│   ├── music/              # Song pool (songPool)
│   ├── audio/              # Playback (player)
│   └── utils/              # Helpers (e.g. colorExtract)
└── store/
    └── gameStore.ts        # Zustand game state
```

---

## Scripts

| Command     | Description                |
|------------|----------------------------|
| `npm run dev`   | Start dev server (127.0.0.1) |
| `npm run build` | Production build            |
| `npm run start` | Start production server     |
| `npm run lint`  | Run ESLint                  |
| `npm run clean` | Remove `.next` and build caches |

---

## Roadmap

- [ ] Arcade leaderboards (post a score with a name, no account required)
- [ ] Analytics
- [ ] Song fetch improvements (e.g. exclude already-played artists, better genre/era coverage)
- [ ] Real-time multiplayer (v2)

---

## License

Proprietary or unlicensed — see repository for details.
