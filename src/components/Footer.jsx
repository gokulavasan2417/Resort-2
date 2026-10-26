import React, { useState } from 'react';
import { resortInfo, navLinks, roomsData } from '../data/resortData';
import { Mail, ArrowRight, Instagram, Facebook, Linkedin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavClick }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && /\S+@\S+\.\S+/.test(newsletterEmail)) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-charcoal-950 text-sand-300 pt-20 pb-12 border-t border-gold-500/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Statement Banner */}
        <div className="pb-16 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-400 font-semibold block">
              The Sanctuary Gazette
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-cream-50 mt-1">
              Seasonal Dispatches & Solitude Inquiries
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-sand-300 font-light max-w-md leading-relaxed">
              Receive quarterly invitations to seasonal culinary harvests, wellness retreats, and private villa releases.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-4 rounded-xl bg-forest-900/60 border border-gold-400/30 text-gold-300 text-xs flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Thank you. Your address has been added to our private dispatch ledger.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-400" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3.5 rounded-full bg-charcoal-900 border border-white/10 text-cream-50 text-xs sm:text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main 4-Column Footer Navigation */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="font-serif text-2xl tracking-[0.25em] text-cream-50">
                {resortInfo.brandName}
              </span>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold-400 mt-0.5">
                {resortInfo.brandSubtitle}
              </p>
            </div>
            <p className="text-xs text-sand-400 font-light leading-relaxed max-w-sm">
              An architectural retreat dedicated to mindful luxury, serene wilderness, and timeless restoration in the high alpine peaks.
            </p>
            <div className="pt-2 text-xs text-sand-400 space-y-1">
              <p>{resortInfo.location}</p>
              <p className="font-mono text-[11px] text-gold-400/80">{resortInfo.coordinates}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-cream-100 font-semibold">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-light">
              {navLinks.slice(0, 6).map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavClick(item.href)}
                    className="hover:text-gold-300 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Accommodations */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-cream-100 font-semibold">
              Accommodations
            </h4>
            <ul className="space-y-2 text-xs font-light">
              {roomsData.map((room) => (
                <li key={room.id}>
                  <button
                    onClick={() => onNavClick('#rooms')}
                    className="hover:text-gold-300 transition-colors text-left"
                  >
                    {room.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavClick('#booking')}
                  className="text-gold-400 hover:text-white font-medium"
                >
                  Direct Booking Desk →
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Socials */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-cream-100 font-semibold">
              Sanctuary Liaison
            </h4>
            <div className="space-y-2 text-xs font-light text-sand-300">
              <p>
                Reservations:{' '}
                <a href={`tel:${resortInfo.contactPhone}`} className="text-cream-50 hover:text-gold-300">
                  {resortInfo.contactPhone}
                </a>
              </p>
              <p>
                Inquiries:{' '}
                <a href={`mailto:${resortInfo.contactEmail}`} className="text-cream-50 hover:text-gold-300">
                  {resortInfo.contactEmail}
                </a>
              </p>
              <p className="text-sand-400 pt-1">
                Check-in: {resortInfo.checkInTime} | Check-out: {resortInfo.checkOutTime}
              </p>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <a
                href="#sanctuary"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 hover:text-charcoal-950 flex items-center justify-center transition-colors"
              >
                <Instagram size={14} />
              </a>
              <a
                href="#sanctuary"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 hover:text-charcoal-950 flex items-center justify-center transition-colors"
              >
                <Facebook size={14} />
              </a>
              <a
                href="#sanctuary"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 hover:text-charcoal-950 flex items-center justify-center transition-colors"
              >
                <Linkedin size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-sand-400 font-light">
          <p>© {new Date().getFullYear()} {resortInfo.brandName} {resortInfo.brandSubtitle}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-cream-50 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-cream-50 cursor-pointer">Terms of Stay</span>
            <span className="hover:text-cream-50 cursor-pointer">Environmental Commitment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
