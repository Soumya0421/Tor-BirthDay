/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, Heart, Calendar, Clock, Volume2, Smile, Compass, Shield, Sun, Eye, ChevronRight, BookOpen, Coffee, Utensils, Book } from 'lucide-react';

interface CountdownWishProps {
  onTriggerPrank: () => void;
  onLetterUnlock: () => void;
}

export default function CountdownWish({ onTriggerPrank, onLetterUnlock }: CountdownWishProps) {
  // Target birthday: 30th May, 2026 (UTC/Local)
  const targetDate = new Date('2026-05-30T00:00:00');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isBirthday: false,
  });

  const [bypassCountdown, setBypassCountdown] = useState(false);
  const [candlesLit, setCandlesLit] = useState([true, true, true, true, true]);
  const [revealedWishes, setRevealedWishes] = useState<Record<number, boolean>>({});
  const [activeGiftIndex, setActiveGiftIndex] = useState<number | null>(null);
  const [cakeBlownOut, setCakeBlownOut] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  // Sound cues from index/audio context can trigger.
  const playBlowoutChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  };

  const playGiftChime = (index: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isBirthday: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isBirthday: false });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCandleClick = (index: number) => {
    if (cakeBlownOut) return;
    const nextCandles = [...candlesLit];
    nextCandles[index] = false;
    setCandlesLit(nextCandles);

    // If all blown out, spark cake blowout!
    if (nextCandles.every(c => !c)) {
      setCakeBlownOut(true);
      playBlowoutChime();
    } else {
      // Small pop chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(600 - index * 40, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  const handleGiftClick = (index: number) => {
    if (!revealedWishes[index]) {
      setRevealedWishes(prev => ({ ...prev, [index]: true }));
      playGiftChime(index);
    }
    setActiveGiftIndex(index);
  };

  const resetCake = () => {
    setCandlesLit([true, true, true, true, true]);
    setCakeBlownOut(false);
  };

  const activeCelebration = timeLeft.isBirthday || bypassCountdown;

  const giftDetails = [
    {
      title: "📚 Cozy Bookshelf",
      wish: "Go and read as many books as you want! I know how much you absolutely love books, the comfortable smell of pages, and the beautiful worlds within them. May you lose yourself in endless heartwarming stories and always have a cozy corner to read to your heart's content!",
      color: "from-amber-600 via-orange-600 to-amber-800",
      accent: "text-amber-200"
    },
    {
      title: "🥟 Sweets & Spicy Momos",
      wish: "Since you absolutely love food, you must treat yourself to something amazing today! Go eat all the sweet treats you want, and of course, some piping-hot, spicy favorites like momos! Feast happily and without any worries on your special day!",
      color: "from-pink-500 via-rose-500 to-red-600",
      accent: "text-rose-200"
    },
    {
      title: "🎉 Friends & Laughter",
      wish: "I hope you get together with your wonderful friends and have the absolute best time laughing and making memories! May you spend this upcoming year surrounded by continuous joy, fun adventures, and endless happiness!",
      color: "from-emerald-500 via-teal-600 to-indigo-600",
      accent: "text-emerald-100"
    },
  ];

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-16 selection:bg-rose-500 selection:text-white" id="main-birthday-frame">
      
      {/* 1. Cozy Greeting Card Presentation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 max-w-3xl w-full mx-auto px-6 py-12 sm:px-12 sm:py-16 rounded-[2.2rem] relative overflow-hidden bg-gradient-to-br from-[#1b120c]/98 to-[#100905]/98 border-2 border-double border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.75)] backdrop-blur-lg flex flex-col items-center selection:bg-rose-500/40"
        id="birthday-head-banner"
      >
        {/* Handcrafted filigree style corner ornaments */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/20 rounded-tl-md pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/20 rounded-tr-md pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/20 rounded-bl-md pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/20 rounded-br-md pointer-events-none" />

        {/* Outer decorative line inset */}
        <div className="absolute inset-2 border border-amber-500/5 rounded-[1.9rem] pointer-events-none" />

        <p className="font-magic tracking-[0.25em] text-[10px] sm:text-xs uppercase text-amber-200/90 font-semibold mb-3 relative z-10">
          a quiet, sweet happy birthday wish for you
        </p>
        <h2 className="font-magic text-lg sm:text-xl font-bold tracking-widest opacity-80 text-amber-500/95 mb-8 relative z-10">
          May 30, 2026
        </h2>
        
        <h1 className="font-magic-dec text-4xl sm:text-6xl md:text-7xl leading-normal text-center tracking-tight relative z-10 my-4">
          <span className="font-magic block opacity-70 text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 font-normal tracking-wide text-stone-200">Happy Birthday</span>
          <span className="accent-gradient block font-black pb-3 pt-1 gold-glow">Torshita Banerjee</span>
        </h1>
        
        <p className="mt-8 text-center max-w-xl text-stone-200 leading-relaxed font-light text-base sm:text-lg italic relative z-10 px-2 sm:px-6">
          "I hope you spend your birthday so happily today with cakes and sweet treats! Even though you cannot celebrate your birthday like you want today since you are going to do it tomorrow, treat yourself today and smile a lot!"
        </p>
      </motion.div>

      {/* 2. Interactive States Container */}
      <div className="w-full max-w-4xl flex justify-center" id="interactive-wish-grid">
        <AnimatePresence mode="wait">
          {!activeCelebration ? (
            // COUNTDOWN VIEW WITH FROSTED GLASS
            <motion.div
              key="countdown-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-panel shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8 text-center"
              id="countdown-glass-card"
            >
              <div className="flex justify-center items-center gap-2 mb-4 text-amber-300" id="countdown-title">
                <Book className="w-5 h-5 opacity-85" />
                <span className="font-magic text-xs tracking-wider text-orange-200 font-bold uppercase">counting down the days to your special day</span>
              </div>
              
              <h2 className="font-magic text-2xl sm:text-3xl text-white font-bold tracking-widest mb-6">ALMOST HERE...</h2>

              {/* Countdown Numbers Grid */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-8" id="countdown-grid">
                {[
                  { label: 'Days', val: timeLeft.days },
                  { label: 'Hours', val: timeLeft.hours },
                  { label: 'Minutes', val: timeLeft.minutes },
                  { label: 'Seconds', val: timeLeft.seconds },
                ].map((col, idx) => (
                  <div key={col.label} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm shadow-inner transition hover:border-amber-500/20">
                    <span className="text-4xl sm:text-6xl font-magic font-extrabold accent-gradient gold-glow">
                      {String(col.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-magic uppercase tracking-widest text-amber-200/65 mt-1.5 font-bold">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Early Celebrate CTA */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBypassCountdown(true)}
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black rounded-full font-semibold text-sm tracking-wider shadow-lg shadow-white/5 overflow-hidden cursor-pointer hover:bg-zinc-100 transition-colors duration-300"
                id="btn-celebrate-early"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow text-amber-600" />
                <span>come on in! 🥐</span>
                <Gift className="w-4 h-4 text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </motion.div>
          ) : (
            // CELEBRATION DISCOVERY PANELS (CAKE & PRESENTS) WITH GLOSSY DARK Vibe
            <motion.div
              key="celebration-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="w-full flex flex-col gap-8"
              id="birthday-celebration-modules"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                {/* A. Dynamic Interactive Birthday Cake Part - Greeting Card Version */}
                <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-gradient-to-br from-[#1b120c]/98 to-[#100905]/98 border-2 border-double border-pink-500/25 shadow-[0_22px_60px_rgba(0,0,0,0.7)] rounded-[2.2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden" id="cake-glass-chamber">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-rose-500/5 blur-xl pointer-events-none" />
                  
                  {/* Fine corner ornaments */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-pink-500/20 rounded-tl pointer-events-none" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-pink-500/20 rounded-tr pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-pink-500/20 rounded-bl pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-pink-500/20 rounded-br pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="text-xs font-magic tracking-wider text-amber-200 font-bold uppercase">🎂 a small birthday cake for you</span>
                    </div>

                    <h3 className="font-magic text-xl sm:text-2xl text-white font-bold tracking-wide mb-1 relative z-10">MAKE A WISH & BLOW THEM OUT!</h3>
                    <p className="font-sans text-xs text-stone-300 leading-relaxed max-w-sm mb-6 relative z-10 font-light">
                      {!cakeBlownOut 
                        ? "just tap each flame one by one to blow them out. take your time."
                        : "🌟 they are all blown out! may all your cozy little dreams come true."}
                    </p>
                  </div>

                  {/* SVG Animated Interactive Birthday Cake */}
                  <div className="my-6 py-4 flex justify-center items-end h-56 relative" id="interactive-cake-stage">
                    
                    {/* SVG Cake Container */}
                    <svg className="w-48 h-44 overflow-visible" viewBox="0 0 200 200">
                      
                      {/* Cake Stand Platform */}
                      <ellipse cx="100" cy="175" rx="80" ry="12" fill="#312e81" opacity="0.6" />
                      <path d="M50,175 L50,185 L150,185 L150,175 Z" fill="#4338ca" />
                      <ellipse cx="100" cy="185" rx="50" ry="8" fill="#1e1b4b" />
                      <ellipse cx="100" cy="175" rx="80" ry="9" fill="#4f46e5" />

                      {/* Tier 1 (Base Layer - Chocolate Strawberry Swirl) */}
                      <rect x="40" y="110" width="120" height="65" rx="6" fill="#fb7185" />
                      {/* Frosting drips */}
                      <path d="M40,115 Q50,128 60,115 Q70,128 80,115 Q90,128 100,115 Q110,128 120,115 Q130,128 140,115 Q150,128 160,115" fill="none" stroke="#fff1f2" strokeWidth="8" strokeLinecap="round" />
                      {/* Swirl lines */}
                      <line x1="45" y1="140" x2="155" y2="140" stroke="#f43f5e" strokeWidth="3" opacity="0.8" strokeDasharray="6 4" />
                      <line x1="45" y1="155" x2="155" y2="155" stroke="#ffe4e6" strokeWidth="2" opacity="0.6" />

                      {/* Cherry Toppings */}
                      {[55, 75, 95, 115, 135, 150].map((cx, i) => (
                        <circle key={i} cx={cx} cy="108" r="5" fill="#be123c" />
                      ))}

                      {/* Torshita Banerjee Text on Cake */}
                      <text x="100" y="150" fill="#ffffff" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="Fredoka" opacity="0.85">happy beith torsites</text>

                      {/* Five Interactive Candles */}
                      {[48, 74, 100, 126, 152].map((cx, idx) => {
                        const lit = candlesLit[idx];
                        return (
                          <g key={idx} className="cursor-pointer" onClick={() => handleCandleClick(idx)}>
                            {/* Candle Stem */}
                            <rect 
                              x={cx - 3} 
                              y="72" 
                              width="6" 
                              height="35" 
                              rx="2" 
                              fill={idx % 2 === 0 ? '#c084fc' : '#38bdf8'} 
                            />
                            {/* Stripe */}
                            <line x1={cx - 3} y1="80" x2={cx + 3} y2="85" stroke="#fff" strokeWidth="1.5" />
                            <line x1={cx - 3} y1="92" x2={cx + 3} y2="97" stroke="#fff" strokeWidth="1.5" />
                            {/* Wick */}
                            <line x1={cx} y1="72" x2={cx} y2="67" stroke="#374151" strokeWidth="1.5" />
                            
                            {/* Candle Flame */}
                            {lit && (
                              <g className="animate-pulse">
                                {/* Outer Flame Glow */}
                                <circle cx={cx} cy="58" r="8" fill="#facc15" opacity="0.38" className="animate-ping" />
                                {/* Inner Flame shape */}
                                <path 
                                  d={`M${cx},48 Q${cx - 4.5},57 ${cx},65 Q${cx + 4.5},57 ${cx},48`} 
                                  fill="#f97316" 
                                />
                                <path 
                                  d={`M${cx},52 Q${cx - 2.5},58 ${cx},63 Q${cx + 2.5},58 ${cx},52`} 
                                  fill="#fef08a" 
                                />
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {cakeBlownOut && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#140d08]/95 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10"
                      >
                        <Heart className="w-8 h-8 text-rose-300 fill-rose-300 mb-2 animate-bounce" />
                        <h4 className="serif-display text-base text-white font-bold">your wishes are made ✨</h4>
                        <p className="font-sans text-[11px] text-stone-300 mt-1 max-w-[240px]">may your wishes get fulfilled this year and give you the craziest adventure and fun ever! 🌟</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="text-center font-mono text-[9px] text-stone-500 tracking-widest mt-2 uppercase">
                    ✦ TAP CANDLES ONE BY ONE ✦
                  </div>
                </div>

                {/* B. The Three Un-wrappable Gifts Grid - Greeting Card Version */}
                <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-gradient-to-br from-[#1c130d]/98 to-[#110a06]/98 border-2 border-double border-amber-500/25 shadow-[0_22px_60px_rgba(0,0,0,0.7)] rounded-[2.2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden" id="presents-discovery-chamber">
                  {/* Fine corner ornaments */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-amber-500/20 rounded-tl pointer-events-none" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-amber-500/20 rounded-tr pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-amber-500/20 rounded-bl pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-amber-500/20 rounded-br pointer-events-none" />

                  <div className="mb-4 relative z-10">
                    <span className="text-xs font-magic tracking-[0.15em] text-amber-200 font-bold block mb-1 uppercase">🎁 some cozy boxes to unwrap</span>
                    <h3 className="font-magic text-2xl text-white font-bold tracking-wide">YOUR BIRTHDAY WISHES</h3>
                    <p className="font-sans text-xs text-stone-300 leading-relaxed max-w-xl font-light">
                      i set these aside for you. tap each one to unwrap a gentle blessing.
                    </p>
                  </div>

                  {/* Gift row */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 my-2" id="presents-grid-row">
                    {giftDetails.map((details, idx) => {
                      const revealed = revealedWishes[idx];
                      const isActive = activeGiftIndex === idx;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <motion.div
                            whileHover={{ scale: isActive ? 1.05 : 1.02, rotate: !revealed ? [0, -4, 4, -4, 0] : 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleGiftClick(idx)}
                            className={`w-full aspect-square flex items-center justify-center rounded-2xl cursor-pointer shadow-lg relative border transition-all duration-300 overflow-hidden ${
                              revealed 
                                ? isActive
                                  ? 'bg-gradient-to-tr ' + details.color + ' border-amber-400/80 ring-4 ring-amber-400/20 scale-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                                  : 'bg-gradient-to-tr ' + details.color + ' border-transparent scale-90 opacity-60 hover:opacity-90 hover:scale-95'
                                : isActive
                                  ? 'bg-white/[0.06] border-purple-400/60 ring-4 ring-purple-400/10 scale-95'
                                  : 'bg-white/[0.02] border-white/5 hover:border-purple-400/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {!revealed ? (
                                <motion.div 
                                  key="wrapped"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex flex-col items-center gap-1.5 p-3 text-center"
                                >
                                  {idx === 0 ? (
                                    /* Beautiful Hardcover Book Vector with bookmark ribbon */
                                    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                                      <rect x="16" y="12" width="32" height="42" rx="4" fill="#d97706" />
                                      <rect x="20" y="10" width="28" height="44" rx="3" fill="#92400e" stroke="#27170e" strokeWidth="1.5" />
                                      <rect x="24" y="14" width="20" height="36" fill="#fef3c7" />
                                      <path d="M32,38 L32,52 L36,48 L40,52 L40,38 Z" fill="#ef4444" />
                                      <line x1="20" y1="18" x2="24" y2="18" stroke="#f59e0b" strokeWidth="2" />
                                      <line x1="20" y1="26" x2="24" y2="26" stroke="#f59e0b" strokeWidth="2" />
                                      <line x1="20" y1="34" x2="24" y2="34" stroke="#f59e0b" strokeWidth="2" />
                                    </svg>
                                  ) : idx === 1 ? (
                                    /* Beautiful Fluffy Frosting Pastry Cupcake / Cherry */
                                    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                                      <path d="M20,38 L44,38 L38,54 L26,54 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
                                      <path d="M16,36 C16,28 24,24 32,24 C40,24 48,28 48,36 Z" fill="#f472b6" />
                                      <path d="M22,28 C22,20 30,16 32,16 C34,16 42,20 42,28 Z" fill="#fdf08a" />
                                      <circle cx="32" cy="14" r="4.5" fill="#ef4444" />
                                      <path d="M33,10 Q37,4 42,6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  ) : (
                                    /* Steaming beautiful Tea Cup and Saucer */
                                    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                                      <path d="M18,22 C18,36 46,36 46,22 Z" fill="#14b8a6" stroke="#0f766e" strokeWidth="1.5" />
                                      <path d="M44,24 C50,24 50,32 44,32" stroke="#14b8a6" strokeWidth="3" fill="none" />
                                      <ellipse cx="32" cy="40" rx="18" ry="3" fill="#115e59" stroke="#0d9488" strokeWidth="1.5" />
                                      <path d="M26,16 Q28,10 26,6" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" />
                                      <path d="M32,14 Q34,8 32,4" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" />
                                      <path d="M38,16 Q40,10 38,6" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" />
                                    </svg>
                                  )}
                                  <span className="text-[10px] sm:text-xs text-amber-250 mt-1 uppercase font-semibold tracking-wider">Unwrap</span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="unwrapped"
                                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                  transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                                  className="flex flex-col items-center text-center p-3"
                                >
                                  <Sparkles className="w-5 h-5 text-white animate-spin-slow mb-1" />
                                  <span className="serif-display text-xs text-white font-medium block">unwrap</span>
                                  <span className="font-mono text-[9px] text-white/70">revealed ✨</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Blessings Showcase Box */}
                  <div className="mt-4 min-h-[140px] bg-black/45 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-center text-center relative z-10" id="blessing-read-room">
                    {activeGiftIndex === null ? (
                      <div className="flex flex-col items-center justify-center p-2 text-stone-300">
                        <Gift className="w-6 h-6 text-amber-200 mb-2 opacity-80" />
                        <p className="font-sans text-xs">tap any of the brown packages above to read a gentle blessing.</p>
                      </div>
                    ) : (
                      (() => {
                        const activeGift = giftDetails[activeGiftIndex];
                        return (
                          <motion.div
                            key={activeGiftIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                          >
                            <h4 className="serif-display text-lg text-white font-bold tracking-tight mb-2 flex items-center gap-2">
                              {activeGift.title} 🌟
                            </h4>
                            <p className="font-sans text-stone-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                              "{activeGift.wish}"
                            </p>
                          </motion.div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Wishes & Wellbeing / Heartfelt Letter section */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col gap-12 mt-4" id="wishes-wellbeing-chambers">
                
                {/* Section Header */}
                <div className="text-center max-w-xl mx-auto flex flex-col items-center">
                  <span className="text-[10px] font-magic tracking-[0.25em] text-amber-200 font-bold uppercase block mb-1">✦ a few cozy thoughts for you ✦</span>
                  <p className="font-magic text-2xl sm:text-4xl text-stone-100 font-bold tracking-wide">SOME GENTLE REMINDERS</p>
                  <div className="h-[2px] w-12 bg-amber-200/40 mt-3 rounded-full"></div>
                </div>

                {/* Wellbeing Cards Grid: Fully Adaptive for laptop & mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="wellbeing-grid">
                  {/* Card 1: Core Personality */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border border-amber-500/10 hover:border-amber-500/20 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-amber-500/5 blur-xl" />
                    <div>
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h4 className="serif-display text-lg text-white font-semibold mb-2">You are so wonderful</h4>
                      <p className="font-sans text-stone-200/90 text-xs sm:text-sm leading-relaxed font-light">
                        Honestly, you are just such an incredibly wonderful human. Hope you never forget that you're a beautiful story of your own, full of sweet strength and lovely quiet chapters. Just stay exactly who you are, because you are amazing!
                      </p>
                    </div>
                    <div className="mt-6 text-[10px] sm:text-xs font-mono text-amber-300/60 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <span>• stay wonderfully you</span>
                    </div>
                  </motion.div>

                  {/* Card 2: Your Path */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border border-pink-500/10 hover:border-pink-500/20 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-pink-500/5 blur-xl" />
                    <div>
                      <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mb-6 text-pink-300">
                        <Utensils className="w-6 h-6" />
                      </div>
                      <h4 className="serif-display text-lg text-white font-semibold mb-2">Do exactly what you love</h4>
                      <p className="font-sans text-stone-200/90 text-xs sm:text-sm leading-relaxed font-light">
                        Go after absolutely anything that makes your heart happy! Make your own rules, trust your gut completely, and let whatever other people have to say just fade into faint background noise. You've got this, always.
                      </p>
                    </div>
                    <div className="mt-6 text-[10px] sm:text-xs font-mono text-pink-300/60 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <span>• your dreams, your path</span>
                    </div>
                  </motion.div>

                  {/* Card 3: Protection from Idiots */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border border-rose-500/10 hover:border-rose-500/20 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-rose-500/5 blur-xl" />
                    <div>
                      <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6 text-rose-300">
                        <Shield className="w-6 h-6" />
                      </div>
                       <h4 className="serif-display text-lg text-white font-semibold mb-2">Protection from annoying energy</h4>
                       <p className="font-sans text-stone-200/90 text-xs sm:text-sm leading-relaxed font-light">
                         Sending you an absolute shield against any bad vibes, negative advice, and annoying guys like Archi! Make sure you learn to say "No" to idiot people like Prassun. Your cozy bookstore reading sessions and peaceful space are strictly sacred, period.
                       </p>
                    </div>
                    <div className="mt-6 text-[10px] sm:text-xs font-mono text-rose-300/60 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <span>• strictly sacred peace</span>
                    </div>
                  </motion.div>

                  {/* Card 4: Happiness & Peace */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border border-amber-500/10 hover:border-amber-500/20 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-amber-500/5 blur-xl" />
                    <div>
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-300">
                        <Coffee className="w-6 h-6" />
                      </div>
                      <h4 className="serif-display text-lg text-white font-semibold mb-2">Sweet treats & spicy food!</h4>
                      <p className="font-sans text-stone-200/90 text-xs sm:text-sm leading-relaxed font-light">
                        Wishing you the absolute ultimate food paradise! I hope you feast on delicious, heavenly sweet treats and then dive into some seriously hot chilli-styled foods like spicy momos! Enjoy the crazy flavor combinations today!
                      </p>
                    </div>
                    <div className="mt-6 text-[10px] sm:text-xs font-mono text-amber-300/60 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <span>• sweet & extra spicy</span>
                    </div>
                  </motion.div>


                </div>

                {/* 2. Personalized Interactive Letter Box */}
                <div className="w-full mt-6" id="personalized-letter-box">
                  <div className="text-center max-w-xl mx-auto flex flex-col items-center mb-8">
                    <span className="text-[10px] font-magic tracking-[0.25em] text-amber-200 font-bold uppercase block mb-1">✨ a note for Goru</span>
                    <h3 className="font-magic text-xl sm:text-2xl text-stone-200 font-bold tracking-wide">A LETTER FROM THE HEART</h3>
                  </div>

                  <AnimatePresence mode="wait">
                    {!envelopeOpened ? (
                      // Sealed Envelope UI
                      <motion.div 
                        key="sealed-letter"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => {
                          setEnvelopeOpened(true);
                          playGiftChime(1);
                          onLetterUnlock();
                        }}
                        className="w-full max-w-xl mx-auto bg-gradient-to-br from-[#1c130d]/98 to-[#110a06]/98 border-2 border-double border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-[2.2rem] p-8 text-center cursor-pointer shadow-2xl group flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden"
                      >
                        {/* Decorative background grid and sparkles */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-red-500/5 pointer-events-none" />
                        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-red-950/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                        {/* Handcrafted filigree style corner ornaments */}
                        <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-amber-500/25 rounded-tl pointer-events-none" />
                        <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-amber-500/25 rounded-tr pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-amber-500/25 rounded-bl pointer-events-none" />
                        <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-amber-500/25 rounded-br pointer-events-none" />

                        {/* Outer decorative line inset */}
                        <div className="absolute inset-1.5 border border-amber-500/5 rounded-[1.9rem] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                          {/* Sealed Envelope Graphic using pure SVG/Lucide */}
                          <div className="relative mb-6">
                            <motion.div 
                              animate={{ scale: [1, 1.05, 1] }} 
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-20 h-20 bg-gradient-to-tr from-rose-900 to-red-950 rounded-full flex items-center justify-center text-amber-200 shadow-lg shadow-red-950/50 border-2 border-amber-600/40 relative z-10"
                              style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.5)' }}
                            >
                              <span className="font-magic text-3xl font-bold text-amber-300 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">T</span>
                            </motion.div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                            </span>
                          </div>

                          <span className="text-xs font-magic uppercase tracking-[0.2em] text-amber-250 font-bold mb-2">FOR GORU ONLY</span>
                          <h4 className="font-magic text-lg text-white font-bold tracking-wide mb-4">OPEN YOUR LETTER</h4>
                          <p className="font-sans text-stone-200 text-xs leading-relaxed max-w-xs mb-6 font-light">
                            "Just a small note to tell you how much your friendship means to me. No rush."
                          </p>
                          <div className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg hover:bg-zinc-100 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> read message
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      // Unfolded Gorgeous Letter UI
                      <motion.div 
                        key="unfolded-letter"
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.98 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
                        className="w-full max-w-2xl mx-auto bg-gradient-to-br from-[#1c130d]/98 to-[#110a06]/98 border-2 border-double border-amber-500/35 shadow-[0_25px_65px_rgba(0,0,0,0.75)] rounded-[2.2rem] p-6 sm:p-10 relative overflow-hidden"
                        id="opened-friendship-letter-frame"
                      >
                        {/* Elegant background tint */}
                        <div className="absolute inset-0 bg-[#0B0A16]/40 rounded-[2.2rem] pointer-events-none" />

                        {/* Handcrafted filigree style corner ornaments */}
                        <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-amber-500/25 rounded-tl pointer-events-none" />
                        <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-amber-500/25 rounded-tr pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-amber-500/25 rounded-bl pointer-events-none" />
                        <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-amber-500/25 rounded-br pointer-events-none" />

                        {/* Outer decorative line inset */}
                        <div className="absolute inset-1.5 border border-amber-500/5 rounded-[1.9rem] pointer-events-none" />

                        <div className="absolute top-5 right-5 text-[10px] font-magic uppercase tracking-[0.15em] text-amber-200 border border-amber-500/20 px-2.5 py-1 rounded-md bg-amber-500/5 z-20">
                          ✦ Sealed with Magic ✦
                        </div>

                        {/* Letter Content */}
                        <div className="relative z-10">
                          {/* Letter Header */}
                          <div className="flex items-center gap-3.5 mb-6 border-b border-white/10 pb-4">
                            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                            <div>
                              <h4 className="font-magic text-base text-white font-bold tracking-wide">From your idiot friend</h4>
                              <p className="font-magic text-[9px] text-stone-300 tracking-widest uppercase">May 30, 2026 • cozy evening</p>
                            </div>
                          </div>

                          {/* Beautiful Hand-written Text container */}
                          <div className="serif-display text-lg sm:text-xl lg:text-2xl text-stone-200 leading-relaxed space-y-4 font-light py-2">
                            <p className="italic">
                              "U are the best friend one could imagine to have, although u are quite an idiot sometimes. Sometime u can be a cow, sometime a super duper girl. But u are who u are!"
                            </p>
                            <p className="italic">
                              "Follow what u want and don't get another idiot guy like Archi... Hehehehhe..."
                            </p>
                            <p className="font-magic italic text-right text-amber-300 font-bold mt-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                              "— Well, thank u for being my friend goru! :)"
                            </p>
                          </div>


                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card 5: Unlimited Sheep Farm Context */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border border-purple-500/15 hover:border-purple-500/30 shadow-lg relative overflow-hidden w-full max-w-2xl mx-auto mt-8"
                >
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-purple-500/5 blur-xl" />
                  <div>
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-300">
                      <svg className="w-8 h-8 text-purple-200" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M 30,50 C 20,50 20,35 30,35 C 30,20 45,20 50,30 C 55,15 70,20 70,30 C 80,30 80,45 70,45 C 80,55 75,70 65,65 C 60,75 45,75 40,65 C 25,70 20,55 30,50 Z" fill="#ffffff" />
                        <rect x="40" y="38" width="20" height="24" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                        <ellipse cx="36" cy="42" rx="6" ry="3" fill="#f8fafc" transform="rotate(-15 36 42)" />
                        <ellipse cx="64" cy="42" rx="6" ry="3" fill="#f8fafc" transform="rotate(15 64 42)" />
                        <circle cx="46" cy="48" r="2" fill="#1e293b" />
                        <circle cx="54" cy="48" r="2" fill="#1e293b" />
                        <circle cx="43" cy="52" r="2.5" fill="#fda4af" opacity="0.8" />
                        <circle cx="57" cy="52" r="2.5" fill="#fda4af" opacity="0.8" />
                        <rect x="42" y="66" width="4" height="10" rx="2" fill="#e2e8f0" />
                        <rect x="54" y="66" width="4" height="10" rx="2" fill="#e2e8f0" />
                      </svg>
                    </div>
                    <h4 className="font-magic text-lg text-white font-bold tracking-wide mb-2">YOUR COZY SHEEP SANCTUARY! 🐑</h4>
                    <p className="font-sans text-stone-200/90 text-xs sm:text-sm leading-relaxed font-light">
                      Since you are a cute little sheep at heart and absolutely love them, you have your very own unlimited sheep farm! Click the little surprise button at the bottom to release a stampede of woolly, bouncing sheep across the screen, feed them, or tickle them as much as you like!
                    </p>
                  </div>
                  <div className="mt-6 text-[10px] sm:text-xs font-mono text-purple-300/60 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <span>• unlimited sheep farm active</span>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Text "happy beith torsites" & Surprise Button */}
      {/* Merged with Sophisticated Dark line-dividors and pure white high-contrast button formatting */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-20 text-center flex flex-col items-center space-y-8 z-20 pt-8 w-full max-w-xl relative"
        id="prank-trigger-lobby"
      >
        {/* Playful greeting divider style matching Sophisticated Dark */}
        <div className="flex items-center space-x-4 opacity-75">
          <div className="h-[1px] w-12 sm:w-24 bg-white/30"></div>
          {/* Exact phrase requested by user */}
          <span className="font-magic text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-amber-200">
            happy beith torsites
          </span>
          <div className="h-[1px] w-12 sm:w-24 bg-white/30"></div>
        </div>

        {/* Surprise Button Triggering Sheep Prank with soft background glow overlay */}
        <div className="relative group">
          {envelopeOpened && (
            <div className="absolute inset-0 bg-white opacity-8 rounded-full blur-xl group-hover:opacity-15 transition-all duration-300 pointer-events-none" />
          )}
          
          <motion.button
            whileHover={envelopeOpened ? { scale: 1.05 } : {}}
            whileTap={envelopeOpened ? { scale: 0.96 } : {}}
            onClick={envelopeOpened ? onTriggerPrank : undefined}
            disabled={!envelopeOpened}
            className={`relative px-10 py-5 font-semibold rounded-full tracking-widest transition-all duration-300 flex items-center gap-3 ${
              envelopeOpened
                ? "bg-white text-black hover:scale-105 shadow-[0_10px_35px_rgba(255,255,255,0.12)] cursor-pointer"
                : "bg-zinc-800/80 text-stone-500 border border-stone-700/40 cursor-not-allowed opacity-45 shadow-none"
            }`}
            id="btn-little-surprise"
          >
            {envelopeOpened ? (
              <>
                {/* Exact spelling requested by user: "little suprice for u" */}
                <span className="font-magic font-extrabold text-xs sm:text-sm tracking-widest uppercase">LITTLE SUPRICE FOR U 🎁</span>
                
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </>
            ) : (
              <>
                <span className="font-magic font-extrabold text-xs sm:text-sm tracking-widest uppercase">SURPRISE LOCKED 🔒</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </>
            )}
          </motion.button>
        </div>


      </motion.div>
    </div>
  );
}
