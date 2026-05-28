/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, MouseEvent } from 'react';
import { playStarSparkle } from '../utils/audio';

interface AmbientOrb {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  color: string;
  speedX: number;
  speedY: number;
  angle: number;
  pulseSpeed: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  speedX: number;
  speedY: number;
  angle: number;
  pulseSpeed: number;
}

interface ClickSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let orbs: AmbientOrb[] = [];
    let sparkles: SparkleParticle[] = [];
    let clickSparks: ClickSpark[] = [];
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create 3 slow-drifting warm ambient lighting orbs
    const orbColors = [
      'rgba(146, 64, 14, 0.15)', // warm brown/amber
      'rgba(190, 24, 74, 0.08)',  // romantic rose blush
      'rgba(120, 53, 4, 0.12)',   // soft cozy orange glow
    ];

    const initOrbs = () => {
      orbs = [];
      const baseSizes = [
        Math.min(width, height) * 0.45,
        Math.min(width, height) * 0.4,
        Math.min(width, height) * 0.35,
      ];
      for (let i = 0; i < 3; i++) {
        orbs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: baseSizes[i],
          baseRadius: baseSizes[i],
          color: orbColors[i % orbColors.length],
          speedX: (Math.random() * 0.15 - 0.075),
          speedY: (Math.random() * 0.15 - 0.075),
          angle: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.001 + 0.0005,
        });
      }
    };

    const createSparkle = (isInitial = false): SparkleParticle => {
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : height + 10,
        size: Math.random() * 2 + 1,
        baseOpacity: Math.random() * 0.3 + 0.2,
        opacity: Math.random() * 0.4 + 0.2,
        speedX: Math.random() * 0.1 - 0.05,
        speedY: -(Math.random() * 0.12 + 0.04), // ultra slow float up
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.01 + 0.005,
      };
    };

    // Spawn initial sparkles
    for (let i = 0; i < 24; i++) {
      sparkles.push(createSparkle(true));
    }

    initOrbs();

    const triggerClickSparks = (clickX: number, clickY: number) => {
      const colors = ['#fef08a', '#ffedd5', '#fde047', '#fed7aa', '#f87171'];
      for (let i = 0; i < 18; i++) {
        const speedAngle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        clickSparks.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(speedAngle) * speed,
          vy: Math.sin(speedAngle) * speed - 0.5,
          size: Math.random() * 2.5 + 1.2,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initOrbs();
    };
    window.addEventListener('resize', handleResize);

    // Main animation loop
    const render = () => {
      // Clean base background
      ctx.fillStyle = '#140d08';
      ctx.fillRect(0, 0, width, height);

      // Draw drifting ambient glows
      orbs.forEach((orb) => {
        orb.x += orb.speedX;
        orb.y += orb.speedY;
        orb.angle += orb.pulseSpeed;

        // Bounce orbs gently off borders
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const currentRadius = orb.baseRadius + Math.sin(orb.angle) * (orb.baseRadius * 0.15);

        // Draw radial glow
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw tiny gentle sparklets
      sparkles.forEach((s, idx) => {
        s.y += s.speedY;
        s.x += s.speedX + Math.sin(s.angle) * 0.06;
        s.angle += s.pulseSpeed;

        if (s.y < -10) {
          sparkles[idx] = createSparkle(false);
          return;
        }

        const currentOpacity = s.baseOpacity + Math.sin(s.angle) * 0.15;
        ctx.globalAlpha = Math.max(0.1, Math.min(currentOpacity, 0.75));
        ctx.fillStyle = '#fef08a';

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw click interactive bursts
      clickSparks.forEach((t, idx) => {
        t.x += t.vx;
        t.y += t.vy;
        t.vy += 0.04; // micro gravity
        t.alpha -= 0.02;

        if (t.alpha <= 0) {
          clickSparks.splice(idx, 1);
          return;
        }

        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleClickSpawns = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerClickSparks(clickX, clickY);
    };

    const handleCustomBurst = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.x !== undefined && detail.y !== undefined) {
        triggerClickSparks(detail.x, detail.y);
      }
    };

    canvas.addEventListener('click', handleClickSpawns as any);
    canvas.addEventListener('sparkle-burst', handleCustomBurst);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas?.removeEventListener('click', handleClickSpawns as any);
      canvas?.removeEventListener('sparkle-burst', handleCustomBurst);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClickAudio = () => {
    playStarSparkle();
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" id="cosmic-canvas-wrapper">
      <canvas
        id="star-cosmic-canvas"
        ref={canvasRef}
        onClick={handleClickAudio}
        className="block w-full h-full cursor-pointer select-none"
      />
    </div>
  );
}
