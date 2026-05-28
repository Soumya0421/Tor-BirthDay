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

