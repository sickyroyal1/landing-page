import React, { useState, useMemo } from 'react';
import { TimeSlot, CourtLocation, UserAccount } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, Lock, Sparkles, AlertCircle, ShieldCheck, Edit3, Trash2, Plus, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';

interface AvailabilityCalendarProps {
  timeSlots: TimeSlot[];
  courts: CourtLocation[];
  onSelectSlot: (slot: TimeSlot) => void;
  currentUser?: UserAccount | null;
  onEditSlot?: (slot: TimeSlot) => void;
  onDeleteSlot?: (slotId: string) => void;
  onAddSlot?: (slot: TimeSlot) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  timeSlots,
  courts,
  onSelectSlot,
  currentUser,
  onEditSlot,
  onDeleteSlot,
  onAddSlot
}) => {
  // Extract unique dates from slots, sorted
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(timeSlots.map(s => s.date))).sort();
    return dates;
  }, [timeSlots]);

  const [selectedDate, setSelectedDate] = useState<string>(uniqueDates[0] || new Date().toISOString().split('T')[0]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('all');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  const isAdmin = currentUser?.role === 'admin';

  // Inline Quick Add Slot state for Admin
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStartTime, setAddStartTime] = useState('08:00 AM');
  const [addEndTime, setAddEndTime] = useState('09:00 AM');
  const [addCourtId, setAddCourtId] = useState(courts[0]?.id || '');

  // Filter slots for current view
  const currentSlots = useMemo(() => {
    return timeSlots.filter(slot => {
      if (slot.date !== selectedDate) return false;
      if (selectedCourtId !== 'all' && slot.courtLocationId !== selectedCourtId) return false;
      
      // Parse hour for morning (8am - 12pm) vs afternoon (12pm - 4pm)
      const timeStr = slot.startTime; // e.g., "08:00 AM" or "01:00 PM"
      const isPM = timeStr.includes('PM');
      let hour = parseInt(timeStr.split(':')[0], 10);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      if (timeOfDayFilter === 'morning' && hour >= 12) return false;
      if (timeOfDayFilter === 'afternoon' && hour < 12) return false;

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
  }, [timeSlots, selectedDate, selectedCourtId, timeOfDayFilter]);

  // Count open slots per date
  const openCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    timeSlots.forEach(slot => {
      if (slot.isAvailable) {
        counts[slot.date] = (counts[slot.date] || 0) + 1;
      }
    });
    return counts;
  }, [timeSlots]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    return { dayName, monthName, dayNum, isToday: new Date().toISOString().split('T')[0] === dateStr };
  };

  const handleCreateQuickSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddSlot) return;
    const court = courts.find(c => c.id === addCourtId) || courts[0];
    const created: TimeSlot = {
      id: `slot-${Date.now()}`,
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

  return (
    <section id="availability" className="py-20 bg-slate-900 text-white relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-extrabold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            Live Schedule (8:00 AM – 4:00 PM)
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Daily Coaching Schedule Table
          </h2>
          <p className="text-slate-300 text-base">
            Select a date below to view available 1-hour coaching sessions between 8:00 AM and 4:00 PM. Click <strong>Book Slot</strong> to reserve.
          </p>

          {isAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Mode Active — You can edit, lock, or add time slots directly in the table!</span>
            </div>
          )}
        </div>

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
              <span className="text-xs text-slate-400 font-medium">
                Daily Hours: 8:00 AM - 4:00 PM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
            {uniqueDates.map((dateStr) => {
              const { dayName, monthName, dayNum, isToday } = formatDateLabel(dateStr);
              const openCount = openCountByDate[dateStr] || 0;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 min-w-[105px] p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-purple-400 text-slate-950 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/40 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
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
                    {openCount > 0 ? (
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

        {/* Filters Bar */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Court Filter */}
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-semibold text-slate-300 shrink-0">Court Location:</label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 w-full max-w-xs focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
            >
              <option value="all">All Court Locations</option>
              {courts.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 px-2">Time:</span>
            {(['all', 'morning', 'afternoon'] as const).map((tod) => (
              <button
                key={tod}
                onClick={() => setTimeOfDayFilter(tod)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  timeOfDayFilter === tod
                    ? 'bg-purple-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tod === 'morning' ? 'Morning (8am-12pm)' : tod === 'afternoon' ? 'Afternoon (12pm-4pm)' : 'All (8am-4pm)'}
              </button>
            ))}
          </div>

        </div>

        {/* Schedule Table Orientation */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
          {currentSlots.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No available time slots found for this filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try selecting a different date above or clearing your court location filter.
              </p>
              <button
                onClick={() => { setSelectedCourtId('all'); setTimeOfDayFilter('all'); }}
                className="text-xs font-bold text-purple-400 hover:underline pt-2 inline-block cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Time Slot</th>
                    <th className="py-4 px-6">Court Location</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action / Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {currentSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      className={`transition-colors ${
                        slot.isAvailable
                          ? 'hover:bg-purple-950/20 group'
                          : 'bg-slate-950/40 text-slate-500 opacity-75'
                      }`}
                    >
                      {/* Time Slot Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Clock className={`w-4 h-4 ${slot.isAvailable ? 'text-purple-400' : 'text-slate-600'}`} />
                          <span className="font-extrabold text-white text-base">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      </td>

                      {/* Court Location Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{slot.courtLocationName}</span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {slot.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-purple-400/10 text-purple-400 border border-purple-400/30 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Open Slot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                            <Lock className="w-3.5 h-3.5" />
                            Booked
                          </span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isAdmin ? (
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
                        ) : (
                          <div>
                            {slot.isAvailable ? (
                              <button
                                onClick={() => onSelectSlot(slot)}
                                className="inline-flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-xl bg-purple-400 text-slate-950 hover:bg-purple-300 shadow-md shadow-purple-500/10 transition-all cursor-pointer active:scale-95"
                              >
                                <span>Book Slot</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-slate-500">Unavailable</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
