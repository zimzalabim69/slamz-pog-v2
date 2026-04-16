// ============================================================
// AUDIO SYSTEM â€” Ported 1:1 from original AudioSystem.js
// Procedural Web Audio API â€” no asset files needed
// ============================================================

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

export function playImpactSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

  filter.type = 'lowpass';
  filter.frequency.value = 400;

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playVelcroRip() {
  const ctx = getCtx();
  const duration = 0.3;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    const envelope = Math.pow(1 - t, 2) * (Math.random() > 0.8 ? 1 : 0.3);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000 + Math.random() * 1000;
  source.connect(filter);
  filter.connect(ctx.destination);
  source.start();
}

export function playCaptureSound() {
  const ctx = getCtx();
  // Rising chime â€” same feel as original "capture" 
  [0, 100, 200].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440 * Math.pow(1.25, i), ctx.currentTime + delay / 1000);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay / 1000);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay / 1000);
    osc.stop(ctx.currentTime + delay / 1000 + 0.35);
  });
}

/**
 * Discovery Jingle: High-rarity "Success" sound
 * Shimmering, harmonically rich rising sequence
 */
export function playDiscoveryJingle() {
  const ctx = getCtx();
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = i * 0.08;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.7);
  });
}

/**
 * Whoosh Sound: Transition effect
 * Filtered white noise sweep
 */
export function playWhooshSound() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  source.start();
}

/**
 * Zip Sound: Trapper Keeper opening/closing effect
 * High-speed noise burst with frequency modulation
 */
export function playZipSound() {
  const ctx = getCtx();
  const duration = 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    // Noise with a bit of periodic "teeth" feel
    const noise = Math.random() * 2 - 1;
    const teeth = Math.sin(i * 0.5) * 0.5;
    data[i] = (noise + teeth) * Math.pow(1 - (i / bufferSize), 2);
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + duration);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  source.start();
}

/**
 * Jackpot Fanfare: The "Big Payoff" sound
 * High-energy celebratory burst combining rising chords and shimmering noise
 */
export function playJackpotFanfare() {
  const ctx = getCtx();
  const baseFreq = 220; // A3
  const intervals = [1, 1.25, 1.5, 2, 2.5, 3]; // Major triad overtones
  
  // Power Chords
  intervals.forEach((interval, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = i * 0.05;
    
    osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq * interval, ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * interval * 1.5, ctx.currentTime + delay + 0.8);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 1.2);
  });

  // Shimmer Burst
  const bufferSize = ctx.sampleRate * 0.8;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bufferSize), 2);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;
  source.connect(filter);
  filter.connect(ctx.destination);
  source.start();
}
