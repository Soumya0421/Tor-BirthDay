import { useEffect, useRef, useState } from 'react';
import { playSheepBleat } from '../utils/audio';
import { VolumeX } from 'lucide-react';

const PHRASES = [
  "U like archi... BAAAA",
  "Will Priyotos really like u? ... BAAAA",
  "U look like a sheep, really?",
  "Your face look 'chapta' according to someone, is it?",
  "Are u stalker? BAAAA",
  "Did u refer your as girl or, woman? BEHHHH",
  "How mahy days of gym did u go? HAHHH",
  "Will u ever get any fineshita?",
];

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
  phrase: string;
  opacity: number;
  settled: boolean;
}

interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface SpeechBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface SheepPrankProps {
  isActive: boolean;
  onClose: () => void;
}

export default function SheepPrank({ isActive, onClose }: SheepPrankProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sheepCount, setSheepCount] = useState(0);
  const [phase, setPhase] = useState<'spawning' | 'sand'>('spawning');

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let baseSheepSize = Math.min(width, height) * 0.04; // 4% of smaller screen dimension

    let sheepList: Sheep[] = [];
    let localBubbles: SpeechBubble[] = [];
    let sandParticles: SandParticle[] = [];
    let animationId: number;
    let phraseIndex = 0;
    let sheepSpawnTimer = 0;
    let spawnInterval = 600; // Start faster
    let totalSheepCreated = 0;

    const gravity = 0.28;
    const bounceDecay = 0.6; // Much stronger to settle fast
    const friction = 0.9; // Stronger friction

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

    // Sand colors - warm, cozy tones
    const sandColors = [
      '#F5DEB3', '#DEB887', '#D2B48C', '#C4A35A', '#B8860B', '#CD853F'
    ];

    const createSheepObj = (x: number, y: number, initialBurst = false): Sheep => {
      const radius = baseSheepSize * (0.8 + Math.random() * 0.6); // 80% to 140% of base size
      const pitch = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
      const phrase = PHRASES[phraseIndex % PHRASES.length];
      phraseIndex++;
      
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
        phrase,
        opacity: 1,
        settled: false
      };
    };

    const addBubble = (x: number, y: number, text: string) => {
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];
      const bubbleColor = colors[Math.floor(Math.random() * colors.length)];

      localBubbles.push({
        id: Math.random() + Date.now(),
        x,
        y: y - 30,
        text,
        color: bubbleColor,
        life: 360, // 6 seconds at 60fps
        maxLife: 360
      });
    };

    // Initial sheep
    for (let i = 0; i < 5; i++) {
      const spawnX = width * 0.3 + Math.random() * width * 0.4;
      const spawnY = height * 0.5 + Math.random() * height * 0.2;
      sheepList.push(createSheepObj(spawnX, spawnY, true));
      totalSheepCreated++;
    }

    setSheepCount(totalSheepCreated);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      baseSheepSize = Math.min(width, height) * 0.04; // Update base size on resize
    };
    window.addEventListener('resize', handleResize);

    const triggerSandEffect = () => {
      // Create sand particles from every sheep
      sheepList.forEach(sheep => {
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 3;
          sandParticles.push({
            x: sheep.x,
            y: sheep.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            size: Math.random() * 5 + 1,
            color: sandColors[Math.floor(Math.random() * sandColors.length)],
            life: 1
          });
        }
      });
      setPhase('sand');
    };

    // Render loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      if (phase === 'spawning') {
        // Spawn new sheep
        sheepSpawnTimer++;
        if (sheepSpawnTimer >= spawnInterval / 16 && totalSheepCreated < 10) { // 60fps approx, max 10 sheep
          const spawnX = width * 0.3 + Math.random() * width * 0.4;
          const spawnY = -50;
          sheepList.push(createSheepObj(spawnX, spawnY, false));
          totalSheepCreated++;
          setSheepCount(totalSheepCreated);
          sheepSpawnTimer = 0;
          
          // Speed up spawning much faster
          spawnInterval = Math.max(100, spawnInterval - 40);
          
          // Play sheep sound occasionally
          if (Math.random() > 0.5) {
            playSheepBleat(pitchTypes[Math.floor(Math.random() * pitchTypes.length)]);
          }

          // Check if we have 10 sheep
          if (totalSheepCreated >= 10) {
            triggerSandEffect();
          }
        }
      }

      // Draw Speech Bubbles with blur
      if (phase === 'spawning') {
        localBubbles.forEach((bubble, idx) => {
          bubble.y -= 2.0; // even faster rise
          bubble.life--;
          if (bubble.life <= 0) {
            localBubbles.splice(idx, 1);
            return;
          }

          // Calculate blur based on life (start blurring after 5 seconds / 300 frames)
          const lifeRatio = bubble.life / bubble.maxLife;
          const blurAmount = Math.max(0, 5 * (1 - lifeRatio - 0.166)); // start blurring at ~5s

          // Render cute floating speech text
          ctx.save();
          ctx.globalAlpha = Math.min(1, lifeRatio * 1.2);
          ctx.filter = `blur(${blurAmount}px)`;
          
          ctx.font = 'bold 14px Fredoka, sans-serif';
          const textWidth = ctx.measureText(bubble.text).width;
          
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(bubble.x - textWidth/2 - 8, bubble.y - 16, textWidth + 16, 28);
          ctx.strokeStyle = bubble.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(bubble.x - textWidth/2 - 8, bubble.y - 16, textWidth + 16, 28);

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(bubble.text, bubble.x, bubble.y + 4);
          ctx.restore();
        });
      }

      // Physics and drawing of falling and rolling sheep
      sheepList.forEach((sheep) => {
        if (phase === 'sand') {
          sheep.opacity = Math.max(0, sheep.opacity - 0.035);
        }

        if (!sheep.settled) {
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
            sheep.vx *= friction;
            
            // Speed up the roll on floor collision
            sheep.spinSpeed = sheep.vx * 0.015;

            // Check if settled
            if (Math.abs(sheep.vy) < 0.5 && Math.abs(sheep.vx) < 0.5) {
              sheep.settled = true;
              sheep.vy = 0;
              sheep.vx = 0;
              sheep.spinSpeed = 0;
            }

            // Sound of floor crash if moving rapidly!
            if (Math.abs(sheep.vy) > 3.0 && phase === 'spawning') {
              addBubble(sheep.x, sheep.y, sheep.phrase);
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
            if (Math.abs(sheep.vx) > 1.5 && phase === 'spawning') {
              addBubble(sheep.x, sheep.y, sheep.phrase);
            }
          } else if (sheep.x + sheep.radius > width) {
            sheep.x = width - sheep.radius;
            sheep.vx = -sheep.vx * bounceDecay;
            sheep.spinSpeed = -sheep.spinSpeed * 1.2;
            if (Math.abs(sheep.vx) > 1.5 && phase === 'spawning') {
              addBubble(sheep.x, sheep.y, sheep.phrase);
            }
          }
        }

        // Render Vector Sheep
        if (sheep.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = sheep.opacity;
          ctx.translate(sheep.x, sheep.y);
          ctx.rotate(sheep.angle);

          // A. Draw Sheep Fluffy Feet (tuck slightly if in high vertical flight!)
          const legLength = sheep.radius * 0.56; // proportional
          const legTuck = Math.abs(sheep.vy) > 4 ? 0.3 : 1.0;
          
          ctx.strokeStyle = '#090d16';
          ctx.lineWidth = sheep.radius * 0.2; // proportional
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
          ctx.arc(fr * 0.7 * headDir, -fr * 0.18, fr * 0.28, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          // Pupil shifts in movement direction
          ctx.arc(fr * 0.73 * headDir, -fr * 0.18, fr * 0.12, 0, Math.PI * 2);
          ctx.fill();

          // Little blush cheek for cute impact
          ctx.fillStyle = '#f43f5e';
          ctx.globalAlpha = 0.55 * sheep.opacity;
          ctx.beginPath();
          ctx.arc(fr * 0.6 * headDir, 0, fr * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = sheep.opacity;

          // Tail
          ctx.fillStyle = sheep.color;
          ctx.beginPath();
          ctx.arc(-fr * 0.95 * headDir, -fr * 0.2, fr * 0.25, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Update and draw sand particles
      if (phase === 'sand') {
        sandParticles.forEach((particle, idx) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.15; // gravity
          particle.life -= 0.009;
          particle.vx *= 0.995; // friction

          if (particle.life <= 0) {
            sandParticles.splice(idx, 1);
            return;
          }

          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Remove faded sheep
        sheepList = sheepList.filter(s => s.opacity > 0);

        // Close when done
        if (sandParticles.length === 0 && sheepList.length === 0) {
          setTimeout(onClose, 500);
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isActive, onClose, phase]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 bg-indigo-950/20 pointer-events-none" id="sheep-prank-master-view">
      
      {/* Full block canvas */}
      <canvas
        id="sheep-rolling-canvas"
        ref={canvasRef}
        className="block absolute inset-0 w-full h-full"
      />

      {/* Control Center */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-stone-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 max-w-sm w-[90%] text-center backdrop-blur-md pointer-events-auto shadow-2xl z-50">
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-magic text-base sm:text-lg text-amber-300 font-bold tracking-wide">
            {phase === 'spawning' ? 'BAAAA BAAAA!' : '✨ Poof! ✨'}
          </span>
        </div>

        <p className="font-sans text-[11px] sm:text-xs text-stone-200 leading-normal mb-3">
          {phase === 'spawning' ? `${sheepCount}/10 sheep!` : 'Sheep are turning to sand!'}
        </p>

        {phase === 'spawning' && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 p-2 px-4 bg-orange-500/20 border border-orange-400/30 rounded-xl text-orange-200 text-[11px] font-bold uppercase hover:bg-orange-500/30 active:scale-95 transition cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" /> Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
