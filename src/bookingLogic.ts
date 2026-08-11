import { BookingRequest, TimeSlot, UserAccount } from './types';

export interface BookingStateResult {
  bookings: BookingRequest[];
  timeSlots: TimeSlot[];
}

/**
 * Add one or more bookings and mark every booked slot unavailable in a single
 * pass. Returns the same array references when `newBookings` is empty so callers
 * can detect a no-op via identity comparison.
 *
 * NOTE: `BookingRequest.timeSlotId` ↔ `TimeSlot.bookedByBookingId` must stay in
 * sync — this is the one place new bookings are created.
 */
export function confirmBookings(
  bookings: BookingRequest[],
  timeSlots: TimeSlot[],
  newBookings: BookingRequest[]
): BookingStateResult {
  if (newBookings.length === 0) return { bookings, timeSlots };

  // 1. Add all bookings at once (single pass — avoids stale-closure drops between calls)
  const nextBookings = [...newBookings, ...bookings];

  // 2. Mark every booked time slot as unavailable & link its booking ID
  const bookedSlotToBookingId = new Map(newBookings.map(b => [b.timeSlotId, b.id]));
  const nextSlots = timeSlots.map(s =>
    bookedSlotToBookingId.has(s.id)
      ? { ...s, isAvailable: false, bookedByBookingId: bookedSlotToBookingId.get(s.id) }
      : s
  );

  return { bookings: nextBookings, timeSlots: nextSlots };
}

/**
 * Remove a booking and re-enable its time slot. Returns `null` when the booking
 * id isn't found (inputs untouched), so callers can early-return.
 */
export function cancelBooking(
  bookings: BookingRequest[],
  timeSlots: TimeSlot[],
  bookingId: string
): BookingStateResult | null {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  return {
    bookings: bookings.filter(b => b.id !== bookingId),
    timeSlots: timeSlots.map(s =>
      s.id === booking.timeSlotId
        ? { ...s, isAvailable: true, bookedByBookingId: undefined }
        : s
    ),
  };
}

/**
 * Replace a booking. When its `timeSlotId` changed, free the old slot and book
 * the new one. Slots are untouched when the booking is edited in place.
 */
export function updateBooking(
  bookings: BookingRequest[],
  timeSlots: TimeSlot[],
  updatedBooking: BookingRequest
): BookingStateResult {
  const existing = bookings.find(b => b.id === updatedBooking.id);
  let slots = timeSlots;

  if (existing && existing.timeSlotId !== updatedBooking.timeSlotId) {
    // Free the old slot
    slots = slots.map(s =>
      s.id === existing.timeSlotId ? { ...s, isAvailable: true, bookedByBookingId: undefined } : s
    );
    // Book the new slot
    slots = slots.map(s =>
      s.id === updatedBooking.timeSlotId
        ? { ...s, isAvailable: false, bookedByBookingId: updatedBooking.id }
        : s
    );
  }

  return {
    bookings: bookings.map(b => (b.id === updatedBooking.id ? updatedBooking : b)),
    timeSlots: slots,
  };
}

/** Pure gate for booking access — guests (null user) are blocked. */
export function isMember(user: UserAccount | null): boolean {
  return user !== null;
}

// ── 24-hour cancellation policy ──────────────────────────────
// Players may cancel up to 24 hours before the session starts. Outside that
// window a booking is final (coach/admin can still cancel). All logic is pure
// so it can be unit-tested and shared between App and the BookingCard UI.

/** Parse a "HH:MM AM/PM" string into {hours24, minutes}. */
export function parse12h(timeStr: string): { hours24: number; minutes: number } {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hours24: 12, minutes: 0 }; // defensive fallback
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return { hours24: hours, minutes: parseInt(match[2], 10) };
}

/** Local-time Date for when a booking's session starts. */
export function sessionStartDate(booking: BookingRequest): Date {
  const [y, m, d] = booking.date.split('-').map(Number);
  const { hours24, minutes } = parse12h(booking.startTime);
  return new Date(y, (m || 1) - 1, d || 1, hours24, minutes, 0, 0);
}

/**
 * Check whether a player is allowed to cancel a booking. Free before the
 * 24-hour cutoff, locked once within 24h of the session start (or after it).
 * `now` is injectable for tests.
 */
export function canCancelBooking(booking: BookingRequest, now: Date = new Date()): boolean {
  return sessionStartDate(booking).getTime() - now.getTime() > 24 * 60 * 60 * 1000;
}

/** Human-readable reason a cancellation is blocked, or null when allowed. */
export function cancellationRestriction(
  booking: BookingRequest,
  now: Date = new Date()
): string | null {
  if (canCancelBooking(booking, now)) return null;
  return 'Free cancellation is only allowed up to 24 hours before the session. This booking can no longer be cancelled online — contact the coach for assistance.';
}
