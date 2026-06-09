// Background music singleton — shared across the app so any component
// (boot autoplay in App, mute toggle in Navbar) controls one Audio instance.
// Module scope means the browser buffers it once and it survives React remounts.
export const bgm = new Audio('/assets/audio/bgm-song1-lastSuprise.mp3');
bgm.loop = true;
bgm.volume = 0.2;
bgm.preload = 'auto';

const tryPlay = () => { if (bgm.paused && !bgm.muted) bgm.play().catch(() => {}); };

// Play once enough audio is buffered…
bgm.addEventListener('canplaythrough', tryPlay, { once: true });

// …with a user-gesture fallback for autoplay-blocked browsers.
['click', 'keydown', 'pointerdown'].forEach((evt) =>
  window.addEventListener(evt, tryPlay, { once: true, passive: true })
);

// Toggle mute; returns the new muted state. Resumes playback when unmuting.
export function toggleMute() {
  bgm.muted = !bgm.muted;
  if (!bgm.muted && bgm.paused) bgm.play().catch(() => {});
  return bgm.muted;
}
