import React, { useState, useEffect } from 'react';
import { CoachingService, CourtLocation, TimeSlot, BookingRequest, SkillLevel, CoachProfile, UserAccount } from '../types';
import { X, Calendar, Clock, MapPin, CheckCircle, User, Mail, Phone, Sparkles, Download, ArrowRight, CreditCard } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach?: CoachProfile;
  currentUser?: UserAccount | null;
  services: CoachingService[];
  timeSlots: TimeSlot[];
  courts: CourtLocation[];
  preselectedService?: CoachingService;
  /** One or more time slots picked from the live schedule — each becomes its own booking. */
  preselectedSlots?: TimeSlot[];
  /** Called once with all confirmed bookings — App marks every time slot booked in a single pass. */
  onConfirmBookings: (bookings: BookingRequest[]) => void;
  /** Called right after bookings are confirmed, to open the payment portal for ALL of them. */
  onProceedToPayment?: (bookings: BookingRequest[]) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  coach,
  currentUser,
  services,
  timeSlots,
  courts,
  preselectedService,
  preselectedSlots,
  onConfirmBookings,
  onProceedToPayment
}) => {
  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  // Player Details
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('3.5 - Intermediate');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['3rd Shot Drop & Drive']);
  const [notes, setNotes] = useState('');

  // Submission / Confirmation state
  const [confirmedBookings, setConfirmedBookings] = useState<BookingRequest[]>([]);

  const availableFocusOptions = [
    '3rd Shot Drop & Drive Selection',
    'Kitchen Dinking Battles & Resets',
    'Serve & Return Depth Strategy',
    'Stacking & Partner Communication',
    'Fast Hands & Counter-Attacks',
    'Transition Zone Footwork',
    'Tournament Match Strategy'
  ];

  const coachSlots = timeSlots.filter(s => s.isAvailable && s.coachId === coach?.id);

  useEffect(() => {
    // Fresh flow each time the modal opens — drop any stale confirmation state.
    setConfirmedBookings([]);

    // Prefill player details from the logged-in account.
    if (currentUser) {
      setPlayerName(currentUser.name ?? '');
      setPlayerEmail(currentUser.email ?? '');
      setPlayerPhone(currentUser.phone ?? '');
      if (currentUser.skillLevel) setSkillLevel(currentUser.skillLevel);
    }

    if (preselectedService) {
      setSelectedServiceId(preselectedService.id);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }

    const slots = preselectedSlots && preselectedSlots.length > 0 ? preselectedSlots : [];
    if (slots.length > 0) {
      setSelectedSlots(slots);
      setSelectedCourtId(slots[0].courtLocationId);
    } else if (coachSlots.length > 0) {
      setSelectedSlots([coachSlots[0]]);
      setSelectedCourtId(coachSlots[0].courtLocationId);
    }
  }, [preselectedService, preselectedSlots, isOpen, coach?.id]);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];
  const currentSlot = selectedSlots[0];
  const currentCourt = courts.find(c => c.id === selectedCourtId) || courts[0];

  const handleToggleFocus = (option: string) => {
    if (selectedFocus.includes(option)) {
      setSelectedFocus(selectedFocus.filter(f => f !== option));
    } else {
      setSelectedFocus([...selectedFocus, option]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || selectedSlots.length === 0) return;

    const newBookings: BookingRequest[] = selectedSlots.map((slot, i) => ({
      id: `bk-${Date.now().toString().slice(-6)}-${i}`,
      coachId: coach?.id ?? slot.coachId,
      coachName: coach?.name ?? 'Coach',
      serviceId: currentService.id,
      serviceName: currentService.title,
      date: slot.date,
      timeSlotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: currentService.durationMinutes,
      courtLocationName: slot.courtLocationName || currentCourt.name,
      playerName,
      playerEmail: currentUser?.email ?? playerEmail,
      playerPhone,
      playerSkillLevel: skillLevel,
      focusAreas: selectedFocus,
      notes,
      totalPrice: currentService.price,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString()
    }));

    onConfirmBookings(newBookings);
    setConfirmedBookings(newBookings);
    // Payment is an explicit next step on the confirmation screen — opening it here
    // would cover the confirmation before the user ever sees it.
  };

  // ── .ics helpers ─────────────────────────────────────────────────────
  const to24h = (t: string): number => {
    const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(m[2], 10);
  };

  const icalDateStr = (bookingDate: string, time: string): string => {
    const [y, mo, d] = bookingDate.split('-').map(Number);
    const totalMin = to24h(time);
    const dt = new Date(y, mo - 1, d, Math.floor(totalMin / 60), totalMin % 60);
    return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };

  const icalEscape = (s: string): string =>
    s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const handleDownloadCalendar = () => {
    if (confirmedBookings.length !== 1) return;
    const b = confirmedBookings[0];

    const dtStart = icalDateStr(b.date, b.startTime);
    const dtEnd   = icalDateStr(b.date, b.endTime);
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PB Coach Pickleball//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${b.id}@pbcoach.ph`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${icalEscape(`PB Coach \u2013 ${b.serviceName} with Coach ${b.coachName}`)}`,
      `DESCRIPTION:${icalEscape(`PB Coach\nPlayer: ${b.playerName}\nSkill Level: ${b.playerSkillLevel}\nFocus: ${b.focusAreas.join(', ')}`)}`,
      `LOCATION:${icalEscape(b.courtLocationName)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `pickleball-session-${b.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden my-8 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Sign Up for Coaching Session</h3>
              <p className="text-xs text-slate-400">Reserve your time slot with Coach {coach?.name ?? 'Coach'} & PB Coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {confirmedBookings.length > 0 ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6 flex-1 min-h-0 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-purple-400/20 text-purple-400 flex items-center justify-center mx-auto ring-4 ring-purple-400/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                {confirmedBookings.length === 1
                  ? `Booking Confirmed • Ref: #${confirmedBookings[0].id}`
                  : `${confirmedBookings.length} Sessions Confirmed`}
              </span>
              <h2 className="text-2xl font-black text-white mt-3">You're All Set, {confirmedBookings[0].playerName}!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                Your session{confirmedBookings.length > 1 ? 's are' : ' is'} reserved and <span className="text-purple-300 font-semibold">{confirmedBookings[0].coachName}</span> can see them on their dashboard. Meet your coach at the court!
              </p>
            </div>

            {/* Session Summary Card */}
            {confirmedBookings.length === 1 ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{confirmedBookings[0].serviceName}</h4>
                    <p className="text-xs text-slate-400">{confirmedBookings[0].durationMinutes} Mins • Coach {confirmedBookings[0].coachName} (PB Coach)</p>
                  </div>
                  <span className="text-lg font-black text-purple-400">₱{confirmedBookings[0].totalPrice}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Date: <strong className="text-white">{confirmedBookings[0].date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Time: <strong className="text-white">{confirmedBookings[0].startTime} – {confirmedBookings[0].endTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Court: <strong className="text-white">{confirmedBookings[0].courtLocationName}</strong></span>
                  </div>
                </div>

                {confirmedBookings[0].focusAreas.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Focus Areas: </span>
                    <span className="text-xs text-slate-200">{confirmedBookings[0].focusAreas.join(', ')}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Multiple sessions summary */
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{confirmedBookings.length} Sessions Booked · {confirmedBookings[0].serviceName}</h4>
                    <p className="text-xs text-slate-400">{confirmedBookings[0].durationMinutes} Mins each • Coach {confirmedBookings[0].coachName} (PB Coach)</p>
                  </div>
                  <span className="text-lg font-black text-purple-400">
                    ₱{confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0)}
                  </span>
                </div>
                <div className="space-y-2">
                  {confirmedBookings.map(b => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border border-slate-800 rounded-lg px-3 py-2">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {b.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.startTime} – {b.endTime}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.courtLocationName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onProceedToPayment?.(confirmedBookings)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
              </button>
              {confirmedBookings.length === 1 && (
                <button
                  onClick={handleDownloadCalendar}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-400 text-slate-950 font-bold text-sm hover:bg-purple-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Add to Calendar (.ics)
                </button>
              )}
              <button
                onClick={() => {
                  setConfirmedBookings([]);
                  onClose();
                }}
                className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
            {confirmedBookings.length > 1 && (
              <p className="text-[10px] text-slate-500">
                One payment covers all {confirmedBookings.length} sessions at once.
              </p>
            )}
          </div>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto">

            {/* Step 1: Service & Time Slot Selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1: Session & Date
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Service */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Coaching Package</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} (₱{s.price} • {s.durationMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chosen Time Slot(s) (picked from the live schedule) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot</label>
                  <div className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>
                      {selectedSlots.length > 0
                        ? selectedSlots.length === 1
                          ? `${selectedSlots[0].date} @ ${selectedSlots[0].startTime} – ${selectedSlots[0].endTime}`
                          : `${selectedSlots.length} slots selected`
                        : 'No open slots available'}
                    </span>
                  </div>
                  {selectedSlots.length > 1 && (
                    <ul className="mt-2 space-y-1">
                      {selectedSlots.map(s => (
                        <li key={s.id} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          {s.date} · {s.startTime} – {s.endTime} · {s.courtLocationName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Price Total */}
              {currentService && selectedSlots.length > 0 && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <span className="text-slate-400">Total{selectedSlots.length > 1 ? ` (${selectedSlots.length} sessions)` : ''}: </span>
                  <span className="font-black text-purple-400 text-sm">₱{currentService.price * selectedSlots.length}</span>
                </div>
              )}
            </div>

            {/* Step 2: Player Information */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Step 2: Player Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="jordan@example.com"
                      value={playerEmail}
                      readOnly={!!currentUser}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      className={`w-full pl-9 border rounded-xl px-3 py-2 text-xs outline-none ${
                        currentUser
                          ? 'bg-slate-950 border-slate-600 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-400'
                      }`}
                    />
                    {currentUser && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Linked to your account ({currentUser.email})</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+63 917 000 0000"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">DUPR / Skill Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
                  >
                    <option value="2.5 - Beginner">2.5 - Beginner</option>
                    <option value="3.0 - Advanced Beginner">3.0 - Advanced Beginner</option>
                    <option value="3.5 - Intermediate">3.5 - Intermediate</option>
                    <option value="4.0 - Advanced Intermediate">4.0 - Advanced Intermediate</option>
                    <option value="4.5+ - Advanced / Tournament">4.5+ - Advanced / Tournament</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={selectedSlots.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Confirm Booking{selectedSlots.length > 1 ? `s (${selectedSlots.length})` : ''}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-2">
                Free cancellation up to 24 hours before your scheduled session time.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
