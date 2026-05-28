/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dynamic Web Audio Synth for sheep bleat and magical interactive chimes.
// This is initialized lazily after user interaction to obey browser policies.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (common in browsers until user gesture)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes an adorable, hilarious sheep "BAHH" bleat using Web Audio API oscillators.
 * Uses FM synthesis + formant filtering to achieve highly custom sounds (baby, normal, deep, funny).
 */
export function playSheepBleat(pitchType: 'baby' | 'standard' | 'deep' | 'derp' = 'standard') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Define pitch and durations based on request
    let baseFreq = 160;   // General pitch of sheep bleat
    let duration = 0.8;   // Length of the bleat
    let vibratoSpeed = 8.5; // Wobble frequency
    let vibratoDepth = 25;  // Wobble intensity (Hz)
    let nasalCutoff = 1000; // Bandpass center frequency to mimic throat formant

    switch (pitchType) {
      case 'baby':
        baseFreq = 310;
        duration = 0.55;
        vibratoSpeed = 11.0;
        vibratoDepth = 35;
        nasalCutoff = 1600;
        break;
      case 'deep':
        baseFreq = 85;
        duration = 1.2;
        vibratoSpeed = 6.0;
        vibratoDepth = 15;
        nasalCutoff = 650;
        break;
      case 'derp':
        baseFreq = 120 + Math.random() * 100;
        duration = 0.9;
        vibratoSpeed = 14.0; // SUPER flutter
        vibratoDepth = 50;
        nasalCutoff = 1100;
        break;
      case 'standard':
      default:
        baseFreq = 170 + (Math.random() * 20 - 10);
        duration = 0.75 + Math.random() * 0.15;
        break;
    }

    // 1. Fundamental Oscillators (Sawtooth for raw vocal buzz, Triangle for body)
    const oscSaw = ctx.createOscillator();
    const oscTri = ctx.createOscillator();
    oscSaw.type = 'sawtooth';
    oscTri.type = 'triangle';

    // Set frequencies
    oscSaw.frequency.setValueAtTime(baseFreq, now);
    oscTri.frequency.setValueAtTime(baseFreq, now);
    
    // Slighly detune them for lush/goofy chorusing
    oscSaw.detune.setValueAtTime(-8, now);
    oscTri.detune.setValueAtTime(8, now);

    // Pitch slide downwards slightly over the course of the bleat
    oscSaw.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + duration);
    oscTri.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + duration);

    // 2. Low Frequency Oscillator (LFO) for that fluttering sheep vocal chord wobble!
    const lfo = ctx.createGain();
    const lfoOsc = ctx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(vibratoSpeed, now);
    
    // LFO Gain controls how wide the pitch bends
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(vibratoDepth, now);

    // Connect LFO to pitch parameters of both oscillators
    lfoOsc.connect(lfoGain);
    lfoGain.connect(oscSaw.frequency);
    lfoGain.connect(oscTri.frequency);

    // 3. Bandpass and Formant filters to give it the vocal nasal "Maaaa" or "Baaaa" quality
    const formantFilter1 = ctx.createBiquadFilter();
    formantFilter1.type = 'bandpass';
    formantFilter1.Q.setValueAtTime(4.0, now);
    formantFilter1.frequency.setValueAtTime(nasalCutoff, now);
    // Let filter frequency sweep slightly
    formantFilter1.frequency.exponentialRampToValueAtTime(nasalCutoff * 0.75, now + duration);

    // 4. Audio Envelope & Gain
    const oscGain = ctx.createGain();
    // Fade in sheep mouth opening "b-" to "aaaa"
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.6, now + 0.08); // Quick attack
    
    // Slight tremolo (amplitude flutter) using custom ramps
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const time = now + 0.08 + (duration - 0.15) * (i / steps);
      // alternate gain values to simulate trembling voice
      const gainVal = 0.45 + (i % 2 === 0 ? 0.15 : -0.15);
      oscGain.gain.linearRampToValueAtTime(gainVal, time);
    }

    // Decay and release
    oscGain.gain.setValueAtTime(0.45, now + duration - 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Soft tail

    // 5. Connect node graph
    oscSaw.connect(oscGain);
    oscTri.connect(oscGain);
    oscGain.connect(formantFilter1);
    
    // Master volume control with a limiter to avoid earsplitting noise
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    formantFilter1.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Start synthesis
    lfoOsc.start(now);
    oscSaw.start(now);
    oscTri.start(now);

    // Stop and cleanup
    lfoOsc.stop(now + duration);
    oscSaw.stop(now + duration);
    oscTri.stop(now + duration);
  } catch (error) {
    console.warn('Audio web context is blocked or unsupported on this system:', error);
  }
}

/**
 * Plays a beautiful glass-like star sparkle sound for visual glitter interaction.
 */
export function playStarSparkle() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Arpeggiating chime frequencies
    const randomFreqs = [1800, 2100, 2400, 2700, 3100];
    const freq = randomFreqs[Math.floor(Math.random() * randomFreqs.length)];
    
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Fail silently
  }
}

/**
 * Plays a soft floral bubble "popper" sound for dropping flowers.
 */
export function playFlowerPop() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    // Fail silently
  }
}
