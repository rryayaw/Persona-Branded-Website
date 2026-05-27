# Persona 5 — Fan Website

## What this is
A single-page, visually-driven fan website for the Persona series, inspired directly
by Persona 5's iconic UI aesthetic. This is a passion/portfolio project.
Visual impact and interactivity are the priority over functionality.

## Vibe and intent
Persona 5's UI is famous for its aggressive graphic design — sharp angles, high contrast
black/red/white, ransom-note typography, motion that feels alive and reactive.
This site should carry that same energy. Nothing should feel static or default.
Every hover, scroll, and selection should have weight and personality.

## The look
- Black backgrounds, off-white text, red (#d00010) as the sole accent
- Teko 700 as the display font throughout
- Letters are intentionally misaligned — different sizes, vertical nudges, slight rotations
- White boxes and black boxes appear randomly on letters, like cut-and-paste collage
- Geometric shapes: slanted panels, parallelogram clips, diagonal slashes, sharp corners
- Halftone dot textures and scan-line overlays as background detail
- Drop shadows are hard-offset (not blurred), always black

## Interactions
- Hover states should reshuffle letter chaos — new nudges, new box patterns
- Selected/active items show a red sine wave rising from the bottom of white text,
  permanently animating until something else is selected
- Spring-curve easing on everything — nothing linear, nothing ease-in-out
- Transitions should feel like the UI is alive and slightly unstable

## Navigation
- Fixed top bar, single page, tabs anchor-scroll to sections
- Nav items are styled in the P5 ransom-note letter style with per-letter size
  variation, vertical nudges, and random white/black box overlays on letters
- Active nav item shows the animated red sine wave rising from the bottom

---

## Stack
- React 19 + Vite 6
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Google Fonts — Teko 700
- Framer Motion — planned, not yet installed
- Deployed on Vercel — planned

---

## Current state

### App flow
Three-phase state machine in `App.jsx`:
1. **Loading** (5s) — full-screen atmospheric loading screen, fades in from black on boot
2. **Transitioning** (1.3s) — lightning bolt wipe sweeps top-left to bottom-right
3. **App** — main layout revealed; transparent main + invisible asides let hero background show through

### BGM
- Module-level Audio singleton (`bgm-song1-lastSuprise.mp3`), `loop`, `volume 0.2`, `preload auto`
- Fires `play()` immediately; `.catch()` attaches interaction listeners (`click`, `keydown`, `pointerdown`) as fallback for autoplay-blocked browsers
- No React effect — survives StrictMode double-invoke and hot reloads without re-buffering

### Components built

**`Loading.jsx`** — 5-second loading screen
- Fades in from black on first mount via `fadeIn` keyframe; `skipFade` prop suppresses it when reused inside `TransitionWipe`
- Dark `#0a0a0a` background with city image backdrop + gradient overlay
- Procedural rain: drops spawn every 65ms, each spawns ripples on impact
- Lightning: random strikes every 10–18s, trigger scene shake + drop burst
- 11 red radial gradients pulse on a 4s cycle at varying positions

**`LoadingText.jsx`** — animated "LOADING..." display (used inside Loading)
- Each letter has a unique size (3–6rem), rotation, and box overlay
- Wave bounce: each letter rises then falls in sequence, 120ms per step, 2s pause between waves
- The "L" has a floating star and a white cutout box inside it

**`TransitionWipe.jsx`** — lightning bolt wipe transition
- SVG clip-path animates a jagged bolt diagonally across the screen
- 3 jag segments, 40–100px stroke, ~11% viewport height jag amplitude
- 1.3s `easeInOut` — loading screen is clipped away frame by frame

**`Navbar.jsx`** — fixed full-width top bar
- `fixed top-0 left-0 right-0` with `px-[200px]` so content aligns with the main column
- IntersectionObserver watches the hero section
- While hero is visible: large `logo.png` fades in at scale
- Once scrolled past: compact `logo-p5.png` fades in (700ms easing)
- Right side: "Purchase now" button + music, sound, mail icon buttons

**`SectionNav.jsx`** — fixed right-side jump nav
- 5 anchor links: `#hero`, `#games`, `#characters`, `#music`, `#news`
- Centered vertically on the right edge, z-index 99

**`HeroBackground.jsx`** — canvas P5 background, scoped to hero section
- `position: absolute`, `left: 50%`, `transform: translateX(-50%)`, `width: 100vw` — breaks out of the main column to fill full viewport width, clipped vertically at section boundary
- Halftone dot grid (pulsing alpha), faint white grid overlay, red slash panels
- 100 gaussian-clustered glass-shard triangles floating with radial pulse + perpendicular sway
- Two sweeping helicopter spotlights with flicker (`screen` blend mode)
- Red corner accent triangles
- Tunables: `radialAmp`, `radialSpeed`, `swayAmp`, `swaySpeed`, `size` (multiplier), `count`

**`GlassShards.jsx`** — orbiting glass shard canvas overlay on the hero graphic
- 15 shards (triangles, diamonds, kites, trapezoids, custom shards) orbit the canvas center
- Launch animation: burst outward with `easeOutExpo`, then blend into hover float via `easeInOutCubic`
- Canvas positioned `absolute inset-0 z-[2]`, shifted `translateY(10px)`
- Tunables: `RADIUS`, `SIZE`, `SWAY`, `SWAY_SPD`, `NUM`, `DELAY` (ms before launch)

**`HeroSection.jsx`** — fully implemented landing section
- `HeroBackground` canvas (full-width, z-0, clipped to section)
- `GlassShards` canvas overlay (z-2, orbiting above graphic)
- `graphic-1.png` — hidden for `POP_DURATION` (1.2s), then `graphic-pop` animation:
  - Springs in from 45% scale + −8° rotation + 80px below, overshoots to 142%, settles at 140%
  - `cubic-bezier(0.34, 1.56, 0.64, 1)` spring curve
  - Chains into `graphic-hover` — 4s gentle bob ±14px + 0.6° rock, loops forever
- Bottom-left: ESRB Teen rating badge
- Bottom-center: series blurb text + blinking scroll arrow
- Bottom-right: "Available on" label + white/black-bordered box with PS, Xbox, Steam SVG logos

**Section skeletons** — placeholder layouts ready for content:
- `GamesSection.jsx`, `CharactersSection.jsx`, `MusicSection.jsx`, `NewsSection.jsx`

### Assets in place
- `public/logo.png` — large Persona 5 logo (hero navbar state)
- `public/logo-p5.png` — compact logo (scrolled navbar state)
- `public/city_background.jpg` — loading screen backdrop
- `public/assets/icon-mail.png`, `icon-music.png`, `icon-sound.png` — navbar icons
- `public/assets/graphic-1.png` — hero section main graphic
- `public/assets/rating-teen.svg` — ESRB Teen badge
- `public/assets/logo-ps.svg`, `logo-xbox.svg`, `logo-steam.svg` — platform logos
- `public/assets/audio/bgm-song1-lastSuprise.mp3` — background music
- `public/assets/Persona 5 Looping Stars Background.mp4` — available for use

### Theme tokens (Tailwind `@theme`)
```
--color-ink: #0d0d0d
--color-cream: #f5f0ea
--font-teko: "Teko", sans-serif
--color-wire-*: wireframe grays (temporary, will be replaced)
```

### Global styles
- `body { background: #0a0a0a }` — page starts black, no white flash on load
- `main { bg-transparent }`, asides `opacity-0` — hero background shows through unobstructed

---

## Sections — planned content

### 2. Games
Full viewport per game, game switcher at bottom.
- Entire section color scheme shifts per active game (P3=blue, P4=yellow, P5=red)
- Active game: title in P5 display font, description, image gallery with arrow nav, "Buy Now" → Steam link
- Bottom row: 3 slabs (P3, P4, P5) — click to switch, auto-advances after idle timeout

### 3. Characters
Character showcase with selector and detail view.
- Selector row: portraits/icons — hover triggers entrance animation, click switches display
- Active character: full artwork, name in P5 font, bio text, Persona symbol/insignia as design element

### 4. Music
In-page music player for Persona series tracks.
- Currently playing: song name, artist/composer, source game
- Song list: title + source game per entry
- Play/pause control; live waveform/audio visualizer
- Default track plays on load; last selected track persists via `localStorage`

### 5. News
Persona series news feed.
- Article display: title in large display font, banner image, body text, published date
- Headline selector to switch between articles
- Slanted-panel P5 layout aesthetic

---

## What's next
1. Build Games section with per-game theming (color, geometry, data)
2. Build Character selector with entrance animations
3. Build Music player with waveform visualizer and `localStorage` persistence
4. Build News feed layout
5. Apply P5 ransom-note letter style to Navbar items
6. Add Framer Motion for spring-curve easing across all transitions and interactions
7. Hook up real game/character/news data
8. Deploy to Vercel

---

## Key constraint
Visuals first. If something looks wrong, that is the bug — even if the code is correct.
The site should feel like booting up a Persona game, not loading a webpage.
