/**
 * Arcade Audio Manager (Stability V1)
 * Handles unmutable, high-impact arcade loops and sound effects.
 */

class AudioManager {
  private context: AudioContext | null = null;
  private introBuffer: AudioBuffer | null = null;
  private introSource: AudioBufferSourceNode | null = null;
  private initialized = false;

  constructor() {
    // We don't initialize context until a user gesture
  }

  public async init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
      console.log('[AUDIO] System Initialized (Arcade Mode)');
      
      // Unlock context (browser policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Pre-load intro track if it exists
      this.loadIntro();
    } catch (e) {
      console.error('[AUDIO] Failed to initialize AudioContext:', e);
    }
  }

  private async loadIntro() {
    if (!this.context) return;
    try {
      // Updated to local user path 'Insert Soul.mp3'
      const response = await fetch('/assets/music/Insert Soul.mp3');
      if (!response.ok) throw new Error('File not found');
      
      const arrayBuffer = await response.arrayBuffer();
      this.introBuffer = await this.context.decodeAudioData(arrayBuffer);
      console.log('[AUDIO] Intro Track Loaded & Primed: Insert Soul.mp3');
      
      // Auto-play on load if possible (since we initialized on a gesture)
      this.playIntro();
    } catch (e) {
      console.warn('[AUDIO] Intro track "Insert Soul.mp3" missing or failed to decode. Check /public/assets/music/');
    }
  }

  public playIntro() {
    if (!this.context || !this.introBuffer || this.introSource) return;

    this.introSource = this.context.createBufferSource();
    this.introSource.buffer = this.introBuffer;
    this.introSource.loop = true;
    this.introSource.connect(this.context.destination);
    this.introSource.start(0);
    console.log('[AUDIO] Intro Loop Started.');
  }

  public stopIntro() {
    if (this.introSource) {
      this.introSource.stop();
      this.introSource = null;
    }
  }

  public playSfx(name: string, volume: number = 0.5) {
    if (!this.context) return;
    
    // SFX Logic (Placeholder for lightning_crack, slam_start)
    console.log(`[AUDIO] SFX Trigger: ${name}`);
    
    // Simple oscillator beep for "lightning" placeholder
    if (name === 'lightning_crack') {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
      gain.gain.setValueAtTime(volume * 0.2, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.start();
      osc.stop(this.context.currentTime + 0.1);
    }
  }
}

export const audioManager = new AudioManager();
