import { describe, it, expect } from 'vitest';
import {
  confirmBookings,
  cancelBooking,
  updateBooking,
  isMember,
  parse12h,
  sessionStartDate,
  canCancelBooking,
  cancellationRestriction,
} from './bookingLogic';
import { BookingRequest, TimeSlot, UserAccount } from './types';

// --- Fixtures -----------------------------------------------------------------

const slot = (id: string, overrides: Partial<TimeSlot> = {}): TimeSlot => ({
  id,
  coachId: 'coach-1',
  date: '2026-08-15',
  startTime: '09:00 AM',
  endTime: '10:00 AM',
  courtLocationId: 'court-1',
  courtLocationName: 'Dumaguete Badminton Center',
  isAvailable: true,
  ...overrides,
});

const booking = (
  id: string,
  slotId: string,
  overrides: Partial<BookingRequest> = {}
): BookingRequest => ({
  id,
  coachId: 'coach-1',
  coachName: 'Coach Francis',
  serviceId: 'service-1on1-60',
  serviceName: '1-on-1 Private Coaching',
  date: '2026-08-15',
  timeSlotId: slotId,
  startTime: '09:00 AM',
  endTime: '10:00 AM',
  durationMinutes: 60,
  courtLocationName: 'Dumaguete Badminton Center',
  playerName: 'Test Player',
  playerEmail: 'test@example.com',
  playerPhone: '09171234567',
  playerSkillLevel: '3.0 - Advanced Beginner',
  focusAreas: ['Dinking'],
  totalPrice: 350,
  status: 'confirmed',
  paymentStatus: 'unpaid',
  createdAt: '2026-08-09T10:00:00.000Z',
  ...overrides,
});

// --- confirmBookings ----------------------------------------------------------

describe('confirmBookings', () => {
  it('creates one booking per slot and marks ALL booked slots unavailable in a single pass', () => {
    const slots = [
      slot('slot-1'),
      slot('slot-2'),
      slot('slot-3'), // stays available — untouched
    ];
    const existing = [booking('bk-0', 'slot-0')];
    const newBookings = [booking('bk-1', 'slot-1'), booking('bk-2', 'slot-2')];

    const { bookings, timeSlots } = confirmBookings(existing, slots, newBookings);

    // Both new bookings added, existing preserved
    expect(bookings).toHaveLength(3);
    expect(bookings.map(b => b.id)).toEqual(['bk-1', 'bk-2', 'bk-0']);

    // Both slots booked & linked to the right booking id
    const slot1 = timeSlots.find(s => s.id === 'slot-1')!;
    const slot2 = timeSlots.find(s => s.id === 'slot-2')!;
    expect(slot1.isAvailable).toBe(false);
    expect(slot1.bookedByBookingId).toBe('bk-1');
    expect(slot2.isAvailable).toBe(false);
    expect(slot2.bookedByBookingId).toBe('bk-2');

    // Untouched slot unchanged
    const slot3 = timeSlots.find(s => s.id === 'slot-3')!;
    expect(slot3.isAvailable).toBe(true);
    expect(slot3.bookedByBookingId).toBeUndefined();
  });

  it('is a no-op (same references) when given no new bookings', () => {
    const slots = [slot('slot-1')];
    const existing = [booking('bk-1', 'slot-1')];

    const result = confirmBookings(existing, slots, []);
    expect(result.bookings).toBe(existing);
    expect(result.timeSlots).toBe(slots);
  });

  it('does not mark a slot twice when two bookings target it (last id wins)', () => {
    const slots = [slot('slot-1')];
    const result = confirmBookings([], slots, [
      booking('bk-a', 'slot-1'),
      booking('bk-b', 'slot-1'),
    ]);
    expect(result.bookings).toHaveLength(2);
    expect(result.timeSlots[0].isAvailable).toBe(false);
    expect(result.timeSlots[0].bookedByBookingId).toBe('bk-b');
  });
});

// --- cancelBooking ------------------------------------------------------------

describe('cancelBooking', () => {
  it('removes the booking and re-enables its time slot', () => {
    const slots = [
      slot('slot-1', { isAvailable: false, bookedByBookingId: 'bk-1' }),
      slot('slot-2'), // untouched
    ];
    const bookingsList = [
      booking('bk-1', 'slot-1'),
      booking('bk-2', 'slot-2'),
    ];

    const result = cancelBooking(bookingsList, slots, 'bk-1');
    expect(result).not.toBeNull();
    expect(result!.bookings.map(b => b.id)).toEqual(['bk-2']);

    const freed = result!.timeSlots.find(s => s.id === 'slot-1')!;
    expect(freed.isAvailable).toBe(true);
    expect(freed.bookedByBookingId).toBeUndefined();

    const untouched = result!.timeSlots.find(s => s.id === 'slot-2')!;
    expect(untouched.isAvailable).toBe(true);
  });

  it('returns null (inputs untouched) for an unknown booking id', () => {
    const slots = [slot('slot-1')];
    const bookingsList = [booking('bk-1', 'slot-1')];

    const result = cancelBooking(bookingsList, slots, 'does-not-exist');
    expect(result).toBeNull();
  });
});

// --- updateBooking ------------------------------------------------------------

describe('updateBooking', () => {
  it('frees the old slot and books the new slot when a booking is moved', () => {
    const slots = [
      slot('slot-1', { isAvailable: false, bookedByBookingId: 'bk-1' }),
      slot('slot-2'),
    ];
    const bookingsList = [booking('bk-1', 'slot-1')];

    const moved = booking('bk-1', 'slot-2', { startTime: '10:00 AM', endTime: '11:00 AM' });
    const result = updateBooking(bookingsList, slots, moved);

    // Old slot freed
    const old = result.timeSlots.find(s => s.id === 'slot-1')!;
    expect(old.isAvailable).toBe(true);
    expect(old.bookedByBookingId).toBeUndefined();

    // New slot booked & linked
    const next = result.timeSlots.find(s => s.id === 'slot-2')!;
    expect(next.isAvailable).toBe(false);
    expect(next.bookedByBookingId).toBe('bk-1');

    // Booking replaced with the new details
    expect(result.bookings[0]).toEqual(moved);
  });

  it('leaves slots untouched when the booking is edited in place (same slot)', () => {
    const slots = [
      slot('slot-1', { isAvailable: false, bookedByBookingId: 'bk-1' }),
      slot('slot-2'),
    ];
    const bookingsList = [booking('bk-1', 'slot-1')];

    const edited = booking('bk-1', 'slot-1', { totalPrice: 500 });
    const result = updateBooking(bookingsList, slots, edited);

    expect(result.timeSlots).toBe(slots); // same references — no slot changes
    expect(result.bookings[0].totalPrice).toBe(500);
  });
});

// --- isMember -----------------------------------------------------------------

describe('isMember', () => {
  it('blocks guests (null user)', () => {
    expect(isMember(null)).toBe(false);
  });

  it('allows any logged-in user regardless of role', () => {
    const player: UserAccount = { id: 'u1', name: 'Ada', email: 'ada@example.com', role: 'user' };
    const admin: UserAccount = { id: 'u2', name: 'Boss', email: 'boss@example.com', role: 'admin' };
    expect(isMember(player)).toBe(true);
    expect(isMember(admin)).toBe(true);
  });
});

// --- 24h cancellation helpers -------------------------------------------------

describe('parse12h', () => {
  it('parses AM/PM into 24-hour time', () => {
    expect(parse12h('09:00 AM')).toEqual({ hours24: 9, minutes: 0 });
    expect(parse12h('09:00 PM')).toEqual({ hours24: 21, minutes: 0 });
    expect(parse12h('12:00 AM')).toEqual({ hours24: 0, minutes: 0 });
    expect(parse12h('12:30 PM')).toEqual({ hours24: 12, minutes: 30 });
    expect(parse12h('4:45 PM')).toEqual({ hours24: 16, minutes: 45 });
  });
});

describe('canCancelBooking', () => {
  // Session: 2026-08-15 09:00 AM local (Asia/Manila — UTC+8)
  const b = () => booking('bk-1', 'slot-1');

  it('allows cancellation more than 24h before the session', () => {
    // 2026-08-14 08:59 AM → 24h01m before the 09:00 start
    expect(canCancelBooking(b(), new Date('2026-08-14T08:59:00+08:00'))).toBe(true);
  });

  it('blocks cancellation within 24h of the session', () => {
    // Exactly 24h before (08-14 09:00 AM) — cutoff is exclusive
    expect(canCancelBooking(b(), new Date('2026-08-14T09:00:00+08:00'))).toBe(false);
    // 1 hour before the session
    expect(canCancelBooking(b(), new Date('2026-08-15T08:00:00+08:00'))).toBe(false);
  });

  it('blocks cancellation after the session started', () => {
    expect(canCancelBooking(b(), new Date('2026-08-15T10:30:00+08:00'))).toBe(false);
  });
});

describe('cancellationRestriction', () => {
  const b = () => booking('bk-1', 'slot-1');

  it('returns null when cancellation is allowed', () => {
    expect(cancellationRestriction(b(), new Date('2026-08-14T08:59:00+08:00'))).toBeNull();
  });

  it('returns a human-readable reason when blocked', () => {
    const reason = cancellationRestriction(b(), new Date('2026-08-14T20:00:00+08:00'));
    expect(reason).not.toBeNull();
    expect(reason).toContain('24 hours');
  });
});

describe('sessionStartDate', () => {
  it('builds the correct local-time Date from date + startTime', () => {
    const start = sessionStartDate(booking('bk-1', 'slot-1'));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(7); // August (0-indexed)
    expect(start.getDate()).toBe(15);
    expect(start.getHours()).toBe(9);
    expect(start.getMinutes()).toBe(0);
  });
});
