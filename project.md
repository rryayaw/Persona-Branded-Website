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

### App flow (implemented)
Three-phase state machine in `App.jsx`:
1. **Loading** (5s) — full-screen atmospheric loading screen
2. **Transitioning** (1.3s) — lightning bolt wipe sweeps top-left to bottom-right
3. **App** — main layout revealed

### Components built

**`Loading.jsx`** — 5-second loading screen
- Dark `#0a0a0a` background with city image backdrop + gradient overlay
- Procedural rain: drops spawn every 65ms, each spawns ripples on impact
- Lightning: random strikes every 10–18s, trigger scene shake + drop burst
- 11 red radial gradients pulse on a 4s cycle at varying positions
- All timers and animation frames properly cleaned up on unmount

**`LoadingText.jsx`** — animated "LOADING..." display (used inside Loading)
- Each letter has a unique size (3–6rem), rotation, and box overlay
- Wave bounce animation: each letter rises then falls in sequence, 120ms per step, 2s pause between waves
- The "L" has a floating star and a white cutout box inside it

**`TransitionWipe.jsx`** — lightning bolt wipe transition
- SVG clip-path animates a jagged bolt diagonally across the screen
- 3 jag segments, 40–100px stroke, ~11% viewport height jag amplitude
- 1.3s `easeInOut` progression — loading screen is clipped away frame by frame

**`Navbar.jsx`** — sticky top bar
- IntersectionObserver watches the hero section
- While hero is visible: large `logo.png` fades in at scale
- Once scrolled past: compact `p5_logo.png` fades in (700ms easing)
- Right side: "Purchase now" button + music, sound, and mail icon buttons

**`SectionNav.jsx`** — fixed right-side jump nav
- 5 anchor links: `#hero`, `#games`, `#characters`, `#music`, `#news`
- Centered vertically on the right edge, z-index 99
- Rounded buttons with hover darkening

**Section skeletons** — all five sections exist as placeholder layouts:
- `HeroSection.jsx`, `GamesSection.jsx`, `CharactersSection.jsx`, `MusicSection.jsx`, `NewsSection.jsx`
- Each is `min-h-screen`, has its anchor `id`, and a basic Tailwind wireframe structure

### Assets in place
- `public/logo.png` — large Persona 5 logo (hero navbar)
- `public/p5_logo.png` — compact logo (scrolled navbar)
- `public/city_background.jpg` — loading screen backdrop
- `public/assets/icon_mail.png`, `icon_music.png`, `icon_sound.png` — navbar icons
- `public/assets/Persona 5 Looping Stars Background.mp4` — available for use

### Theme tokens (Tailwind `@theme`)
```
--color-ink: #0d0d0d
--color-cream: #f5f0ea
--font-teko: "Teko", sans-serif
--color-wire-*: wireframe grays (temporary, will be replaced)
```

---

## Sections — planned content

### 1. Home
Full viewport landing.
- Large hero graphic or animated visual as the main focal point
- Bottom-left: TEEN ESRB rating badge
- Bottom-right: "Wishlist on Steam" + platform badges (Steam, console icons)
- Middle-bottom: short about/series blurb
- Below blurb: blinking downward scroll arrow

### 2. Games
Full viewport per game, game switcher at bottom.
- Entire section color scheme shifts per active game (P3=blue, P4=yellow, P5=red) — background, accents, geometry all change
- Active game: title in P5 display font, description, image gallery with arrow nav, "Buy Now" → Steam link
- Bottom row: 3 slabs (P3, P4, P5) — click to switch, auto-advances after idle timeout

### 3. Characters
Character showcase with selector and detail view.
- Selector row: character portraits/icons — hover triggers entrance animation, click switches display
- Active character: full artwork, name in P5 font, bio text, Persona symbol/insignia as design element

### 4. Music
In-page music player for Persona series tracks.
- Currently playing: song name, artist/composer, source game
- Song list: title + source game per entry
- Play/pause control on the left
- Live waveform/audio visualizer alongside the player
- Default track plays on load; last selected track persists via `localStorage`

### 5. News
Persona series news feed.
- Article display: title in large display font, banner image, body text, published date
- Headline selector to switch between articles
- Slanted-panel P5 layout aesthetic

---

## What's next
1. Replace wireframe section skeletons with real P5-styled content and layouts
2. Implement Games section with per-game theming (color, geometry, data)
3. Build Character selector with entrance animations
4. Build Music player with waveform visualizer and `localStorage` persistence
5. Build News feed layout
6. Add Framer Motion for spring-curve easing across all transitions and interactions
7. Apply P5 ransom-note letter style to Navbar items
8. Hook up real game/character/news data
9. Deploy to Vercel

---

## Key constraint
Visuals first. If something looks wrong, that is the bug — even if the code is correct.
The site should feel like booting up a Persona game, not loading a webpage.
