/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Single global AudioContext for ALL sounds!
let audioCtx: AudioContext | null = null;
let audioPrimed = false;

// Ambient sound variables
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain1: GainNode | null = null;
let ambientGain2: GainNode | null = null;
let ambientMasterGain: GainNode | null = null;
let isAmbientPlaying = false;

/**
 * Get or create the single global AudioContext, and PRIME IT on first call!
 * MUST be called from a USER INTERACTION handler!
 */
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) throw new Error('Web Audio not supported');
    audioCtx = new Ctor();
  }

  // ALWAYS try to resume and prime!
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Prime with a completely silent sound the first time we get the context!
  if (!audioPrimed) {
    audioPrimed = true;
    const now = audioCtx.currentTime;
    const primeOsc = audioCtx.createOscillator();
    const primeGain = audioCtx.createGain();
    primeGain.gain.setValueAtTime(0.0001, now);
    primeGain.gain.linearRampToValueAtTime(0, now + 0.01);
    primeOsc.connect(primeGain);
    primeGain.connect(audioCtx.destination);
    primeOsc.start(now);
    primeOsc.stop(now + 0.01);
  }

  return audioCtx;
}

/**
 * Initializes audio system on first user interaction anywhere!
 * Call this ONCE from a top-level user event handler!
 */
export function initializeAudioOnFirstInteraction() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'running') {
      console.log('Audio system initialized and primed!');
    }
  } catch (e) {
    console.warn('Failed to initialize audio:', e);
  }
}

// --------------------------
// BIRTHDAY SONG FUNCTIONALITY
// --------------------------
interface AudioSyllable {
  note: string;
  freq: number;
  duration: number;
  syllable: string;
  pause: number;
}

const SWEET_HAPPY_BIRTHDAY: AudioSyllable[] = [
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: 'to ', pause: 0.05 },
  { note: 'B4', freq: 493.88, duration: 1.10, syllable: 'you!', pause: 0.35 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: 'to ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.10, syllable: 'you!', pause: 0.35 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'G5', freq: 783.99, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: 'dear ', pause: 0.05 },
  { note: 'B4', freq: 493.88, duration: 0.55, syllable: 'Tor-', pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.85, syllable: 'shi-ta!', pause: 0.35 },
  { note: 'F5', freq: 698.46, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'F5', freq: 698.46, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: 'to ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.50, syllable: 'YOU!', pause: 0.80 }
];

/**
 * Plays the birthday song, calls updateSyllable for each syllable change, calls onComplete when done
 */
export function playBirthdaySong(
  updateSyllable: (syllable: string) => void,
  onComplete: () => void
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    let noteIndex = 0;

    const playNote = () => {
      if (noteIndex >= SWEET_HAPPY_BIRTHDAY.length) {
        onComplete();
        return;
      }

      const syllable = SWEET_HAPPY_BIRTHDAY[noteIndex];
      updateSyllable(syllable.syllable);

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(syllable.freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02); // Quicker attack for mobile
      gain.gain.exponentialRampToValueAtTime(0.0001, now + syllable.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + syllable.duration);

      noteIndex++;
      setTimeout(playNote, (syllable.duration + syllable.pause) * 1000);
    };

    playNote();
  } catch (e) {
    console.warn('Birthday song failed:', e);
    onComplete();
  }
}

// --------------------------
// AMBIENT SOUND
// --------------------------
export function startAmbientSound() {
  try {
    if (isAmbientPlaying) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create two detuned oscillators for a warm, sweet ambient drone
    ambientOsc1 = ctx.createOscillator();
    ambientOsc2 = ctx.createOscillator();
    
    ambientOsc1.type = 'sine';
    ambientOsc2.type = 'sine';
    
    // Sweet, warm frequencies (C3 and E3, perfect fifth apart for harmony)
    ambientOsc1.frequency.setValueAtTime(130.81, now); // C3
    ambientOsc2.frequency.setValueAtTime(164.81, now); // E3
    ambientOsc2.detune.setValueAtTime(5, now); // Slight detune for warmth
    
    // Create gain nodes
    ambientGain1 = ctx.createGain();
    ambientGain2 = ctx.createGain();
    ambientMasterGain = ctx.createGain();
    
    // Very low volume
    ambientMasterGain.gain.setValueAtTime(0.03, now);
    
    // Connect oscillators
    ambientOsc1.connect(ambientGain1);
    ambientGain1.connect(ambientMasterGain);
    ambientOsc2.connect(ambientGain2);
    ambientGain2.connect(ambientMasterGain);
    ambientMasterGain.connect(ctx.destination);
    
    // Add gentle tremolo (slow amplitude modulation)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, now); // 0.5 Hz = 2-second cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, now); // Modulation depth
    lfo.connect(lfoGain);
    lfoGain.connect(ambientMasterGain.gain);
    
    // Start everything
    ambientOsc1.start(now);
    ambientOsc2.start(now);
    lfo.start(now);
    
    isAmbientPlaying = true;
  } catch (error) {
    console.warn('Failed to start ambient sound:', error);
  }
}

export function pauseAmbientSound() {
  if (!isAmbientPlaying || !ambientMasterGain || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    ambientMasterGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
  } catch (error) {
    console.warn('Failed to pause ambient sound:', error);
  }
}

export function resumeAmbientSound() {
  if (!isAmbientPlaying || !ambientMasterGain || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    ambientMasterGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
  } catch (error) {
    console.warn('Failed to resume ambient sound:', error);
  }
}

// --------------------------
// OTHER SOUNDS
// --------------------------
export function playSheepBleat(pitchType: 'baby' | 'standard' | 'deep' | 'derp' = 'standard') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    let baseFreq = 160;
    let duration = 0.8;
    let vibratoSpeed = 8.5;
    let vibratoDepth = 25;
    let nasalCutoff = 1000;

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
        vibratoSpeed = 14.0;
        vibratoDepth = 50;
        nasalCutoff = 1100;
        break;
      case 'standard':
      default:
        baseFreq = 170 + (Math.random() * 20 - 10);
        duration = 0.75 + Math.random() * 0.15;
        break;
    }

    const oscSaw = ctx.createOscillator();
    const oscTri = ctx.createOscillator();
    oscSaw.type = 'sawtooth';
    oscTri.type = 'triangle';

    oscSaw.frequency.setValueAtTime(baseFreq, now);
    oscTri.frequency.setValueAtTime(baseFreq, now);
    oscSaw.detune.setValueAtTime(-8, now);
    oscTri.detune.setValueAtTime(8, now);

    oscSaw.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + duration);
    oscTri.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + duration);

    const lfoGain = ctx.createGain();
    const lfoOsc = ctx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(vibratoSpeed, now);
    lfoGain.gain.setValueAtTime(vibratoDepth, now);

    lfoOsc.connect(lfoGain);
    lfoGain.connect(oscSaw.frequency);
    lfoGain.connect(oscTri.frequency);

    const formantFilter1 = ctx.createBiquadFilter();
    formantFilter1.type = 'bandpass';
    formantFilter1.Q.setValueAtTime(4.0, now);
    formantFilter1.frequency.setValueAtTime(nasalCutoff, now);
    formantFilter1.frequency.exponentialRampToValueAtTime(nasalCutoff * 0.75, now + duration);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.6, now + 0.08);
    
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const time = now + 0.08 + (duration - 0.15) * (i / steps);
      const gainVal = 0.45 + (i % 2 === 0 ? 0.15 : -0.15);
      oscGain.gain.linearRampToValueAtTime(gainVal, time);
    }

    oscGain.gain.setValueAtTime(0.45, now + duration - 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscSaw.connect(oscGain);
    oscTri.connect(oscGain);
    oscGain.connect(formantFilter1);
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    formantFilter1.connect(masterGain);
    masterGain.connect(ctx.destination);

    lfoOsc.start(now);
    oscSaw.start(now);
    oscTri.start(now);

    lfoOsc.stop(now + duration);
    oscSaw.stop(now + duration);
    oscTri.stop(now + duration);
  } catch (error) {
    console.warn('Sheep bleat failed:', error);
  }
}

export function playStarSparkle() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
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
