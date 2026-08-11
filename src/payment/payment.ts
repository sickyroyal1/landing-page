// Payment abstraction — the app talks to a PaymentProcessor.
// Today this ships with a mock processor (simulated checkout).
// To go live: implement PaymentProcessor with a real gateway
// (e.g. Stripe Checkout / GCash / PayPal) and swap the export below.
// No UI changes needed — PaymentModal stays the same.

export type PaymentMethod = 'card' | 'ewallet' | 'bank' | 'oncourt';

export interface PaymentInput {
  amount: number;
  method: PaymentMethod;
  playerName: string;
  serviceName: string;
}

export interface PaymentResult {
  success: boolean;
  method: PaymentMethod;
  /** Populated for electronic payments — the gateway reference number. */
  receiptId?: string;
  /** true when the player opted to pay cash at the session. */
  onCourt?: boolean;
}

export interface PaymentProcessor {
  readonly displayName: string;
  processPayment(input: PaymentInput): Promise<PaymentResult>;
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard' },
  { id: 'ewallet', label: 'E-wallet / QR', description: 'GCash, PayPal, Maya' },
  { id: 'bank', label: 'Bank Transfer', description: 'Online banking' },
  { id: 'oncourt', label: 'Pay on Court', description: 'Cash at your session' }
];

/** Simulated processor — always succeeds, prints a test-mode receipt. */
export class MockPaymentProcessor implements PaymentProcessor {
  readonly displayName = 'Test Mode — no real charge';

  async processPayment(input: PaymentInput): Promise<PaymentResult> {
    // Simulate gateway latency
    await new Promise((resolve) => setTimeout(resolve, 1800));

    if (input.method === 'oncourt') {
      return { success: true, method: input.method, onCourt: true };
    }

    const receiptId = `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
    return { success: true, method: input.method, receiptId };
  }
}

/** Swap this for a real gateway processor when you set one up. */
export const paymentProcessor: PaymentProcessor = new MockPaymentProcessor();
