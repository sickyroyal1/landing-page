import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { CoachProfileSection } from './components/CoachProfileSection';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { BookingModal } from './components/BookingModal';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { CoachPortal } from './components/CoachPortal';
import { AuthModal } from './components/AuthModal';
import { RegistrationModal } from './components/RegistrationModal';
import { EditSlotModal } from './components/EditSlotModal';
import { UserBookingsModal } from './components/UserBookingsModal';
import { PaymentModal } from './components/PaymentModal';
import { Footer } from './components/Footer';
import { ScrollTopButton } from './components/ScrollTopButton';
import { PaymentResult } from './payment/payment';

import { CoachingService, TimeSlot, BookingRequest, Review, CourtLocation, CoachProfile, SiteCopy, UserAccount } from './types';
import { confirmBookings, cancelBooking, updateBooking, isMember, cancellationRestriction } from './bookingLogic';
import {
  initialCoaches,
  initialServices,
  initialCourts,
  initialReviews,
  initialSiteCopy,
  loadStoredTimeSlots,
  saveStoredTimeSlots,
  loadStoredBookings,
  saveStoredBookings,
  loadStoredCoaches,
  saveStoredCoaches,
  loadStoredServices,
  saveStoredServices,
  loadStoredSiteCopy,
  saveStoredSiteCopy,
  loadStoredReviews,
  saveStoredReviews,
  generateCoachSlots,
  loadStoredUser,
  saveStoredUser,
  clearStoredUser
} from './data/mockData';
import { PSGCProvince, PSGCCity, fetchAllProvinces, fetchCities } from './data/psgc';

// Fallback PSGC data so the picker still works when the API is unreachable.
// Negros Oriental matches the seeded coaches.
const FALLBACK_PROVINCES: PSGCProvince[] = [{ code: "0704600000", name: "Negros Oriental" }];
const FALLBACK_CITIES: PSGCCity[] = initialCourts.map((c) => ({
  code: c.psgcCode,
  name: c.name,
  type: c.type === "Indoor" ? "City" : "Mun",
  zip_code: "",
  district: ""
}));

// Heavy branch-only sections are code-split so they load on demand, not on first paint.
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const FindCoachSection = lazy(() =>
  import('./components/FindCoachSection').then(m => ({ default: m.FindCoachSection }))
);

function MinimalLoading({ label }: { label: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin" />
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

export default function App() {
  const [coaches, setCoaches] = useState<CoachProfile[]>(initialCoaches);
  const [services, setServices] = useState<CoachingService[]>(initialServices);
  const [siteCopy, setSiteCopy] = useState<SiteCopy>(initialSiteCopy);
  const [courts, setCourts] = useState<CourtLocation[]>(initialCourts);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // PSGC geographic data — fetched from the official PSGC API (province → city)
  const [psgcProvinces, setPsgcProvinces] = useState<PSGCProvince[]>([]);
  const [psgcCities, setPsgcCities] = useState<PSGCCity[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(true);

  // Find-a-coach flow state — coach availability is matched at the PSGC city level
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [selectedCityCode, setSelectedCityCode] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Time slots & bookings from storage
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<CoachingService | undefined>(undefined);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const [isCoachPortalOpen, setIsCoachPortalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  // Payment portal state — multi-booking: every confirmed session is payable
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingPaymentBookings, setPendingPaymentBookings] = useState<BookingRequest[]>([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedSlots = loadStoredTimeSlots();
    const loadedBookings = loadStoredBookings();
    const loadedCoachesList = loadStoredCoaches();
    const loadedSrvs = loadStoredServices();
    const loadedCopy = loadStoredSiteCopy();
    const loadedReviews = loadStoredReviews();

    setTimeSlots(loadedSlots);
    setBookings(loadedBookings);
    setCoaches(loadedCoachesList);
    setServices(loadedSrvs);
    setSiteCopy(loadedCopy);
    setReviews(loadedReviews);

    // Restore the signed-in user so a refresh keeps the session alive.
    const loadedUser = loadStoredUser();
    if (loadedUser) {
      setCurrentUser(loadedUser);
      // Coaches land straight back into their own portal.
      if (loadedUser.role === 'coach' && loadedUser.coachId) {
        setSelectedCoachId(loadedUser.coachId);
      }
    }
  }, []);

  // Load the full PSGC province list once on mount (fallback used offline).
  useEffect(() => {
    let cancelled = false;
    fetchAllProvinces()
      .then((ps) => { if (!cancelled) setPsgcProvinces(ps.length ? ps : FALLBACK_PROVINCES); })
      .catch(() => { if (!cancelled) setPsgcProvinces(FALLBACK_PROVINCES); })
      .finally(() => { if (!cancelled) setPsgcLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Two-stage flow: landing shows only the location → coach picker; picking a coach
  // opens that coach's portal. Scroll to the schedule once a coach is chosen.
  useEffect(() => {
    if (selectedCoachId) {
      const el = document.querySelector('#availability');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCoachId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setIsAdminView(false);
    if (user.role === 'coach' && user.coachId) {
      setSelectedCoachId(user.coachId);
      showToast(`👋 Welcome back, ${user.name}! Logged in as Coach.`);
    } else if (user.role === 'admin') {
      showToast(`👑 Welcome back, Coach! Logged in as Admin.`);
    } else {
      showToast(`🎾 Welcome back, ${user.name}! Logged in as Player.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearStoredUser();
    setIsAdminView(false);
    setIsCoachPortalOpen(false);
    showToast(`Logged out successfully.`);
  };

  // Registration handlers
  const handleRegisterClient = (user: UserAccount) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setIsRegistrationOpen(false);
    showToast(`🎾 Account created — welcome, ${user.name}!`);
  };

  const handleRegisterCoach = (
    coach: CoachProfile,
    user: UserAccount,
    areaNames: Record<string, string> = {}
  ) => {
    // 1. Add the new coach to the roster
    const updatedCoaches = [...coaches, coach];
    setCoaches(updatedCoaches);
    saveStoredCoaches(updatedCoaches);

    // 1b. Make sure each area the coach picked exists as a court so their time
    // slots resolve to the right city names (nationwide, not just Negros Oriental).
    const known = new Set(courts.map((c) => c.psgcCode));
    const missing: CourtLocation[] = coach.locationIds
      .filter((id) => !known.has(id))
      .map((id) => ({
        id,
        name: areaNames[id] ?? id,
        psgcCode: id,
        regionCode: "",
        provinceCode: "",
        address: areaNames[id] ?? id,
        type: "Outdoor",
        notes: undefined
      }));
    const allCourts = missing.length ? [...courts, ...missing] : courts;

    // 2. Give them a fresh schedule across their selected areas
    const newSlots = generateCoachSlots(coach, allCourts);
    const updatedSlots = [...newSlots, ...timeSlots];
    setTimeSlots(updatedSlots);
    saveStoredTimeSlots(updatedSlots);

    // 3. Log them in and drop them into their own portal
    setCurrentUser(user);
    saveStoredUser(user);
    setSelectedCoachId(coach.id);
    setIsRegistrationOpen(false);
    showToast(`🎉 Welcome aboard, Coach ${coach.name}! Your availability is live.`);
  };

  const handleAddReview = (review: Review) => {
    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    saveStoredReviews(updatedReviews);
    showToast("⭐ Thanks for your review!");
  };

  // Handlers for saving profile & content
  const handleSaveCoach = (updatedCoach: CoachProfile) => {
    const updatedList = coaches.map((c) => (c.id === updatedCoach.id ? updatedCoach : c));
    setCoaches(updatedList);
    saveStoredCoaches(updatedList);
    showToast("✨ Coach profile updated successfully!");
  };

  const handleSaveCoaches = (newCoaches: CoachProfile[]) => {
    setCoaches(newCoaches);
    saveStoredCoaches(newCoaches);
    showToast("✨ Coach roster updated!");
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
    setCoaches(initialCoaches);
    setServices(initialServices);
    setSiteCopy(initialSiteCopy);
    saveStoredCoaches(initialCoaches);
    saveStoredServices(initialServices);
    saveStoredSiteCopy(initialSiteCopy);
    showToast("🔄 Restored initial default content!");
  };

  // Booking Handlers — non-members must log in / register before they can book
  const requireMember = (): boolean => {
    if (!isMember(currentUser)) {
      showToast('🔒 Create an account or log in to book a session.');
      setIsRegistrationOpen(true);
      return false;
    }
    return true;
  };

  // Called from the registration footer "Already have an account?"
  const handleSwitchToLogin = () => {
    setIsRegistrationOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleOpenBooking = (service?: CoachingService, slot?: TimeSlot) => {
    if (!requireMember()) return;
    setSelectedService(service);
    setSelectedSlots(slot ? [slot] : []);
    setIsBookingModalOpen(true);
  };

  const handleOpenMultiBooking = (slots: TimeSlot[]) => {
    if (!requireMember()) return;
    setSelectedSlots(slots);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBookings = (newBookings: BookingRequest[]) => {
    const next = confirmBookings(bookings, timeSlots, newBookings);
    if (next.bookings === bookings) return; // empty input → no-op

    setBookings(next.bookings);
    saveStoredBookings(next.bookings);
    setTimeSlots(next.timeSlots);
    saveStoredTimeSlots(next.timeSlots);

    showToast(
      newBookings.length === 1
        ? `🎉 Session booked for ${newBookings[0].playerName} on ${newBookings[0].date}!`
        : `🎉 ${newBookings.length} sessions booked for ${newBookings[0].playerName}!`
    );
  };

  // Booking edit / move (Admin Dashboard)
  const handleUpdateBooking = (updatedBooking: BookingRequest) => {
    const next = updateBooking(bookings, timeSlots, updatedBooking);
    setBookings(next.bookings);
    saveStoredBookings(next.bookings);
    setTimeSlots(next.timeSlots);
    saveStoredTimeSlots(next.timeSlots);
    showToast(`💾 Booking ${updatedBooking.id} updated.`);
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

  // Payment handlers — one payment covers ALL selected sessions
  const handleProceedToPayment = (bookingsToPay: BookingRequest[]) => {
    setPendingPaymentBookings(bookingsToPay);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (results: { bookingId: string; result: PaymentResult }[]) => {
    const resultById = new Map(results.map(r => [r.bookingId, r.result]));
    const updatedBookings = bookings.map(b => {
      const res = resultById.get(b.id);
      if (!res) return b;
      return {
        ...b,
        paymentStatus: res.onCourt ? ('unpaid' as const) : ('paid' as const),
        paymentMethod: res.method,
        receiptId: res.receiptId
      };
    });
    setBookings(updatedBookings);
    saveStoredBookings(updatedBookings);

    const paidCount = results.filter(r => !r.result.onCourt).length;
    const onCourtCount = results.length - paidCount;
    if (paidCount > 0) {
      showToast(
        paidCount === results.length
          ? `💳 ${paidCount} session${paidCount > 1 ? 's' : ''} paid!`
          : `💳 ${paidCount} paid — ${onCourtCount} to settle on court.`
      );
    } else if (onCourtCount > 0) {
      showToast(`✅ ${onCourtCount} session${onCourtCount > 1 ? 's' : ''} confirmed — pay on court.`);
    }
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setPendingPaymentBookings([]);
    setIsBookingModalOpen(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 24h cancellation policy applies to players — coaches & admins can always cancel.
    if (currentUser?.role === 'user') {
      const restriction = cancellationRestriction(booking);
      if (restriction) {
        showToast(`⛔ ${restriction}`);
        return;
      }
    }

    const next = cancelBooking(bookings, timeSlots, bookingId);
    if (!next) return;

    setBookings(next.bookings);
    saveStoredBookings(next.bookings);
    setTimeSlots(next.timeSlots);
    saveStoredTimeSlots(next.timeSlots);

    showToast(`Booking cancelled and time slot made available again.`);
  };

  const openSlotsCount = timeSlots.filter(s => s.isAvailable).length;

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId) ?? coaches.find((c) => c.isActive) ?? coaches[0];
  // Landing shows only the picker; once a coach is chosen we render their portal.
  const hasSelectedCoach = selectedCoachId !== null;

  const handleSelectProvince = (provinceCode: string | null) => {
    setSelectedProvinceCode(provinceCode);
    setSelectedCityCode(null);
    setPsgcCities([]);
    if (!provinceCode) return;
    fetchCities(provinceCode)
      .then((cities) => {
        setPsgcCities(cities);
        // Augment the known court list with any PSGC city not yet seeded so time
        // slots for newly registered coaches resolve to the right city names.
        setCourts((prev) => {
          const known = new Set(prev.map((c) => c.psgcCode));
          const additions = cities
            .filter((c) => !known.has(c.code))
            .map((c): CourtLocation => ({
              id: c.code,
              name: c.name,
              psgcCode: c.code,
              regionCode: "",
              provinceCode,
              address: c.name,
              type: "Outdoor",
              notes: undefined
            }));
          return additions.length ? [...prev, ...additions] : prev;
        });
      })
      .catch(() => setPsgcCities(FALLBACK_CITIES));
  };

  const handleSelectCity = (cityCode: string | null) => {
    setSelectedCityCode(cityCode);
  };

  const handleSelectCoach = (coachId: string) => {
    setSelectedCoachId(coachId);
  };

  const handleClearCoach = () => {
    setSelectedCoachId(null);
    setSelectedProvinceCode(null);
    setSelectedCityCode(null);
  };

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

      {/* Floating back-to-top — appears once the 3rd section (Coach Profile) is reached */}
      {hasSelectedCoach && !isAdminView && <ScrollTopButton />}

      {/* Header Navigation — hidden while the admin dashboard is open */}
      {!isAdminView && (
        <Navbar
          coachProfile={selectedCoach}
          isCoachPortalOpen={isCoachPortalOpen}
          onToggleCoachPortal={() => setIsCoachPortalOpen(!isCoachPortalOpen)}
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdminDashboard={() => setIsAdminView(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
          onLogout={handleLogout}
          onOpenMyBookings={() => setIsMyBookingsOpen(true)}
          isLanding={!hasSelectedCoach}
          onFindCoach={hasSelectedCoach ? handleClearCoach : undefined}
        />
      )}

      {/* Two-stage flow: landing = picker only; then the chosen coach's portal */}
      <main>
        {isAdminView ? (
          <Suspense fallback={<MinimalLoading label="Loading dashboard…" />}>
            <AdminDashboard
              coaches={coaches}
              services={services}
              siteCopy={siteCopy}
              courts={courts}
              timeSlots={timeSlots}
              bookings={bookings}
              currentUser={currentUser}
              onSaveCoaches={handleSaveCoaches}
              onSaveServices={handleSaveServices}
              onSaveSiteCopy={handleSaveSiteCopy}
              onResetDefaults={handleResetDefaults}
              onAddSlot={handleAddSlot}
              onSaveSlot={handleSaveSlot}
              onDeleteSlot={handleDeleteSlot}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleCancelBooking}
              onLogout={handleLogout}
              onExitAdmin={() => setIsAdminView(false)}
            />
          </Suspense>
        ) : hasSelectedCoach ? (
          <>
            {/* Coach portal context bar */}
            <div className="bg-slate-900 border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 truncate">
                  Booking with <strong className="text-purple-300">Coach {selectedCoach.name}</strong>
                  <span className="text-slate-500 ml-1.5 hidden sm:inline">• {selectedCoach.locationCity}</span>
                </span>
                <button
                  onClick={handleClearCoach}
                  className="text-sm font-black text-slate-950 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 shrink-0 cursor-pointer px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  ← Find Another Coach
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <Hero
              coachProfile={selectedCoach}
              siteCopy={siteCopy}
              availableSlotsCount={openSlotsCount}
              onOpenBooking={() => handleOpenBooking()}
              onScrollToAvailability={() => scrollToSection('#availability')}
            />

            {/* Interactive Schedule & Availability Calendar */}
            <AvailabilityCalendar
              timeSlots={timeSlots}
              courts={courts}
              coachId={selectedCoach.id}
              coachName={selectedCoach.name}
              availableDays={selectedCoach.availableDays}
              onBookSelectedSlots={(slots) => handleOpenMultiBooking(slots)}
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onPayBooking={(b) => handleProceedToPayment([b])}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              currentUser={currentUser}
              onEditSlot={handleEditSlot}
              onDeleteSlot={handleDeleteSlot}
              onAddSlot={handleAddSlot}
            />

            {/* Coach Bio & Preferred Courts */}
            <CoachProfileSection
              coachProfile={selectedCoach}
              courts={courts}
              onOpenBooking={() => handleOpenBooking()}
            />

            {/* Coaching Services & Rates Section — scoped to the selected coach */}
            <ServicesSection
              services={services.filter((s) => s.coachId === selectedCoach.id)}
              siteCopy={siteCopy}
              onSelectService={() => scrollToSection('#availability')}
            />

            {/* Verified Player Reviews */}
            <Testimonials
              reviews={reviews}
              onAddReview={handleAddReview}
            />

            {/* FAQ */}
            <FAQSection />
          </>
        ) : (
          /* Landing — hero banner + the PSGC province → city picker */
          <>
            <HeroBanner />
            <Suspense fallback={<MinimalLoading label="Loading…" />}>
            <FindCoachSection
              provinces={psgcProvinces}
              cities={psgcCities}
              loading={psgcLoading && psgcProvinces.length === 0}
              coaches={coaches}
              selectedProvinceCode={selectedProvinceCode}
              selectedCityCode={selectedCityCode}
              onSelectProvince={handleSelectProvince}
              onSelectCity={handleSelectCity}
              onSelectCoach={handleSelectCoach}
            />
            </Suspense>
          </>
        )}
      </main>

      {/* Footer — only on a coach's portal page */}
      {hasSelectedCoach && !isAdminView && (
        <Footer
          coachProfile={selectedCoach}
          onOpenBooking={() => handleOpenBooking()}
        />
      )}

      {/* Modals & Portals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        coaches={coaches}
      />

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onRegisterClient={handleRegisterClient}
        onRegisterCoach={handleRegisterCoach}
        onSwitchToLogin={handleSwitchToLogin}
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
        onPayBooking={(b) => handleProceedToPayment([b])}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        coach={selectedCoach}
        currentUser={currentUser}
        services={services.filter((s) => s.coachId === selectedCoach.id)}
        timeSlots={timeSlots}
        courts={courts}
        preselectedService={selectedService}
        preselectedSlots={selectedSlots}
        onConfirmBookings={handleConfirmBookings}
        onProceedToPayment={handleProceedToPayment}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        bookings={pendingPaymentBookings}
        onPaymentComplete={handlePaymentComplete}
      />

      <CoachPortal
        isOpen={isCoachPortalOpen}
        onClose={() => setIsCoachPortalOpen(false)}
        coachProfile={selectedCoach}
        timeSlots={timeSlots}
        bookings={bookings}
        courts={courts}
        currentUser={currentUser}
        onAddSlot={handleAddSlot}
        onDeleteSlot={handleDeleteSlot}
        onCancelBooking={handleCancelBooking}
        onSaveCoach={handleSaveCoach}
      />

    </div>
  );
}

