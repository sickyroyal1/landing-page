import React, { useState } from 'react';
import { TimeSlot, BookingRequest, CourtLocation, CoachProfile } from '../types';
import { LayoutDashboard, Calendar, Users, Plus, Trash2, CheckCircle2, Clock, MapPin, User, Mail, Phone, Target, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface CoachPortalProps {
  isOpen: boolean;
  onClose: () => void;
  coachProfile: CoachProfile;
  timeSlots: TimeSlot[];
  bookings: BookingRequest[];
  courts: CourtLocation[];
  onAddSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const CoachPortal: React.FC<CoachPortalProps> = ({
  isOpen,
  onClose,
  coachProfile,
  timeSlots,
  bookings,
  courts,
  onAddSlot,
  onDeleteSlot,
  onCancelBooking
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');

  // New Slot Form State
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStart, setNewStart] = useState('08:00 AM');
  const [newEnd, setNewEnd] = useState('09:00 AM');
  const [newCourtId, setNewCourtId] = useState(courts[0]?.id || '');

  if (!isOpen) return null;

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === newCourtId) || courts[0];
    const created: TimeSlot = {
      id: `slot-${Date.now()}`,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      courtLocationId: court.id,
      courtLocationName: court.name,
      isAvailable: true
    };
    onAddSlot(created);
  };

  const totalEarnings = bookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.totalPrice : sum, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-6">
        
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
              <p className="text-xs text-slate-400">Manage your player appointments and slot availability</p>
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
            <p className="text-2xl font-black text-white mt-1">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Total Open Slots</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{timeSlots.filter(s => s.isAvailable).length}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Est. Revenue</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">${totalEarnings}</p>
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
            Player Bookings ({bookings.length})
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
            Manage Slot Availability ({timeSlots.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: PLAYER BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Coaching Sessions</h4>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No player bookings recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
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

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-white">${b.totalPrice}</span>
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
                  {timeSlots.map((slot) => (
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
