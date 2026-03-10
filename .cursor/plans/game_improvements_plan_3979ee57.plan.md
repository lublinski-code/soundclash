---
name: Game improvements plan
overview: Improve the music guessing game with better song discovery (random music instead of user's known tracks), playback fixes, replay/control features, playlist creation, and UI polish using shadcn/ui design patterns.
todos:
  - id: iter1-song-discovery
    content: "ITER 1: Rewrite song pool -- search-first strategy, browse API, user library as fallback only"
    status: completed
  - id: iter1-snippet-bug
    content: "ITER 1: Fix snippet duration bug -- start timer after playTrack resolves + position polling safety net"
    status: completed
  - id: iter1-snippet-offset
    content: "ITER 1: Add 2.5s start offset to skip silent intros in playSnippet()"
    status: completed
  - id: iter2-give-up
    content: "ITER 2: Add 'Give Up' button that reveals the song and plays it fully (skip remaining snippets)"
    status: completed
  - id: iter2-auto-play-skip
    content: "ITER 2: Auto-play next snippet immediately on skip (no second click needed)"
    status: completed
  - id: iter2-popular-songs
    content: "ITER 2: Bias song pool toward popular/well-known tracks (add popularity filter + 'top' search terms)"
    status: completed
  - id: iter2-replay-button
    content: "ITER 2: Add replay button to SnippetPlayer for re-listening during SNIPPET and GUESS phases"
    status: completed
  - id: iter2-album-fullplay
    content: "ITER 2: Full song playback on AlbumReveal with pause/play + next round controls"
    status: completed
  - id: iter2-spotify-warning
    content: "ITER 2: Add warning banner for Spotify app visibility + rename SDK device"
    status: completed
  - id: iter2-battle-playlist
    content: "ITER 2: Add playlist-modify-private scope + create playlist button on KO screen"
    status: completed
  - id: iter3-design-polish
    content: "ITER 3: UI polish pass -- shadcn/ui patterns, consistent spacing/buttons/cards, game-feel animations"
    status: pending
isProject: false
---

# SoundClash Game Improvements Plan

## 1. Random Music Discovery (instead of user's top tracks)

The root cause: in Spotify Development Mode, playlist track access is blocked (403) and search limit is capped. The search fix (limit=10) from the previous session should now work -- the raw API test confirmed `Status: 200, Tracks: 5` for track search.

**Approach: Make search the PRIMARY strategy, user's own music the LAST fallback.**

Changes in [src/lib/spotify/songPool.ts](src/lib/spotify/songPool.ts):

- Reorder strategies: Search first, user library last
- Increase search diversity: add year-based queries ("rock 2020", "rock 2015"), artist-based queries, and random offset pagination to avoid the same results
- Add Spotify Browse API calls (`/browse/new-releases`, `/browse/categories/{id}/playlists`) as a second strategy -- these are public endpoints that should work in dev mode
- Only fall back to user's top/saved tracks if search yields fewer than the target (60 tracks)
- Add a `mixMode` option: "discovery" (no user tracks) vs "mixed" (blend search + user tracks)

## 2. Snippet Start Offset (skip silent intros)

Currently `playTrack()` starts at position `0ms`. Many songs have silent intros.

Changes:

- [src/lib/spotify/player.ts](src/lib/spotify/player.ts) -- `playSnippet()`: add `startOffsetMs` parameter (default 2500ms = 2.5s)
- [src/lib/spotify/api.ts](src/lib/spotify/api.ts) -- `playTrack()`: already supports `positionMs`, just needs to be wired through
- [src/app/game/page.tsx](src/app/game/page.tsx) -- pass offset to `playSnippet()`

## 3. Give Up Button (reveal + full playback)

Add a "Give Up" option that immediately ends the guessing, reveals the song, and plays it in full. Currently "Give up" only appears on the last snippet level and applies max damage silently. The new behavior:

- Show a "Give Up" button alongside "Skip (hear more)" at ALL snippet levels (not just the last)
- When pressed: apply max damage (-30 HP, same as wrong guess or skipping all snippets), skip straight to DAMAGE -> ALBUM_REVEAL phase, and play the full song
- This is different from "Skip" -- Skip gives you more time to listen; Give Up means "I have no idea, show me"
- Damage is always 30 HP (max from damage table) regardless of which snippet level the player is on

Changes:

- [src/components/game/GuessInput.tsx](src/components/game/GuessInput.tsx): add a separate "Give Up" button (muted style, always visible)
- [src/lib/game/engine.ts](src/lib/game/engine.ts): add `GIVE_UP` action that applies max damage and transitions to DAMAGE -> ALBUM_REVEAL
- [src/app/game/page.tsx](src/app/game/page.tsx): wire `handleGiveUp` handler that stops snippet and dispatches GIVE_UP

## 4. Auto-Play on Skip (no second click)

Currently clicking "Skip (hear more)" advances the snippet level but requires a second click on the play button to hear the next snippet. This breaks flow.

Changes:

- [src/app/game/page.tsx](src/app/game/page.tsx): after dispatching `SKIP_GUESS`, automatically call `handlePlaySnippet()` with the new snippet duration
- [src/components/game/SnippetPlayer.tsx](src/components/game/SnippetPlayer.tsx): accept an `autoPlay` prop; when true, trigger `onPlay` on mount/level change
- Ensure the timer ring resets and animates for the new duration

## 5. Popular Songs Bias

Users don't want deep cuts -- they want recognizable songs they have a chance of guessing.

Changes in [src/lib/spotify/songPool.ts](src/lib/spotify/songPool.ts):

- Add `popularity` filter: after collecting tracks, sort by Spotify's `popularity` field (0-100) and prioritize tracks with popularity >= 50
- Add search terms biased toward hits: "top hits {genre}", "{genre} number one", "{genre} greatest hits", "best {genre} songs ever"
- In post-processing: keep a 70/30 split -- 70% high-popularity (>= 50) and 30% mid-popularity (30-50) for variety
- Filter out tracks with popularity < 20 entirely (deep cuts nobody will guess)

## 6. Replay Button

Add ability to re-listen to the current snippet.

Changes:

- [src/components/game/SnippetPlayer.tsx](src/components/game/SnippetPlayer.tsx): add a "Replay" button that calls `onReplay`
- [src/app/game/page.tsx](src/app/game/page.tsx): implement `handleReplay` that calls `playSnippet()` again with the same duration and offset
- Show replay button during both SNIPPET and GUESS phases
- Visual: circular replay icon next to the timer

## 7. Hide Song from Spotify App

**Limitation:** The Spotify Web Playback SDK exposes the currently playing track to all Spotify clients (phone app, desktop app). There is no API to make playback "invisible."

**Practical mitigations:**

- [src/lib/spotify/player.ts](src/lib/spotify/player.ts): rename the device from "SoundClash" to something that doesn't draw attention
- Add a visual warning banner in the game UI: "Players: don't check your Spotify app during the game!"
- After each snippet pause, immediately seek to position 0 of a different (silent/generic) track -- this clears the "now playing" display. This is optional and may cause latency issues.
- **Best approach for MVP**: just add the warning banner. Revisit with a more sophisticated approach later.

## 8. Full Song Playback After Guess + Controls

Currently `AlbumReveal` auto-advances after 3.5s with no audio.

Changes:

- [src/components/game/AlbumReveal.tsx](src/components/game/AlbumReveal.tsx):
  - Remove the 3.5s auto-advance timer
  - Start full song playback when the component mounts (from position 0)
  - Add "Pause/Play" toggle button and "Next Round" button
  - "Next Round" pauses playback and calls `onComplete`
- [src/app/game/page.tsx](src/app/game/page.tsx): wire up playback calls for album reveal phase
- [src/lib/spotify/api.ts](src/lib/spotify/api.ts): add `resumePlayback()` function

## 9. Battle Playlist Creation

Track all played songs and allow creating a Spotify playlist after the game.

Changes:

- [src/lib/spotify/auth.ts](src/lib/spotify/auth.ts): add `playlist-modify-private` scope (requires re-auth)
- [src/lib/spotify/api.ts](src/lib/spotify/api.ts): add `createPlaylist(name, trackUris)` function using `POST /users/{user_id}/playlists` and `POST /playlists/{id}/tracks`
- [src/components/game/KoScreen.tsx](src/components/game/KoScreen.tsx): add "Save as Playlist" button below the battle summary
  - Playlist name: "SoundClash Battle - {date}"
  - Shows success/error feedback
  - Disables after creation to prevent duplicates

## 10. Fix Snippet Duration Bug (plays whole song) -- COMPLETED in ITER 1

The bug is in the timing mechanism in `playSnippet()`:

```typescript
snippetTimeout = window.setTimeout(async () => {
  await stopSnippet();
  onSnippetEnd?.();
}, durationMs);
```

**Root cause candidates:**

- Race condition: if `playSnippet()` is called again before the timeout fires, the old timeout may not be cleared properly
- The `playTrack()` API call may take variable time, so the song starts late but the timer started early
- If the tab is backgrounded, `setTimeout` may be throttled by the browser

**Fix in [src/lib/spotify/player.ts](src/lib/spotify/player.ts):**

- Start the timer AFTER `playTrack()` resolves (not before)
- Add a safety net: poll `player.getCurrentState()` every 500ms and force-pause if position exceeds the intended duration + start offset
- Clear any existing timeout before setting a new one (already done, but verify)
- Use `performance.now()` as a secondary check

## 11. Design Polish (shadcn/ui patterns, no Figma dependency) -- ITER 3

Use shadcn/ui design patterns as the foundation. No full library install -- cherry-pick the Tailwind patterns and CSS variables from the [shadcn/ui design system](https://www.figma.com/design/51PGDNQ9VabSqSczz8xMgV/-shadcn-ui---Design-System--Community-?node-id=2-287).

**Design principles (party game context -- friends around one screen):**

- 44px minimum click targets on all interactive elements
- `tabular-nums` on HP/damage numbers to prevent layout shift
- Album art is the ONLY color hero; everything else stays neutral dark
- Consistent 300ms ease-out on all phase transitions
- Guess input: 48px height minimum, centered, prominent (core interaction under time pressure)
- HP bars pinned top, always visible

**Changes across all screens:**

[src/app/globals.css](src/app/globals.css):

- Add shadcn/ui-compatible CSS variables (--radius, --ring, --card, --card-foreground, etc.)
- Standardize border-radius to 8px (sm), 12px (md), 16px (lg)
- Add subtle card elevation (1px border + soft shadow on elevated surfaces)

**Component-level polish:**

- **Buttons**: 3 tiers -- Primary (accent fill, 44px height, bold), Secondary (ghost + border), Muted (text-only for skip/cancel). All with focus-visible ring.
- **Cards**: rounded-xl, subtle border, bg-surface, consistent 16-24px internal padding
- **Setup page**: card containers for each config section, better visual grouping
- **Game HUD**: tighter spacing, monospace HP numbers, cleaner VS divider
- **SnippetPlayer**: larger timer ring (120px+), clearer play/replay buttons
- **GuessInput**: 48px height input, wider dropdown, album art thumbnails in results at 40x40px
- **AlbumReveal**: dominant-color gradient background, larger album art (280px+), proper song info typography
- **KoScreen**: better hierarchy, scrollable round list, cleaner action buttons
- **DamageOverlay**: tighter animation timing (flash 150ms, fade 600ms), damage number at 64px font
- **VsSplash**: bolder typography, pulse animation on active player name

## Scope Note

All changes maintain the client-side-only architecture (no backend). The Spotify Web Playback SDK and Web API are the only external dependencies. Adding the `playlist-modify-private` scope will require users to re-authorize with Spotify.