/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

// Single shared AudioContext — mobile browsers limit the number of concurrent
// AudioContext instances (typically ~6). Reusing one context ensures the full
// birthday song plays through on mobile without notes silently dropping.
let sharedAudioCtx: AudioContext | null = null;
function getSharedAudioCtx(): AudioContext {
  if (!sharedAudioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) throw new Error('Web Audio not supported');
    sharedAudioCtx = new Ctor();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

// Color Palette for our gorgeous cozy Calico Library Kitty Companion
const w = '#ffffff'; // fluffy white fur
const o = '#f97316'; // ginger orange patched spots
const c = '#fed7aa'; // caramel beige mouth muzzle
const K = '#18181b'; // dark border outline
const b = '#78716c'; // cozy warm stone grey fur
const p = '#f472b6'; // sweet pink ear insides & cheeks
const a = '#fbbf24'; // glowing gold collar bell
const E = '#4ade80'; // brilliant bright green hazel cat eyes
const _ = '';        // empty transparent pixel

// Magic Kitty Frame 0: Wings Spread Up (Flapping high)
const PHOENIX_FRAME_UP: string[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, _, _, _, K, K, _, _, _],
  [_, K, w, p, K, _, _, _, _, _, K, p, w, K, _, _],
  [_, K, w, w, w, K, K, K, K, K, w, w, w, K, _, _],
  [K, w, w, o, o, w, w, w, w, w, o, w, w, w, K, _],
  [K, w, E, K, w, w, c, c, c, w, w, K, E, w, K, _],
  [K, w, w, w, w, c, p, c, p, c, w, w, w, w, K, _],
  [_, K, w, p, w, w, c, c, c, w, w, p, w, K, _, _],
  [_, _, K, K, w, w, a, a, a, w, w, K, K, _, _, _],
  [_, K, p, _, K, w, w, w, w, w, K, _, p, K, _, _],
  [_, K, p, p, K, w, w, w, w, w, K, p, p, K, _, _],
  [_, _, K, p, K, w, w, w, w, w, K, p, K, _, _, _],
  [_, _, _, K, K, o, w, w, w, o, K, K, _, _, _, _],
  [_, _, _, _, K, o, o, w, o, o, K, _, _, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// Magic Kitty Frame 1: Wings Pushed Down (Flapping low)
const PHOENIX_FRAME_DOWN: string[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, _, _, _, K, K, _, _, _],
  [_, K, w, p, K, _, _, _, _, _, K, p, w, K, _, _],
  [_, K, w, w, w, K, K, K, K, K, w, w, w, K, _, _],
  [K, w, w, o, o, w, w, w, w, w, o, w, w, w, K, _],
  [K, w, E, K, w, w, c, c, c, w, w, K, E, w, K, _],
  [K, w, w, w, w, c, p, c, p, c, w, w, w, w, K, _],
  [_, K, w, p, w, w, c, c, c, w, w, p, w, K, _, _],
  [_, _, K, K, w, w, a, a, a, w, w, K, K, _, _, _],
  [_, _, _, K, K, w, w, w, w, w, K, K, _, _, _, _],
  [_, _, K, p, K, w, w, w, w, w, K, p, K, _, _, _],
  [_, K, p, p, K, w, w, w, w, w, K, p, p, K, _, _],
  [_, K, p, _, K, o, w, w, w, o, K, _, p, K, _, _],
  [_, _, K, K, K, o, o, w, o, o, K, K, K, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// Magic Kitty Frame 2: Sleek Cozy Glide
const PHOENIX_FRAME_GLIDE: string[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, _, _, _, K, K, _, _, _],
  [_, K, w, p, K, _, _, _, _, _, K, p, w, K, _, _],
  [_, K, w, w, w, K, K, K, K, K, w, w, w, K, _, _],
  [K, w, o, o, o, w, w, w, w, w, o, o, o, w, K, _],
  [K, w, E, K, w, w, c, c, c, w, w, K, E, w, K, _],
  [K, w, w, w, w, c, p, c, p, c, w, w, w, w, K, _],
  [_, K, w, p, w, w, c, c, c, w, w, p, w, K, _, _],
  [_, _, K, K, w, w, a, a, a, w, w, K, K, _, _, _],
  [_, _, _, K, K, w, w, w, w, w, K, K, _, _, _, _],
  [_, _, _, K, w, w, w, w, w, w, w, K, _, _, _, _],
  [_, _, K, K, w, w, w, w, w, w, w, K, K, _, _, _],
  [_, K, o, o, w, w, w, w, w, w, w, o, o, K, _, _],
  [_, _, K, K, K, o, o, w, o, o, K, K, K, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// Particle template for fiery trails and big birthday explosions
interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  decay: number;
  type?: 'heart' | 'star' | 'ember' | 'diamond';
}

interface AudioSyllable {
  note: string;     // Note name
  freq: number;     // Freq in Hz
  duration: number; // Length of note in seconds
  syllable: string; // The specific vocalized lyric text
  pause: number;    // Pause length after note before next
}

// Full Sing-Along Happy Birthday notes structure
const SWEET_HAPPY_BIRTHDAY: AudioSyllable[] = [
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "Hap-", pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "py ", pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.55, syllable: "Birth-", pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.55, syllable: "day ", pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: "to ", pause: 0.05 },
  { note: 'B4', freq: 493.88, duration: 1.10, syllable: "you! 💖", pause: 0.35 },

  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "Hap-", pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "py ", pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.55, syllable: "Birth-", pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.55, syllable: "day ", pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: "to ", pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.10, syllable: "you! 🌟", pause: 0.35 },

  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "Hap-", pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: "py ", pause: 0.05 },
  { note: 'G5', freq: 783.99, duration: 0.55, syllable: "Birth-", pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: "day ", pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: "dear ", pause: 0.05 },
  { note: 'B4', freq: 493.88, duration: 0.55, syllable: "Tor-", pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.85, syllable: "shi-ta! 👑", pause: 0.35 },

  { note: 'F5', freq: 698.46, duration: 0.28, syllable: "Hap-", pause: 0.05 },
  { note: 'F5', freq: 698.46, duration: 0.28, syllable: "py ", pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: "Birth-", pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: "day ", pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: "to ", pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.50, syllable: "YOU! 🎉", pause: 0.80 }
];

export default function PixelCompanion({ letterUnlocked }: { letterUnlocked: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core magical state management
  const [hasAppeared, setHasAppeared] = useState(false);
  const [isSinging, setIsSinging] = useState(false);
  const [currentSyllableText, setCurrentSyllableText] = useState('');
  const [accumulatedSubtitles, setAccumulatedSubtitles] = useState('');
  const [isExploded, setIsExploded] = useState(false);
  const [textDisintegrated, setTextDisintegrated] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [promptMsg, setPromptMsg] = useState('tap me and i\'ll sing a cozy little birthday song for you! 🐾🧁');

  // Multi-state animation loop coordinate memory
  const posRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    rotation: 0,
    isSpinning: false,
    spinTime: 0,
    frameIndex: 0,
    tick: 0,
    embers: [] as FlameParticle[],
    lastScrollY: 0,
    isGliding: false,
    glideTimer: 0,
    triggerSummonFlash: false,
    particlesExploded: [] as FlameParticle[]
  });

  // Synthesizes a beautiful sweet chirping pixel vocalizer simulation
  const playVocalNote = (s: AudioSyllable) => {
    try {
      const ctx = getSharedAudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const resonanceOsc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      // Main triangle voice wave
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(s.freq, now);

      // Sweet, warm singing vibrato modulator
      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(6.4, now);
      vibratoGain.gain.setValueAtTime(s.freq * 0.018, now);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now);

      // Harmonics generator to warm up tone
      resonanceOsc.type = 'sine';
      resonanceOsc.frequency.setValueAtTime(s.freq * 2, now);
      vibratoGain.connect(resonanceOsc.frequency);
      resonanceOsc.start(now);

      // Cute bandpass filter sweep resembling human vowel formats
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + s.duration * 0.5);

      // Pronunciation Volume Envelope
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.24, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + s.duration);

      osc.connect(filter);
      resonanceOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + s.duration);
      resonanceOsc.stop(now + s.duration);
      vibrato.stop(now + s.duration);
    } catch (err) {
      // Web Audio fallback
    }
  };

  // Triggers spectacular fire-summon particle spray when the phoenix emerges
  const triggerMagicSummonFlash = (sourceX: number, sourceY: number) => {
    const p = posRef.current;
    const summonColors = ['#f97316', '#ef4444', '#facc15', '#ffffff', '#fda4af'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      p.embers.push({
        x: sourceX,
        y: sourceY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        size: Math.random() * 4 + 2.5,
        color: summonColors[Math.floor(Math.random() * summonColors.length)],
        alpha: 1.0,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.015
      });
    }
  };

  // Triggers final incredible pixel burst explosion once the celebration song finishes
  const triggerPhoenixGrandBurst = () => {
    setIsExploded(true);
    setBubbleVisible(false);
    
    // Play structural high pitched firework audio chirps
    try {
      const ctx = getSharedAudioCtx();
      const now = ctx.currentTime;
      [523, 659, 783, 1046].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.30);
      });
    } catch (e) {}

    const p = posRef.current;
    const colors = [
      '#f97316', '#ef4444', '#facc15', '#fef08a', 
      '#c084fc', '#f472b6', '#38bdf8', '#34d399'
    ];
    const particleTypes: ('heart' | 'star' | 'ember' | 'diamond')[] = ['heart', 'star', 'ember', 'diamond'];

    // Spawn 195 sparkling high range multi-directional vector celebration particles
    for (let i = 0; i < 195; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 11 + 3;
      p.particlesExploded.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2.5, // strong outward gravity resistant blast
        size: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.0,
        decay: Math.random() * 0.012 + 0.008,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)]
      });
    }
  };

  // Triggers magical sweet sand dissolution animation with immersive sound & particle generation
  const handleTextClickToDisintegrate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (textDisintegrated) return;
    setTextDisintegrated(true);

    // Play a beautiful, sweet lowpass sweeping sound resembling falling magical golden sand
    try {
      const ctx = getSharedAudioCtx();
      const now = ctx.currentTime;

      // Custom sand sweep sound synthesis
      const bSize = ctx.sampleRate * 1.5;
      const bBuffer = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const bData = bBuffer.getChannelData(0);
      for (let j = 0; j < bSize; j++) {
        bData[j] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = bBuffer;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1200, now);
      lowpass.frequency.exponentialRampToValueAtTime(15, now + 1.3);

      const sandGain = ctx.createGain();
      sandGain.gain.setValueAtTime(0.16, now);
      sandGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noise.connect(lowpass);
      lowpass.connect(sandGain);
      sandGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 1.5);

      // Sweet tiny high pitched pixel note say sweet goodbye
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35);
      
      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (err) {}

    // Generate 450 gorgeous fine glowing sand particles drifting from the center screen zone
    const p = posRef.current;
    const colors = [
      '#f97316', '#ef4444', '#facc15', '#fef08a', 
      '#fda4af', '#c084fc', '#e879f9', '#a78bfa',
      '#38bdf8', '#fb7185', '#ffffff'
    ];
    
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    for (let i = 0; i < 450; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 4.5 + 1.0;
      // Spread across typical overlay bounds (400px x 300px centered)
      const offsetX = Math.random() * 320 - 160;
      const offsetY = Math.random() * 240 - 120;

      p.particlesExploded.push({
        x: screenW / 2 + offsetX,
        y: screenH / 2 + offsetY,
        vx: Math.cos(angle) * velocity + 0.7, // slight subtle rightward wind current
        vy: Math.sin(angle) * velocity + 1.2, // fine sand density falling downward under light gravity
        size: Math.random() * 2.2 + 1.0, // tiny sand grains
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.0,
        decay: Math.random() * 0.008 + 0.004, // slow beautiful drift life
        type: 'ember'
      });
    }
  };

  // Triggers notes play sequences and updates subtitle lyric accumulation dynamically
  const triggerPhoenixSingingSequence = () => {
    if (isSinging || isExploded) return;
    setIsSinging(true);
    setBubbleVisible(true);

    let idx = 0;
    const playNextWord = () => {
      if (idx >= SWEET_HAPPY_BIRTHDAY.length) {
        // Singing successfully complete! Initiate incredible firework burst
        triggerPhoenixGrandBurst();
        return;
      }

      const s = SWEET_HAPPY_BIRTHDAY[idx];
      setCurrentSyllableText(s.syllable);

      // Build accumulated sing-along subtitles based on verse layout
      if (idx === 0 || idx === 6 || idx === 12 || idx === 19) {
        setAccumulatedSubtitles(s.syllable);
      } else {
        setAccumulatedSubtitles(prev => prev + s.syllable);
      }

      playVocalNote(s);

      // Trigger high speed playful aerial gymnastics loops on note beat
      posRef.current.isSpinning = true;
      posRef.current.spinTime = 0;

      idx++;
      setTimeout(playNextWord, (s.duration + s.pause) * 1000);
    };

    playNextWord();
  };

  // Trigger magical appearance once letterUnlocked becomes true
  useEffect(() => {
    if (letterUnlocked && !hasAppeared) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Position nice & flying in magically
      posRef.current.x = width * 0.78;
      posRef.current.y = height + 120;
      posRef.current.targetX = width * 0.78;
      posRef.current.targetY = height * 0.70;

      setHasAppeared(true);
      setBubbleVisible(true);
      triggerMagicSummonFlash(width * 0.78, height * 0.70);
    }
  }, [letterUnlocked, hasAppeared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Track scroll events to detect scroll speed updates for cute gliding tilts
    const handleScrollDetect = () => {
      const scrollTop = window.scrollY;

      // Sync active glide speed variables on quick scrolls
      const p = posRef.current;
      if (Math.abs(scrollTop - p.lastScrollY) > 2) {
        p.isGliding = true;
        p.glideTimer = 15;
      }
      p.lastScrollY = scrollTop;
    };

    window.addEventListener('scroll', handleScrollDetect);
    window.addEventListener('resize', handleResize);

    const updateAndRender = () => {
      ctx.clearRect(0, 0, width, height);
      const p = posRef.current;
      p.tick++;

      // Easing speed updates
      p.x += (p.targetX - p.x) * 0.08;
      p.y += (p.targetY - p.y) * 0.08;

      if (p.isGliding) {
        p.glideTimer--;
        if (p.glideTimer <= 0) p.isGliding = false;
      }

      // A. SPARK SUMMON EMBERS RENDERING
      p.embers.forEach((emb) => {
        emb.x += emb.vx;
        emb.y += emb.vy;
        emb.life -= emb.decay;
        emb.alpha = Math.max(0, emb.life);

        ctx.save();
        ctx.globalAlpha = emb.alpha;
        ctx.fillStyle = emb.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = emb.color;
        ctx.fillRect(emb.x, emb.y, emb.size, emb.size);
        ctx.restore();
      });
      p.embers = p.embers.filter(e => e.life > 0);

      // B. END GAME FIREWORK BURST CELEBRATION EMBERS RENDERING
      p.particlesExploded.forEach((part) => {
        part.x += part.vx;
        part.y += part.vy;
        // Gravity pulled falls gentle
        part.vy += 0.15;
        part.life -= part.decay;
        part.alpha = Math.max(0, part.life);

        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = part.color;

        if (part.type === 'heart') {
          // Draw mini pixelated heart
          const size = part.size;
          ctx.beginPath();
          ctx.rect(part.x - size / 2, part.y, size, size);
          ctx.rect(part.x - size, part.y - size / 2, size, size);
          ctx.rect(part.x, part.y - size / 2, size, size);
          ctx.rect(part.x - size / 2, part.y - size, size, size);
          ctx.fill();
        } else if (part.type === 'star') {
          // Draw sparkling cross star shape
          const s = part.size;
          ctx.beginPath();
          ctx.fillRect(part.x - s, part.y, s * 2 + 1, 2);
          ctx.fillRect(part.x, part.y - s, 2, s * 2 + 1);
        } else if (part.type === 'diamond') {
          // Draw elegant diamond vector
          const s = part.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(part.x, part.y - s);
          ctx.lineTo(part.x + s, part.y);
          ctx.lineTo(part.x, part.y + s);
          ctx.lineTo(part.x - s, part.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Flame Ember blocks
          ctx.fillRect(part.x, part.y, part.size, part.size);
        }
        ctx.restore();
      });
      p.particlesExploded = p.particlesExploded.filter(part => part.life > 0);

      // C. DRAW INTACT BIRD (Render ONLY if magical appearance has completed and grand burst hasn't exploded)
      if (hasAppeared && !isExploded) {
        // Continuous spawn subtle orange embers drifting from feathers
        if (p.tick % 4 === 0) {
          p.embers.push({
            x: p.x + (Math.random() * 12 - 6),
            y: p.y + 10,
            vx: Math.random() * 0.8 - 0.4,
            vy: Math.random() * 1.0 + 0.4,
            size: Math.random() * 2.5 + 1.8,
            color: ['#f97316', '#ef4444', '#facc15'][Math.floor(Math.random() * 3)],
            alpha: 1.0,
            life: 1.0,
            decay: 0.02
          });
        }

        // Flapping frame swapping
        if (p.tick % 10 === 0 && !p.isGliding) {
          p.frameIndex = p.frameIndex === 0 ? 1 : 0;
        }

        const hoverOffset = p.isGliding ? 0 : Math.sin(p.tick * 0.06) * 5;
        const drawY = p.y + hoverOffset;

        // Custom phoenix spin acrobatics
        if (p.isSpinning) {
          p.rotation += 0.26;
          p.spinTime++;
          if (p.spinTime >= 24) {
            p.isSpinning = false;
            p.rotation = 0;
            p.spinTime = 0;
          }
        }

        ctx.save();
        ctx.translate(p.x, drawY);
        ctx.rotate(p.rotation);

        let frame = PHOENIX_FRAME_UP;
        if (p.isGliding) {
          frame = PHOENIX_FRAME_GLIDE;
        } else if (p.frameIndex === 1) {
          frame = PHOENIX_FRAME_DOWN;
        }

        const pixelSize = isMobileHost() ? 2.6 : 3.5;
        const sizeOffset = (16 * pixelSize) / 2;

        for (let r = 0; r < 16; r++) {
          for (let c = 0; c < 16; c++) {
            const color = frame[r][c];
            if (color !== '') {
              ctx.fillStyle = color;
              ctx.fillRect(
                c * pixelSize - sizeOffset,
                r * pixelSize - sizeOffset,
                pixelSize,
                pixelSize
              );
            }
          }
        }
        ctx.restore();

        // Buttery-smooth live-sync for interactive controls layer
        const btn = document.getElementById('pixel-click-trigger');
        const bubble = document.getElementById('pixel-speech-bubble');
        const btnSize = isMobileHost() ? 48 : 68;

        if (btn) {
          btn.style.left = `${p.x - btnSize / 2}px`;
          btn.style.top = `${drawY - btnSize / 2}px`;
        }

        if (bubble) {
          const bubbleHalfWidth = isMobileHost() ? 105 : 140;
          let bubbleX = p.x;
          const padding = 16;

          if (bubbleX < bubbleHalfWidth + padding) {
            bubbleX = bubbleHalfWidth + padding;
          } else if (bubbleX > width - bubbleHalfWidth - padding) {
            bubbleX = width - bubbleHalfWidth - padding;
          }

          bubble.style.left = `${bubbleX}px`;
          const bubbleHeight = bubble.offsetHeight || (isMobileHost() ? 92 : 112);
          const bubbleYOffset = bubbleHeight + (isMobileHost() ? 24 : 32);
          bubble.style.top = `${drawY - bubbleYOffset}px`;

          const arrow = document.getElementById('speech-bubble-arrow');
          const arrowInner = document.getElementById('speech-bubble-arrow-inner');

          if (arrow && arrowInner) {
            const relativeX = p.x - bubbleX;
            const maxArrowOffset = bubbleHalfWidth - 24;
            const clampedOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, relativeX));
            arrow.style.left = `calc(50% + ${clampedOffset}px)`;
            arrowInner.style.left = `calc(50% + ${clampedOffset}px)`;
          }
        }
      }

      animId = requestAnimationFrame(updateAndRender);
    };

    const isMobileHost = () => window.innerWidth < 768;

    updateAndRender();

    return () => {
      window.removeEventListener('scroll', handleScrollDetect);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [hasAppeared, isExploded]);

  const handlePhoenixClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasAppeared || isSinging || isExploded) return;
    triggerPhoenixSingingSequence();
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 font-sans" id="pixel-companion-module">
      {/* Immersive drawing canvas for rendering beautiful pixel phoenix and summond sparkles */}
      <canvas
        ref={canvasRef}
        id="pixel-companion-canvas"
        className="absolute inset-0 w-full h-full"
      />

      {/* Renders only if phoenix has magically appeared at end of page */}
      {hasAppeared && !isExploded && (
        <>
          {/* Fully invisible click target mapped coordinate-perfectly on top of bird */}
          <button
            type="button"
            id="pixel-click-trigger"
            onClick={handlePhoenixClick}
            className="absolute pointer-events-auto cursor-pointer rounded-full bg-transparent hover:bg-orange-500/10 active:scale-95 transition focus:outline-none"
            style={{
              width: `${window.innerWidth < 768 ? 48 : 68}px`,
              height: `${window.innerWidth < 768 ? 48 : 68}px`,
            }}
            title="Tap Phoenix!"
          />

          {/* Immersive Showcase Speech Balloon */}
          <div
            id="pixel-speech-bubble"
            className={`absolute p-4 rounded-2xl border border-orange-500/30 bg-[#0c0c16]/95 shadow-2xl select-none w-[210px] sm:w-[280px] -translate-x-1/2 transition-opacity duration-300 pointer-events-none ${
              bubbleVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div>
              <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold uppercase block mb-1">
                {isSinging ? '🎤 kitty song' : '✦ bookstore kitten ✦'}
              </span>
              <p className="font-mono text-[11px] font-semibold text-stone-200 leading-relaxed">
                {isSinging ? 'meow meowed melodiously!' : promptMsg}
              </p>
            </div>

            {/* Neon arrow pointing downward target perfectly */}
            <div 
              id="speech-bubble-arrow"
              className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[9px] border-t-orange-500/30"
            />
            <div 
              id="speech-bubble-arrow-inner"
              className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[8px] border-t-[#0c0c16]"
            />
          </div>
        </>
      )}

      {/* Immersive synchronized interactive lyrics display container */}
      {isSinging && !isExploded && (
        <div className="fixed inset-x-4 top-[32%] sm:top-[28%] -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-50 text-center">
          <div className="bg-[#0b0c16]/90 border border-orange-500/35 px-6 py-4 sm:px-10 sm:py-6 rounded-[2.5rem] backdrop-blur-xl shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-[bounce_1.4s_infinite] max-w-xl">
            <span className="text-[10px] font-mono tracking-[0.3em] text-orange-400 font-bold uppercase block mb-2 animate-pulse">
              🎵 SIng-along 🎵
            </span>
            <p className="text-[10px] sm:text-xs font-mono text-zinc-400 tracking-wider mb-2 uppercase font-medium">
              For Torshita Banerjee
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 tracking-tight leading-normal select-none drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]">
              {accumulatedSubtitles}
            </h2>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-[11px] font-mono text-orange-400 font-semibold uppercase tracking-widest">{currentSyllableText}</span>
            </div>
          </div>
        </div>
      )}

      {/* FINAL EXPLOSIVE BURST OVERLAY DESIGN (Grand finale once bird bursts into glowing pixie stars) */}
      {isExploded && (
        <button
          type="button"
          onClick={handleTextClickToDisintegrate}
          className={`fixed inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer z-50 text-center bg-black/40 backdrop-blur-[2px] outline-none border-none select-none transition-all duration-[1200ms] ease-out ${
            textDisintegrated ? 'opacity-0 scale-75 blur-md pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="p-8 sm:p-12 max-w-2xl">
            <h1 className="font-serif text-5xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-400 via-orange-400 to-yellow-300 tracking-tight animate-[pulse_2s_infinite] select-none leading-none drop-shadow-[0_0_35px_rgba(244,63,94,0.45)]">
              HAPPY BIRTHDAY
            </h1>
            <h1 className="font-serif text-5xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 tracking-tight select-none leading-none mt-2 drop-shadow-[0_0_35px_rgba(249,115,22,0.45)]">
              TORSHITA!
            </h1>
            <p className="font-playful text-lg sm:text-2xl font-bold text-yellow-100 mt-6 tracking-wide drop-shadow-md">
              ✨ May your sweet story be pleasant, cozy, and baked with happy dreams! ✨
            </p>
            <p className="font-mono text-xs text-orange-400 mt-4 tracking-widest font-semibold uppercase animate-pulse">
              ✦ Your birthday blessings are baked to cozy perfection! ✦
            </p>
            <p className="font-mono text-[10px] text-orange-400/60 mt-8 tracking-widest uppercase animate-bounce">
              🌾 Tap anywhere to dissolve this wish into warm pastry sugar 🌾
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
