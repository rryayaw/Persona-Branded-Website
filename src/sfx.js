// Lightweight UI sound-effects player built on Web Audio.
// Buffers decode once and replay via fresh BufferSources, so rapid/overlapping
// triggers (hover spam, quick clicks) never cut each other off or re-fetch.


// Master multiplier applied to every UI sound, then per-sound volume + rate.
export const SFX_MASTER = 0.9;   // 0 = silent, 1 = full, >1 = boost

export const SFX = {
  sectionHover:    { src: '/assets/audio/section-hover.wav',    volume: 20, rate: 1.0 },
  sectionSelect:   { src: '/assets/audio/section-select.wav',   volume: 2,  rate: 1.0 },
  characterSelect: { src: '/assets/audio/character-select.wav', volume: 1,  rate: 1.0 },
};


let _ctx = null;
const _bufs = {};
let _muted = false;

// Toggle all UI sound effects on/off; returns the new muted state.
export function toggleSfxMute() {
  _muted = !_muted;
  return _muted;
}
export function isSfxMuted() {
  return _muted;
}

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function load(url) {
  if (_bufs[url]) return _bufs[url];
  _bufs[url] = fetch(url).then((r) => r.arrayBuffer()).then((a) => ctx().decodeAudioData(a));
  return _bufs[url];
}

// Preload every configured sound so first playback is instant
export function preloadAllSfx() {
  Object.values(SFX).forEach((cfg) => load(cfg.src));
}

// Play a configured sound by key (reads the tunables above)
export function playSound(key) {
  if (_muted) return;
  const cfg = SFX[key];
  if (!cfg) return;
  load(cfg.src).then((buf) => {
    const c = ctx();
    if (c.state === 'suspended') c.resume();
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = cfg.rate ?? 1;
    const gain = c.createGain();
    gain.gain.value = (cfg.volume ?? 1) * SFX_MASTER;
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  }).catch(() => {});
}
