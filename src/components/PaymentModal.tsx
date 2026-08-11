import React, { useState } from 'react';
import { BookingRequest } from '../types';
import { X, CreditCard, Wallet, Landmark, HandCoins, Loader2, CheckCircle2, ReceiptText, ShieldCheck } from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod, PaymentResult, paymentProcessor } from '../payment/payment';

export interface PaymentResultItem {
  bookingId: string;
  result: PaymentResult;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRequest[];
  onPaymentComplete: (results: PaymentResultItem[]) => void;
}

const METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  card: <CreditCard className="w-4 h-4" />,
  ewallet: <Wallet className="w-4 h-4" />,
  bank: <Landmark className="w-4 h-4" />,
  oncourt: <HandCoins className="w-4 h-4" />
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onPaymentComplete
}) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [results, setResults] = useState<PaymentResultItem[] | null>(null);

  const totalPrice = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  if (!isOpen || bookings.length === 0) return null;

  const handlePay = async () => {
    if (status === 'processing') return;
    setStatus('processing');
    // One method applies to every selected session; process them all.
    const paid = await Promise.all(
      bookings.map(async (b) => {
        const res = await paymentProcessor.processPayment({
          amount: b.totalPrice,
          method,
          playerName: b.playerName,
          serviceName: b.serviceName
        });
        return { bookingId: b.id, result: res };
      })
    );
    setResults(paid);
    setStatus('success');
    onPaymentComplete(paid);
  };

  const resetAndClose = () => {
    setMethod('card');
    setStatus('idle');
    setResults(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Payment Portal</h3>
              <p className="text-xs text-slate-400">
                {bookings.length > 1 ? `Secure checkout for ${bookings.length} sessions` : 'Secure checkout for your session'}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TEST MODE banner */}
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          {paymentProcessor.displayName} — no real payment will be charged.
        </div>

        {status === 'idle' && (
          <div className="p-6 space-y-5">
            {/* Order summary */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-300 truncate">{b.serviceName}</p>
                    <p className="text-[10px] text-slate-500">
                      {b.date} • {b.startTime} • Coach {b.coachName}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-400 shrink-0">₱{b.totalPrice}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800">
                <p className="text-sm font-bold text-slate-300">Total</p>
                <p className="text-xl font-black text-emerald-400">₱{totalPrice}</p>
              </div>
            </div>

            {/* Method picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose a payment method
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      method === m.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className={`p-2 rounded-lg ${method === m.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {METHOD_ICONS[m.id]}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{m.label}</span>
                      <span className="block text-[11px] text-slate-400">{m.description}</span>
                    </span>
                    <span className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay ₱{totalPrice}
            </button>

            <p className="text-[10px] text-center text-slate-500">
              {method === 'oncourt'
                ? 'You\'ll settle this with your coach at the session.'
                : 'Test checkout — a receipt will be generated, no card is charged.'}
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-sm font-bold text-white">Processing payment…</p>
            <p className="text-xs text-slate-400">Contacting payment gateway — hold tight.</p>
          </div>
        )}

        {status === 'success' && results && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Payment complete!</h4>
              <p className="text-xs text-slate-400 mt-1">All selected sessions are booked and confirmed.</p>
            </div>

            <div className="w-full space-y-2">
              {results.map(({ bookingId, result }) => {
                const b = bookings.find((x) => x.id === bookingId);
                if (!b) return null;
                if (result.receiptId) {
                  return (
                    <div key={bookingId} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                      <ReceiptText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{b.serviceName}</p>
                        <p className="text-xs font-black text-white">{result.receiptId}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</p>
                        <p className="text-sm font-black text-emerald-400">₱{b.totalPrice}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={bookingId} className="p-3 bg-slate-950 rounded-2xl border border-amber-500/20 text-left">
                    <p className="text-xs font-bold text-amber-300">Pay on Court selected</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Bring <strong className="text-white">₱{b.totalPrice}</strong> cash to {b.date} • {b.startTime}.
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
