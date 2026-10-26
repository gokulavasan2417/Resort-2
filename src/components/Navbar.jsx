import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Compass, PhoneCall } from 'lucide-react';
import { navLinks, resortInfo } from '../data/resortData';

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('sanctuary');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section
      const sections = ['sanctuary', 'rooms', 'family', 'contact', 'about'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'glass-nav py-3 shadow-lg shadow-black/20'
            : 'bg-gradient-to-b from-charcoal-950/85 via-charcoal-950/40 to-transparent py-4 sm:py-6'
        }`}
      >
        <div className="w-full max-w-[1700px] mx-auto px-6 sm:px-12 lg:px-20">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo (Intro.mp4 Style) */}
            <div className="flex-shrink-0">
              <a
                href="#sanctuary"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#sanctuary');
                }}
                className="group flex items-center gap-2.5 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full border border-gold-400/40 flex items-center justify-center text-gold-300 group-hover:border-gold-400 transition-colors">
                  <Compass size={16} className="group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-oswald text-base sm:text-xl tracking-[0.2em] text-white font-medium group-hover:text-gold-300 transition-colors uppercase whitespace-nowrap">
                    {resortInfo.brandName}
                  </span>
                  <span className="text-[8px] tracking-[0.3em] uppercase text-gold-400/80 font-medium -mt-1 whitespace-nowrap">
                    {resortInfo.brandSubtitle}
                  </span>
                </div>
              </a>
            </div>

            {/* Right: Desktop Navigation Links + Action Button (Intro.mp4 Style) */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <nav className="flex items-center space-x-1 xl:space-x-2">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.replace('#', '');
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      className={`relative px-3 py-1 text-[11px] xl:text-[12px] font-sans font-medium uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                        isActive
                          ? 'text-gold-300'
                          : 'text-cream-100/75 hover:text-white'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-amber-400"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={onOpenBooking}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold bg-gold-500 hover:bg-gold-400 text-charcoal-950 shadow-md shadow-gold-500/20 transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                <span className="font-serif font-bold text-sm leading-none">₹</span>
                <span>Book Stay</span>
              </button>
            </div>

            {/* Mobile / Tablet Menu Button */}
            <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gold-500 text-charcoal-950 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap"
              >
                <span className="font-bold">₹</span>
                <span>Book</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                className="p-2 rounded-lg text-cream-100 hover:text-gold-300 hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Fullscreen Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden bg-charcoal-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10"
          >
            {/* Top Bar inside Menu */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-xl tracking-[0.25em] text-cream-50">
                  {resortInfo.brandName}
                </span>
                <p className="text-[9px] tracking-[0.3em] uppercase text-gold-400">
                  {resortInfo.brandSubtitle}
                </p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
                className="p-2 rounded-full bg-white/10 text-white hover:text-gold-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex flex-col space-y-3 py-6">
              {navLinks.map((link, idx) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left font-serif text-xl sm:text-2xl text-cream-100 hover:text-gold-400 transition-colors py-1 flex items-center justify-between border-b border-white/5"
                >
                  <span>{link.label}</span>
                  <span className="text-xs font-sans text-gold-400/60 font-light">
                    0{idx + 1}
                  </span>
                </motion.button>
              ))}
            </nav>

            {/* Bottom Actions inside Mobile Menu */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="font-serif font-bold text-base leading-none">₹</span>
                <span>Book Your Stay</span>
              </button>
              <div className="text-center text-xs text-sand-300/70 pt-1">
                Direct Line: <a href={`tel:${resortInfo.contactPhone}`} className="text-gold-300 underline underline-offset-2">{resortInfo.contactPhone}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
