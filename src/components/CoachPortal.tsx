import React, { useState } from 'react';
import { TimeSlot, BookingRequest, CourtLocation, CoachProfile, UserAccount } from '../types';
import { LayoutDashboard, Calendar, Users, Plus, Trash2, CheckCircle2, Clock, MapPin, User, Mail, Phone, Target, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { todayLocalStr } from '../data/mockData';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CoachPortalProps {
  isOpen: boolean;
  onClose: () => void;
  coachProfile: CoachProfile;
  timeSlots: TimeSlot[];
  bookings: BookingRequest[];
  courts: CourtLocation[];
  currentUser?: UserAccount | null;
  onAddSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onSaveCoach?: (coach: CoachProfile) => void;
}

export const CoachPortal: React.FC<CoachPortalProps> = ({
  isOpen,
  onClose,
  coachProfile,
  timeSlots,
  bookings,
  courts,
  currentUser,
  onAddSlot,
  onDeleteSlot,
  onCancelBooking,
  onSaveCoach
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');

  // New Slot Form State
  const [newDate, setNewDate] = useState(todayLocalStr());
  const [newStart, setNewStart] = useState('08:00 AM');
  const [newEnd, setNewEnd] = useState('09:00 AM');
  const [newCourtId, setNewCourtId] = useState(courts[0]?.id || '');

  // Weekly availability (days of week the coach regularly coaches)
  const [availabilityDays, setAvailabilityDays] = useState<number[]>(coachProfile.availableDays ?? ALL_DAYS);
  const [availabilityCoachId, setAvailabilityCoachId] = useState(coachProfile.id);
  // Re-sync when the portal opens for a different coach (component stays mounted as a modal)
  if (coachProfile.id !== availabilityCoachId) {
    setAvailabilityCoachId(coachProfile.id);
    setAvailabilityDays(coachProfile.availableDays ?? ALL_DAYS);
  }

  // Scope portal data: a logged-in coach sees only their own slots/bookings;
  // the platform admin (owner) sees everything.
  const portalCoachId = currentUser?.role === 'coach'
    ? currentUser.coachId
    : currentUser?.role === 'admin'
      ? null
      : coachProfile.id;

  const scopedSlots = portalCoachId ? timeSlots.filter(s => s.coachId === portalCoachId) : timeSlots;
  const scopedBookings = portalCoachId ? bookings.filter(b => b.coachId === portalCoachId) : bookings;

  if (!isOpen) return null;

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === newCourtId) || courts[0];
    const created: TimeSlot = {
      id: `slot-${Date.now()}`,
      coachId: portalCoachId ?? coachProfile.id,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      courtLocationId: court.id,
      courtLocationName: court.name,
      isAvailable: true
    };
    onAddSlot(created);
  };

  // Revenue counts only PAID bookings; unpaid / pay-on-court sessions excluded.
  const totalEarnings = scopedBookings.reduce((sum, b) => b.paymentStatus === 'paid' ? sum + b.totalPrice : sum, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden my-6">
        
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Coach Portal</h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Coach Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {portalCoachId
                  ? `Manage Coach ${coachProfile.name}'s appointments & availability`
                  : 'Platform owner — view and manage all coaches'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-950/60 border-b border-slate-800 text-center">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Confirmed Bookings</p>
            <p className="text-2xl font-black text-white mt-1">{scopedBookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Total Open Slots</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{scopedSlots.filter(s => s.isAvailable).length}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Est. Revenue</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">₱{totalEarnings}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Active Locations</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{courts.length}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Player Bookings ({scopedBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Manage Slot Availability ({scopedSlots.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          
          {/* TAB 1: PLAYER BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Coaching Sessions</h4>
              
              {scopedBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No player bookings recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {scopedBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-base font-extrabold text-white">{b.playerName}</h5>
                            <span className="text-[10px] font-bold bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded border border-purple-400/20">
                              {b.playerSkillLevel}
                            </span>
                          </div>
                          <p className="text-xs text-amber-300 font-semibold mt-0.5">{b.serviceName}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            b.paymentStatus === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {b.paymentStatus === 'paid'
                              ? 'Paid'
                              : b.paymentMethod === 'oncourt' ? 'Pay on Court' : 'Payment Due'}
                          </span>
                          <span className="text-sm font-black text-white">₱{b.totalPrice}</span>
                          <button
                            onClick={() => onCancelBooking(b.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date: <strong className="text-white">{b.date}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Time: <strong className="text-white">{b.startTime} - {b.endTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Location: <strong className="text-white">{b.courtLocationName}</strong></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Email: <a href={`mailto:${b.playerEmail}`} className="text-slate-200 underline">{b.playerEmail}</a></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Phone: <a href={`tel:${b.playerPhone}`} className="text-slate-200 underline">{b.playerPhone}</a></span>
                        </div>
                      </div>

                      {b.receiptId && (
                        <p className="text-[10px] text-slate-500">Receipt: <span className="font-bold text-slate-300">{b.receiptId}</span></p>
                      )}

                      {/* Focus Areas & Notes */}
                      {(b.focusAreas.length > 0 || b.notes) && (
                        <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                          {b.focusAreas.length > 0 && (
                            <div>
                              <strong className="text-slate-400">Goals: </strong>
                              <span>{b.focusAreas.join(', ')}</span>
                            </div>
                          )}
                          {b.notes && (
                            <div>
                              <strong className="text-slate-400">Player Note: </strong>
                              <span className="italic text-slate-200">"{b.notes}"</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE SCHEDULE & SLOTS */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">

              {/* Weekly Availability */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Weekly Availability
                </h4>
                <p className="text-[11px] text-slate-400">
                  Pick the days you regularly coach — e.g. take weekends off. Players only see slots on days you're
                  available, and new time slots skip your days off automatically.
                </p>

                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => {
                    const on = availabilityDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          setAvailabilityDays((prev) =>
                            on ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)
                          )
                        }
                        className={`w-12 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          on
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                            : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {DAY_NAMES[d]}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onSaveCoach && onSaveCoach({ ...coachProfile, availableDays: availabilityDays })}
                  disabled={!onSaveCoach || availabilityDays.length === 0}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Weekly Availability
                </button>
              </div>

              {/* Form to Add New Slot */}
              <form onSubmit={handleCreateSlot} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Available Slot
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      placeholder="08:00 AM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">End Time</label>
                    <input
                      type="text"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Court Location</label>
                    <select
                      value={newCourtId}
                      onChange={(e) => setNewCourtId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {courts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Publish New Time Slot
                </button>
              </form>

              {/* Slot List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Configured Time Slots</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scopedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{slot.date}</span>
                          <span className="text-amber-400">• {slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{slot.courtLocationName}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          slot.isAvailable ? 'bg-purple-400/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {slot.isAvailable ? 'Available' : 'Booked'}
                        </span>
                        {slot.isAvailable && (
                          <button
                            onClick={() => onDeleteSlot(slot.id)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
