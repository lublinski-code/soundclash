# SoundClash

A real-time music battle game powered by your Spotify library. Two teams go head-to-head listening to short song snippets and racing to guess the track — the longer it takes, the more HP you lose.

> **Requires Spotify Premium** — audio playback uses the Spotify Web Playback SDK.

---

## How it works

1. **Connect Spotify** — authenticate with your Spotify Premium account
2. **Set up teams** — name your teams and players
3. **Pick genres, eras, and market** — the game pulls songs from your Spotify library matching your settings
4. **Battle** — players take turns listening to increasingly longer snippets and guessing song or artist
5. **Survive** — wrong guesses and skips cost HP; first team to zero loses

### Snippet levels & damage

Each round starts with the shortest snippet. Players can listen again for a longer clip, but the damage multiplier increases. Guessing artist-only costs less than a full skip but more than a correct guess.

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Zustand** — client-side game state
- **Framer Motion** — animations
- **Tailwind CSS v4**
- **Spotify Web Playback SDK** + **Spotify Web API**

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Spotify Developer app](https://developer.spotify.com/dashboard) with a registered redirect URI
- A Spotify Premium account for testing

### 1. Clone and install

```bash
git clone https://github.com/lublinski-code/soundclash.git
cd soundclash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

In the Spotify Developer Dashboard, add `http://localhost:3000/callback` as a Redirect URI for your app.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Set the same env vars under **Settings → Environment Variables**, with `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` pointing to your Vercel URL (e.g. `https://soundclash.vercel.app/callback`)
3. Add the Vercel callback URL to your Spotify app's Redirect URIs

---

## Project structure

```
src/
  app/              # Next.js pages (home, setup, game, callback, privacy, terms)
  components/
    game/           # In-game UI (HpHud, SnippetPlayer, GuessInput, KoScreen…)
    landing/        # Home page components
    setup/          # Setup flow components
  lib/
    game/           # Game engine, damage logic, types
    spotify/        # Auth (PKCE), API calls, Web Playback SDK wrapper
  store/            # Zustand stores (game, spotify)
```

---

## Roadmap

- [ ] Arcade leaderboards (post a score with a name, no account required)
- [ ] Analytics
- [ ] Real-time multiplayer (v2)
