import React from 'react';
import { BookingRequest } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, CreditCard, ShieldAlert } from 'lucide-react';

interface BookingCardProps {
  booking: BookingRequest;
  onCancel: (bookingId: string) => void;
  /** Triggered by the "Pay Now" button for an unpaid session. */
  onPay?: (booking: BookingRequest) => void;
  /** When true the cancel button is disabled (24h policy) — a hint explains why. */
  cancelDisabled?: boolean;
  cancelHint?: string;
}

/** Presentational card for a single booking — shared by the "My Booking" tab and the user bookings popup. */
export const BookingCard: React.FC<BookingCardProps> = ({
  booking: b,
  onCancel,
  onPay,
  cancelDisabled,
  cancelHint
}) => (
  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-black text-white">{b.serviceName}</h4>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
          {b.paymentStatus === 'paid' && (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Paid
            </span>
          )}
          {b.paymentStatus === 'unpaid' && (
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> {b.paymentMethod === 'oncourt' ? 'Pay on Court' : 'Payment Due'}
            </span>
          )}
        </div>
        <p className="text-xs text-purple-300 font-semibold mt-0.5">₱{b.totalPrice} • {b.durationMinutes} Minutes • Coach {b.coachName}</p>
        {b.receiptId && (
          <p className="text-[10px] text-slate-500 mt-0.5">Receipt: <span className="font-bold text-slate-300">{b.receiptId}</span></p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {b.paymentStatus === 'unpaid' && b.paymentMethod !== 'oncourt' && onPay && (
          <button
            onClick={() => onPay(b)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" /> Pay Now
          </button>
        )}
        <button
          onClick={() => onCancel(b.id)}
          disabled={cancelDisabled}
          title={cancelDisabled ? cancelHint : undefined}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
            cancelDisabled
              ? 'text-slate-500 bg-slate-800/50 border-slate-800 cursor-not-allowed'
              : 'text-rose-400 hover:text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 cursor-pointer'
          }`}
        >
          {cancelDisabled && <ShieldAlert className="w-3.5 h-3.5" />}
          Cancel
        </button>
        {cancelDisabled && cancelHint && (
          <p className="text-[10px] text-slate-500 max-w-[200px] text-right leading-tight">{cancelHint}</p>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-purple-400" />
        <span>Date: <strong className="text-white">{b.date}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-purple-400" />
        <span>Time: <strong className="text-white">{b.startTime} - {b.endTime}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-purple-400" />
        <span>Court: <strong className="text-white">{b.courtLocationName}</strong></span>
      </div>
    </div>

    {b.focusAreas.length > 0 && (
      <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <strong className="text-slate-300">Selected Focus: </strong>
        <span>{b.focusAreas.join(', ')}</span>
      </div>
    )}
  </div>
);
