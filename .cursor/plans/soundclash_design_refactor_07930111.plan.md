---
name: SoundClash Design Refactor
overview: "Full design-system overhaul aligned to the Figma spec: new color tokens, two new fonts (Underfind + Space Grotesk), updated user flow (VS screen removed, battle summary merged into KO screen), responsive game/setup/home layouts, and starry pixel backgrounds on Home and Battle Summary."
todos:
  - id: fonts
    content: Copy Underfind font files to public/fonts/ and update layout.tsx with Space Grotesk + local Underfind
    status: completed
  - id: tokens
    content: "Rewrite globals.css: update all color tokens, type scale, button/card classes; add .starry-bg; remove box-frame/terminal classes"
    status: completed
  - id: home
    content: "Redesign src/app/page.tsx: remove box-frame, add starry background, clean centered layout"
    status: completed
  - id: game-flow
    content: "Update game/page.tsx: remove VS_SCREEN phase, add blurred album-art background layer during play"
    status: completed
  - id: vs-splash
    content: Remove VsSplash.tsx full-screen modal; add inline 'Player X's turn' label to SnippetPlayer
    status: completed
  - id: snippet-player
    content: "Update SnippetPlayer: add turn label + instructions, remove damage preview, update tokens"
    status: completed
  - id: guess-input
    content: "Update GuessInput: show damage cost inline, update I Give up label, update tokens"
    status: completed
  - id: ko-screen
    content: "Update KoScreen: single Rematch CTA, add starry background, update tokens/fonts"
    status: completed
  - id: hp-hud
    content: Update HpHud + HpBar to match Figma layout (name + HP inline, VS centered)
    status: completed
  - id: setup
    content: "Update setup page and components: clean card, HP slider labels, collapsible settings, chip styles"
    status: completed
isProject: false
---

# SoundClash Design Refactor

## What the Figma tells us

**New color tokens (from Figma variables):**

- `--bg-primary: #131315` (was `#0f1118`)
- `--bg-secondary: #1f2024` (Surface/Bottom)
- `--bg-surface: #292a2e` (Surface/Middle)
- `--text-primary: #ffffffe5` (Accent 90 / Mute 70)
- `--text-muted: #ffffff80` (Accessible 50)
- `--border-default: #ffffff1a` (Dividers/hovers)
- `--gold: #fff982` (yellow accent replaces amber)
- `--accent: #1ed760` (new Spotify green)
- `--destructive: #ff4766` (new red)
- New: `--pink: #ffccf3`, `--light-blue: #d3eafe`
- Remove all board-game-frame, terminal, crimson frame vars

**New fonts:**

- `Underfind Medium` (local) → `--font-display` (all headings H1–H4, Subtitle 1)
- `Space Grotesk` (Google Fonts) → `--font-body` (all body, buttons, labels)
- Remove: `Lilita_One`, `JetBrains_Mono`, `VT323`, `Inter`

**Type scale (from Figma):**

- H1: 96px / weight 500 / line-height 1.1 (Underfind)
- H4: 48px / weight 500 / line-height 1.2
- Subtitle 1: 32px / letter-spacing 6px (Underfind)
- Body 1: 16px / weight 400 / line-height 1.5 (Space Grotesk)
- Button 1: 18px / weight 500 / letter-spacing 2px
- Caption: 12px

**User flow changes:**

- `VS_SCREEN` phase removed — "Player X's turn" shown inline above play button
- `DamageOverlay` kept, but no pre-play "damage preview"
- `KoScreen`: single Rematch CTA (navigates to `/setup` preserving last settings); remove "Back to Lobby" button
- `AlbumReveal`: blurred cover art shown as full background during the `SNIPPET`/`GUESS` phase

**Visual effects:**

- Home page + Battle Summary: animated starry/pixel background (CSS-only, extends existing `.star-particle` + `twinkle`)
- Game page: blurred album cover as `position: fixed` background layer during play
- Remove box-frame aesthetic from Home page; clean centered card

## Files to change

### 1. Font files → `[public/fonts/](public/fonts/)`

Copy Underfind woff/woff2 files from Desktop into `public/fonts/` so `next/font/local` can reference them.

### 2. `[src/app/layout.tsx](src/app/layout.tsx)`

- Replace all 4 Google Font imports with `Space_Grotesk` + `next/font/local` for Underfind
- Variable names stay: `--font-display` (Underfind) and `--font-body` (Space Grotesk)
- Remove `--font-mono` and `--font-retro` variables from className

### 3. `[src/app/globals.css](src/app/globals.css)`

- Update all `:root` color tokens to Figma values
- Remove board-game-frame, terminal-panel, and crimson-frame vars
- Update `.btn-arcade`, `.btn-primary`, `.btn-secondary` etc. to use new tokens
- Update `.card`, `.card-elevated`, `.card-glow` 
- Add `.starry-bg` class (dense pixel stars via CSS animation + `box-shadow` trick or JS-rendered canvas approach)
- Remove `.box-frame`, `.terminal-panel`, `.terminal-panel-gold` classes (or deprecate)
- Update `.font-display` to reference only Underfind; remove `.font-retro`, `.font-mono` 
- Update `.text-gold-3d` to use new `--gold` (#fff982)

### 4. `[src/app/page.tsx](src/app/page.tsx)` — Home

- Remove `.box-frame` wrapper and ambient maroon glow
- Add `starry-bg` canvas/CSS layer behind content
- Center card with clean padding, new color tokens
- Use `font-display` (Underfind) for "SoundClash" title

### 5. `[src/app/game/page.tsx](src/app/game/page.tsx)`

- Remove `VS_SCREEN` phase case (or redirect it directly to `SNIPPET`)
- During `SNIPPET`/`GUESS` phase: render a blurred album-art layer `position: fixed inset-0` behind all content (use `currentAlbumArt` from game store, `filter: blur(40px) brightness(0.3)`)
- Show "Player X's turn" as a subtle inline label above the play button (no separate screen)

### 6. `[src/components/game/VsSplash.tsx](src/components/game/VsSplash.tsx)`

- Remove the full-screen splash entirely (it becomes dead code when VS_SCREEN phase is skipped)
- The "Player X's turn" label moves into `SnippetPlayer`

### 7. `[src/components/game/SnippetPlayer.tsx](src/components/game/SnippetPlayer.tsx)`

- Add player-turn label ("Player 1's turn") above the play button
- Add instruction text: "Listen carefully and guess the song" (shown during play)
- Remove any damage-preview UI
- Update all inline colors to CSS vars

### 8. `[src/components/game/GuessInput.tsx](src/components/game/GuessInput.tsx)`

- Damage cost shown inline inside input row (matching Figma: "−10 HP" label in muted text)
- "I Give up" button shows "−30 HP" as secondary label
- Style updates to new tokens

### 9. `[src/components/game/KoScreen.tsx](src/components/game/KoScreen.tsx)`

- Remove "Back to Lobby" button — only Rematch remains
- `handlePlayAgain` already routes to `/setup` and resets state (keep this behaviour)
- Add `.starry-bg` layer to the fixed background
- Update all colors/fonts to new tokens
- Keep battle summary list (per-round rows) and stats cards (Total Rounds / Perfects)

### 10. `[src/components/game/HpHud.tsx](src/components/game/HpHud.tsx)` + `[HpBar.tsx](src/components/game/HpBar.tsx)`

- Update layout per Figma: player name left-aligned, HP value next to name, bar below
- "VS" text centered between both bars
- Color updates

### 11. `[src/components/game/AlbumReveal.tsx](src/components/game/AlbumReveal.tsx)`

- Full-screen blurred album cover already lives here — verify it's wired through to the game page background layer as well
- Style updates to new tokens

### 12. `[src/components/landing/HeroSection.tsx](src/components/landing/HeroSection.tsx)` + `[SpotifyConnect.tsx](src/components/landing/SpotifyConnect.tsx)`

- Use `font-display` for "SoundClash"
- Use "The ultimate Music battle" subtitle in Space Grotesk
- SpotifyConnect: update token references

### 13. `[src/app/setup/page.tsx](src/app/setup/page.tsx)` + setup components

- Clean card layout per Figma
- HP slider with Quick/Standard/Marathon labels
- Collapsible "Battle Settings" section (chevron)
- Genre/Era selector chips styled with new `--border-default` and selected state using `--gold`

## Responsive strategy

- All containers: `max-w-[690px] mx-auto px-4`
- HP HUD stacks vertically on `< sm`, horizontal on `sm+`
- Game action area (play button + guess input) uses `flex-col` on mobile
- Selector chips wrap naturally
- Minimum touch target 44px maintained throughout

