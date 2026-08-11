export type SkillLevel = '2.5 - Beginner' | '3.0 - Advanced Beginner' | '3.5 - Intermediate' | '4.0 - Advanced Intermediate' | '4.5+ - Advanced / Tournament';

export type UserRole = 'guest' | 'user' | 'coach' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  coachId?: string; // set when role === 'coach' — links to a CoachProfile
  phone?: string;
  skillLevel?: SkillLevel;
  avatarUrl?: string;
}

export interface CoachingService {
  id: string;
  /** The coach this service belongs to — each coach has their own packages & rates. */
  coachId: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  price: number;
  maxPlayers: number;
  description: string;
  highlights: string[];
  recommendedLevel: string;
  badge?: string;
  popular?: boolean;
}

/**
 * A Philippine region (e.g. "Region VII (Central Visayas)").
 * `code` is the 10-digit PSGC code; `id` is kept for backward compat.
 */
export interface PickleballRegion {
  id: string;
  code: string;        // PSGC region code, e.g. "0700000000"
  name: string;
  description: string;
}

/**
 * A province within a region (e.g. "Negros Oriental" in Region VII).
 * `code` is the 10-digit PSGC province code.
 */
export interface PickleballSubregion {
  id: string;
  code: string;        // PSGC province code, e.g. "0704600000"
  name: string;
  regionCode: string;  // parent PSGC region code
  description?: string;
}

/**
 * A city or municipality (PSGC-mapped). Coaches set availability at this level.
 * `psgcCode` is the 10-digit PSGC code; `id` equals `psgcCode` for new data.
 */
export interface CourtLocation {
  id: string;           // equals psgcCode for PSGC-sourced data
  name: string;         // e.g. "City of Dumaguete"
  psgcCode: string;     // 10-digit PSGC code
  regionCode: string;   // parent PSGC region code
  provinceCode: string; // parent PSGC province code
  address: string;
  type: 'Outdoor' | 'Indoor' | 'Flexible / Private';
  notes?: string;
}

export interface TimeSlot {
  id: string;
  coachId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM AM/PM
  endTime: string; // HH:MM AM/PM
  courtLocationId: string;
  courtLocationName: string;
  isAvailable: boolean;
  bookedByBookingId?: string;
}

export interface BookingRequest {
  id: string;
  coachId: string;
  coachName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlotId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  courtLocationName: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  playerSkillLevel: SkillLevel;
  focusAreas: string[];
  notes?: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'refunded';
  paymentMethod?: string;
  receiptId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  duprRating: string;
  rating: number;
  date: string;
  comment: string;
  sessionType: string;
}

/** A coach accomplishment shown on their profile — image is optional. */
export interface CoachAchievement {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // optional image URL/path
}

export interface CoachProfile {
  id: string;
  name: string;
  title: string;
  certification: string;
  duprRating: number;
  yearsCoaching: number;
  studentsTrained: number;
  bio: string;
  specialties: string[];
  email: string;
  phone: string;
  instagram: string;
  locationCity: string;
  locationIds: string[]; // locations this coach serves
  photo?: string; // coach photo URL/asset path
  achievements?: CoachAchievement[]; // displayed on the profile if showAchievements
  showAchievements?: boolean; // whether to display the achievements section
  availableDays?: number[]; // days of week the coach regularly coaches (0=Sun … 6=Sat); undefined = every day
  preferredCourts?: string[]; // court ids listed as "Preferred Courts" on the profile; undefined = show locationIds
  isActive: boolean; // shown on site & bookable
}

export interface SiteCopy {
  heroHeadline: string;
  heroSubheadline: string;
  heroBadgeText: string;
  servicesTitle: string;
  servicesSubtitle: string;
  coachSectionTitle: string;
  coachSectionSubtitle: string;
}


