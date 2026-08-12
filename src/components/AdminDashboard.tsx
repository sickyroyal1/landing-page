import React, { useState } from 'react';
import {
  BookingRequest, CoachAchievement, CoachProfile, CoachingService,
  CourtLocation, SiteCopy, SkillLevel, TimeSlot, UserAccount
} from '../types';
import {
  LayoutDashboard, CalendarDays, Clock, Users, DollarSign, Type, LogOut,
  ArrowLeft, Trophy, ShieldCheck, User, MapPin, Trash2, Plus,
  Save, RotateCcw, Check, Pencil, Lock, Unlock, Star, Award, Search
} from 'lucide-react';
import { BookingEditModal } from './BookingEditModal';
import { EditSlotModal } from './EditSlotModal';
import { todayLocalStr } from '../data/mockData';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SKILL_LEVELS: SkillLevel[] = [
  '2.5 - Beginner',
  '3.0 - Advanced Beginner',
  '3.5 - Intermediate',
  '4.0 - Advanced Intermediate',
  '4.5+ - Advanced / Tournament'
];

type SectionId = 'overview' | 'bookings' | 'schedule' | 'coaches' | 'services' | 'site';

const blankCoach = (): CoachProfile => ({
  id: `coach-${Date.now()}`,
  name: 'New Coach',
  title: 'Pickleball Coach',
  certification: '',
  duprRating: 4.0,
  yearsCoaching: 1,
  studentsTrained: 0,
  bio: '',
  specialties: [],
  email: '',
  phone: '',
  instagram: '',
  locationCity: '',
  locationIds: [],
  photo: '',
  isActive: true
});

/* ------------------------------ badge helpers ------------------------------ */

const statusBadge = (status: BookingRequest['status']) => {
  const map: Record<BookingRequest['status'], string> = {
    confirmed: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
    pending: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };
  return `px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${map[status]}`;
};

const paymentBadge = (status: BookingRequest['paymentStatus']) => {
  const map: Record<BookingRequest['paymentStatus'], string> = {
    paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    unpaid: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    processing: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    refunded: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };
  return `px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${map[status]}`;
};

const slotBadge = (slot: TimeSlot) => {
  if (slot.isAvailable) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (slot.bookedByBookingId) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  return 'bg-slate-600/30 text-slate-400 border-slate-600/40';
};

const slotLabel = (slot: TimeSlot) => {
  if (slot.isAvailable) return 'Available';
  if (slot.bookedByBookingId) return 'Booked';
  return 'Blocked';
};

const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none";
const denseInputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none";
const labelClass = "block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider";

/* ==========================================================================
   MAIN ADMIN DASHBOARD
   ========================================================================== */

interface AdminDashboardProps {
  coaches: CoachProfile[];
  services: CoachingService[];
  siteCopy: SiteCopy;
  courts: CourtLocation[];
  timeSlots: TimeSlot[];
  bookings: BookingRequest[];
  currentUser?: UserAccount | null;
  onSaveCoaches: (coaches: CoachProfile[]) => void;
  onSaveServices: (services: CoachingService[]) => void;
  onSaveSiteCopy: (siteCopy: SiteCopy) => void;
  onResetDefaults: () => void;
  onAddSlot: (slot: TimeSlot) => void;
  onSaveSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onUpdateBooking: (booking: BookingRequest) => void;
  onDeleteBooking: (bookingId: string) => void;
  onLogout: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  coaches,
  services,
  siteCopy,
  courts,
  timeSlots,
  bookings,
  currentUser,
  onSaveCoaches,
  onSaveServices,
  onSaveSiteCopy,
  onResetDefaults,
  onAddSlot,
  onSaveSlot,
  onDeleteSlot,
  onUpdateBooking,
  onDeleteBooking,
  onLogout,
  onExitAdmin
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [editingBooking, setEditingBooking] = useState<BookingRequest | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule & Slots', icon: <Clock className="w-4 h-4" /> },
    { id: 'coaches', label: 'Coaches', icon: <Users className="w-4 h-4" /> },
    { id: 'services', label: 'Services & Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'site', label: 'Site Content', icon: <Type className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* Top bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black text-white">DINKLAB +</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {currentUser?.name ?? 'Admin'}
          </span>
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Back to the public site"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Admin · View Site</span>
            <span className="sm:hidden">Exit</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar (horizontal row on mobile) */}
        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 p-3 md:p-4">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-purple-400/15 text-purple-300 border border-purple-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 min-h-0">
          {activeSection === 'overview' && (
            <OverviewSection bookings={bookings} timeSlots={timeSlots} coaches={coaches} courts={courts} onGoToBookings={() => setActiveSection('bookings')} />
          )}
          {activeSection === 'bookings' && (
            <BookingsSection
              bookings={bookings}
              coaches={coaches}
              services={services}
              timeSlots={timeSlots}
              onEdit={setEditingBooking}
              onDelete={onDeleteBooking}
            />
          )}
          {activeSection === 'schedule' && (
            <ScheduleSection
              timeSlots={timeSlots}
              coaches={coaches}
              courts={courts}
              onAddSlot={onAddSlot}
              onEditSlot={setEditingSlot}
              onSaveSlot={onSaveSlot}
              onDeleteSlot={onDeleteSlot}
            />
          )}
          {activeSection === 'coaches' && (
            <CoachesSection coaches={coaches} courts={courts} onSaveCoaches={onSaveCoaches} />
          )}
          {activeSection === 'services' && (
            <AdminServicesSection coaches={coaches} services={services} onSaveServices={onSaveServices} />
          )}
          {activeSection === 'site' && (
            <SiteContentSection siteCopy={siteCopy} onSaveSiteCopy={onSaveSiteCopy} onResetDefaults={onResetDefaults} />
          )}
        </main>
      </div>

      {/* Booking edit / move modal */}
      {editingBooking && (
        <BookingEditModal
          booking={editingBooking}
          coaches={coaches}
          services={services}
          timeSlots={timeSlots}
          onSave={onUpdateBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}

      {/* Slot edit modal */}
      {editingSlot && (
        <EditSlotModal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          slot={editingSlot}
          courts={courts}
          onSaveSlot={(s) => { onSaveSlot(s); setEditingSlot(null); }}
        />
      )}
    </div>
  );
};

/* ==========================================================================
   OVERVIEW
   ========================================================================== */

const OverviewSection: React.FC<{
  bookings: BookingRequest[];
  timeSlots: TimeSlot[];
  coaches: CoachProfile[];
  courts: CourtLocation[];
  onGoToBookings: () => void;
}> = ({ bookings, timeSlots, coaches, courts, onGoToBookings }) => {
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const openSlots = timeSlots.filter(s => s.isAvailable);
  const revenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0);
  const activeCoaches = coaches.filter(c => c.isActive);

  const stats = [
    { label: 'Confirmed Bookings', value: confirmed.length, icon: <CalendarDays className="w-4 h-4" />, accent: 'text-purple-300 bg-purple-400/10' },
    { label: 'Open Slots', value: openSlots.length, icon: <Clock className="w-4 h-4" />, accent: 'text-emerald-300 bg-emerald-400/10' },
    { label: 'Est. Revenue (paid)', value: `₱${revenue.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, accent: 'text-amber-300 bg-amber-400/10' },
    { label: 'Active Coaches', value: activeCoaches.length, icon: <Users className="w-4 h-4" />, accent: 'text-sky-300 bg-sky-400/10' },
    { label: 'Active Locations', value: courts.length, icon: <MapPin className="w-4 h-4" />, accent: 'text-rose-300 bg-rose-400/10' }
  ];

  const upcoming = [...bookings]
    .filter(b => b.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Overview</h1>
        <p className="text-xs text-slate-400">A snapshot of everything happening on the site.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.accent}`}>{s.icon}</div>
            <p className="text-2xl font-black text-white leading-none">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Upcoming Bookings
          </h3>
          <button
            onClick={onGoToBookings}
            className="text-xs font-bold text-purple-300 hover:text-purple-200 cursor-pointer"
          >
            Manage all →
          </button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-xs text-slate-500">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{b.playerName} <span className="text-slate-500 font-semibold">· {b.serviceName}</span></p>
                  <p className="text-[11px] text-slate-400">{b.coachName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-300">{b.date}</p>
                  <span className={statusBadge(b.status)}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   BOOKINGS (edit / move / delete)
   ========================================================================== */

const BookingsSection: React.FC<{
  bookings: BookingRequest[];
  coaches: CoachProfile[];
  services: CoachingService[];
  timeSlots: TimeSlot[];
  onEdit: (b: BookingRequest) => void;
  onDelete: (bookingId: string) => void;
}> = ({ bookings, coaches, services, timeSlots, onEdit, onDelete }) => {
  const [coachFilter, setCoachFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = bookings
    .filter(b => coachFilter === 'all' || b.coachId === coachFilter)
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => paymentFilter === 'all' || b.paymentStatus === paymentFilter)
    .filter(b => !search || b.playerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const handleDelete = (b: BookingRequest) => {
    if (window.confirm(`Delete booking ${b.id} (${b.playerName} on ${b.date})? The time slot will be freed.`)) {
      onDelete(b.id);
    }
  };

  const selectClass = `${inputClass} cursor-pointer w-auto`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Bookings</h1>
        <p className="text-xs text-slate-400">{bookings.length} total · edit, move, or delete any booking.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={coachFilter} onChange={(e) => setCoachFilter(e.target.value)} className={selectClass}>
          <option value="all">All coaches</option>
          {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={selectClass}>
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="processing">Processing</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player…"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500 p-4 bg-slate-900 border border-slate-800 rounded-2xl">No bookings match the current filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-extrabold text-white">{b.playerName}</p>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">{b.playerSkillLevel}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">#{b.id}</span>
                  </div>
                  <p className="text-xs text-purple-300 font-semibold mt-0.5">{b.serviceName}</p>
                  <p className="text-[11px] text-slate-400">Coach {b.coachName}</p>
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={statusBadge(b.status)}>{b.status}</span>
                    <span className={paymentBadge(b.paymentStatus)}>{b.paymentStatus}</span>
                  </div>
                  <p className="text-lg font-black text-purple-400">₱{b.totalPrice}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /> {b.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {b.startTime} – {b.endTime} ({b.durationMinutes} min)</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.courtLocationName}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => onEdit(b)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-400 hover:bg-purple-300 text-slate-950 text-xs font-black transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit / Move
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <span className="ml-auto text-[10px] text-slate-500">Created {new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   SCHEDULE & SLOTS
   ========================================================================== */

const ScheduleSection: React.FC<{
  timeSlots: TimeSlot[];
  coaches: CoachProfile[];
  courts: CourtLocation[];
  onAddSlot: (slot: TimeSlot) => void;
  onEditSlot: (slot: TimeSlot) => void;
  onSaveSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}> = ({ timeSlots, coaches, courts, onAddSlot, onEditSlot, onSaveSlot, onDeleteSlot }) => {
  const [coachFilter, setCoachFilter] = useState('all');
  const [newCoachId, setNewCoachId] = useState(coaches[0]?.id ?? '');
  const [newDate, setNewDate] = useState(todayLocalStr());
  const [newStart, setNewStart] = useState('08:00 AM');
  const [newEnd, setNewEnd] = useState('09:00 AM');
  const [newCourtId, setNewCourtId] = useState(courts[0]?.id ?? '');

  const scopedSlots = coachFilter === 'all' ? timeSlots : timeSlots.filter(s => s.coachId === coachFilter);
  const sortedSlots = [...scopedSlots].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachId || !newDate) return;
    const court = courts.find(c => c.id === newCourtId) || courts[0];
    const created: TimeSlot = {
      id: `slot-${Date.now()}`,
      coachId: newCoachId,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      courtLocationId: court?.id ?? '',
      courtLocationName: court?.name ?? 'Unassigned',
      isAvailable: true
    };
    onAddSlot(created);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Schedule &amp; Slots</h1>
        <p className="text-xs text-slate-400">{timeSlots.length} slots across all coaches.</p>
      </div>

      {/* Add slot */}
      <form onSubmit={handleCreateSlot} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-purple-400" /> Add Available Slot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select value={newCoachId} onChange={(e) => setNewCoachId(e.target.value)} className={`${inputClass} cursor-pointer`}>
            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />
          <input type="text" value={newStart} onChange={(e) => setNewStart(e.target.value)} placeholder="Start (08:00 AM)" className={inputClass} />
          <input type="text" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} placeholder="End (09:00 AM)" className={inputClass} />
          <select value={newCourtId} onChange={(e) => setNewCourtId(e.target.value)} className={`${inputClass} cursor-pointer`}>
            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-purple-400 hover:bg-purple-300 text-slate-950 text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slot
        </button>
      </form>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <select value={coachFilter} onChange={(e) => setCoachFilter(e.target.value)} className={`${inputClass} cursor-pointer w-auto`}>
          <option value="all">All coaches</option>
          {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Slot list */}
      {sortedSlots.length === 0 ? (
        <p className="text-xs text-slate-500 p-4 bg-slate-900 border border-slate-800 rounded-2xl">No slots found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedSlots.map((slot) => {
            const coachName = coaches.find(c => c.id === slot.coachId)?.name ?? 'Unknown';
            const isBooked = !slot.isAvailable && !!slot.bookedByBookingId;
            return (
              <div key={slot.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{slot.date}</p>
                    <p className="text-xs text-purple-300 font-semibold">{slot.startTime} – {slot.endTime}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{coachName} · {slot.courtLocationName}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${slotBadge(slot)}`}>
                    {slotLabel(slot)}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button onClick={() => onEditSlot(slot)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  {!isBooked && (
                    <button
                      onClick={() => onSaveSlot({ ...slot, isAvailable: slot.isAvailable ? false : true })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        slot.isAvailable
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {slot.isAvailable ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {slot.isAvailable ? 'Block' : 'Unblock'}
                    </button>
                  )}
                  {!isBooked && (
                    <button onClick={() => onDeleteSlot(slot.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COACHES
   ========================================================================== */

const CoachesSection: React.FC<{
  coaches: CoachProfile[];
  courts: CourtLocation[];
  onSaveCoaches: (coaches: CoachProfile[]) => void;
}> = ({ coaches, courts, onSaveCoaches }) => {
  const [localCoaches, setLocalCoaches] = useState<CoachProfile[]>([...coaches]);
  const [editingCoachId, setEditingCoachId] = useState<string>(coaches[0]?.id ?? '');
  const [saved, setSaved] = useState(false);

  const editingCoach = localCoaches.find(c => c.id === editingCoachId) ?? localCoaches[0];

  const handleChange = (id: string, field: keyof CoachProfile, value: any) => {
    setLocalCoaches(localCoaches.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleToggleLocation = (id: string, courtId: string) => {
    setLocalCoaches(localCoaches.map(c => {
      if (c.id !== id) return c;
      const has = c.locationIds.includes(courtId);
      return { ...c, locationIds: has ? c.locationIds.filter(x => x !== courtId) : [...c.locationIds, courtId] };
    }));
  };

  const handleToggleDay = (id: string, day: number) => {
    setLocalCoaches(localCoaches.map(c => {
      if (c.id !== id) return c;
      const current = c.availableDays ?? ALL_DAYS;
      const has = current.includes(day);
      return { ...c, availableDays: has ? current.filter(x => x !== day) : [...current, day].sort((a, b) => a - b) };
    }));
  };

  const handleAddAchievement = (id: string) => {
    setLocalCoaches(localCoaches.map(c => c.id === id ? {
      ...c,
      achievements: [...(c.achievements ?? []), { id: `ach-${Date.now()}`, title: '', description: '' }]
    } : c));
  };

  const handleUpdateAchievement = (id: string, achId: string, field: keyof CoachAchievement, value: string) => {
    setLocalCoaches(localCoaches.map(c => c.id === id ? {
      ...c,
      achievements: (c.achievements ?? []).map(a => a.id === achId ? { ...a, [field]: value } : a)
    } : c));
  };

  const handleRemoveAchievement = (id: string, achId: string) => {
    setLocalCoaches(localCoaches.map(c => c.id === id ? {
      ...c,
      achievements: (c.achievements ?? []).filter(a => a.id !== achId)
    } : c));
  };

  const handleAddCoach = () => {
    const n = blankCoach();
    setLocalCoaches([...localCoaches, n]);
    setEditingCoachId(n.id);
  };

  const handleRemoveCoach = (id: string) => {
    if (localCoaches.length <= 1) return;
    setLocalCoaches(localCoaches.filter(c => c.id !== id));
    if (editingCoachId === id) setEditingCoachId(localCoaches.find(c => c.id !== id)?.id ?? '');
  };

  const handleSave = () => {
    onSaveCoaches(localCoaches);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!editingCoach) return <p className="text-xs text-slate-500">No coaches yet — add one below.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Coaches</h1>
          <p className="text-xs text-slate-400">{localCoaches.length} coaches · {localCoaches.filter(c => c.isActive).length} visible on site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddCoach} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Coach
          </button>
          {localCoaches.length > 1 && (
            <button onClick={() => handleRemoveCoach(editingCoach.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Selector */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <label className="text-xs font-bold text-slate-300 shrink-0">Editing Coach:</label>
        <select value={editingCoach.id} onChange={(e) => setEditingCoachId(e.target.value)} className={`${inputClass} flex-1 cursor-pointer`}>
          {localCoaches.map(c => (
            <option key={c.id} value={c.id}>{c.name}{c.isActive ? '' : ' (hidden)'}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" /> Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={editingCoach.name} onChange={(e) => handleChange(editingCoach.id, 'name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Title / Tagline</label>
                <input type="text" value={editingCoach.title} onChange={(e) => handleChange(editingCoach.id, 'title', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>DUPR Rating</label>
                <input type="number" step="0.1" value={editingCoach.duprRating} onChange={(e) => handleChange(editingCoach.id, 'duprRating', Number(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Years Coaching</label>
                <input type="number" value={editingCoach.yearsCoaching} onChange={(e) => handleChange(editingCoach.id, 'yearsCoaching', Number(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Students Trained</label>
                <input type="number" value={editingCoach.studentsTrained} onChange={(e) => handleChange(editingCoach.id, 'studentsTrained', Number(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Photo URL</label>
                <input type="text" value={editingCoach.photo ?? ''} onChange={(e) => handleChange(editingCoach.id, 'photo', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="text" value={editingCoach.email} onChange={(e) => handleChange(editingCoach.id, 'email', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={editingCoach.phone} onChange={(e) => handleChange(editingCoach.id, 'phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location City</label>
                <input type="text" value={editingCoach.locationCity} onChange={(e) => handleChange(editingCoach.id, 'locationCity', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Certification</label>
                <input type="text" value={editingCoach.certification} onChange={(e) => handleChange(editingCoach.id, 'certification', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea rows={3} value={editingCoach.bio} onChange={(e) => handleChange(editingCoach.id, 'bio', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Specialties (comma separated)</label>
              <input type="text" value={editingCoach.specialties.join(', ')} onChange={(e) => handleChange(editingCoach.id, 'specialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input type="checkbox" checked={editingCoach.isActive} onChange={(e) => handleChange(editingCoach.id, 'isActive', e.target.checked)} className="accent-purple-400 w-4 h-4" />
              Visible on site
            </label>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> Areas Served
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {courts.map((court) => {
                const active = editingCoach.locationIds.includes(court.id);
                return (
                  <button
                    key={court.id}
                    onClick={() => handleToggleLocation(editingCoach.id, court.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-purple-400/20 text-purple-300 border-purple-400/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{court.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Weekly Availability
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((d) => {
                const on = (editingCoach.availableDays ?? ALL_DAYS).includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => handleToggleDay(editingCoach.id, d)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      on
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {DAY_NAMES[d]}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500">Days this coach is regularly available. Unselected days show as "Off" on the schedule.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" /> Achievements
              </h3>
              <button onClick={() => handleAddAchievement(editingCoach.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input type="checkbox" checked={editingCoach.showAchievements ?? true} onChange={(e) => handleChange(editingCoach.id, 'showAchievements', e.target.checked)} className="accent-purple-400 w-4 h-4" />
              Show achievements on profile
            </label>
            {(editingCoach.achievements ?? []).length === 0 && (
              <p className="text-[11px] text-slate-500">No achievements yet.</p>
            )}
            <div className="space-y-2">
              {(editingCoach.achievements ?? []).map((ach, i) => (
                <div key={ach.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Achievement {i + 1}</span>
                    <button onClick={() => handleRemoveAchievement(editingCoach.id, ach.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input type="text" value={ach.title} onChange={(e) => handleUpdateAchievement(editingCoach.id, ach.id, 'title', e.target.value)} placeholder="Title (e.g. Men's Beginner 4th Place)" className={denseInputClass} />
                  <input type="text" value={ach.description ?? ''} onChange={(e) => handleUpdateAchievement(editingCoach.id, ach.id, 'description', e.target.value)} placeholder="Description (optional)" className={denseInputClass} />
                  <input type="text" value={ach.imageUrl ?? ''} onChange={(e) => handleUpdateAchievement(editingCoach.id, ach.id, 'imageUrl', e.target.value)} placeholder="Image URL (optional)" className={denseInputClass} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 sticky bottom-4">
        <p className="text-[11px] text-slate-500 mr-auto">Changes apply to every page that shows this coach.</p>
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer ${
            saved ? 'bg-emerald-500 text-slate-950' : 'bg-purple-400 hover:bg-purple-300 text-slate-950'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Coaches'}
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   SERVICES & PRICING
   ========================================================================== */

const AdminServicesSection: React.FC<{
  coaches: CoachProfile[];
  services: CoachingService[];
  onSaveServices: (services: CoachingService[]) => void;
}> = ({ coaches, services, onSaveServices }) => {
  const [localServices, setLocalServices] = useState<CoachingService[]>([...services]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(coaches[0]?.id ?? '');
  const [saved, setSaved] = useState(false);

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);
  const coachServices = localServices.filter((s) => s.coachId === selectedCoachId);

  const blankService = (): CoachingService => ({
    id: `service-${Date.now()}`,
    coachId: selectedCoachId,
    title: 'New Service',
    subtitle: '',
    durationMinutes: 60,
    price: 250,
    maxPlayers: 1,
    description: '',
    highlights: [],
    recommendedLevel: 'All Levels (2.5 to 5.0)'
  });

  const handleChange = (id: string, field: keyof CoachingService, value: any) => {
    setLocalServices(localServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAdd = () => setLocalServices([...localServices, blankService()]);
  const handleRemove = (id: string) => {
    if (coachServices.length <= 1) return;
    setLocalServices(localServices.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSaveServices(localServices);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Services &amp; Pricing</h1>
          <p className="text-xs text-slate-400">Each coach has their own packages &amp; rates (₱) — nothing is shared across coaches.</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add Service
        </button>
      </div>

      {/* Coach selector — pick whose rates you're editing */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <label className="text-xs font-bold text-slate-300 shrink-0">Editing Rates For:</label>
        <select value={selectedCoachId} onChange={(e) => setSelectedCoachId(e.target.value)} className={`${inputClass} flex-1 cursor-pointer`}>
          {coaches.map((c) => {
            const count = services.filter((s) => s.coachId === c.id).length;
            return (
              <option key={c.id} value={c.id}>
                {c.name}{c.isActive ? '' : ' (hidden)'} · {count} service{count === 1 ? '' : 's'}
              </option>
            );
          })}
        </select>
      </div>

      {coachServices.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-sm font-bold text-white">{selectedCoach?.name ?? 'This coach'} has no packages yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Service" to set up their first package &amp; rate.</p>
        </div>
      ) : (
      <div className="space-y-3">
        {coachServices.map((srv, idx) => (
          <div key={srv.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service #{idx + 1} · {selectedCoach?.name}</span>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={!!srv.popular} onChange={(e) => handleChange(srv.id, 'popular', e.target.checked)} className="accent-purple-400 w-3.5 h-3.5" />
                  Popular
                </label>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Price (₱)</label>
                  <input type="number" value={srv.price} onChange={(e) => handleChange(srv.id, 'price', Number(e.target.value) || 0)} className={`${denseInputClass} w-24`} />
                </div>
                {coachServices.length > 1 && (
                  <button onClick={() => handleRemove(srv.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Title</label>
                <input type="text" value={srv.title} onChange={(e) => handleChange(srv.id, 'title', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input type="text" value={srv.subtitle} onChange={(e) => handleChange(srv.id, 'subtitle', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duration (minutes)</label>
                <input type="number" value={srv.durationMinutes} onChange={(e) => handleChange(srv.id, 'durationMinutes', Number(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Players</label>
                <input type="number" value={srv.maxPlayers} onChange={(e) => handleChange(srv.id, 'maxPlayers', Number(e.target.value) || 1)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Recommended Level</label>
                <input type="text" value={srv.recommendedLevel} onChange={(e) => handleChange(srv.id, 'recommendedLevel', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Badge (optional)</label>
                <input type="text" value={srv.badge ?? ''} onChange={(e) => handleChange(srv.id, 'badge', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={2} value={srv.description} onChange={(e) => handleChange(srv.id, 'description', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Highlights (comma separated)</label>
              <input type="text" value={srv.highlights.join(', ')} onChange={(e) => handleChange(srv.id, 'highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass} />
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <p className="text-[11px] text-slate-500 mr-auto">Per-coach — only {selectedCoach?.name ?? 'this coach'}'s portal shows these rates.</p>
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer ${
            saved ? 'bg-emerald-500 text-slate-950' : 'bg-purple-400 hover:bg-purple-300 text-slate-950'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Services'}
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   SITE CONTENT
   ========================================================================== */

const SiteContentSection: React.FC<{
  siteCopy: SiteCopy;
  onSaveSiteCopy: (siteCopy: SiteCopy) => void;
  onResetDefaults: () => void;
}> = ({ siteCopy, onSaveSiteCopy, onResetDefaults }) => {
  const [local, setLocal] = useState<SiteCopy>({ ...siteCopy });
  const [saved, setSaved] = useState(false);

  const set = (field: keyof SiteCopy, value: string) => setLocal({ ...local, [field]: value });

  const handleSave = () => {
    onSaveSiteCopy(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    if (window.confirm('Restore all default site headings & text?')) {
      onResetDefaults();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const fields: { key: keyof SiteCopy; label: string; textarea?: boolean }[] = [
    { key: 'heroHeadline', label: 'Hero Main Headline' },
    { key: 'heroSubheadline', label: 'Hero Sub-headline', textarea: true },
    { key: 'heroBadgeText', label: 'Hero Badge Text' },
    { key: 'servicesTitle', label: 'Services Section Title' },
    { key: 'servicesSubtitle', label: 'Services Section Subtitle', textarea: true },
    { key: 'coachSectionTitle', label: 'Coach Section Title' },
    { key: 'coachSectionSubtitle', label: 'Coach Section Subtitle', textarea: true }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Site Content</h1>
        <p className="text-xs text-slate-400">Site-wide headings &amp; page text — apply to every coach's pages.</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className={labelClass}>{f.label}</label>
            {f.textarea ? (
              <textarea rows={2} value={local[f.key]} onChange={(e) => set(f.key, e.target.value)} className={`${inputClass} resize-none`} />
            ) : (
              <input type="text" value={local[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer ${
            saved ? 'bg-emerald-500 text-slate-950' : 'bg-purple-400 hover:bg-purple-300 text-slate-950'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Site Content'}
        </button>
      </div>
    </div>
  );
};
