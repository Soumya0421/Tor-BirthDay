/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  char?: string;
  angle?: number;
  rotSpeed?: number;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'teardrop' | 'heart' | 'round';
  speedY: number;
  swayOffset: number;
  swaySpeed: number;
  swayAmplitude: number;
  aspect: number; // For egg/teardrop shape stretch
  isPopping: boolean;
  popProgress: number;
}

export default function BalloonFloating() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synthesize a classic, crisp latex balloon POP using the Web Audio API noise generator
  const playPopSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Create a noise buffer for the burst click sound
      const bufferSize = ctx.sampleRate * 0.12; // 120ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Fill with random noise of decreasing amplitude (decay)
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.pow(1 - i / bufferSize, 3);
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Add a low-frequency thump for real acoustic weight
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      // Add filter to noise to make it less harsh and more organic
      const passFilter = ctx.createBiquadFilter();
      passFilter.type = 'bandpass';
      passFilter.frequency.setValueAtTime(800, now);
      passFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Routing
      noiseNode.connect(passFilter);
      passFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      // Fire sounds
      noiseNode.start(now);
      noiseNode.stop(now + 0.12);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Ignored if browser rules blocks startup sound context
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let balloons: Balloon[] = [];
    let particles: PopParticle[] = [];
    let animationFrameId: number;

    // Elegant warm café, patisserie, and cozy book toned balloon colors
    const balloonColors = [
      'rgba(194, 120, 3, 0.78)',    // Warm caramel gold
      'rgba(239, 104, 134, 0.78)',  // Soft strawberry jam pink
      'rgba(223, 155, 117, 0.78)',  // Fresh croissant honey toast
      'rgba(74, 117, 89, 0.78)',    // Cozy Matcha latte green
      'rgba(142, 110, 80, 0.78)',   // Roasted coffee brown
      'rgba(167, 139, 250, 0.78)',  // Lavender tea blossom
      'rgba(245, 158, 11, 0.78)',   // Golden blossom honey
    ];

    const generateBalloon = (isInitial = false): Balloon => {
      const isMobile = window.innerWidth < 768;
      // Beautiful size that stands out on mobile and desktop
      const size = isMobile 
        ? Math.random() * 8 + 23  // 23 to 31px radius
        : Math.random() * 12 + 31; // 31 to 43px radius

      const shapeRand = Math.random();
      const shape = shapeRand < 0.60 
        ? 'teardrop' 
        : shapeRand < 0.85 ? 'heart' : 'round';

      return {
        id: Math.random(),
        x: Math.random() * width,
        y: isInitial ? Math.random() * height * 0.9 + height * 0.15 : height + size + 70,
        size,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        shape,
        // Upward floating pace (slower on mobile for top-tier animation performance)
        speedY: isMobile 
          ? Math.random() * 0.55 + 0.45 
          : Math.random() * 0.95 + 0.55,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: isMobile 
          ? Math.random() * 0.008 + 0.004
          : Math.random() * 0.012 + 0.006,
        swayAmplitude: isMobile 
          ? Math.random() * 8 + 8 
          : Math.random() * 18 + 12,
        aspect: shape === 'heart' ? 1.0 : 1.15 + Math.random() * 0.1, // Aspect stretch for egg/teardrops
        isPopping: false,
        popProgress: 0,
      };
    };

    // Instantiate beautiful floating balloon army
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 7 : 14;

    for (let i = 0; i < count; i++) {
      balloons.push(generateBalloon(true));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particle shower burst spelling out words!
    const spawnPopConfetti = (sourceX: number, sourceY: number, color: string) => {
      // Alternate between spelling Torshita and HBD
      const word = Math.random() > 0.5 ? "TORSHITA" : "HBD";
      const letters = word.split("");

      // 1. First, create custom letters moving upwards in an expand arch
      letters.forEach((char, i) => {
        const letterAngle = -Math.PI / 2 + (i - (letters.length - 1) / 2) * 0.22 + (Math.random() * 0.1 - 0.05);
        const velocity = Math.random() * 2.5 + 4.0; // push up
        particles.push({
          x: sourceX,
          y: sourceY,
          vx: Math.cos(letterAngle) * velocity,
          vy: Math.sin(letterAngle) * velocity - 1.5,
          size: Math.random() * 3 + 12, // larger text sizes
          color: color,
          alpha: 1.0,
          char: char,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.04 + 0.015) * (Math.random() > 0.5 ? 1 : -1)
        });
      });

      // 2. Add extra tiny round shiny bubble confetti to accompany the letters
      const pCount = 18;
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 4.5 + 2.0;
        particles.push({
          x: sourceX,
          y: sourceY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 1.0,
          size: Math.random() * 4 + 2,
          color: color,
          alpha: 1.0,
          char: undefined,
          angle: 0,
          rotSpeed: 0
        });
      }
    };

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update active floating balloons
      balloons.forEach((b, idx) => {
        if (b.isPopping) {
          b.popProgress += 0.2;
          if (b.popProgress >= 1.0) {
            // Respawn balloon back at the bottom
            balloons[idx] = generateBalloon(false);
          }
          return;
        }

        // Apply upwards movement & horizontal wave-sway motion (simulating helium floating)
        b.y -= b.speedY;
        b.swayOffset += b.swaySpeed;
        const currentX = b.x + Math.sin(b.swayOffset) * b.swayAmplitude;

        // Reset positions once it floats completely out of boundaries
        if (b.y < -b.size * 3) {
          balloons[idx] = generateBalloon(false);
          return;
        }

        ctx.save();
        ctx.translate(currentX, b.y);

        const r = b.size;
        const h = b.size * b.aspect;

        // A. Draw the wiggly cotton string tail hanging from the bottom of the balloon
        ctx.beginPath();
        if (b.shape === 'heart') {
          ctx.moveTo(0, h * 0.95);
        } else {
          ctx.moveTo(0, h);
        }
        
        // Draw squiggly curve
        const stringVal = r * 1.8;
        const waveOffset = Math.sin(b.swayOffset * 2) * 6;
        ctx.bezierCurveTo(
          waveOffset, h + stringVal * 0.3,
          -waveOffset, h + stringVal * 0.6,
          0, h + stringVal
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // B. Draw balloon shape (bezier based for genuine bulbous premium visual appeal)
        ctx.beginPath();
        if (b.shape === 'heart') {
          // Heart Balloon Curve
          ctx.moveTo(0, h * 0.85);
          ctx.bezierCurveTo(-r * 1.6, h * 0.3, -r * 1.7, -h * 0.8, -r * 0.7, -h);
          ctx.bezierCurveTo(-r * 0.2, -h * 1.15, 0, -h * 0.7, 0, -h * 0.35); // top notch
          ctx.bezierCurveTo(0, -h * 0.7, r * 0.2, -h * 1.15, r * 0.7, -h);
          ctx.bezierCurveTo(r * 1.7, -h * 0.8, r * 1.6, h * 0.3, 0, h * 0.85);
        } else if (b.shape === 'teardrop') {
          // Teardrop Balloon Curve
          ctx.moveTo(0, h);
          ctx.bezierCurveTo(-r * 1.35, h * 0.45, -r * 1.35, -h * 0.9, 0, -h);
          ctx.bezierCurveTo(r * 1.35, -h * 0.9, r * 1.35, h * 0.45, 0, h);
        } else {
          // Round Celebration Balloon
          ctx.ellipse(0, 0, r * 1.04, r * 1.1, 0, 0, Math.PI * 2);
        }
        ctx.closePath();

        // Use rich radial gradient for realistic glossy volume
        const radialGrdX = -r * 0.25;
        const radialGrdY = -h * 0.35;
        const radGrd = ctx.createRadialGradient(
          radialGrdX,
          radialGrdY,
          r * 0.08,
          radialGrdX * 0.5,
          radialGrdY * 0.5,
          h * 1.3
        );
        
        // Dynamic glossy color mapping
        const baseClr = b.color;
        radGrd.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        radGrd.addColorStop(0.18, baseClr.replace('0.78', '0.88'));
        radGrd.addColorStop(0.8, baseClr);
        radGrd.addColorStop(1, baseClr.replace('0.78', '0.98'));

        ctx.fillStyle = radGrd;
        ctx.shadowBlur = 12;
        ctx.shadowColor = baseClr.replace('0.78', '0.35');
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // C. Draw tiny triangular tie node at the bottom
        ctx.beginPath();
        const nodeYOffset = b.shape === 'heart' ? h * 0.83 : h - 1;
        ctx.moveTo(0, nodeYOffset);
        ctx.lineTo(-r * 0.16, nodeYOffset + 5);
        ctx.lineTo(r * 0.16, nodeYOffset + 5);
        ctx.closePath();
        ctx.fillStyle = baseClr;
        ctx.fill();

        // D. Dual High-contrast glassy crescent reflection highlights
        // Primary shine (Top-Left)
        ctx.beginPath();
        if (b.shape === 'heart') {
          ctx.ellipse(-r * 0.5, -h * 0.4, r * 0.22, h * 0.12, -Math.PI / 12, 0, Math.PI * 2);
        } else {
          ctx.ellipse(-r * 0.35, -h * 0.45, r * 0.25, h * 0.15, -Math.PI / 10, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.44)';
        ctx.fill();

        // Secondary ambient shine (Bottom-Right)
        ctx.beginPath();
        if (b.shape === 'heart') {
          ctx.ellipse(r * 0.5, h * 0.3, r * 0.16, h * 0.08, Math.PI / 8, 0, Math.PI * 2);
        } else {
          ctx.ellipse(r * 0.4, h * 0.35, r * 0.18, h * 0.1, Math.PI / 6, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fill();

        ctx.restore();
      });

      // 2. Draw and update pop confetti particles (with support for spelling characters)
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity deceleration
        p.vx *= 0.98; // atmospheric friction
        p.alpha -= 0.014; // slow drift fade for improved word readability

        if (p.alpha <= 0) {
          particles.splice(index, 1);
          return;
        }

        if (p.char) {
          if (p.angle !== undefined && p.rotSpeed !== undefined) {
            p.angle += p.rotSpeed;
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.font = `bold ${p.size * 1.5}px "Inter", sans-serif`;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;

          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          
          // Sparkly bloom
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Click/Popping detector on window layer so it doesn't block underlying elements
    const registerClickToPop = (e: any) => {
      // Find coordinates relative to the viewport (supporting both mouse clicks and touch events)
      let clickX = e.clientX;
      let clickY = e.clientY;

      if (e.changedTouches && e.changedTouches[0]) {
        clickX = e.changedTouches[0].clientX;
        clickY = e.changedTouches[0].clientY;
      } else if (e.touches && e.touches[0]) {
        clickX = e.touches[0].clientX;
        clickY = e.touches[0].clientY;
      }

      if (clickX === undefined || clickY === undefined) return;

      // Look for first hit balloon (checking distance dynamically accounting for sway offsets)
      let hitBalloonIndex = -1;
      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        if (b.isPopping) continue;

        const currentX = b.x + Math.sin(b.swayOffset) * b.swayAmplitude;
        const dist = Math.hypot(clickX - currentX, clickY - b.y);

        // Account for balloon shape size margin with a generous friendly ease factor for touch devices!
        const hitZone = b.size * b.aspect * 1.5;
        if (dist < hitZone) {
          hitBalloonIndex = i;
          break;
        }
      }

      if (hitBalloonIndex !== -1) {
        const b = balloons[hitBalloonIndex];
        b.isPopping = true;
        b.popProgress = 0;

        const finalX = b.x + Math.sin(b.swayOffset) * b.swayAmplitude;

        // Play festive audio POP & trigger sparkly particle burst!
        playPopSound();
        spawnPopConfetti(finalX, b.y, b.color);
      }
    };
    window.addEventListener('click', registerClickToPop);
    window.addEventListener('touchend', registerClickToPop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', registerClickToPop);
      window.removeEventListener('touchend', registerClickToPop);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-15 pointer-events-none" id="balloon-floating-wrapper">
      <canvas
        id="balloon-floating-canvas"
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        style={{ opacity: 0.92 }}
      />
    </div>
  );
}

