// Apple Pay Sound Effects Engine with Zero-Latency Audio Buffer & Web Audio Synthesizer Fallback
class SoundEffects {
  private ctx: AudioContext | null = null;
  private successAudio: HTMLAudioElement | null = null;
  private failureAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.successAudio = new Audio('/sounds/payment_success.wav');
        this.successAudio.preload = 'auto';

        this.failureAudio = new Audio('/sounds/payment_failure.wav');
        this.failureAudio.preload = 'auto';
      } catch {
        // Fallback to Web Audio API synthesis
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  /**
   * Play official Apple Pay transaction success chime
   * Uses real audio asset with automatic Web Audio synthesizer fallback
   */
  playApplePaySuccess() {
    // 1. Try playing pre-buffered official Apple Pay audio file
    if (this.successAudio) {
      try {
        this.successAudio.currentTime = 0;
        const playPromise = this.successAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy or asset issue -> fall back to Web Audio API synthesis
            this.playSynthesizedApplePayChime();
          });
          return;
        }
      } catch {
        // Fall back to synthesizer
      }
    }

    this.playSynthesizedApplePayChime();
  }

  // Alias for backward compatibility
  playSuccessChime() {
    this.playApplePaySuccess();
  }

  /**
   * Synthesized Apple Pay Chime (Two-tone ascending resonant bell chime: G5 783.99Hz -> C6 1046.50Hz + harmonic overtone)
   */
  private playSynthesizedApplePayChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Note 1: G5 (783.99 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2: C6 (1046.50 Hz) - slightly overlapping resonant completion chime
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, now + 0.08);

      // Harmonic overtone (C7 2093Hz) for signature crystal shine
      const oscOvertone = this.ctx.createOscillator();
      const gainOvertone = this.ctx.createGain();
      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(2093.00, now + 0.08);

      gain2.gain.setValueAtTime(0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.095);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      gainOvertone.gain.setValueAtTime(0, now + 0.08);
      gainOvertone.gain.linearRampToValueAtTime(0.08, now + 0.095);
      gainOvertone.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      oscOvertone.connect(gainOvertone);
      gainOvertone.connect(this.ctx.destination);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.48);
      oscOvertone.start(now + 0.08);
      oscOvertone.stop(now + 0.38);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  /**
   * Play official Apple Pay transaction failure sound
   */
  playApplePayFailure() {
    if (this.failureAudio) {
      try {
        this.failureAudio.currentTime = 0;
        const playPromise = this.failureAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.playSynthesizedFailure();
          });
          return;
        }
      } catch {
        // Fall back
      }
    }

    this.playSynthesizedFailure();
  }

  playErrorBuzzer() {
    this.playApplePayFailure();
  }

  private playSynthesizedFailure() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(165, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // safe fallback
    }
  }
}

export const sounds = new SoundEffects();

