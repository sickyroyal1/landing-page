import { CoachingService, CourtLocation, TimeSlot, BookingRequest, Review, CoachProfile, SiteCopy } from '../types';

export const initialSiteCopy: SiteCopy = {
  heroHeadline: "Elevate Your Pickleball Game with Coach Francis at FD Academy",
  heroSubheadline: "Structured 1-on-1 private coaching, partner strategy, and on-court video breakdown with FD Academy. Elevate your DUPR rating with proven mechanics.",
  heroBadgeText: "Accepting New Players • Open Slots This Week",
  servicesTitle: "FD Academy Coaching Programs",
  servicesSubtitle: "Private 1-on-1 lessons, partner strategy sessions, small group clinics, and remote video breakdowns tailored to your skill level.",
  coachSectionTitle: "Meet Coach Francis",
  coachSectionSubtitle: "Dedicated to helping players turn high-level tactical strategies into simple, repeatable habits."
};

const LS_SERVICES_KEY = "pickleball_coach_services_v2";
const LS_SITE_COPY_KEY = "pickleball_coach_site_copy_v2";

export function loadStoredServices(): CoachingService[] {
  try {
    const raw = localStorage.getItem(LS_SERVICES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load services", e);
  }
  return initialServices;
}

export function saveStoredServices(services: CoachingService[]) {
  try {
    localStorage.setItem(LS_SERVICES_KEY, JSON.stringify(services));
  } catch (e) {
    console.error("Failed to save services", e);
  }
}

export function loadStoredSiteCopy(): SiteCopy {
  try {
    const raw = localStorage.getItem(LS_SITE_COPY_KEY);
    if (raw) return { ...initialSiteCopy, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to load site copy", e);
  }
  return initialSiteCopy;
}

export function saveStoredSiteCopy(siteCopy: SiteCopy) {
  try {
    localStorage.setItem(LS_SITE_COPY_KEY, JSON.stringify(siteCopy));
  } catch (e) {
    console.error("Failed to save site copy", e);
  }
}


export const initialCoachProfile: CoachProfile = {
  name: "Francis",
  title: "FD Academy Head Pickleball Professional",
  certification: "PPR Certified Master Pro & IPTPA Level 2",
  duprRating: 5.0,
  yearsCoaching: 8,
  studentsTrained: 1450,
  bio: "Former collegiate tennis athlete turned 5.0 competitive pickleball pro and founder of FD Academy. I specialize in turning high-level tactical strategies into simple, repeatable habits. Whether you want to master the 3rd shot drop, dominate the kitchen line, or break through to 4.0+ DUPR, my structured drills and video breakdowns deliver fast, permanent results.",
  specialties: [
    "3rd Shot Drop & Drive Selection",
    "Kitchen Battles & Reset Mechanics",
    "Stacking & Partner Synergy",
    "Fast Hands & Counter-Attacks",
    "Tournament Mental Toughness"
  ],
  email: "francis@fdacademy.com",
  phone: "(555) 839-2041",
  instagram: "@fd_academy_pickleball",
  locationCity: "FD Academy Courts & Metro Partners"
};

export const initialServices: CoachingService[] = [
  {
    id: "service-1on1-60",
    title: "1-on-1 Private Mastery",
    subtitle: "Personalized technical & tactical overhaul",
    durationMinutes: 60,
    price: 95,
    maxPlayers: 1,
    description: "Dedicated 1-on-1 coaching customized completely to your game goals. Includes video review on court, stroke mechanics tuning, and specific drill plans.",
    highlights: [
      "On-court slow-motion video analysis",
      "Personalized 3rd shot mechanics calibration",
      "Tailored footwork & kitchen positioning",
      "Post-session PDF action report & drills"
    ],
    recommendedLevel: "All Levels (2.5 to 5.0)",
    popular: true,
    badge: "Most Popular"
  },
  {
    id: "service-1on1-90",
    title: "90-Min Intensive Deep Dive",
    subtitle: "Complete game breakdown & live gameplay",
    durationMinutes: 90,
    price: 135,
    maxPlayers: 1,
    description: "Extended session giving ample time for warm-up, core drill sets, live scenario points against Coach Francis, and tactical gameplay adjustments.",
    highlights: [
      "30 mins drill work + 30 mins game scenarios + 30 mins tactical play",
      "Advanced serve/return placement strategies",
      "Resetting high-velocity drives under pressure",
      "In-depth biomechanics adjustment"
    ],
    recommendedLevel: "3.0+ DUPR Players"
  },
  {
    id: "service-2on1-60",
    title: "2-on-1 Partner Strategy",
    subtitle: "Master communication, stacking & doubles positioning",
    durationMinutes: 60,
    price: 130, // total ($65 per player)
    maxPlayers: 2,
    description: "Bring your regular partner! Focus on partner dynamics, middle court coverage, stacking rotations, and targeted opponent exposure.",
    highlights: [
      "Doubles court coverage & middle responsibility rules",
      "Stacking & switching execution drills",
      "Targeting weak spots in opponent pairs",
      "Split-step timing in transition zone"
    ],
    recommendedLevel: "3.0 to 4.5 Doubles Pairs",
    badge: "Great Value for Pairs"
  },
  {
    id: "service-group-4p",
    title: "Small Group Clinic (Up to 4 Players)",
    subtitle: "High-rep dynamic drills & live rotation games",
    durationMinutes: 90,
    price: 180, // ($45 per player)
    maxPlayers: 4,
    description: "Ideal for a group of friends or team members looking for structured, high-energy group drills, dinking patterns, and live situation coaching.",
    highlights: [
      "4-player rapid rotation drills",
      "Competitive kitchen king & queen games",
      "Pressure transition zone defense",
      "Group tactical analysis"
    ],
    recommendedLevel: "2.5 to 4.0 Groups"
  },
  {
    id: "service-video-eval",
    title: "Remote Video Match Breakdown",
    subtitle: "Send your match footage for annotated coaching analysis",
    durationMinutes: 30,
    price: 60,
    maxPlayers: 1,
    description: "Upload a recorded full match or game. Coach Francis will record a voiceover video breakdown with telestrator drawings and a custom 4-week practice program.",
    highlights: [
      "15-minute annotated video breakdown",
      "Unforced error tracking log",
      "Shot selection decision matrix",
      "4-week home & court practice schedule"
    ],
    recommendedLevel: "All Remote Players"
  }
];

export const initialCourts: CourtLocation[] = [
  {
    id: "court-central-park",
    name: "Central Park Pickleball Club",
    address: "1200 S Commerce St (Courts 1-8)",
    type: "Outdoor",
    notes: "Pro outdoor surfaces with lighted courts."
  },
  {
    id: "court-highland-indoor",
    name: "Highland Indoor Racquet Hub",
    address: "450 Airport Blvd, Building B",
    type: "Indoor",
    notes: "Climate controlled wood cushion courts. Zero wind factor."
  },
  {
    id: "court-riverside-park",
    name: "Riverside Park Courts",
    address: "880 Riverside Dr",
    type: "Outdoor",
    notes: "Scenic park location near downtown."
  },
  {
    id: "court-private",
    name: "Your Private / HOA Community Court",
    address: "Client Specified Location (Within 15 miles)",
    type: "Flexible / Private",
    notes: "Coach comes directly to your private or residential court."
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    author: "Marcus Vance",
    duprRating: "4.1 DUPR",
    rating: 5,
    date: "July 24, 2026",
    comment: "Coach Francis fixed my 3rd shot drop in just two sessions. He pointed out a wrist flick error I didn't even know I was doing. Now I can consistently drop into the kitchen from the baseline!",
    sessionType: "1-on-1 Private Mastery"
  },
  {
    id: "rev-2",
    author: "Sarah & David Chen",
    duprRating: "3.5 DUPR Pair",
    rating: 5,
    date: "July 18, 2026",
    comment: "The 2-on-1 session was a game changer for our mixed doubles strategy. Learning how to stack smoothly and communicate in the middle court helped us win our local club tournament last weekend!",
    sessionType: "2-on-1 Partner Strategy"
  },
  {
    id: "rev-3",
    author: "Elena Rostova",
    duprRating: "3.2 DUPR",
    rating: 5,
    date: "July 10, 2026",
    comment: "Alex makes complex strategy so easy to understand. His video review on court gave me instant clarity on my kitchen footwork. Highly recommended for anyone serious about improving!",
    sessionType: "1-on-1 Private Mastery"
  },
  {
    id: "rev-4",
    author: "Tom Miller",
    duprRating: "4.5 DUPR",
    rating: 5,
    date: "June 29, 2026",
    comment: "Even as an advanced player, Alex's counter-attack drills and speed-up resets pushed my game to the next level. Worth every penny.",
    sessionType: "90-Min Intensive Deep Dive"
  }
];

// Helper to generate initial dynamic time slots for next 14 days (8:00 AM - 4:00 PM)
export function generateInitialTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  const sampleTimes = [
    { start: "08:00 AM", end: "09:00 AM" },
    { start: "09:00 AM", end: "10:00 AM" },
    { start: "10:00 AM", end: "11:00 AM" },
    { start: "11:00 AM", end: "12:00 PM" },
    { start: "12:00 PM", end: "01:00 PM" },
    { start: "01:00 PM", end: "02:00 PM" },
    { start: "02:00 PM", end: "03:00 PM" },
    { start: "03:00 PM", end: "04:00 PM" }
  ];

  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    sampleTimes.forEach((time, index) => {
      // Pick court location deterministically
      const courtIndex = (i + index) % initialCourts.length;
      const court = initialCourts[courtIndex];

      // Mark a couple slots as pre-booked for realistic initial state
      const isBooked = (i === 1 && index === 1) || (i === 2 && index === 3) || (i === 4 && index === 0);

      slots.push({
        id: `slot-${dateStr}-${index}`,
        date: dateStr,
        startTime: time.start,
        endTime: time.end,
        courtLocationId: court.id,
        courtLocationName: court.name,
        isAvailable: !isBooked,
        bookedByBookingId: isBooked ? `sample-booking-${i}-${index}` : undefined
      });
    });
  }

  return slots;
}

export const initialBookings: BookingRequest[] = [
  {
    id: "booking-101",
    serviceId: "service-1on1-60",
    serviceName: "1-on-1 Private Mastery",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    timeSlotId: "slot-tomorrow-1",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    durationMinutes: 60,
    courtLocationName: "Central Park Pickleball Club",
    playerName: "Jordan Lee",
    playerEmail: "jordan.l@example.com",
    playerPhone: "(555) 392-1084",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["3rd Shot Drop & Drive", "Kitchen Battles & Dinking"],
    notes: "Struggling with popping up soft dinks under pressure.",
    totalPrice: 95,
    status: "confirmed",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-102",
    serviceId: "service-2on1-60",
    serviceName: "2-on-1 Partner Strategy",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // in 2 days
    timeSlotId: "slot-in2days-3",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    durationMinutes: 60,
    courtLocationName: "Highland Indoor Racquet Hub",
    playerName: "Samantha & Brian Wright",
    playerEmail: "sam.wright@example.com",
    playerPhone: "(555) 781-9921",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["Stacking & Court Positioning", "Fast Hands & Counter-Attacks"],
    notes: "Preparing for state level 3.5 tournament next month.",
    totalPrice: 130,
    status: "confirmed",
    createdAt: new Date().toISOString()
  }
];

// LocalStorage Persistence Keys
const LS_SLOTS_KEY = "pickleball_coach_time_slots_v3";
const LS_BOOKINGS_KEY = "pickleball_coach_bookings_v3";
const LS_PROFILE_KEY = "pickleball_coach_profile_v1";

export function loadStoredTimeSlots(): TimeSlot[] {
  try {
    const raw = localStorage.getItem(LS_SLOTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load time slots", e);
  }
  const initial = generateInitialTimeSlots();
  saveStoredTimeSlots(initial);
  return initial;
}

export function saveStoredTimeSlots(slots: TimeSlot[]) {
  try {
    localStorage.setItem(LS_SLOTS_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error("Failed to save time slots", e);
  }
}

export function loadStoredBookings(): BookingRequest[] {
  try {
    const raw = localStorage.getItem(LS_BOOKINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load bookings", e);
  }
  saveStoredBookings(initialBookings);
  return initialBookings;
}

export function saveStoredBookings(bookings: BookingRequest[]) {
  try {
    localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error("Failed to save bookings", e);
  }
}

export function loadStoredProfile(): CoachProfile {
  try {
    const raw = localStorage.getItem(LS_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return initialCoachProfile;
}

export function saveStoredProfile(profile: CoachProfile) {
  try {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}
