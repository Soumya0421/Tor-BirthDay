/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { playFlowerPop } from '../utils/audio';

interface CozyPatisserieElement {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  sway: number;
  swaySpeed: number;
  color: string;
  type: 'book_page' | 'cookie' | 'tea_leaf' | 'croissant' | 'cupcake';
}

export default function FlowerPetals() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let items: CozyPatisserieElement[] = [];
    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palettes
    const pages = ['#ffedd5', '#fef3c7', '#fafaf9', '#fdf6e2'];
    const cookies = ['#b45309', '#d97706', '#f59e0b', '#78350f'];
    const leaves = ['#16a34a', '#10b981', '#15803d', '#1e3a1e', '#854d0e'];
    const croissants = ['#f59e0b', '#d97706', '#b45309'];
    const cupcakes = ['#f472b6', '#ec4899', '#c084fc', '#38bdf8', '#34d399'];

    const createItem = (isInitial = false): CozyPatisserieElement => {
      const typeRand = Math.random();
      const isMobile = window.innerWidth < 768;
      let type: 'book_page' | 'cookie' | 'tea_leaf' | 'croissant' | 'cupcake' = 'book_page';
      let colors = pages;

      if (typeRand < 0.35) {
        type = 'book_page';
        colors = pages;
      } else if (typeRand < 0.58) {
        type = 'cookie';
        colors = cookies;
      } else if (typeRand < 0.76) {
        type = 'tea_leaf';
        colors = leaves;
      } else if (typeRand < 0.90) {
        type = 'croissant';
        colors = croissants;
      } else {
        type = 'cupcake';
        colors = cupcakes;
      }

      const size = type === 'book_page' 
        ? (isMobile ? Math.random() * 4 + 8 : Math.random() * 6 + 11)
        : (isMobile ? Math.random() * 3 + 6 : Math.random() * 5 + 8);

      const baseSpeedY = isMobile 
        ? Math.random() * 0.06 + 0.04
        : Math.random() * 0.12 + 0.06; // Extremely calm, slow, lazy floating drift

      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : -30,
        size,
        opacity: Math.random() * 0.4 + 0.35,
        speedY: baseSpeedY,
        speedX: Math.random() * 0.04 - 0.02,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.0015 + 0.0005) * (Math.random() > 0.5 ? 1 : -1), // Gentle, sleepy rotation
        sway: Math.random() * Math.PI * 2,
        swaySpeed: isMobile ? Math.random() * 0.0015 + 0.001 : Math.random() * 0.002 + 0.001, // Super slow sways
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
      };
    };

    // Populate
    const isMobile = window.innerWidth < 768;
    const itemsCount = isMobile ? 26 : 58;

    for (let i = 0; i < itemsCount; i++) {
      items.push(createItem(true));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const drawBookPage = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Draw a flying curled book page / scroll shape
      c.beginPath();
      c.moveTo(-size, -size * 0.2);
      c.bezierCurveTo(-size * 0.5, -size * 0.9, size * 0.5, -size * 0.1, size, -size * 0.3);
      c.lineTo(size * 0.8, size * 0.8);
      c.bezierCurveTo(size * 0.32, size * 0.64, -size * 0.48, size * 0.96, -size, size * 0.8);
      c.closePath();
      c.fillStyle = color;
      c.fill();
      c.strokeStyle = 'rgba(78, 53, 36, 0.45)';
      c.lineWidth = 1;
      c.stroke();

      // Lines of printed lines inside page
      c.beginPath();
      c.moveTo(-size * 0.5, 0);
      c.lineTo(size * 0.5, -size * 0.2);
      c.moveTo(-size * 0.5, size * 0.35);
      c.lineTo(size * 0.5, size * 0.15);
      c.strokeStyle = 'rgba(78, 53, 36, 0.22)';
      c.lineWidth = 1;
      c.stroke();
    };

    const drawCookie = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Circle body
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      c.strokeStyle = 'rgba(69, 26, 3, 0.2)';
      c.lineWidth = 1.2;
      c.stroke();

      // Chocolate chips
      c.fillStyle = '#451a03';
      c.beginPath();
      c.arc(-size * 0.35, -size * 0.15, size * 0.22, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(size * 0.25, size * 0.3, size * 0.18, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(size * 0.05, -size * 0.4, size * 0.15, 0, Math.PI * 2);
      c.fill();
    };

    const drawTeaLeaf = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Slender leaf curve
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(-size * 0.5, 0, 0, size * 1.05);
      c.quadraticCurveTo(size * 0.5, 0, 0, -size);
      c.closePath();
      c.fillStyle = color;
      c.fill();

      // Leaf middle rib line
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(0, size);
      c.strokeStyle = 'rgba(255,255,255,0.25)';
      c.lineWidth = 1;
      c.stroke();
    };

    const drawCroissant = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Crescent butter croissants layers
      c.beginPath();
      c.ellipse(0, 0, size * 1.5, size * 0.8, Math.PI / 10, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();

      // Flaky segment lines
      c.beginPath();
      c.moveTo(-size * 0.6, -size * 0.3);
      c.quadraticCurveTo(0, -size * 0.1, -size * 0.4, size * 0.5);
      c.moveTo(-size * 0.1, -size * 0.45);
      c.quadraticCurveTo(size * 0.2, -size * 0.1, 0, size * 0.55);
      c.moveTo(size * 0.4, -size * 0.3);
      c.quadraticCurveTo(size * 0.6, 0, size * 0.4, size * 0.4);
      c.strokeStyle = 'rgba(69, 26, 3, 0.45)';
      c.lineWidth = 1.3;
      c.stroke();
    };

    const drawCupcake = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Liner
      c.beginPath();
      c.moveTo(-size * 0.7, 0);
      c.lineTo(size * 0.7, 0);
      c.lineTo(size * 0.48, size * 0.82);
      c.lineTo(-size * 0.48, size * 0.82);
      c.closePath();
      c.fillStyle = '#b45309';
      c.fill();

      // Fluffy icing
      c.beginPath();
      c.arc(-size * 0.28, -size * 0.1, size * 0.55, 0, Math.PI * 2);
      c.arc(size * 0.28, -size * 0.1, size * 0.55, 0, Math.PI * 2);
      c.arc(0, -size * 0.45, size * 0.55, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();

      // Little Red Cherry
      c.beginPath();
      c.arc(0, -size * 0.82, size * 0.2, 0, Math.PI * 2);
      c.fillStyle = '#ef4444';
      c.fill();
    };

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      items.forEach((item, idx) => {
        // Position changes
        item.y += item.speedY;
        item.sway += item.swaySpeed;
        item.x += item.speedX + Math.sin(item.sway) * 0.35;
        item.angle += item.rotationSpeed;

        // Reset off-screens
        if (item.y > height + 30 || item.x < -30 || item.x > width + 30) {
          items[idx] = createItem(false);
          return;
        }

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.angle);

        // 3D curl simulation
        const curlX = Math.sin(item.sway * 1.2) * 0.4 + 0.65;
        const curlY = Math.cos(item.angle * 0.9) * 0.3 + 0.7;
        ctx.scale(curlX, curlY);

        ctx.fillStyle = item.color;
        ctx.globalAlpha = item.opacity;

        if (item.type === 'book_page') {
          drawBookPage(ctx, item.size, item.color);
        } else if (item.type === 'cookie') {
          drawCookie(ctx, item.size, item.color);
        } else if (item.type === 'tea_leaf') {
          drawTeaLeaf(ctx, item.size, item.color);
        } else if (item.type === 'croissant') {
          drawCroissant(ctx, item.size, item.color);
        } else {
          drawCupcake(ctx, item.size, item.color);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Spawn more bakery & book items on click
    const registerClickSprout = (e: any) => {
      let clickX = e.clientX;
      let clickY = e.clientY;

      if (e.changedTouches && e.changedTouches[0]) {
        clickX = e.changedTouches[0].clientX;
        clickY = e.changedTouches[0].clientY;
      }

      if (clickX === undefined || clickY === undefined) return;
      const isMobileSize = window.innerWidth < 768;

      playFlowerPop(); // sweet flower bubble sound

      const spawnCount = isMobileSize ? 5 : 10;
      for (let i = 0; i < spawnCount; i++) {
        const typeRand = Math.random();
        let fType: 'book_page' | 'cookie' | 'tea_leaf' | 'croissant' | 'cupcake' = 'book_page';
        let palette = pages;

        if (typeRand < 0.3) {
          fType = 'book_page';
          palette = pages;
        } else if (typeRand < 0.55) {
          fType = 'cookie';
          palette = cookies;
        } else if (typeRand < 0.75) {
          fType = 'croissant';
          palette = croissants;
        } else if (typeRand < 0.9) {
          fType = 'tea_leaf';
          palette = leaves;
        } else {
          fType = 'cupcake';
          palette = cupcakes;
        }

        const size = fType === 'book_page' 
          ? (isMobileSize ? Math.random() * 5 + 9 : Math.random() * 8 + 14)
          : (isMobileSize ? Math.random() * 4 + 7 : Math.random() * 7 + 10);

        items.push({
          x: clickX + (Math.random() * 30 - 15),
          y: clickY + (Math.random() * 20 - 10),
          size,
          opacity: 0.9,
          speedY: isMobileSize ? Math.random() * 0.2 + 0.3 : Math.random() * 0.3 + 0.5,
          speedX: Math.random() * 0.6 - 0.3,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          sway: Math.random() * Math.PI,
          swaySpeed: Math.random() * 0.01 + 0.005,
          color: palette[Math.floor(Math.random() * palette.length)],
          type: fType,
        });
      }

      const upperLimit = isMobileSize ? 35 : 120;
      if (items.length > upperLimit) {
        items.splice(0, items.length - upperLimit);
      }
    };

    window.addEventListener('click', registerClickSprout);
    window.addEventListener('touchend', registerClickSprout);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', registerClickSprout);
      window.removeEventListener('touchend', registerClickSprout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" id="flower-petals-wrapper">
      <canvas
        id="flower-canvas"
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
}
