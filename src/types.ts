export type SkillLevel = '2.5 - Beginner' | '3.0 - Advanced Beginner' | '3.5 - Intermediate' | '4.0 - Advanced Intermediate' | '4.5+ - Advanced / Tournament';

export type UserRole = 'guest' | 'user' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  skillLevel?: SkillLevel;
  avatarUrl?: string;
}

export interface CoachingService {
  id: string;
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

export interface CourtLocation {
  id: string;
  name: string;
  address: string;
  type: 'Outdoor' | 'Indoor' | 'Flexible / Private';
  notes?: string;
}

export interface TimeSlot {
  id: string;
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

export interface CoachProfile {
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


