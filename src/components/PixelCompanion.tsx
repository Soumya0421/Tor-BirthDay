/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { pauseAmbientSound, resumeAmbientSound } from '../utils/audio';

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

const _ = '';
const W = '#ffffff';
const K = '#18181b';

// Original Calico Kitty - big version!
const KITTY_PIXELS_UP: string[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, K, K, _, _, _, _, _, _, K, K, _, _, _],
  [_, _, K, W, W, K, _, _, _, _, K, W, W, K, _, _],
  [_, _, K, W, W, W, K, K, K, K, W, W, W, K, _, _],
  [_, K, W, W, '#d97706', '#d97706', W, W, W, W, '#d97706', W, W, W, K, _],
  [_, K, W, '#4ade80', K, W, W, '#fed7ca', '#fed7ca', W, W, K, '#4ade80', W, K, _],
  [_, K, W, W, W, W, '#fed7ca', '#f472b6', '#fed7ca', '#f472b6', '#fed7ca', W, W, W, K, _],
  [_, _, K, W, '#f472b6', W, W, '#fed7ca', '#fed7ca', W, W, '#f472b6', W, K, _, _],
  [_, _, _, K, K, W, W, '#fbbf24', '#fbbf24', W, W, K, K, _, _, _],
  [_, _, K, '#f472b6', _, K, W, W, W, W, W, K, _, '#f472b6', K, _, _],
  [_, _, K, '#f472b6', '#f472b6', K, W, W, W, W, W, K, '#f472b6', '#f472b6', K, _, _],
  [_, _, _, K, '#f472b6', K, W, W, W, W, W, K, '#f472b6', K, _, _],
  [_, _, _, _, K, K, '#d97706', W, W, W, '#d97706', K, K, _, _, _],
  [_, _, _, _, _, K, K, K, K, K, K, K, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];
const KITTY_PIXELS_DOWN: string[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, K, K, _, _, _, _, _, _, K, K, _, _, _],
  [_, _, K, W, W, K, _, _, _, _, K, W, W, K, _, _],
  [_, _, K, W, W, W, K, K, K, K, W, W, W, K, _, _],
  [_, K, W, W, '#d97706', '#d97706', W, W, W, W, '#d97706', W, W, W, K, _],
  [_, K, W, '#4ade80', K, W, W, '#fed7ca', '#fed7ca', W, W, K, '#4ade80', W, K, _],
  [_, K, W, W, W, W, '#fed7ca', '#f472b6', '#fed7ca', '#f472b6', '#fed7ca', W, W, W, K, _],
  [_, _, K, W, '#f472b6', W, W, '#fed7ca', '#fed7ca', W, W, '#f472b6', W, K, _, _],
  [_, _, _, K, K, W, W, '#fbbf24', '#fbbf24', W, W, K, K, _, _, _],
  [_, _, _, _, K, K, W, W, W, W, W, K, K, _, _, _],
  [_, _, _, K, '#f472b6', K, W, W, W, W, W, K, '#f472b6', K, _, _],
  [_, _, K, '#f472b6', '#f472b6', K, W, W, W, W, W, K, '#f472b6', '#f472b6', K, _, _],
  [_, _, K, '#f472b6', _, K, '#d97706', W, W, W, '#d97706', K, _, '#f472b6', K, _, _],
  [_, _, _, K, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

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
  { note: 'B4', freq: 493.88, duration: 1.10, syllable: 'you! 💖', pause: 0.35 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: 'to ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.10, syllable: 'you! 🌟', pause: 0.35 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'G4', freq: 392.00, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'G5', freq: 783.99, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: 'dear ', pause: 0.05 },
  { note: 'B4', freq: 493.88, duration: 0.55, syllable: 'Tor-', pause: 0.05 },
  { note: 'A4', freq: 440.00, duration: 0.85, syllable: 'shi-ta! 👑', pause: 0.35 },
  { note: 'F5', freq: 698.46, duration: 0.28, syllable: 'Hap-', pause: 0.05 },
  { note: 'F5', freq: 698.46, duration: 0.28, syllable: 'py ', pause: 0.05 },
  { note: 'E5', freq: 659.25, duration: 0.55, syllable: 'Birth-', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 0.55, syllable: 'day ', pause: 0.05 },
  { note: 'D5', freq: 587.33, duration: 0.55, syllable: 'to ', pause: 0.05 },
  { note: 'C5', freq: 523.25, duration: 1.50, syllable: 'YOU! 🎉', pause: 0.80 }
];

interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export default function PixelCompanion({ 
  letterUnlocked, 
  onComplete 
}: { 
  letterUnlocked: boolean, 
  onComplete?: () => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sandParticlesRef = useRef<SandParticle[]>([]);
  const pixelPositionsRef = useRef<{x: number, y: number, color: string}[]>([]);
  
  const [hasAppeared, setHasAppeared] = useState(false);
  const [isSinging, setIsSinging] = useState(false);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [isExploded, setIsExploded] = useState(false);
  const [textDisintegrated, setTextDisintegrated] = useState(false);
  const [kittyY, setKittyY] = useState<number>(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [isDancing, setIsDancing] = useState(false);
  const [isBowing, setIsBowing] = useState(false);
  const [bowProgress, setBowProgress] = useState(0);
  const [spriteSize, setSpriteSize] = useState(0);
  const [kittyX, setKittyX] = useState(0);
  const [spiritVisible, setSpiritVisible] = useState(true);
  const [bowHoldTime, setBowHoldTime] = useState(0);

  // Initialize position and make it visible!
  useEffect(() => {
    if (letterUnlocked && !hasAppeared) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setKittyX(width / 2);
      setKittyY(height - 150); // Position at bottom
      setSpriteSize(width < 768 ? 7 : 9); // Even bigger!
      setHasAppeared(true);
    }
  }, [letterUnlocked, hasAppeared]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (hasAppeared) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setKittyX(width / 2);
        setKittyY(height - 150);
        setSpriteSize(width < 768 ? 7 : 9);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasAppeared]);

  // Main animation loop: confetti + sprite
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update tick for animation
      setTick(prev => prev + 1);

      // Update sand particles
      sandParticlesRef.current = sandParticlesRef.current.filter((part, idx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.vy += 0.15; // gravity
        part.life -= 0.008;
        part.vx *= 0.998; // slight drag

        ctx.save();
        ctx.globalAlpha = part.life;
        ctx.fillStyle = part.color;
        ctx.shadowBlur = 3;
        ctx.shadowColor = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return part.life > 0;
      });

      // Draw sprite if visible
      if (hasAppeared && spiritVisible) {
        const sprite = frameIndex === 0 ? KITTY_PIXELS_UP : KITTY_PIXELS_DOWN;
        const spriteW = sprite[0].length * spriteSize;
        const spriteH = sprite.length * spriteSize;

        ctx.save();
        ctx.globalAlpha = 1;
        
        // Position kitty at bottom center
        ctx.translate(kittyX, kittyY);
        
        if (isBowing) {
          // Bow down: scale down vertically and rotate forward
          ctx.scale(1 - bowProgress * 0.2, 1 - bowProgress * 0.4);
          ctx.rotate(bowProgress * 0.6);
        } else if (isDancing) {
          ctx.rotate(Math.sin(tick * 0.15) * 0.15);
        }
        
        ctx.translate(-spriteW / 2, -spriteH / 2);

        // Store pixel positions for when we explode
        pixelPositionsRef.current = [];
        
        for (let r = 0; r < sprite.length; r++) {
          for (let c = 0; c < sprite[r].length; c++) {
            const color = sprite[r][c];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(c * spriteSize, r * spriteSize, spriteSize, spriteSize);
              
              pixelPositionsRef.current.push({
                x: kittyX - spriteW/2 + c * spriteSize + spriteSize/2,
                y: kittyY - spriteH/2 + r * spriteSize + spriteSize/2,
                color
              });
            }
          }
        }
        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [hasAppeared, frameIndex, kittyX, kittyY, isDancing, isBowing, bowProgress, tick, spriteSize, spiritVisible]);

  // Update frame index and bow progress
  useEffect(() => {
    if (tick % (isDancing ? 8 : 12) === 0) {
      setFrameIndex(prev => prev === 0 ? 1 : 0);
    }

    if (isBowing && bowProgress < 1) {
      setBowProgress(prev => Math.min(1, prev + 0.02));
    } else if (isBowing && bowProgress >= 1) {
      setBowHoldTime(prev => prev + 1);
      
      // Hold the bow for about 1 second (60 ticks) then explode into sand
      if (bowHoldTime > 60 && !isExploded) {
        setIsExploded(true);
        setSpiritVisible(false);
        if (onComplete) {
          onComplete();
        }
        
        // Sand colors
        const sandColors = ['#F5DEB3', '#DEB887', '#D2B48C', '#C4A35A', '#B8860B', '#CD853F', '#FFDEAD', '#F4A460'];
        
        // Create sand particles from all the stored pixel positions
        pixelPositionsRef.current.forEach((pos) => {
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 1;
            sandParticlesRef.current.push({
              x: pos.x,
              y: pos.y,
              vx: Math.cos(angle) * speed + (Math.random() * 2 - 1),
              vy: Math.sin(angle) * speed - 2,
              size: Math.random() * 4 + 1,
              color: pos.color || sandColors[Math.floor(Math.random() * sandColors.length)],
              life: 1
            });
          }
        });
        
        // Add extra sand particles for effect
        for (let i = 0; i < 100; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 2;
          sandParticlesRef.current.push({
            x: kittyX,
            y: kittyY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            size: Math.random() * 5 + 1,
            color: sandColors[Math.floor(Math.random() * sandColors.length)],
            life: 1
          });
        }
      }
    }
  }, [tick, isDancing, isBowing, bowProgress, isExploded, kittyX, kittyY, bowHoldTime]);

  // Start the show!
  const startTheShow = () => {
    if (isSinging || isExploded) return;
    setIsSinging(true);
    setIsDancing(true);
    
    // Pause ambient sound when singing starts
    pauseAmbientSound();

    let noteIndex = 0;
    const playNote = () => {
      if (noteIndex >= SWEET_HAPPY_BIRTHDAY.length) {
        setIsDancing(false);
        setIsBowing(true);
        // Resume ambient sound after singing is done
        setTimeout(resumeAmbientSound, 1000);
        return;
      }

      const syllable = SWEET_HAPPY_BIRTHDAY[noteIndex];
      setCurrentSyllable(syllable.syllable);

      try {
        const ctx = getSharedAudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(syllable.freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + syllable.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + syllable.duration);
      } catch (e) {}

      noteIndex++;
      setTimeout(playNote, (syllable.duration + syllable.pause) * 1000);
    };

    playNote();
  };

  // Get sprite dimensions for click area
  const getSpriteDims = () => {
    const sprite = frameIndex === 0 ? KITTY_PIXELS_UP : KITTY_PIXELS_DOWN;
    const width = sprite[0].length * spriteSize;
    const height = sprite.length * spriteSize;
    return { width, height };
  };
  const { width: spriteW, height: spriteH } = getSpriteDims();

  return (
    <div className="fixed inset-0 pointer-events-none z-40 font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Speech bubble - beautiful, large, and follows the kitty! */}
      {hasAppeared && !isExploded && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: '50%',
            top: kittyY - spriteH - 200,
            transform: 'translateX(-50%)',
            width: '95%',
            maxWidth: '450px'
          }}
        >
          <div
            className="w-full bg-gradient-to-br from-[#0c0804]/98 to-[#050301]/98 border-2 border-amber-500/40 rounded-[2rem] px-4 sm:px-6 py-4 sm:py-6 shadow-2xl shadow-amber-500/10"
            style={{ boxShadow: '0 0 50px rgba(245, 158, 11, 0.15)' }}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[9px] sm:text-sm font-mono text-amber-300 uppercase tracking-[0.3em] mb-1 font-bold">
                ✨✨ BOOKSTORE KITTY ✨✨
              </p>
              <p className="text-sm sm:text-xl text-white font-semibold leading-relaxed">
                {isSinging ? "Let's sing together! 🎶🎵🎶" : "Tap me to start your birthday show! 🎉🎂"}
              </p>
              {!isSinging && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* Bubble tail */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 scale-75">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[16px] border-t-[#0c0804]" />
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[11px] border-t-amber-500/30 absolute top-0 left-1/2 -translate-x-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* Clickable area over the kitty */}
      {hasAppeared && !isExploded && (
        <button
          type="button"
          onClick={startTheShow}
          className="absolute pointer-events-auto cursor-pointer rounded-full bg-transparent hover:bg-orange-500/10 active:scale-95 transition"
          style={{
            left: kittyX - spriteW / 2 - 30,
            top: kittyY - spriteH / 2 - 30,
            width: spriteW + 60,
            height: spriteH + 60
          }}
        />
      )}

      {/* Sing-along text box - matching the image style! */}
      {isSinging && !isExploded && (
        <div className="fixed inset-x-3 top-[3%] flex flex-col items-center justify-center pointer-events-none z-50">
          <div className="w-full max-w-3xl bg-gradient-to-br from-[#0f0a18]/98 to-[#050308]/98 border-2 border-orange-500/40 rounded-[2.5rem] px-5 sm:px-10 py-6 sm:py-12 backdrop-blur-xl shadow-2xl"
               style={{ boxShadow: '0 0 80px rgba(245, 158, 11, 0.3)' }}
          >
            <p className="text-[8px] sm:text-sm font-mono text-orange-300 uppercase tracking-[0.3em] mb-1 sm:mb-2 text-center">
              🎵 SING-ALONG 🎵
            </p>
            <p className="text-[8px] sm:text-sm font-sans text-amber-200/70 mb-4 sm:mb-6 text-center">
              FOR TORSHITA BANERJEE
            </p>
            <p className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-center leading-tight">
              {currentSyllable}
            </p>
            <div className="mt-4 sm:mt-8 flex items-center justify-center gap-2">
              <div className="w-2 h-2 sm:w-4 sm:h-4 rounded-full bg-amber-600" />
              <p className="font-mono text-[9px] sm:text-xs text-amber-400 uppercase tracking-widest">
                {currentSyllable} 👑
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Final message */}
      {isExploded && (
        <button
          type="button"
          onClick={() => setTextDisintegrated(true)}
          className={`fixed inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer z-50 text-center bg-black/40 backdrop-blur-[2px] outline-none border-none transition-all duration-[1200ms] ease-out ${
            textDisintegrated ? 'opacity-0 scale-75 blur-md pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="p-8 sm:p-12 max-w-2xl">
            <h1 className="font-serif text-5xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-400 via-orange-400 to-yellow-300 mb-2">
              HAPPY BIRTHDAY
            </h1>
            <h1 className="font-serif text-5xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500">
              TORSHITA!
            </h1>
            <p className="text-xl sm:text-3xl text-yellow-100 mt-6 font-medium">
              May your day be as sweet, wonderful, and magical as you are! 🎉🎂✨
            </p>
            <p className="font-mono text-xs text-orange-400 mt-8 tracking-widest uppercase animate-bounce">
              🌾 Tap anywhere to celebrate 🌾
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
