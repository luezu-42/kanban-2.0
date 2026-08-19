let audio: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

export function unlockReviewChime() {
  context();
}

export function playPrAlertChime() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  master.connect(ctx.destination);

  const notes = [
    { freq: 392.0, start: 0, duration: 0.28, type: "triangle" as const },
    { freq: 493.88, start: 0.16, duration: 0.4, type: "sine" as const },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq, now + note.start);
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(1, now + note.start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.02);
  }
}

export function playReviewChime() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  master.connect(ctx.destination);

  const notes = [
    { freq: 523.25, start: 0, duration: 0.18 },
    { freq: 659.25, start: 0.09, duration: 0.2 },
    { freq: 783.99, start: 0.18, duration: 0.28 },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, now + note.start);
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(1, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.02);
  }
}
