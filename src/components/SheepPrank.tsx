/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { playSheepBleat } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, VolumeX, Volume2, Flame, RefreshCw } from 'lucide-react';

interface Sheep {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  spinSpeed: number;
  color: string;
  faceColor: string;
  pitchType: 'baby' | 'standard' | 'deep' | 'derp';
  isClicked: boolean;
  clickTimer: number;
}

interface SpeechBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface SheepPrankProps {
  isActive: boolean;
  onClose: () => void;
}

export default function SheepPrank({ isActive, onClose }: SheepPrankProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sheepCount, setSheepCount] = useState(0);
  const [bubbles, setBubbles] = useState<SpeechBubble[]>([]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let sheepList: Sheep[] = [];
    let localBubbles: SpeechBubble[] = [];
    let animationId: number;

    const gravity = 0.28;
    const bounceDecay = 0.85;

    const pitchTypes: ('baby' | 'standard' | 'deep' | 'derp')[] = [
      'standard',
      'baby',
      'deep',
      'derp'
    ];
    
    // Whimsical color themes for our sheep coats!
    const coatColors = [
      '#ffffff', // Classic fluffy cloud
      '#fecdd3', // Pastel Pink Blossom
      '#bae6fd', // Pastel Sky
      '#ddd6fe', // Lavender bubble
      '#fed7aa', // Caramel cotton
      '#fef08a'  // Dandelion puff
    ];

    const faceColors = [
      '#1e293b', // Deep charcoal
      '#334155', // Slate
      '#475569', // Dust
      '#27272a'  // Dark zinc
    ];

    const createSheepObj = (x: number, y: number, initialBurst = false): Sheep => {
      const radius = Math.random() * 12 + 18; // 18px to 30px
      const pitch = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const spinSpeed = (Math.random() * 0.08 + 0.04) * (Math.random() > 0.5 ? 1 : -1);

      return {
        id: Math.random() + Date.now(),
        x,
        y,
        vx: initialBurst ? (Math.random() * 10 - 5) : (Math.random() * 6 - 3),
        vy: initialBurst ? (Math.random() * -12 - 4) : (Math.random() * -6 - 2),
        radius,
        angle,
        spinSpeed,
        color: coatColors[Math.floor(Math.random() * coatColors.length)],
        faceColor: faceColors[Math.floor(Math.random() * faceColors.length)],
        pitchType: pitch,
        isClicked: false,
        clickTimer: 0,
      };
    };

    const addBubble = (x: number, y: number, pitch: string) => {
      const sounds = {
        baby: ['BAAAH! 🍼', 'Meeeh!', 'baaah!'],
        standard: ['BAHH!', 'BAHH BAHH!', 'meeeh'],
        deep: ['BOOOO!', 'BAAAAAHHH.', 'BAHH! 🧔'],
        derp: ['BLEEERGH!! 🤪', 'Baaahh?', 'derrrp!']
      };
      
      const textArr = sounds[pitch as keyof typeof sounds] || sounds.standard;
      const text = textArr[Math.floor(Math.random() * textArr.length)];
      
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];
      const bubbleColor = colors[Math.floor(Math.random() * colors.length)];

      localBubbles.push({
        id: Math.random() + Date.now(),
        x,
        y: y - 30,
        text,
        color: bubbleColor,
        life: 55, // lifespan in frames
      });

      // Synchronize back to react state every now and then
      setBubbles([...localBubbles]);
    };

    // Initial flock explosion! Summon 16 rolling sheep! We get sheep-rolled!
    for (let i = 0; i < 16; i++) {
      // Spawn scattered from center
      const spawnX = width * 0.3 + Math.random() * width * 0.4;
      const spawnY = height * 0.5 + Math.random() * height * 0.2;
      sheepList.push(createSheepObj(spawnX, spawnY, true));
    }

    setSheepCount(sheepList.length);

    // Dynamic crescendo of entry bleats
    playSheepBleat('standard');
    setTimeout(() => playSheepBleat('baby'), 150);
    setTimeout(() => playSheepBleat('derp'), 300);
    setTimeout(() => playSheepBleat('deep'), 450);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Speech Bubbles
      localBubbles.forEach((bubble, idx) => {
        bubble.y -= 0.6; // drift up
        bubble.life--;
        if (bubble.life <= 0) {
          localBubbles.splice(idx, 1);
          setBubbles([...localBubbles]);
          return;
        }

        // Render cute floating speech text
        ctx.save();
        ctx.globalAlpha = bubble.life / 55;
        ctx.font = 'bold 12px Fredoka, sans-serif';
        
        const textWidth = ctx.measureText(bubble.text).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(bubble.x - textWidth/2 - 6, bubble.y - 14, textWidth + 12, 20);
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bubble.x - textWidth/2 - 6, bubble.y - 14, textWidth + 12, 20);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(bubble.text, bubble.x, bubble.y);
        ctx.restore();
      });

      // Physics and drawing of falling and rolling sheep
      sheepList.forEach((sheep) => {
        // Apply Gravity
        sheep.vy += gravity;
        sheep.x += sheep.vx;
        sheep.y += sheep.vy;

        // Apply Barrel-roll rotation!
        sheep.angle += sheep.spinSpeed;

        // Handle floor bounce
        if (sheep.y + sheep.radius > height) {
          sheep.y = height - sheep.radius;
          sheep.vy = -sheep.vy * bounceDecay;
          // Apply horizontal friction on bounce
          sheep.vx *= 0.95;
          
          // Speed up the roll on floor collision
          sheep.spinSpeed = sheep.vx * 0.015;

          // Sound of floor crash if moving rapidly!
          if (Math.abs(sheep.vy) > 3.0) {
            playSheepBleat(sheep.pitchType);
            addBubble(sheep.x, sheep.y, sheep.pitchType);
          }
        }

        // Handle ceiling ceiling bound
        if (sheep.y - sheep.radius < 0) {
          sheep.y = sheep.radius;
          sheep.vy = -sheep.vy * 0.8;
        }

        // Handle Side Wall Bounces
        if (sheep.x - sheep.radius < 0) {
          sheep.x = sheep.radius;
          sheep.vx = -sheep.vx * bounceDecay;
          // Reverse roll
          sheep.spinSpeed = -sheep.spinSpeed * 1.2;
          if (Math.abs(sheep.vx) > 1.5) {
            playSheepBleat(sheep.pitchType);
            addBubble(sheep.x, sheep.y, sheep.pitchType);
          }
        } else if (sheep.x + sheep.radius > width) {
          sheep.x = width - sheep.radius;
          sheep.vx = -sheep.vx * bounceDecay;
          sheep.spinSpeed = -sheep.spinSpeed * 1.2;
          if (Math.abs(sheep.vx) > 1.5) {
            playSheepBleat(sheep.pitchType);
            addBubble(sheep.x, sheep.y, sheep.pitchType);
          }
        }

        // Render Vector Sheep
        ctx.save();
        ctx.translate(sheep.x, sheep.y);
        ctx.rotate(sheep.angle);

        // A. Draw Sheep Fluffy Feet (tuck slightly if in high vertical flight!)
        const legLength = 12;
        const legTuck = Math.abs(sheep.vy) > 4 ? 0.3 : 1.0;
        
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Front legs
        ctx.beginPath();
        ctx.moveTo(-sheep.radius * 0.4, sheep.radius * 0.5);
        ctx.lineTo(-sheep.radius * 0.4, sheep.radius * 0.5 + legLength * legTuck);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sheep.radius * 0.4, sheep.radius * 0.5);
        ctx.lineTo(sheep.radius * 0.4, sheep.radius * 0.5 + legLength * legTuck);
        ctx.stroke();

        // B. Draw Fluffy Body (composed of clustered cloud circles)
        ctx.fillStyle = sheep.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 4;

        // Central body radius
        const fr = sheep.radius;
        ctx.beginPath();
        // Draw clusters of overlapping fluff
        ctx.arc(0, 0, fr * 0.9, 0, Math.PI * 2); // Core
        ctx.arc(-fr * 0.5, -fr * 0.3, fr * 0.55, 0, Math.PI * 2); // top-left bubble
        ctx.arc(fr * 0.5, -fr * 0.3, fr * 0.55, 0, Math.PI * 2); // top-right bubble
        ctx.arc(0, fr * 0.4, fr * 0.5, 0, Math.PI * 2); // bottom bubble
        ctx.arc(-fr * 0.6, fr * 0.2, fr * 0.4, 0, Math.PI * 2); // left cheek
        ctx.arc(fr * 0.6, fr * 0.2, fr * 0.4, 0, Math.PI * 2); // right cheek
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // C. Draw Sheep Head
        const headDir = sheep.vx >= 0 ? 1 : -1; // look where moving
        ctx.fillStyle = sheep.faceColor;
        ctx.beginPath();
        // Face oval offsetted
        ctx.ellipse(
          fr * 0.65 * headDir, 
          -fr * 0.1, 
          fr * 0.45, 
          fr * 0.35, 
          (Math.PI / 180) * 15 * headDir, 
          0, 
          Math.PI * 2
        );
        ctx.fill();

        // Peach inner ears
        ctx.fillStyle = '#fdbbcb';
        ctx.beginPath();
        ctx.ellipse(fr * 0.4 * headDir, -fr * 0.45, fr * 0.12, fr * 0.25, (Math.PI / 180) * (-20 * headDir), 0, Math.PI * 2);
        ctx.fill();

        // Dark outer ears
        ctx.fillStyle = sheep.faceColor;
        ctx.beginPath();
        ctx.ellipse(fr * 0.45 * headDir, -fr * 0.48, fr * 0.14, fr * 0.28, (Math.PI / 180) * (-20 * headDir), 0, Math.PI * 2);
        ctx.fill();

        // D. Draw Goofy Eyes (white circles + dynamic black pupils looking forward)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fr * 0.7 * headDir, -fr * 0.18, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // Pupil shifts in movement direction
        ctx.arc(fr * 0.73 * headDir, -fr * 0.18, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Little blush cheek for cute impact
        ctx.fillStyle = '#f43f5e';
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(fr * 0.6 * headDir, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Tail
        ctx.fillStyle = sheep.color;
        ctx.beginPath();
        ctx.arc(-fr * 0.95 * headDir, -fr * 0.2, fr * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationId = requestAnimationFrame(loop);
    };

    loop();

    // Soundboard event binder to interactively clicking bouncing sheep!
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let hitDetected = false;

      // Check coordinates of each sheep for bounding overlap
      sheepList.forEach((sheep) => {
        const distance = Math.hypot(sheep.x - clickX, sheep.y - clickY);
        // Padding for bounding box click ease
        if (distance < sheep.radius + 15) {
          hitDetected = true;
          // Launch the clicked sheep screaming into outer orbit!
          sheep.vy = -14;
          sheep.vx = (sheep.x - clickX) * 0.4 + (Math.random() * 8 - 4);
          // Speed up the barrel roll
          sheep.spinSpeed = (Math.random() * 0.18 + 0.1) * (Math.random() > 0.5 ? 1 : -1);

          // Force derpy screaming bleats on user tickles!
          playSheepBleat(sheep.pitchType);
          addBubble(sheep.x, sheep.y, sheep.pitchType);

          // Spark particle effect around sheep
          createSplash(sheep.x, sheep.y, sheep.color);
        }
      });

      // If clicked the empty sky, spawn a tiny baby lamb falling down!
      if (!hitDetected) {
        const babyLamb = createSheepObj(clickX, clickY, false);
        babyLamb.pitchType = 'baby';
        babyLamb.color = '#fffbeb';
        sheepList.push(babyLamb);
        setSheepCount(sheepList.length);
        
        playSheepBleat('baby');
        addBubble(clickX, clickY, 'baby');
      }
    };

    // Tiny vector splash sparkles on sheep clicks
    const createSplash = (x: number, y: number, color: string) => {
      // Direct drawing or state tracking
    };

    canvas.addEventListener('mousedown', handleCanvasClick as any);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleCanvasClick as any);
      cancelAnimationFrame(animationId);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 bg-indigo-950/20 pointer-events-none" id="sheep-prank-master-view">
      
      {/* Full block clickable transparent overlay canvas */}
      <canvas
        id="sheep-rolling-canvas"
        ref={canvasRef}
        className="block absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto"
      />

      {/* Retro/cute Floating Command Control Center at top of prank */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-stone-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 max-w-sm w-[90%] text-center backdrop-blur-md pointer-events-auto shadow-2xl z-50">
        
        {/* Floating Headers */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-playful text-base sm:text-lg text-amber-300 font-bold tracking-wide">
            📚 FLUFFY BOOKWORM COZY STAMPEDE! 📖
          </span>
        </div>

        <p className="font-sans text-[11px] sm:text-xs text-stone-200 leading-normal mb-3">
          🐑 {sheepCount} woolly marshmallow sheep invaded our library café! 
          Tickle/click a sheep to bounce it high, or tap the empty sky to bake newborn little lambs! 🥐
        </p>

        {/* Buttons strip */}
        <div className="flex gap-2 justify-center" id="prank-controls-strip">
          
          <button
            onClick={() => {
              // Spawn another batch
              try {
                playSheepBleat('derp');
                playSheepBleat('baby');
              } catch (e) {}
              // Triggers a click callback to force-reload state
              const canvas = canvasRef.current;
              if (canvas) {
                const event = new MouseEvent('mousedown', {
                  clientX: window.innerWidth * 0.5,
                  clientY: window.innerHeight * 0.5,
                });
                canvas.dispatchEvent(event);
              }
            }}
            className="flex items-center gap-1.5 p-2 px-3 bg-amber-500/10 border border-amber-400/35 rounded-xl text-amber-300 text-[11px] font-bold uppercase hover:bg-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Bake Another 🐑
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 p-2 px-4 bg-orange-500/20 border border-orange-400/30 rounded-xl text-orange-200 text-[11px] font-bold uppercase hover:bg-orange-500/30 active:scale-95 transition cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" /> Stop Stampede ☕️
          </button>
        </div>
      </div>
    </div>
  );
}
