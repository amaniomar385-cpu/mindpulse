/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreathingPhase } from '../types';

class AudioBiofeedbackService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stop();
    return this.isMuted;
  }

  public playPhaseCue(phase: BreathingPhase, durationSeconds: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.stop();

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const dur = Math.max(1, durationSeconds);

      // Create primary oscillator & gain
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft filter for warm organic tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      if (phase === 'inhale') {
        // Inhale: Ascending soothing tone (432 Hz -> 528 Hz - "Love frequency")
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        osc.frequency.exponentialRampToValueAtTime(528, now + dur);

        // Smooth breathing swell envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + dur * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      } else if (phase === 'hold-in' || phase === 'hold-out') {
        // Hold: subtle harmonic shimmer
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(528, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      } else if (phase === 'exhale') {
        // Exhale: Descending grounding tone (528 Hz -> 360 Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + dur);

        // Calming release envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      }

      osc.start(now);
      osc.stop(now + dur);

      this.currentOsc = osc;
      this.currentGain = gain;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playChime(success: boolean = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(success ? 659.25 : 440, now); // E5
      if (success) {
        osc.frequency.setValueAtTime(880, now + 0.15); // A5
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // Audio playback error ignore
    }
  }

  public stop() {
    if (this.currentOsc) {
      try {
        this.currentOsc.stop();
        this.currentOsc.disconnect();
      } catch {
        // already stopped
      }
      this.currentOsc = null;
    }
  }
}

export const audioBiofeedback = new AudioBiofeedbackService();
