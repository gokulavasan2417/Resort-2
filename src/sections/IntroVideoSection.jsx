import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, FastForward, ArrowDown, Sparkles, ChevronDown } from 'lucide-react';

// Strict checkpoints requested by user:
// 1st scroll stops at 2.0s
// 2nd scroll stops at 5.0s
// 3rd scroll stops at 7.5s
// 4th scroll finishes the full video (9.85s emblem, safely avoiding EOF black screen)
const CHECKPOINTS = [0.0, 2.0, 5.0, 7.5, 9.85];
const TOTAL_SCROLLS = CHECKPOINTS.length - 1; // 4 scrolls
const MAX_SAFE_TIME = 9.85;

export default function IntroVideoSection({ onComplete, onExploreSanctuary, onBookStay }) {
  const videoRef = useRef(null);
  const isCompletedRef = useRef(false);
  const scrollStepRef = useRef(0);
  const targetTimeRef = useRef(0);
  const forwardRafRef = useRef(null);
  const reverseRafRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const wheelCooldownRef = useRef(false);
  const canProceedAfterCompleteRef = useRef(false);
  const hasProceededRef = useRef(false);
  const accumulatedDeltaRef = useRef(0);

  const [scrollStep, setScrollStep] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHeroOverlay, setShowHeroOverlay] = useState(true);

  // Freeze firmly on the emblem final frame without any black screen
  const freezeOnLastFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    if (forwardRafRef.current) {
      cancelAnimationFrame(forwardRafRef.current);
      forwardRafRef.current = null;
    }
    if (reverseRafRef.current) {
      cancelAnimationFrame(reverseRafRef.current);
      reverseRafRef.current = null;
    }

    video.pause();
    video.currentTime = MAX_SAFE_TIME;

    scrollStepRef.current = TOTAL_SCROLLS;
    setScrollStep(TOTAL_SCROLLS);
    isCompletedRef.current = true;
    setIsCompleted(true);
    setShowHeroOverlay(false);
    document.body.style.overflow = '';

    wheelCooldownRef.current = true;
    canProceedAfterCompleteRef.current = false;
    setTimeout(() => {
      isAnimatingRef.current = false;
      wheelCooldownRef.current = false;
      canProceedAfterCompleteRef.current = true;
    }, 280);
  };

  // Play forward strictly toward target checkpoint (0.0s -> 2.0s -> 5.0s -> 7.5s -> 9.85s)
  const playForward = (targetTime, step) => {
    const video = videoRef.current;
    if (!video) {
      isAnimatingRef.current = false;
      return;
    }

    if (reverseRafRef.current) {
      cancelAnimationFrame(reverseRafRef.current);
      reverseRafRef.current = null;
    }
    if (forwardRafRef.current) {
      cancelAnimationFrame(forwardRafRef.current);
      forwardRafRef.current = null;
    }

    setHasStarted(true);
    setShowHeroOverlay(false);
    scrollStepRef.current = step;
    setScrollStep(step);

    const clampedTarget = Math.min(targetTime, MAX_SAFE_TIME);
    targetTimeRef.current = clampedTarget;

    // If already at or past target, pause immediately and stop
    if (video.currentTime >= clampedTarget - 0.04) {
      video.pause();
      video.currentTime = clampedTarget;
      if (step >= TOTAL_SCROLLS) {
        freezeOnLastFrame();
      } else {
        wheelCooldownRef.current = true;
        setTimeout(() => {
          isAnimatingRef.current = false;
          wheelCooldownRef.current = false;
        }, 220);
      }
      return;
    }

    // Dynamic playback rate:
    // First scroll (0.0s -> 2.0s) is ultra-fast (~0.55s), subsequent scrolls complete in ~0.9s - 1.05s
    let targetRate;
    if (step === 1) {
      targetRate = 3.6; // Ultra-fast first scroll requested by user
    } else {
      const distance = Math.max(0.1, clampedTarget - video.currentTime);
      targetRate = Math.min(Math.max(distance / 1.05, 2.1), 2.75);
    }
    video.playbackRate = targetRate;
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    const checkTime = () => {
      const v = videoRef.current;
      if (!v) {
        isAnimatingRef.current = false;
        return;
      }

      const remaining = targetTimeRef.current - v.currentTime;

      // Soft deceleration right before target checkpoint to prevent overshoot
      const slowThreshold = scrollStepRef.current === 1 ? 0.2 : 0.28;
      const slowRate = scrollStepRef.current === 1 ? 1.8 : 1.3;
      if (remaining > 0 && remaining < slowThreshold && v.playbackRate > slowRate) {
        v.playbackRate = slowRate;
      }

      // When reached target checkpoint or safety limit
      if (remaining <= 0.04 || v.currentTime >= targetTimeRef.current || v.currentTime >= MAX_SAFE_TIME || v.ended) {
        v.pause();
        v.currentTime = Math.min(targetTimeRef.current, MAX_SAFE_TIME);

        if (scrollStepRef.current >= TOTAL_SCROLLS) {
          freezeOnLastFrame();
        } else {
          // Strictly stopped at this checkpoint!
          wheelCooldownRef.current = true;
          setTimeout(() => {
            isAnimatingRef.current = false;
            wheelCooldownRef.current = false;
          }, 220);
        }
      } else {
        forwardRafRef.current = requestAnimationFrame(checkTime);
      }
    };

    forwardRafRef.current = requestAnimationFrame(checkTime);
  };

  // Play backward strictly toward previous checkpoint (9.85s -> 7.5s -> 5.0s -> 2.0s -> 0.0s)
  const playBackward = (targetTime, step) => {
    const video = videoRef.current;
    if (!video) {
      isAnimatingRef.current = false;
      return;
    }

    if (forwardRafRef.current) {
      cancelAnimationFrame(forwardRafRef.current);
      forwardRafRef.current = null;
    }
    if (reverseRafRef.current) {
      cancelAnimationFrame(reverseRafRef.current);
      reverseRafRef.current = null;
    }

    video.pause();

    // Immediately dismiss completed state so reverse playback is visible
    if (isCompletedRef.current) {
      isCompletedRef.current = false;
      setIsCompleted(false);
      canProceedAfterCompleteRef.current = false;
      document.body.style.overflow = 'hidden';
    }

    scrollStepRef.current = step;
    setScrollStep(step);

    const clampedTarget = Math.max(0, targetTime);
    targetTimeRef.current = clampedTarget;

    const stepReverse = () => {
      const v = videoRef.current;
      if (!v) {
        isAnimatingRef.current = false;
        return;
      }

      const remaining = v.currentTime - targetTimeRef.current;
      if (remaining <= 0.05) {
        v.currentTime = targetTimeRef.current;
        if (targetTimeRef.current === 0) {
          setHasStarted(false);
          setShowHeroOverlay(true);
        }
        // Strictly stopped at reverse checkpoint!
        wheelCooldownRef.current = true;
        setTimeout(() => {
          isAnimatingRef.current = false;
          wheelCooldownRef.current = false;
        }, 220);
        return;
      }

      if (!v.seeking) {
        // Fast, smooth reverse step matching forward speed
        const maxStep = targetTimeRef.current === 0 ? 0.32 : 0.24;
        const stepAmount = Math.min(Math.max(remaining * 0.3, 0.08), maxStep);
        v.currentTime = Math.max(0, v.currentTime - stepAmount);
      }

      reverseRafRef.current = requestAnimationFrame(stepReverse);
    };

    reverseRafRef.current = requestAnimationFrame(stepReverse);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;

    if (window.scrollY > 80) {
      isCompletedRef.current = true;
      setIsCompleted(true);
      canProceedAfterCompleteRef.current = true;
    } else {
      document.body.style.overflow = 'hidden';
    }

    const handleEnded = () => {
      freezeOnLastFrame();
    };
    video.addEventListener('ended', handleEnded);

    const handleScroll = () => {
      if (window.scrollY <= 10) {
        hasProceededRef.current = false;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Wheel handler: strictly stops at 2.0s, 5.0s, 7.5s, and finishes on 4th scroll
    const handleWheel = (e) => {
      if (window.scrollY > 15) return; // Allow natural scrolling in other sections

      // While traveling to a checkpoint, lock scrolling and discard residual momentum!
      if (isAnimatingRef.current) {
        accumulatedDeltaRef.current = 0;
        e.preventDefault();
        return;
      }

      if (wheelCooldownRef.current) {
        accumulatedDeltaRef.current = 0;
        e.preventDefault();
        return;
      }

      if (!isCompletedRef.current) {
        e.preventDefault();

        accumulatedDeltaRef.current += e.deltaY;
        const wheelThreshold = scrollStepRef.current === 0 ? 14 : 25;
        if (Math.abs(accumulatedDeltaRef.current) < wheelThreshold) return;

        if (accumulatedDeltaRef.current > 0) {
          // Scroll DOWN -> Play FORWARD to next checkpoint strictly
          accumulatedDeltaRef.current = 0;
          if (scrollStepRef.current < TOTAL_SCROLLS) {
            const nextStep = scrollStepRef.current + 1;
            isAnimatingRef.current = true;
            playForward(CHECKPOINTS[nextStep], nextStep);
          }
        } else if (accumulatedDeltaRef.current < 0) {
          // Scroll UP -> Play BACKWARD to previous checkpoint strictly
          accumulatedDeltaRef.current = 0;
          if (scrollStepRef.current > 0) {
            const prevStep = scrollStepRef.current - 1;
            isAnimatingRef.current = true;
            playBackward(CHECKPOINTS[prevStep], prevStep);
          }
        }
      } else {
        // Video has finished at 9.85s emblem
        if (e.deltaY > 0) {
          // Scrolling down proceeds to Landing Page (Hero Section)
          if (canProceedAfterCompleteRef.current) {
            handleProceedToLanding();
          } else {
            e.preventDefault();
          }
        } else if (e.deltaY < 0 && window.scrollY <= 10) {
          // Scrolling UP while on emblem -> play BACKWARD to 7.5s!
          e.preventDefault();
          accumulatedDeltaRef.current = 0;
          const prevStep = TOTAL_SCROLLS - 1;
          isAnimatingRef.current = true;
          playBackward(CHECKPOINTS[prevStep], prevStep);
        }
      }
    };

    // Touch handlers for mobile devices
    let touchY = 0;
    const handleTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (window.scrollY > 15) return;
      if (isAnimatingRef.current || wheelCooldownRef.current) return;

      const deltaY = touchY - e.changedTouches[0].clientY;

      if (!isCompletedRef.current) {
        const touchThreshold = scrollStepRef.current === 0 ? 16 : 28;
        if (Math.abs(deltaY) > touchThreshold) {
          if (deltaY > 0 && scrollStepRef.current < TOTAL_SCROLLS) {
            const nextStep = scrollStepRef.current + 1;
            isAnimatingRef.current = true;
            playForward(CHECKPOINTS[nextStep], nextStep);
          } else if (deltaY < 0 && scrollStepRef.current > 0) {
            const prevStep = scrollStepRef.current - 1;
            isAnimatingRef.current = true;
            playBackward(CHECKPOINTS[prevStep], prevStep);
          }
        }
      } else {
        if (deltaY > 28 && canProceedAfterCompleteRef.current) {
          handleProceedToLanding();
        } else if (deltaY < -28 && window.scrollY <= 10) {
          const prevStep = TOTAL_SCROLLS - 1;
          isAnimatingRef.current = true;
          playBackward(CHECKPOINTS[prevStep], prevStep);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.body.style.overflow = '';
      if (forwardRafRef.current) cancelAnimationFrame(forwardRafRef.current);
      if (reverseRafRef.current) cancelAnimationFrame(reverseRafRef.current);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProceedToLanding = () => {
    if (hasProceededRef.current) return;
    hasProceededRef.current = true;
    isCompletedRef.current = true;
    setIsCompleted(true);
    document.body.style.overflow = '';
    onComplete();
  };

  return (
    <section
      id="intro-video"
      className="relative h-screen w-full overflow-hidden bg-charcoal-950 select-none cursor-pointer"
      onClick={() => {
        if (isAnimatingRef.current || wheelCooldownRef.current) return;
        if (scrollStepRef.current < TOTAL_SCROLLS) {
          const nextStep = scrollStepRef.current + 1;
          isAnimatingRef.current = true;
          playForward(CHECKPOINTS[nextStep], nextStep);
        }
      }}
    >
      {/* Background Layer: Seamless cream behind emblem, charcoal elsewhere */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          scrollStep >= 4 ? 'bg-[#F6F3ED]' : 'bg-charcoal-950'
        }`}
      />

      {/* Fullscreen Video Element */}
      <video
        ref={videoRef}
        src="/videos/Main-8.mp4"
        className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform"
        playsInline
        muted={isMuted}
        preload="auto"
      />

      {/* High-res Emblem Snapshot Overlay: 100% guarantees no black screen can ever appear */}
      <img
        src="/images/intro-emblem.jpg"
        alt="Happening Luxury Villa Emblem"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
          isCompleted ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtle Cinematic Vignette (Fades out when on emblem so it stays clean and brilliant) */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-charcoal-950/40 pointer-events-none transition-opacity duration-500 ${
          isCompleted ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Top Controls: Sound & Skip */}
      <div
        className="absolute top-24 right-6 sm:right-12 z-20 flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          className="p-2.5 rounded-full bg-charcoal-950/60 hover:bg-gold-500 hover:text-charcoal-950 text-white border border-white/20 hover:border-gold-400 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <button
          onClick={handleProceedToLanding}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-950/60 hover:bg-gold-500 hover:text-charcoal-950 text-white border border-white/20 hover:border-gold-400 backdrop-blur-md text-[11px] uppercase tracking-widest font-medium transition-all duration-300 active:scale-95 shadow-lg"
        >
          <span>Skip to Sanctuary</span>
          <FastForward size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Resort Hero Title Overlay (Inspired by reference image; disappears when in-video text arrives) */}
      <AnimatePresence>
        {showHeroOverlay && !isCompleted && (
          <motion.div
            key="resort-hero-overlay"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none"
          >
            {/* Subtle backdrop gradient for crisp text readability over aerial resort shot */}
            <div className="absolute inset-0 bg-charcoal-950/25 pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 sm:gap-6 mt-14 sm:mt-18">
              {/* Top Badge: Madurai / Chennai reference style */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-950/70 border border-gold-400/40 backdrop-blur-md text-gold-300 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium shadow-lg pointer-events-auto"
              >
                <Sparkles size={12} className="text-gold-400 animate-pulse" />
                <span>EAST COAST CANOPY · EXCLUSIVE LUXURY SANCTUARY</span>
              </motion.div>

              {/* Bold Serif Headline with Italic Gold Accent matching reference image */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-serif text-white tracking-tight leading-[1.08] drop-shadow-2xl font-medium"
              >
                Where Coastal Serenity <br />
                <span className="font-serif italic font-normal text-gold-300 drop-shadow-lg">
                  Meets Timeless Luxury
                </span>
              </motion.h1>

              {/* Descriptive Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="text-cream-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md"
              >
                An architectural sanctuary nestled along the serene East Coast canopy.
                Private mineral plunge pools, bioclimatic pavilions, and boundless natural stillness.
              </motion.p>

              {/* Action Buttons: Pointer events enabled on buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-2 pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookStay?.();
                  }}
                  className="px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-semibold text-xs uppercase tracking-[0.18em] shadow-xl hover:shadow-gold-500/30 transition-all duration-300 active:scale-95"
                >
                  Reserve Sanctuary
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExploreSanctuary?.();
                  }}
                  className="px-7 py-3.5 rounded-full bg-charcoal-950/70 hover:bg-charcoal-900/90 text-white border border-white/25 hover:border-gold-400/70 backdrop-blur-md font-medium text-xs uppercase tracking-[0.18em] shadow-xl transition-all duration-300 active:scale-95"
                >
                  Explore Sanctuary
                </button>
              </motion.div>

              {/* Scroll Cue at Bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="flex flex-col items-center gap-1.5 pt-3 text-cream-200/80 pointer-events-none"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-light drop-shadow">
                  Scroll To Explore
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  <ChevronDown size={16} className="text-gold-400" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* When Video Finishes -> Stays on Final Emblem Frame + Prompt to Enter Landing Page */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            onClick={(e) => {
              e.stopPropagation();
              handleProceedToLanding();
            }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer flex flex-col items-center gap-2 group"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-gold-300 group-hover:text-white transition-colors font-medium drop-shadow-lg">
              Scroll Down To Enter Sanctuary
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="p-2.5 rounded-full bg-charcoal-950/80 border border-gold-400/50 text-gold-300 group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-all shadow-xl"
            >
              <ArrowDown size={16} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
