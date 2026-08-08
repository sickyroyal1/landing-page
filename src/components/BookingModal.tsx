import React, { useState, useEffect } from 'react';
import { CoachingService, CourtLocation, TimeSlot, BookingRequest, SkillLevel } from '../types';
import { X, Calendar, Clock, MapPin, CheckCircle, ShieldCheck, User, Mail, Phone, Target, Sparkles, Download, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: CoachingService[];
  timeSlots: TimeSlot[];
  courts: CourtLocation[];
  preselectedService?: CoachingService;
  preselectedSlot?: TimeSlot;
  onConfirmBooking: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  timeSlots,
  courts,
  preselectedService,
  preselectedSlot,
  onConfirmBooking
}) => {
  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  // Player Details
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('3.5 - Intermediate');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['3rd Shot Drop & Drive']);
  const [notes, setNotes] = useState('');

  // Submission / Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRequest | null>(null);

  const availableFocusOptions = [
    '3rd Shot Drop & Drive Selection',
    'Kitchen Dinking Battles & Resets',
    'Serve & Return Depth Strategy',
    'Stacking & Partner Communication',
    'Fast Hands & Counter-Attacks',
    'Transition Zone Footwork',
    'Tournament Match Strategy'
  ];

  const availableSlots = timeSlots.filter(s => s.isAvailable);

  useEffect(() => {
    if (preselectedService) {
      setSelectedServiceId(preselectedService.id);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }

    if (preselectedSlot) {
      setSelectedSlotId(preselectedSlot.id);
      setSelectedCourtId(preselectedSlot.courtLocationId);
    } else if (availableSlots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(availableSlots[0].id);
      setSelectedCourtId(availableSlots[0].courtLocationId);
    }
  }, [preselectedService, preselectedSlot, isOpen]);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];
  const currentSlot = timeSlots.find(s => s.id === selectedSlotId);
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
    if (!currentService || !currentSlot) return;

    const newBooking: BookingRequest = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      serviceId: currentService.id,
      serviceName: currentService.title,
      date: currentSlot.date,
      timeSlotId: currentSlot.id,
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
      durationMinutes: currentService.durationMinutes,
      courtLocationName: currentSlot.courtLocationName || currentCourt.name,
      playerName,
      playerEmail,
      playerPhone,
      playerSkillLevel: skillLevel,
      focusAreas: selectedFocus,
      notes,
      totalPrice: currentService.price,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    onConfirmBooking(newBooking);
    setConfirmedBooking(newBooking);
  };

  // Generate .ics calendar download file string
  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Pickleball Coaching//EN
BEGIN:VEVENT
SUMMARY:FD Academy Pickleball Private Session with Coach Francis (${confirmedBooking.serviceName})
DESCRIPTION:FD Academy - ${confirmedBooking.serviceName}\\nPlayer: ${confirmedBooking.playerName}\\nSkill Level: ${confirmedBooking.playerSkillLevel}\\nFocus: ${confirmedBooking.focusAreas.join(', ')}
LOCATION:${confirmedBooking.courtLocationName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `pickleball-session-${confirmedBooking.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Sign Up for Coaching Session</h3>
              <p className="text-xs text-slate-400">Reserve your time slot with Coach Francis & FD Academy</p>
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
        {confirmedBooking ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-400/20 text-purple-400 flex items-center justify-center mx-auto ring-4 ring-purple-400/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                Booking Confirmed • Ref: #{confirmedBooking.id}
              </span>
              <h2 className="text-2xl font-black text-white mt-3">You're All Set, {confirmedBooking.playerName}!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                A confirmation email and session preparation guide has been dispatched to <span className="text-purple-300 font-semibold">{confirmedBooking.playerEmail}</span>.
              </p>
            </div>

            {/* Session Summary Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{confirmedBooking.serviceName}</h4>
                  <p className="text-xs text-slate-400">{confirmedBooking.durationMinutes} Mins • Coach Francis (FD Academy)</p>
                </div>
                <span className="text-lg font-black text-purple-400">${confirmedBooking.totalPrice}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Date: <strong className="text-white">{confirmedBooking.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time: <strong className="text-white">{confirmedBooking.startTime} – {confirmedBooking.endTime}</strong></span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Court: <strong className="text-white">{confirmedBooking.courtLocationName}</strong></span>
                </div>
              </div>

              {confirmedBooking.focusAreas.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Focus Areas: </span>
                  <span className="text-xs text-slate-200">{confirmedBooking.focusAreas.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownloadCalendar}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-400 text-slate-950 font-bold text-sm hover:bg-purple-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Add to Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  onClose();
                }}
                className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
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
                        {s.title} (${s.price} • {s.durationMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Time Slot */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Available Time Slot</label>
                  <select
                    value={selectedSlotId}
                    onChange={(e) => {
                      setSelectedSlotId(e.target.value);
                      const slot = timeSlots.find(s => s.id === e.target.value);
                      if (slot) setSelectedCourtId(slot.courtLocationId);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
                  >
                    {availableSlots.length === 0 ? (
                      <option value="">No open slots available</option>
                    ) : (
                      availableSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.date} @ {slot.startTime} – {slot.courtLocationName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Price & Location Preview Bar */}
              {currentService && currentSlot && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">{currentSlot.courtLocationName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Total: </span>
                    <span className="font-black text-purple-400 text-sm">${currentService.price}</span>
                  </div>
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
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
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

            {/* Step 3: Focus Areas & Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Step 3: What do you want to work on?
              </h4>

              <div className="flex flex-wrap gap-2">
                {availableFocusOptions.map((opt) => {
                  const isChecked = selectedFocus.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleToggleFocus(opt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-400/20 text-purple-300 border-purple-400/40 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {opt}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Additional Notes / Questions for Coach Francis</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Struggling with wrist pop-ups, bringing my tournament partner, prefer indoor courts, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedSlotId}
                className="w-full py-4 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Confirm & Reserve Session
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
