// Background music singleton + playlist — shared across the app so the boot
// autoplay (App), the mute toggles (Navbar) and the song selector (MusicSection)
// all control one Audio instance. Module scope = buffered once, survives remounts.

export const SONGS = [
  { id: 'song1', title: 'Last Surprise',   game: 'Persona 5', accent: '#d00010', logo: '/assets/title-persona5.png',  src: '/assets/audio/bgm-song1-lastSuprise.mp3' },
  { id: 'song2', title: 'Life Will Change', game: 'Persona 5', accent: '#d00010', logo: '/assets/title-persona5.png',  src: '/assets/audio/bgm-song2-lifeWillChange.mp3' },
  { id: 'song3', title: 'Specialist',       game: 'Persona 4', accent: '#f2c200', logo: '/assets/title-persona4.webp', src: '/assets/audio/bgm-song3-specialist.mp3' },
  { id: 'song4', title: 'Color Your Night', game: 'Persona 3', accent: '#1e6edc', logo: '/assets/title-persona3.webp', src: '/assets/audio/bgm-song4-colorYourNight.mp3' },
  { id: 'song5', title: "It's Going Down",  game: 'Persona 3', accent: '#1e6edc', logo: '/assets/title-persona3.webp', src: '/assets/audio/bgm-song5-itsGoingDown.mp3' },
];

const MUTE_KEY = 'p5-bgm-muted';
const SONG_KEY = 'p5-bgm-song';

function readSongIndex() {
  try {
    const v = parseInt(localStorage.getItem(SONG_KEY), 10);
    return Number.isInteger(v) && v >= 0 && v < SONGS.length ? v : 0;
  } catch { return 0; }
}

let _songIndex = readSongIndex();
let _muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; } })();

export const bgm = new Audio(SONGS[_songIndex].src);
bgm.loop = true;
bgm.volume = 0.2;
bgm.preload = 'auto';

// Web Audio graph nodes (declared up here so applyMute() can reference _gain
// safely at module init — they're populated later by ensureAudioGraph()).
let _actx = null;
let _analyser = null;
let _gain = null;

// Mute is applied via the gain node once the audio graph exists (so the analyser
// still "sees" the signal and the waveform keeps moving while muted). Until then
// it falls back to the element's own muted flag.
function applyMute() {
  if (_gain) { _gain.gain.value = _muted ? 0 : 1; bgm.muted = false; }
  else { bgm.muted = _muted; }
}
applyMute();

const tryPlay = () => { if (bgm.paused) bgm.play().catch(() => {}); };

// Play once enough audio is buffered…
bgm.addEventListener('canplaythrough', tryPlay, { once: true });

// …with a user-gesture fallback for autoplay-blocked browsers.
['click', 'keydown', 'pointerdown'].forEach((evt) =>
  window.addEventListener(evt, tryPlay, { once: true, passive: true })
);

export function getSongIndex() {
  return _songIndex;
}

// ── Web Audio graph: source → analyser → gain → destination ─
// Built lazily on the first user gesture so routing the element through the
// graph doesn't silence the autoplay BGM.
function ensureAudioGraph() {
  if (_analyser) return;
  try {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
    const srcNode = _actx.createMediaElementSource(bgm);
    _analyser = _actx.createAnalyser();
    _analyser.fftSize = 1024;
    _analyser.smoothingTimeConstant = 0.8;
    _gain = _actx.createGain();
    srcNode.connect(_analyser);
    _analyser.connect(_gain);
    _gain.connect(_actx.destination);
    applyMute(); // move mute from the element onto the gain node
  } catch {
    _analyser = null;
  }
}

export function getAnalyser() {
  return _analyser;
}

function onGesture() {
  ensureAudioGraph();
  if (_actx && _actx.state === 'suspended') _actx.resume();
}
['pointerdown', 'keydown', 'click'].forEach((evt) =>
  window.addEventListener(evt, onGesture, { passive: true })
);

// Toggle play/pause; returns whether it is now playing.
export function togglePlay() {
  if (_actx && _actx.state === 'suspended') _actx.resume();
  if (bgm.paused) bgm.play().catch(() => {});
  else bgm.pause();
  return !bgm.paused;
}

// Switch the active song (persists choice, keeps playing — muted just silences)
export function setSong(index) {
  if (index < 0 || index >= SONGS.length || index === _songIndex) return;
  _songIndex = index;
  try { localStorage.setItem(SONG_KEY, String(index)); } catch { /* ignore */ }
  if (_actx && _actx.state === 'suspended') _actx.resume();
  bgm.src = SONGS[index].src;
  bgm.load();
  bgm.play().catch(() => {});
}

// Toggle mute; returns the new muted state. Audio keeps PLAYING when muted
// (gain → 0) so the waveform keeps moving; mute is purely an output thing.
export function toggleMute() {
  _muted = !_muted;
  try { localStorage.setItem(MUTE_KEY, _muted ? '1' : '0'); } catch { /* ignore */ }
  applyMute();
  return _muted;
}

export function isBgmMuted() {
  return _muted;
}
