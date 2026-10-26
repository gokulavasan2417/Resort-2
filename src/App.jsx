import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IntroVideoSection from './sections/IntroVideoSection';
import HeroSection from './sections/HeroSection';
import RoomsSection from './sections/RoomsSection';
import ActivitiesSection from './sections/ActivitiesSection';
import ContactSection from './sections/ContactSection';
import AboutSection from './sections/AboutSection';
import BookingModal from './components/BookingModal';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookRoom = (room) => {
    setPreselectedRoom(room);
    setIsBookingOpen(true);
  };

  const handleOpenBooking = () => {
    setPreselectedRoom(null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-900 font-sans selection:bg-gold-500 selection:text-white">
      {/* Luxury Navigation Header */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Main Experience Flow */}
      <main>
        {/* 1. Cinematic Intro Video (Scroll-Controlled Main-8.mp4 Playback) */}
        <IntroVideoSection
          onComplete={() => scrollToSection('sanctuary')}
          onExploreSanctuary={() => scrollToSection('sanctuary')}
          onBookStay={handleOpenBooking}
        />

        {/* 2. Sanctuary Overview & Architectural Journey (The Sanctuary Elevation) */}
        <RoomsSection
          onBookRoom={handleBookRoom}
          onExploreRooms={() => scrollToSection('rooms')}
        />

        {/* 3. Luxury Rooms Page (Destination Showcase, Bold Typography & Floating Preview Cards) */}
        <HeroSection
          onExplore={() => scrollToSection('family')}
          onBook={handleOpenBooking}
        />

        {/* 4. Family Page (Young Rangers Nature Lab, Canopy Adventure & Family Cottage) */}
        <ActivitiesSection
          onInquireFamily={() => scrollToSection('contact')}
          onBookFamily={() => handleBookRoom(null)}
        />

        {/* 5. Contact Page (Direct Sanctuary Enquiries, Coordinates, Concierge & FAQs) */}
        <ContactSection />

        {/* 6. About Us Last Page (Sanctuary Philosophy, 2,400-Acre Wilderness Reserve) */}
        <AboutSection onExploreRooms={() => scrollToSection('rooms')} />
      </main>

      {/* Footer */}
      <Footer onNavClick={(href) => scrollToSection(href)} />

      {/* Luxury Reservation Drawer / Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedRoom={preselectedRoom}
      />
    </div>
  );
}
