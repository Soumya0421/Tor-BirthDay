/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import BalloonFloating from './components/BalloonFloating';
import FlowerPetals from './components/FlowerPetals';
import PixelCompanion from './components/PixelCompanion';
import CountdownWish from './components/CountdownWish';
import SheepPrank from './components/SheepPrank';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Music, Volume2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [sheepPrankActive, setSheepPrankActive] = useState(false);
  const [letterUnlocked, setLetterUnlocked] = useState(false);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  // Detect landscape orientation on mobile devices — app is portrait-only on mobile
  useEffect(() => {
    const checkOrientation = () => {
      const isMobileWidth = window.innerWidth < 1024 || window.innerHeight < 1024;
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsLandscapeMobile(isMobileWidth && isLandscape);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 150);
    });

    const mql = window.matchMedia('(orientation: landscape)');
    const handleMql = () => checkOrientation();
    mql.addEventListener('change', handleMql);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      mql.removeEventListener('change', handleMql);
    };
  }, []);

  useEffect(() => {
    // 1. Prevent right-click context menu globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent keyboard copy triggers (Ctrl+C, Cmd+C)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Landscape-mode gate: block the app on mobile landscape, it only works in portrait
  if (isLandscapeMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0b0804] flex flex-col items-center justify-center text-center px-8 select-none">
        {/* Magical dark background with subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] pointer-events-none" />

        {/* Animated rotate phone icon — shows phone rotating from landscape back to portrait */}
        <div className="relative z-10 mb-8">
          <svg
            className="w-24 h-24 text-amber-400 animate-[rotateToPortrait_2s_ease-in-out_infinite]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Phone body in landscape */}
            <rect x="10" y="30" width="70" height="40" rx="6" stroke="currentColor" strokeWidth="3" fill="none" />
            {/* Screen */}
            <rect x="18" y="34" width="52" height="32" rx="2" fill="currentColor" opacity="0.12" />
            {/* Home button */}
            <circle cx="75" cy="50" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Rotation arrow */}
            <path
              d="M50,25 A30,30 0 0,1 80,50"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 3"
            />
            <polygon points="48,23 54,23 51,17" fill="currentColor" />
          </svg>
        </div>

        {/* Text instructions */}
        <h1 className="font-magic text-2xl text-amber-300 font-bold tracking-wider mb-3 relative z-10 gold-glow">
          Rotate Your Phone
        </h1>
        <p className="font-magic text-sm text-amber-200/70 tracking-wide max-w-xs leading-relaxed relative z-10">
          This birthday experience is designed for portrait mode. Please hold your phone upright!
        </p>

        {/* Decorative corner ornaments */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-500/20 rounded-tl-md" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-500/20 rounded-tr-md" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-500/20 rounded-bl-md" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-500/20 rounded-br-md" />

        {/* Subtle pulsing sparkle dots */}
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-amber-300/30 animate-ping" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-amber-400/25 animate-ping" style={{ animationDelay: '1.4s' }} />
      </div>
    );
  }

  return (
    <main 
      className="relative min-h-screen w-full bg-[#140d08] overflow-x-hidden text-white font-sans flex flex-col justify-between" 
      id="birthday-app-root"
    >
      {/* A. Starry Cosmic Atmosphere & Connections Canvas Layer */}
      <CosmicBackground />

      {/* Helium Balloons Floating festive Layer */}
      <BalloonFloating />

      {/* B. Graceful Falling Floral Petals Overlay Layer */}
      <FlowerPetals />

      {/* Retro Pixel Companion (Flying Kitten Companion with speech bubble) */}
      <PixelCompanion letterUnlocked={letterUnlocked} />

      {/* C. Primary Wishing & Celebration Interactive Console */}
      <div className="relative z-20 flex-grow w-full max-w-7xl mx-auto flex items-center justify-center">
        <CountdownWish 
          onTriggerPrank={() => setSheepPrankActive(true)} 
          onLetterUnlock={() => setLetterUnlocked(true)}
        />
      </div>



      {/* E. Full-Screen "Sheep-Rolled" Interactive Prank Overlay */}
      <AnimatePresence>
        {sheepPrankActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            id="active-prank-enclosure"
          >
            <SheepPrank 
              isActive={sheepPrankActive} 
              onClose={() => setSheepPrankActive(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

