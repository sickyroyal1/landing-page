import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { CoachProfileSection } from './components/CoachProfileSection';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { BookingModal } from './components/BookingModal';
import { SkillQuizModal } from './components/SkillQuizModal';
import { CoachPortal } from './components/CoachPortal';
import { ContentEditorModal } from './components/ContentEditorModal';
import { AuthModal } from './components/AuthModal';
import { EditSlotModal } from './components/EditSlotModal';
import { UserBookingsModal } from './components/UserBookingsModal';
import { Footer } from './components/Footer';

import { CoachingService, TimeSlot, BookingRequest, Review, CourtLocation, CoachProfile, SiteCopy, UserAccount } from './types';
import {
  initialCoachProfile,
  initialServices,
  initialCourts,
  initialReviews,
  initialSiteCopy,
  loadStoredTimeSlots,
  saveStoredTimeSlots,
  loadStoredBookings,
  saveStoredBookings,
  loadStoredProfile,
  saveStoredProfile,
  loadStoredServices,
  saveStoredServices,
  loadStoredSiteCopy,
  saveStoredSiteCopy
} from './data/mockData';

export default function App() {
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(initialCoachProfile);
  const [services, setServices] = useState<CoachingService[]>(initialServices);
  const [siteCopy, setSiteCopy] = useState<SiteCopy>(initialSiteCopy);
  const [courts] = useState<CourtLocation[]>(initialCourts);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Time slots & bookings from storage
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<CoachingService | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>(undefined);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCoachPortalOpen, setIsCoachPortalOpen] = useState(false);
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedSlots = loadStoredTimeSlots();
    const loadedBookings = loadStoredBookings();
    const loadedProfile = loadStoredProfile();
    const loadedSrvs = loadStoredServices();
    const loadedCopy = loadStoredSiteCopy();

    setTimeSlots(loadedSlots);
    setBookings(loadedBookings);
    setCoachProfile(loadedProfile);
    setServices(loadedSrvs);
    setSiteCopy(loadedCopy);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      showToast(`👑 Welcome back, Coach! Logged in as Admin.`);
    } else {
      showToast(`🎾 Welcome back, ${user.name}! Logged in as Player.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsCoachPortalOpen(false);
    showToast(`Logged out successfully.`);
  };

  // Handlers for saving profile & content
  const handleSaveProfile = (newProfile: CoachProfile) => {
    setCoachProfile(newProfile);
    saveStoredProfile(newProfile);
    showToast("✨ Coach profile updated successfully!");
  };

  const handleSaveServices = (newServices: CoachingService[]) => {
    setServices(newServices);
    saveStoredServices(newServices);
    showToast("✨ Services & pricing updated!");
  };

  const handleSaveSiteCopy = (newCopy: SiteCopy) => {
    setSiteCopy(newCopy);
    saveStoredSiteCopy(newCopy);
    showToast("✨ Headings & page text updated!");
  };

  const handleResetDefaults = () => {
    setCoachProfile(initialCoachProfile);
    setServices(initialServices);
    setSiteCopy(initialSiteCopy);
    saveStoredProfile(initialCoachProfile);
    saveStoredServices(initialServices);
    saveStoredSiteCopy(initialSiteCopy);
    showToast("🔄 Restored initial default content!");
  };

  // Booking Handlers
  const handleOpenBooking = (service?: CoachingService, slot?: TimeSlot) => {
    setSelectedService(service);
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (newBooking: BookingRequest) => {
    // 1. Add booking
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    saveStoredBookings(updatedBookings);

    // 2. Mark time slot as unavailable & link booking ID
    const updatedSlots = timeSlots.map(s => {
      if (s.id === newBooking.timeSlotId) {
        return { ...s, isAvailable: false, bookedByBookingId: newBooking.id };
      }
      return s;
    });
    setTimeSlots(updatedSlots);
    saveStoredTimeSlots(updatedSlots);

    showToast(`🎉 Session booked for ${newBooking.playerName} on ${newBooking.date}!`);
  };

  // Slot CRUD Handlers (Admin)
  const handleAddSlot = (newSlot: TimeSlot) => {
    const updated = [newSlot, ...timeSlots];
    setTimeSlots(updated);
    saveStoredTimeSlots(updated);
    showToast(`New time slot added: ${newSlot.date} @ ${newSlot.startTime}`);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
  };

  const handleSaveSlot = (updatedSlot: TimeSlot) => {
    const updated = timeSlots.map(s => s.id === updatedSlot.id ? updatedSlot : s);
    setTimeSlots(updated);
    saveStoredTimeSlots(updated);
    showToast(`✨ Updated time slot ${updatedSlot.date} (${updatedSlot.startTime})`);
  };

  const handleDeleteSlot = (slotId: string) => {
    const updated = timeSlots.filter(s => s.id !== slotId);
    setTimeSlots(updated);
    saveStoredTimeSlots(updated);
    showToast(`Time slot removed.`);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 1. Remove or set cancelled status
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    setBookings(updatedBookings);
    saveStoredBookings(updatedBookings);

    // 2. Re-enable slot
    const updatedSlots = timeSlots.map(s => {
      if (s.id === booking.timeSlotId) {
        return { ...s, isAvailable: true, bookedByBookingId: undefined };
      }
      return s;
    });
    setTimeSlots(updatedSlots);
    saveStoredTimeSlots(updatedSlots);

    showToast(`Booking cancelled and time slot made available again.`);
  };

  const openSlotsCount = timeSlots.filter(s => s.isAvailable).length;

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-400 selection:text-slate-950">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-purple-400 text-slate-950 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl border border-purple-300 flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Navbar
        coachProfile={coachProfile}
        isCoachPortalOpen={isCoachPortalOpen}
        onToggleCoachPortal={() => setIsCoachPortalOpen(!isCoachPortalOpen)}
        onOpenBooking={() => handleOpenBooking()}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenContentEditor={() => setIsContentEditorOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* Main Landing Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          coachProfile={coachProfile}
          siteCopy={siteCopy}
          availableSlotsCount={openSlotsCount}
          onOpenBooking={() => handleOpenBooking()}
          onScrollToAvailability={() => scrollToSection('#availability')}
        />

        {/* Interactive Schedule & Availability Calendar */}
        <AvailabilityCalendar
          timeSlots={timeSlots}
          courts={courts}
          onSelectSlot={(slot) => handleOpenBooking(undefined, slot)}
          currentUser={currentUser}
          onEditSlot={handleEditSlot}
          onDeleteSlot={handleDeleteSlot}
          onAddSlot={handleAddSlot}
        />

        {/* Coach Bio & Methodology */}
        <CoachProfileSection
          coachProfile={coachProfile}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Coaching Services & Rates Section */}
        <ServicesSection
          services={services}
          siteCopy={siteCopy}
          onSelectService={(service) => handleOpenBooking(service)}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        coachProfile={coachProfile}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Modals & Portals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      <EditSlotModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        slot={editingSlot}
        courts={courts}
        onSaveSlot={handleSaveSlot}
      />

      <UserBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        currentUser={currentUser}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        services={services}
        timeSlots={timeSlots}
        courts={courts}
        preselectedService={selectedService}
        preselectedSlot={selectedSlot}
        onConfirmBooking={handleConfirmBooking}
      />

      <SkillQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        services={services}
        onSelectRecommendedService={(service) => handleOpenBooking(service)}
      />

      <CoachPortal
        isOpen={isCoachPortalOpen}
        onClose={() => setIsCoachPortalOpen(false)}
        coachProfile={coachProfile}
        timeSlots={timeSlots}
        bookings={bookings}
        courts={courts}
        onAddSlot={handleAddSlot}
        onDeleteSlot={handleDeleteSlot}
        onCancelBooking={handleCancelBooking}
      />

      <ContentEditorModal
        isOpen={isContentEditorOpen}
        onClose={() => setIsContentEditorOpen(false)}
        coachProfile={coachProfile}
        services={services}
        siteCopy={siteCopy}
        onSaveProfile={handleSaveProfile}
        onSaveServices={handleSaveServices}
        onSaveSiteCopy={handleSaveSiteCopy}
        onResetDefaults={handleResetDefaults}
      />

    </div>
  );
}

