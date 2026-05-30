// Web Audio API Retro Sound Effects for children engagement
let isMutedGlobal = false;

export function toggleGlobalMute(): boolean {
  isMutedGlobal = !isMutedGlobal;
  return isMutedGlobal;
}

export function isMuted(): boolean {
  return isMutedGlobal;
}

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    return new AudioContextClass();
  } catch (e) {
    return null;
  }
}

export function playStickerSound(pitchMultiply = 1) {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  // Delightful ascending chip-tune chime
  osc.frequency.setValueAtTime(440 * pitchMultiply, now);
  osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiply, now + 0.15);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

export function playNegativeSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  // Soft correction sound
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.linearRampToValueAtTime(220, now + 0.12);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playSuccessSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  // Joyful triumphant chord (Major Triad: C5 - E5 - G5 with a quick delayed build)
  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(523.25, now + 0.05);
  osc.frequency.setValueAtTime(659.25, now + 0.10); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.15); // G5
  osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(261.63, now); // C4 support
  osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.35);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 0.4);
  osc2.stop(now + 0.4);
}
