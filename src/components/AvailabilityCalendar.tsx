import React, { useState, useMemo, useEffect } from 'react';
import { TimeSlot, CourtLocation, UserAccount, BookingRequest } from '../types';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Lock, Sparkles, AlertCircle, ShieldCheck, Edit3, Trash2, Plus, ToggleLeft, ToggleRight, ArrowRight, Check } from 'lucide-react';
import { BookingCard } from './BookingCard';
import { canCancelBooking, cancellationRestriction } from '../bookingLogic';
import { todayLocalStr } from '../data/mockData';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AvailabilityCalendarProps {
  timeSlots: TimeSlot[];
  courts: CourtLocation[];
  coachId: string;
  coachName?: string;
  /** Days of week this coach regularly coaches (0=Sun … 6=Sat). Undefined = every day. */
  availableDays?: number[];
  /** Called when the client clicks the floating "Book Slot" button with their selected time slots. */
  onBookSelectedSlots: (slots: TimeSlot[]) => void;
  currentUser?: UserAccount | null;
  onEditSlot?: (slot: TimeSlot) => void;
  onDeleteSlot?: (slotId: string) => void;
  onAddSlot?: (slot: TimeSlot) => void;
  /** All bookings — used for the "My Booking" tab. */
  bookings?: BookingRequest[];
  /** Cancel a booking from the "My Booking" tab. */
  onCancelBooking?: (bookingId: string) => void;
  /** Pay for an unpaid session from the "My Booking" tab. */
  onPayBooking?: (booking: BookingRequest) => void;
  /** Open the auth modal (used by the "My Booking" tab for guests). */
  onOpenAuthModal?: () => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  timeSlots,
  courts,
  coachId,
  coachName,
  availableDays,
  onBookSelectedSlots,
  currentUser,
  onEditSlot,
  onDeleteSlot,
  onAddSlot,
  bookings = [],
  onCancelBooking,
  onPayBooking,
  onOpenAuthModal
}) => {
  const coachAvailableDays = availableDays ?? ALL_DAYS;
  const dayIndexOf = (dateStr: string) => new Date(dateStr + 'T00:00:00').getDay();
  // This coach's slots (scoped to the selected coach)
  const coachSlots = useMemo(() => timeSlots.filter(s => s.coachId === coachId), [timeSlots, coachId]);

  // Extract unique dates from slots, sorted
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(coachSlots.map(s => s.date))).sort();
    return dates;
  }, [coachSlots]);

  const [selectedDate, setSelectedDate] = useState<string>(uniqueDates[0] || todayLocalStr());

  const isAdmin = currentUser?.role === 'admin';

  // Inline Quick Add Slot state for Admin
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStartTime, setAddStartTime] = useState('08:00 AM');
  const [addEndTime, setAddEndTime] = useState('09:00 AM');
  const [addCourtId, setAddCourtId] = useState(courts[0]?.id || '');

  // Client multi-select
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'mybookings'>('schedule');

  // Clear selection when coach or date changes
  useEffect(() => { setSelectedSlotIds([]); }, [coachId, selectedDate]);

  // Filter bookings for My Booking tab — keyed by account email
  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(
      b => b.playerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [bookings, currentUser]);

  // Filter slots for current view
  const currentSlots = useMemo(() => {
    return coachSlots.filter(slot => {
      if (slot.date !== selectedDate) return false;
      // Hide slots on days the coach is regularly unavailable (e.g. weekends off)
      if (!coachAvailableDays.includes(dayIndexOf(slot.date))) return false;
      return true;
    }).sort((a, b) => {
      // Sort chronologically by start time
      const getHour = (t: string) => {
        const isPM = t.includes('PM');
        let h = parseInt(t.split(':')[0], 10);
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
        return h;
      };
      return getHour(a.startTime) - getHour(b.startTime);
    });
  }, [coachSlots, selectedDate, coachAvailableDays, dayIndexOf]);

  // Count open slots per date
  const openCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    coachSlots.forEach(slot => {
      if (slot.isAvailable) {
        counts[slot.date] = (counts[slot.date] || 0) + 1;
      }
    });
    return counts;
  }, [coachSlots]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    return { dayName, monthName, dayNum, isToday: todayLocalStr() === dateStr };
  };

  const handleCreateQuickSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddSlot) return;
    const court = courts.find(c => c.id === addCourtId) || courts[0];
    const created: TimeSlot = {
      id: `slot-${Date.now()}`,
      coachId,
      date: selectedDate,
      startTime: addStartTime,
      endTime: addEndTime,
      courtLocationId: court.id,
      courtLocationName: court.name,
      isAvailable: true
    };
    onAddSlot(created);
    setShowAddForm(false);
  };

  const handleToggleSlot = (slotId: string) => {
    setSelectedSlotIds(prev =>
      prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
    );
  };

  const handleBookSelected = () => {
    const slots = currentSlots.filter(s => selectedSlotIds.includes(s.id));
    if (slots.length === 0) return;
    onBookSelectedSlots(slots);
    setSelectedSlotIds([]);
  };

  // Show tabs on the client portal (not in admin dashboard)
  const showTabs = !isAdmin;

  return (
    <section id="availability" className="py-20 bg-slate-900 text-white relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-extrabold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            Regular Coaching Hours
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {activeTab === 'mybookings' ? 'My Booking' : `Live Schedule (8:00 AM – 4:00 PM)`}
          </h2>
          <p className="text-slate-300 text-base">
            {activeTab === 'mybookings'
              ? 'Your upcoming and past coaching sessions.'
              : 'Select a date below to book.'}
          </p>

          {activeTab === 'schedule' && coachAvailableDays.length < 7 && (
            <p className="text-sm font-semibold text-slate-400">
              Regularly available:{' '}
              <span className="text-amber-300">{coachAvailableDays.map(d => DAY_NAMES[d]).join(' · ')}</span>
              <span className="text-slate-500"> — days not listed are weekly days off.</span>
            </p>
          )}

          {isAdmin && activeTab === 'schedule' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Mode Active — You can edit, lock, or add time slots directly in the table!</span>
            </div>
          )}
        </div>

        {/* Tab bar — for clients, not admins */}
        {showTabs && (
          <div className="flex border-b border-slate-800 bg-slate-950/30 rounded-t-xl -mt-2 mb-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer rounded-t-xl ${
                activeTab === 'schedule'
                  ? 'border-purple-400 text-purple-400 bg-purple-400/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Live Schedule
            </button>
            <button
              onClick={() => setActiveTab('mybookings')}
              className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer rounded-t-xl ${
                activeTab === 'mybookings'
                  ? 'border-purple-400 text-purple-400 bg-purple-400/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              My Booking{myBookings.length > 0 ? ` (${myBookings.length})` : ''}
            </button>
          </div>
        )}

        {/* ── Live Schedule Tab ─────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <>
            {/* Date Selector Carousel */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Select Date:
                </span>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showAddForm ? 'Close Add Slot Form' : `Add Slot for ${selectedDate}`}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                {uniqueDates.map((dateStr) => {
                  const { dayName, monthName, dayNum, isToday } = formatDateLabel(dateStr);
                  const openCount = openCountByDate[dateStr] || 0;
                  const isSelected = selectedDate === dateStr;
                  const isOffDay = !coachAvailableDays.includes(dayIndexOf(dateStr));

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isOffDay && setSelectedDate(dateStr)}
                      disabled={isOffDay}
                      title={isOffDay ? 'Weekly day off' : undefined}
                      className={`flex-shrink-0 min-w-[105px] p-3 rounded-2xl border text-center transition-all relative ${
                        isSelected
                          ? 'bg-purple-400 text-slate-950 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/40 font-bold cursor-pointer'
                          : isOffDay
                            ? 'bg-slate-900 text-slate-500 border-slate-800 opacity-50 cursor-not-allowed'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 cursor-pointer'
                      }`}
                    >
                      {isToday && (
                        <span className={`absolute top-1.5 right-1.5 text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                          isSelected ? 'bg-slate-950 text-purple-400' : 'bg-purple-400 text-slate-950'
                        }`}>
                          Today
                        </span>
                      )}

                      <div className={`text-xs uppercase font-semibold ${isSelected ? 'text-slate-950/80' : 'text-slate-400'}`}>
                        {dayName}
                      </div>
                      <div className="text-xl font-black my-0.5">
                        {monthName} {dayNum}
                      </div>

                      <div className="mt-1">
                        {isOffDay ? (
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-500'
                          }`}>
                            Off
                          </span>
                        ) : openCount > 0 ? (
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                          }`}>
                            {openCount} open
                          </span>
                        ) : (
                          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            Full
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Admin Add Slot Form */}
            {isAdmin && showAddForm && (
              <form onSubmit={handleCreateQuickSlot} className="mb-8 p-5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Custom Time Slot (8:00 AM - 4:00 PM) for {selectedDate}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={addStartTime}
                      onChange={(e) => setAddStartTime(e.target.value)}
                      placeholder="08:00 AM"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">End Time</label>
                    <input
                      type="text"
                      value={addEndTime}
                      onChange={(e) => setAddEndTime(e.target.value)}
                      placeholder="09:00 AM"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Court Location</label>
                    <select
                      value={addCourtId}
                      onChange={(e) => setAddCourtId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {courts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Publish Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Schedule Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
              {currentSlots.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No time slots on this date</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try selecting a different date above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-6">Time Slot</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        {isAdmin && <th className="py-4 px-6 text-right">Action / Management</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {currentSlots.map((slot) => {
                        const isSelected = selectedSlotIds.includes(slot.id);
                        const canSelect = slot.isAvailable && !isAdmin;

                        const rowBg = isSelected
                          ? 'bg-purple-400/10 ring-1 ring-inset ring-purple-400/40'
                          : canSelect
                            ? 'hover:bg-purple-950/20 group cursor-pointer'
                            : slot.isAvailable
                              ? 'hover:bg-purple-950/20 group'
                              : slot.bookedByBookingId
                                ? 'bg-rose-950/20 text-slate-400'
                                : 'bg-slate-950/40 text-slate-500 opacity-75';

                        return (
                          <tr
                            key={slot.id}
                            onClick={canSelect ? () => handleToggleSlot(slot.id) : undefined}
                            className={`transition-colors ${rowBg}`}
                          >
                            {/* Time Slot Column */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                {canSelect && (
                                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                    isSelected
                                      ? 'bg-purple-400 border-purple-400 shadow-sm shadow-purple-400/30'
                                      : 'border-slate-600 group-hover:border-slate-400'
                                  }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-950" strokeWidth={3} />}
                                  </div>
                                )}
                                <Clock className={`w-4 h-4 ${slot.isAvailable ? 'text-emerald-400' : slot.bookedByBookingId ? 'text-rose-400' : 'text-slate-600'}`} />
                                <span className="font-extrabold text-white text-base">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="py-4 px-6 text-center whitespace-nowrap">
                              {slot.isAvailable ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-extrabold border px-3 py-1 rounded-full ${
                                  isSelected
                                    ? 'bg-purple-400/10 text-purple-300 border-purple-400/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {isSelected
                                    ? <Check className="w-3.5 h-3.5" />
                                    : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  {isSelected ? 'Selected' : 'Available'}
                                </span>
                              ) : slot.bookedByBookingId ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full">
                                  <Lock className="w-3.5 h-3.5" />
                                  Booked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                                  <Lock className="w-3.5 h-3.5" />
                                  Blocked
                                </span>
                              )}
                            </td>

                            {/* Action Column — Admin only */}
                            {isAdmin && (
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => onEditSlot && onEditSlot(slot)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                    title="Edit slot details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => onEditSlot && onEditSlot({ ...slot, isAvailable: !slot.isAvailable })}
                                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                                    title="Toggle Available / Booked"
                                  >
                                    {slot.isAvailable ? <ToggleRight className="w-4 h-4 text-purple-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                                    {slot.isAvailable ? 'Lock' : 'Unlock'}
                                  </button>

                                  {onDeleteSlot && (
                                    <button
                                      onClick={() => onDeleteSlot(slot.id)}
                                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── My Booking Tab ──────────────────────────────────────── */}
        {activeTab === 'mybookings' && (
          <div className="py-4">
            {!currentUser ? (
              <div className="text-center py-16 space-y-4">
                <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold">Log in to see your bookings.</p>
                {onOpenAuthModal && (
                  <button
                    onClick={onOpenAuthModal}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-400 text-slate-950 font-bold text-sm hover:bg-purple-300 transition-all cursor-pointer"
                  >
                    Log In
                  </button>
                )}
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold">No bookings found for your account yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Switch to the Live Schedule tab and click available time slots to book a session!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(b => {
                  const isPlayer = currentUser?.role === 'user';
                  const locked = isPlayer && !canCancelBooking(b);
                  return (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      onCancel={onCancelBooking!}
                      onPay={onPayBooking}
                      cancelDisabled={locked}
                      cancelHint={locked ? cancellationRestriction(b) ?? undefined : undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating "Book Slot" action bar — appears when client has selected slots */}
      {activeTab === 'schedule' && !isAdmin && selectedSlotIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 border border-purple-400/30 shadow-2xl shadow-purple-500/20 backdrop-blur-md">
          <span className="text-sm font-bold text-white whitespace-nowrap">
            {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBookSelected}
            className="inline-flex items-center gap-2 text-sm font-extrabold px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10 transition-all cursor-pointer active:scale-95"
          >
            Book Slot{selectedSlotIds.length > 1 ? 's' : ''}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedSlotIds([])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            title="Clear selection"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
};
