import React from 'react';
import { UserAccount, BookingRequest } from '../types';
import { X, Calendar, Trophy } from 'lucide-react';
import { BookingCard } from './BookingCard';
import { canCancelBooking, cancellationRestriction } from '../bookingLogic';

interface UserBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  bookings: BookingRequest[];
  onCancelBooking: (bookingId: string) => void;
  onPayBooking?: (booking: BookingRequest) => void;
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookings,
  onCancelBooking,
  onPayBooking
}) => {
  if (!isOpen || !currentUser) return null;

  // Filter bookings for this logged-in user account email
  const myBookings = bookings.filter(
    b => b.playerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 via-slate-900 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-400/20 text-purple-300 border border-purple-400/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">My Coaching Sessions</h3>
                <span className="text-[10px] font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full">
                  Player Account
                </span>
              </div>
              <p className="text-xs text-slate-400">View and manage your scheduled coaching sessions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center font-bold text-purple-300">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email} • {currentUser.skillLevel || 'Player'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Bookings</p>
            <p className="text-lg font-black text-purple-400">{myBookings.length}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold">No bookings found for your account yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Scroll down to the Live Availability schedule and choose a time slot to book your session!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => {
                const locked = currentUser.role === 'user' && !canCancelBooking(b);
                return (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancel={onCancelBooking}
                    onPay={onPayBooking}
                    cancelDisabled={locked}
                    cancelHint={locked ? cancellationRestriction(b) ?? undefined : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
