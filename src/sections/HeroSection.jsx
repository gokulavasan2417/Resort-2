import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Compass, ArrowDown } from 'lucide-react';

export const introSlides = [
  {
    id: 1,
    region: 'East Coast Sanctuary - Chennai',
    titleLine1: 'HAPPENING',
    titleLine2: 'VILLA RETREAT',
    cardTitle: 'HAPPENING VILLA',
    description:
      'Set within lush canopy forests, Happening Villa is a cultural and nature sanctuary offering mineral pools, mindful contemplation, and restorative serenity.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 2,
    region: 'Private Bamboo Grove',
    titleLine1: 'CELESTIAL',
    titleLine2: 'INFINITY VILLA',
    cardTitle: 'CELESTIAL INFINITY',
    description:
      'A detached architectural residence featuring heated quartzite plunge pool, stone fireplace, cliffside rain shower, and 24-hour dedicated butler care.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 3,
    region: 'Panoramic Alpine Ridge',
    titleLine1: 'VERDANT',
    titleLine2: 'HORIZON SUITE',
    cardTitle: 'VERDANT HORIZON',
    description:
      'Expansive living spaces framing unobstructed sunset horizons over mist-draped peaks, complete with Italian soaking tub and private cantilevered terrace.',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 4,
    region: 'Geothermal Waterscape',
    titleLine1: 'OASIS OF',
    titleLine2: 'STILLNESS POOL',
    cardTitle: 'OASIS OF STILLNESS',
    description:
      'Tiered quartzite infinity waters gently regulated to 28°C across all seasons. Floating teak daybeds, botanical infusions, and mineral hydrotherapy.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 5,
    region: 'Multi-Generation Heritage',
    titleLine1: 'SILVER FIR',
    titleLine2: 'FAMILY HAVEN',
    cardTitle: 'SILVER FIR HAVEN',
    description:
      'A two-story timber haven with private wildflower gardens, night-sky telescope, open hearth, and Young Rangers forest discovery walks.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85',
  },
];

export default function HeroSection({ onExplore, onBook }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef(null);

  const isTransitioningRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const isMouseDownRef = useRef(false);
  const isScrollingToRoomsRef = useRef(false);

  const total = introSlides.length;

  const goToSlide = useCallback((index) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => {
      isTransitioningRef.current = false;
      setIsAnimating(false);
    }, 600);
  }, []);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % total;
    goToSlide(nextIdx);
  }, [currentIndex, total, goToSlide]);

  const handlePrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + total) % total;
    goToSlide(prevIdx);
  }, [currentIndex, total, goToSlide]);

  // Mouse Drag Swipe Handlers (Horizontal Swipe)
  const handleMouseDown = (e) => {
    // Avoid triggering drag if user clicked an interactive button or link
    if (e.target.closest('button, a, input, select')) return;
    isMouseDownRef.current = true;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const deltaX = dragStartX.current - e.clientX;
    const deltaY = dragStartY.current - e.clientY;

    // Trigger horizontal swipe if movement is predominantly horizontal and > 45px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
      if (deltaX > 0) {
        handleNext(); // Swiped left -> next room
      } else {
        handlePrev(); // Swiped right -> prev room
      }
    }
  };

  // Touch Swipe Handlers for Mobile & Tablet (Horizontal Swipe)
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = dragStartX.current - e.changedTouches[0].clientX;
    const deltaY = dragStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 40) {
      // Swipe up (scroll down) -> smoothly transition to next section (Family)
      if (isScrollingToRoomsRef.current) return;
      isScrollingToRoomsRef.current = true;
      onExplore();
      setTimeout(() => {
        isScrollingToRoomsRef.current = false;
      }, 1000);
    }
  };

  // Wheel Gestures (Horizontal swipes change slides; vertical scroll smoothly transitions to next section)
  const handleWheel = (e) => {
    // 1. Horizontal trackpad gesture -> cycle room slides
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 25) {
      if (isTransitioningRef.current) return;
      if (e.deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      return;
    }

    // 2. Vertical scroll down on this page -> smoothly scroll to next section
    if (e.deltaY > 20) {
      if (isScrollingToRoomsRef.current) return;
      isScrollingToRoomsRef.current = true;
      onExplore();
      setTimeout(() => {
        isScrollingToRoomsRef.current = false;
      }, 1000);
    }
  };

  const current = introSlides[currentIndex];

  // 3 preview cards on right (Intro.mp4 style)
  const upcomingCards = [];
  for (let i = 1; i <= 3; i++) {
    const cardIdx = (currentIndex + i) % total;
    upcomingCards.push({
      ...introSlides[cardIdx],
      originalIndex: cardIdx,
    });
  }

  return (
    <section
      id="rooms"
      ref={heroRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        isMouseDownRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen w-full overflow-hidden bg-charcoal-950 select-none flex flex-col justify-between cursor-grab active:cursor-grabbing"
    >
      {/* Background Image with Smooth Crossfade & Ken-Burns Zoom */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${current.id}`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{
            opacity: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
            scale: { duration: 7, ease: 'easeOut' },
          }}
          className="absolute inset-0 w-full h-full transform-gpu will-change-transform pointer-events-none"
        >
          <img
            src={current.image}
            alt={`${current.titleLine1} ${current.titleLine2}`}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-950/45 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-transparent to-charcoal-950/50 pointer-events-none" />

      {/* Content Layout */}
      <div className="relative z-10 w-full h-full max-w-[1700px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-between pt-28 pb-10 flex-1">
        
        {/* Middle Container */}
        <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
          
          {/* Left Column: Bold Condensed Typography */}
          <div className="lg:col-span-6 xl:col-span-5 pr-4 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Region / Category Subtitle */}
                <p className="text-xs sm:text-sm font-sans font-medium tracking-widest text-cream-100 uppercase">
                  {current.region}
                </p>

                {/* Massive Bold Headline in 2 lines */}
                <div className="font-oswald text-5xl sm:text-7xl md:text-8xl lg:text-[88px] xl:text-[96px] font-bold text-white uppercase tracking-tight leading-[0.88] drop-shadow-md">
                  <div>{current.titleLine1}</div>
                  <div>{current.titleLine2}</div>
                </div>

                {/* Narrative Description */}
                <p className="text-xs sm:text-sm md:text-base text-cream-100/85 font-light leading-relaxed max-w-lg tracking-normal">
                  {current.description}
                </p>

                {/* Pill Buttons: DISCOVER LOCATION + RESERVE */}
                <div className="pt-3 flex items-center gap-4">
                  <button
                    onClick={onExplore}
                    className="group inline-flex items-center gap-3 px-6 sm:px-7 py-3 rounded-full bg-charcoal-950/40 hover:bg-white text-white hover:text-charcoal-950 border border-white/40 hover:border-white backdrop-blur-md text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
                      <Compass size={12} className="group-hover:rotate-45 transition-transform duration-500" />
                    </span>
                    <span>DISCOVER LOCATION</span>
                  </button>

                  <button
                    onClick={onBook}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-lg shadow-gold-500/25 active:scale-95 cursor-pointer"
                  >
                    <span className="font-serif font-bold text-sm leading-none">₹</span>
                    <span>BOOK STAY</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Floating Cards Carousel */}
          <div className="hidden md:flex lg:col-span-6 xl:col-span-7 justify-end items-center overflow-visible pl-4 pointer-events-auto">
            <div className="flex items-center gap-4 sm:gap-5">
              {upcomingCards.map((card, idx) => (
                <motion.div
                  key={`carousel-card-${card.id}`}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(card.originalIndex);
                  }}
                  className="group relative w-44 sm:w-52 md:w-56 lg:w-48 xl:w-56 h-64 sm:h-76 md:h-84 lg:h-76 xl:h-88 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-white/25 hover:border-gold-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-500/25 flex-shrink-0"
                >
                  {/* Card Background Image */}
                  <img
                    src={card.image}
                    alt={card.cardTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Bottom Gradient for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/30 to-transparent" />

                  {/* Card Labels at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-1">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80 font-medium truncate">
                      {card.region}
                    </p>
                    <h3 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-tight leading-tight group-hover:text-gold-300 transition-colors">
                      {card.cardTitle}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Controls Bar: Circular Arrows + Amber Progress Line + Big Slide Number */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 pointer-events-auto">
          
          {/* Left: Previous & Next Circular Buttons + Progress Bar */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Circular Navigation Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous Room"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-gold-400 text-white hover:text-gold-300 hover:bg-white/10 flex items-center justify-center transition-all duration-300 active:scale-95 group cursor-pointer"
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next Room"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-gold-400 text-white hover:text-gold-300 hover:bg-white/10 flex items-center justify-center transition-all duration-300 active:scale-95 group cursor-pointer"
              >
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Amber Progress Bar Line */}
            <div className="w-36 sm:w-60 md:w-80 h-[3px] bg-white/20 rounded-full overflow-hidden relative">
              <motion.div
                key={`progress-${currentIndex}`}
                initial={{ width: `${(currentIndex / total) * 100}%` }}
                animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-sm shadow-amber-400/50"
              />
            </div>

          </div>

          {/* Right: Big Bold Slide Number */}
          <div className="flex items-baseline">
            <AnimatePresence mode="wait">
              <motion.span
                key={`number-${currentIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="font-oswald text-4xl sm:text-6xl font-bold text-white tracking-tight leading-none"
              >
                {currentIndex + 1}
              </motion.span>
            </AnimatePresence>
            <span className="font-oswald text-xs sm:text-sm text-white/50 ml-1.5 font-light">
              / {total}
            </span>
          </div>

        </div>

      </div>

      {/* Floating Scroll Indicator (Natural Page Scroll Down to Rooms) */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        onClick={(e) => {
          e.stopPropagation();
          onExplore();
        }}
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer text-white/60 hover:text-gold-300 transition-colors pointer-events-auto"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase font-light">
          Swipe Horizontally to Explore • Scroll for Rooms
        </span>
        <ArrowDown size={12} className="text-amber-400" />
      </motion.div>
    </section>
  );
}
