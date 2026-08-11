import React, { useState, useEffect } from 'react';
import { BookingRequest, CoachProfile, CoachingService, SkillLevel, TimeSlot } from '../types';
import { X, Calendar, Clock, MapPin, Save, User, Mail, Phone, ShieldCheck, Tag, Wallet, StickyNote, AlertCircle } from 'lucide-react';

interface BookingEditModalProps {
  booking: BookingRequest;
  coaches: CoachProfile[];
  services: CoachingService[];
  timeSlots: TimeSlot[];
  onSave: (updated: BookingRequest) => void;
  onClose: () => void;
}

const SKILL_LEVELS: SkillLevel[] = [
  '2.5 - Beginner',
  '3.0 - Advanced Beginner',
  '3.5 - Intermediate',
  '4.0 - Advanced Intermediate',
  '4.5+ - Advanced / Tournament'
];

const STATUSES: BookingRequest['status'][] = ['confirmed', 'pending', 'cancelled'];
const PAYMENT_STATUSES: BookingRequest['paymentStatus'][] = ['unpaid', 'processing', 'paid', 'refunded'];

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  coaches,
  services,
  timeSlots,
  onSave,
  onClose
}) => {
  // Session
  const [coachId, setCoachId] = useState(booking.coachId);
  const [serviceId, setServiceId] = useState(booking.serviceId);
  const [date, setDate] = useState(booking.date);
  const [timeSlotId, setTimeSlotId] = useState<string>(booking.timeSlotId);

  // Player
  const [playerName, setPlayerName] = useState(booking.playerName);
  const [playerEmail, setPlayerEmail] = useState(booking.playerEmail);
  const [playerPhone, setPlayerPhone] = useState(booking.playerPhone);
  const [playerSkillLevel, setPlayerSkillLevel] = useState<SkillLevel>(booking.playerSkillLevel);
  const [focusAreasText, setFocusAreasText] = useState(booking.focusAreas.join(', '));

  // Status / payment
  const [status, setStatus] = useState<BookingRequest['status']>(booking.status);
  const [paymentStatus, setPaymentStatus] = useState<BookingRequest['paymentStatus']>(booking.paymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod ?? '');
  const [notes, setNotes] = useState(booking.notes ?? '');

  // Validation
  const [error, setError] = useState('');

  // Re-seed local state when a different booking is opened
  useEffect(() => {
    setCoachId(booking.coachId);
    setServiceId(booking.serviceId);
    setDate(booking.date);
    setTimeSlotId(booking.timeSlotId);
    setPlayerName(booking.playerName);
    setPlayerEmail(booking.playerEmail);
    setPlayerPhone(booking.playerPhone);
    setPlayerSkillLevel(booking.playerSkillLevel);
    setFocusAreasText(booking.focusAreas.join(', '));
    setStatus(booking.status);
    setPaymentStatus(booking.paymentStatus);
    setPaymentMethod(booking.paymentMethod ?? '');
    setNotes(booking.notes ?? '');
    setError('');
  }, [booking]);

  const coach = coaches.find(c => c.id === coachId);
  const service = services.find(s => s.id === serviceId);

  // A booking edit doubles as a "move": changing coach/date/slot updates the slot link.
  const currentSlot = timeSlots.find(s => s.id === booking.timeSlotId);
  const slotOptions = timeSlots.filter(s => {
    const isCurrent = s.id === booking.timeSlotId && s.coachId === coachId && s.date === date;
    const isCandidate = s.coachId === coachId && s.date === date && s.isAvailable;
    return isCurrent || isCandidate;
  });

  const handleCoachChange = (v: string) => {
    setCoachId(v);
    setTimeSlotId(''); // forces a slot choice for the new coach
    // Reset service to first available for the new coach
    const available = services.filter(s => s.coachId === v);
    setServiceId(available[0]?.id ?? '');
  };

  const handleDateChange = (v: string) => {
    setDate(v);
    const sel = timeSlots.find(s => s.id === timeSlotId);
    if (sel && sel.date !== v) setTimeSlotId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!coachId || !serviceId) {
      setError('Please pick a coach and a service.');
      return;
    }

    // Moving to a new coach/date requires an explicit slot choice
    if (timeSlotId === '' && (coachId !== booking.coachId || date !== booking.date)) {
      setError('Pick a time slot for the updated coach & date.');
      return;
    }

    const finalSlot = timeSlots.find(s => s.id === timeSlotId) ?? timeSlots.find(s => s.id === booking.timeSlotId);

    const updated: BookingRequest = {
      ...booking,
      coachId,
      coachName: coach?.name ?? booking.coachName,
      serviceId,
      serviceName: service?.title ?? booking.serviceName,
      durationMinutes: service?.durationMinutes ?? booking.durationMinutes,
      totalPrice: service?.price ?? booking.totalPrice,
      date,
      timeSlotId: finalSlot?.id ?? booking.timeSlotId,
      startTime: finalSlot?.startTime ?? booking.startTime,
      endTime: finalSlot?.endTime ?? booking.endTime,
      courtLocationName: finalSlot?.courtLocationName ?? booking.courtLocationName,
      playerName,
      playerEmail,
      playerPhone,
      playerSkillLevel,
      focusAreas: focusAreasText.split(',').map(s => s.trim()).filter(Boolean),
      status,
      paymentStatus,
      paymentMethod: paymentMethod || undefined,
      notes
    };

    onSave(updated);
    onClose();
  };

  const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none";
  const labelClass = "block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Edit Booking</h3>
              <p className="text-xs text-slate-400">Ref #{booking.id} · {booking.playerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Session & schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Session & Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Coach</label>
                <select value={coachId} onChange={(e) => handleCoachChange(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">Select coach…</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.isActive ? '' : ' (hidden)'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Service</label>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">Select service…</option>
                  {services.filter(s => s.coachId === coachId).map(s => (
                    <option key={s.id} value={s.id}>{s.title} (₱{s.price} • {s.durationMinutes} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Time Slot (change = move)</label>
                <select value={timeSlotId} onChange={(e) => setTimeSlotId(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  {timeSlotId === '' && <option value="">— keep current / pick a slot —</option>}
                  {slotOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.startTime}–{s.endTime} · {s.courtLocationName}
                      {s.id === booking.timeSlotId ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
                {slotOptions.length === 0 && (
                  <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-400">
                    <Clock className="w-3.5 h-3.5" /> No open slots for this coach & date.
                  </p>
                )}
              </div>
            </div>

            {/* Price readout */}
            {service && (
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> {service.title} · {service.durationMinutes} mins
                </span>
                <span className="font-black text-purple-400 text-sm">₱{service.price}</span>
              </div>
            )}
          </div>

          {/* Player */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Player Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Skill Level</label>
                <select value={playerSkillLevel} onChange={(e) => setPlayerSkillLevel(e.target.value as SkillLevel)} className={`${inputClass} cursor-pointer`}>
                  {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={playerEmail} onChange={(e) => setPlayerEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={playerPhone} onChange={(e) => setPlayerPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Focus Areas (comma separated)</label>
                <input type="text" value={focusAreasText} onChange={(e) => setFocusAreasText(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Status & payment */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Status & Payment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Booking Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as BookingRequest['status'])} className={`${inputClass} cursor-pointer`}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as BookingRequest['paymentStatus'])} className={`${inputClass} cursor-pointer`}>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">— none —</option>
                  <option value="card">Card</option>
                  <option value="ewallet">E-wallet</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="oncourt">Pay on Court</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-400 hover:bg-purple-300 text-slate-950 text-xs font-black transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Booking
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Changing the time slot moves the booking and frees the old slot automatically.
          </p>

        </form>
      </div>
    </div>
  );
};
