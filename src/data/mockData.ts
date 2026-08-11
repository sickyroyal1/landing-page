import { CoachingService, CourtLocation, PickleballRegion, PickleballSubregion, TimeSlot, BookingRequest, Review, CoachProfile, SiteCopy, UserAccount } from '../types';

// Coach portrait asset (Francis) — bundled via Vite so it resolves to a real URL
import francisPhoto from '../assets/images/coach_portrait_1785645192774.jpg';

// ── Local timezone helpers (avoids UTC off-by-one from toISOString) ─────────

/** Formats a Date as YYYY-MM-DD using local timezone components. */
export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's YYYY-MM-DD in the user's local timezone. */
export function todayLocalStr(): string {
  return toLocalDateStr(new Date());
}

/** YYYY-MM-DD for N days from today in the user's local timezone. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

export const initialSiteCopy: SiteCopy = {
  heroHeadline: "Master the Kitchen. Own the 3rd Shot Drop.",
  heroSubheadline: "",
  heroBadgeText: "Multiple Pro Coaches • Open Slots This Week",
  servicesTitle: "Coaching Programs",
  servicesSubtitle: "Focus on what you want to improve — foot drills, the 3rd shot drop, drives, dinking, or full tournament strategy. Pick a session, set your goal, and get coaching built around your game.",
  coachSectionTitle: "Meet the Coaches",
  coachSectionSubtitle: "Dedicated pros helping players turn high-level tactical strategies into simple, repeatable habits."
};

const LS_SERVICES_KEY = "pickleball_coach_services_v4";
const LS_SITE_COPY_KEY = "pickleball_coach_site_copy_v4";

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

export const initialCoaches: CoachProfile[] = [
  {
    id: "coach-francis",
    name: "Francis",
    title: "Head Pickleball Professional, PB Coach",
    certification: "",
    duprRating: 3.9,
    yearsCoaching: 8,
    studentsTrained: 50,
    bio: "Former collegiate tennis athlete turned 5.0 competitive pickleball player and founder of PB Coach. I specialize in turning high-level tactical strategies into simple, repeatable habits. Whether you want to master the 3rd shot drop, dominate the kitchen line, or break through to 4.0+ DUPR, my structured drills and video breakdowns deliver fast, permanent results.",
    specialties: [
      "3rd Shot Drop & Drive Selection",
      "Kitchen Battles & Reset Mechanics",
      "Stacking & Partner Synergy",
      "Fast Hands & Counter-Attacks",
      "Tournament Mental Toughness"
    ],
    email: "francis@pbcoach.com",
    phone: "+63 917 839 2041",
    instagram: "@pbcoach_pickleball",
    locationCity: "Dumaguete City & nearby areas",
    locationIds: ["0704610000", "0704620000"],
    photo: francisPhoto,
    achievements: [
      { id: "ach-francis-1", title: "SIX ZERO 1st Tournament", description: "Men's Beginner — 4th Place", imageUrl: "/achievements/medal-4th.svg" },
      { id: "ach-francis-2", title: "San Jose SK Tournament", description: "Men's Beginner — Bronze", imageUrl: "/achievements/medal-bronze.svg" },
      { id: "ach-francis-3", title: "Sneaky Picklers Club Tournament", description: "Open Category — Bronze", imageUrl: "/achievements/medal-bronze.svg" },
      { id: "ach-francis-4", title: "Barangay Magatas First Tournament", description: "Men's Category — Silver", imageUrl: "/achievements/medal-silver.svg" }
    ],
    showAchievements: true,
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    preferredCourts: ["0704610000", "0704620000", "0704623000", "0704609000", "0704603000"],
    isActive: true
  },
  {
    id: "coach-dana",
    name: "Dana Reyes",
    title: "Pickleball Fundamentals Instructor",
    certification: "",
    duprRating: 4.5,
    yearsCoaching: 5,
    studentsTrained: 620,
    bio: "Competitive tournament player passionate about developing strong fundamentals and confident kitchen play. Dana's sessions focus on consistency, footwork, and building a reliable dinking game for players of every level.",
    specialties: [
      "Dinking & Reset Fundamentals",
      "Serve & Return Placement",
      "Footwork & Split-Step Timing",
      "Beginner to 3.5 Development"
    ],
    email: "dana@pbcoach.com",
    phone: "+63 918 772 4309",
    instagram: "@dana_coaches",
    locationCity: "Northern & Upper Northern areas",
    locationIds: ["0704621000", "0704604000", "0704615000", "0704611000", "0704612000"],
    photo: "",
    achievements: [
      { id: "ach-dana-1", title: "5.0 Competitive Player", description: "Rated 5.0 and competing in regional tournaments across Visayas." },
      { id: "ach-dana-2", title: "620+ Players Coached", description: "Fundamentals-first coaching trusted by hundreds of beginners." }
    ],
    showAchievements: true,
    availableDays: [1, 2, 3, 4, 5, 6], // Sundays off
    preferredCourts: ["0704621000", "0704604000", "0704615000", "0704601000", "0704611000", "0704612000"],
    isActive: true
  },
  {
    id: "coach-marcus",
    name: "Marcus Chen",
    title: "Tournament & Strategy Specialist",
    certification: "",
    duprRating: 4.8,
    yearsCoaching: 6,
    studentsTrained: 890,
    bio: "Former pro-level competitor who loves the tactical side of the game. Marcus breaks down doubles strategy, stacking, and shot selection so players think the game at the next level and win more points in tight matches.",
    specialties: [
      "Doubles Strategy & Stacking",
      "3rd Shot Options & Shot Selection",
      "Transition Zone Control",
      "Tournament Preparation"
    ],
    email: "marcus@pbcoach.com",
    phone: "+63 919 208 7741",
    instagram: "@marcus_pickleball",
    locationCity: "Southern Negros Oriental",
    locationIds: ["0704609000", "0704625000", "0704603000", "0704619000", "0704606000", "0704618000", "0704605000"],
    photo: "",
    achievements: [
      { id: "ach-marcus-1", title: "Former Pro-Level Competitor", description: "Competed at the national level before turning to coaching." },
      { id: "ach-marcus-2", title: "890+ Students Trained", description: "Go-to specialist for doubles strategy & tournament preparation." }
    ],
    showAchievements: true,
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    preferredCourts: ["0704609000", "0704625000", "0704603000", "0704619000", "0704618000", "0704606000", "0704605000"],
    isActive: true
  },
  {
    id: "coach-paolo",
    name: "Paolo Villanueva",
    title: "Highland & Doubles Specialist",
    certification: "",
    duprRating: 4.3,
    yearsCoaching: 4,
    studentsTrained: 380,
    bio: "Valencia-based coach focused on highland players and doubles teams. Paolo emphasizes court movement, serve placement, and building a consistent rally game you can rely on in matches.",
    specialties: [
      "Highland & HOA Court Sessions",
      "Serve & Return Placement",
      "Doubles Positioning",
      "Rally Consistency"
    ],
    email: "paolo@pbcoach.com",
    phone: "+63 920 314 8820",
    instagram: "@paolo_pickleball",
    locationCity: "Valencia & central Negros Oriental",
    locationIds: ["0704623000", "0704610000"],
    photo: "",
    achievements: [
      { id: "ach-paolo-1", title: "Valencia Community Builder", description: "Grew pickleball across the highland private & HOA courts." },
      { id: "ach-paolo-2", title: "380+ Players Developed", description: "Doubles-focused coaching for teams and local leagues." }
    ],
    showAchievements: true,
    availableDays: [1, 2, 3, 4, 5, 6], // Sundays off
    preferredCourts: ["0704623000", "0704610000", "0704620000"],
    isActive: true
  },
  {
    id: "coach-jenna",
    name: "Jenna Marquez",
    title: "Female Fundamentals & Drills Coach",
    certification: "",
    duprRating: 4.2,
    yearsCoaching: 3,
    studentsTrained: 210,
    bio: "Passionate about building confident beginners and steady intermediate players. Jenna's structured drill sessions make learning fun and fast, from first-ever games to 3.5+ advancement.",
    specialties: [
      "Beginner Development",
      "Dinking & Soft Game",
      "Footwork & Balance",
      "Women's Group Clinics"
    ],
    email: "jenna@pbcoach.com",
    phone: "+63 921 906 1187",
    instagram: "@jenna_pickleball",
    locationCity: "Manjuyod, Amlan & surrounding areas",
    locationIds: ["0704615000", "0704601000"],
    photo: "",
    achievements: [
      { id: "ach-jenna-1", title: "Women's Clinics Founder", description: "Leads weekly women's group clinics in Manjuyod & Amlan." },
      { id: "ach-jenna-2", title: "210+ Players Coached", description: "From first-ever games to steady 3.5+ advancement." }
    ],
    showAchievements: true,
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    preferredCourts: ["0704615000", "0704601000", "0704604000", "0704621000"],
    isActive: true
  },
  {
    id: "coach-karlo",
    name: "Karlo Bautista",
    title: "Power & Attack Coach",
    certification: "",
    duprRating: 4.6,
    yearsCoaching: 5,
    studentsTrained: 510,
    bio: "Up-and-coming power player known for a big serve and aggressive attacks. Karlo trains far-north players in Guihulngan, Jimalalud, and La Libertad, teaching controlled aggression and reliable drives.",
    specialties: [
      "Power Drives & Erne Attacks",
      "Serve & Return Power",
      "Transition Zone Punishing",
      "Youth & Junior Clinics"
    ],
    email: "karlo@pbcoach.com",
    phone: "+63 922 623 4472",
    instagram: "@karlo_pickleball",
    locationCity: "Guihulngan, Jimalalud & La Libertad",
    locationIds: ["0704613000", "0704611000", "0704612000"],
    photo: "",
    achievements: [
      { id: "ach-karlo-1", title: "Power Game Specialist", description: "Known for developing explosive drives and erne attacks." },
      { id: "ach-karlo-2", title: "Youth Clinics", description: "Runs junior & youth programs across the far-north corridor." }
    ],
    showAchievements: true,
    availableDays: [1, 2, 3, 4, 5, 6], // Sundays off
    preferredCourts: ["0704611000", "0704612000", "0704613000", "0704615000"],
    isActive: true
  },
  {
    id: "coach-lena",
    name: "Lena Navarro",
    title: "Deep South Community Coach",
    certification: "",
    duprRating: 4.1,
    yearsCoaching: 2,
    studentsTrained: 150,
    bio: "Rooted in the far southwest, Lena brings pickleball to Sta. Catalina, Bayawan, and Basay. She loves introducing new players to the sport and building welcoming community games.",
    specialties: [
      "New Player Introductions",
      "Community & Social Play",
      "Fundamentals Bootcamps",
      "Family Sessions"
    ],
    email: "lena@pbcoach.com",
    phone: "+63 927 845 3390",
    instagram: "@lena_pickleball",
    locationCity: "Sta. Catalina, Bayawan & Basay",
    locationIds: ["0704618000", "0704606000", "0704605000"],
    photo: "",
    achievements: [
      { id: "ach-lena-1", title: "Deep South Pioneer", description: "Introduced pickleball to Sta. Catalina, Bayawan & Basay." },
      { id: "ach-lena-2", title: "Community Play Founder", description: "Builds welcoming weekly community games for new players." }
    ],
    showAchievements: true,
    availableDays: [1, 2, 3, 4, 5], // weekdays only — weekends off
    preferredCourts: ["0704618000", "0704606000", "0704605000", "0704619000"],
    isActive: true
  }
];

// Services & pricing are per-coach: every service is tied to exactly one coach
// via `coachId`. The admin Services & Pricing section edits each coach's own
// packages, and each coach's portal shows only their own rates.
export const initialServices: CoachingService[] = [
  /* ── Francis ─────────────────────────────────────────────────────────── */
  {
    id: "service-1on1-60",
    coachId: "coach-francis",
    title: "1-on-1 Private Mastery",
    subtitle: "Personalized technical & tactical overhaul",
    durationMinutes: 60,
    price: 250, // ₱250
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
    id: "service-2on1-60",
    coachId: "coach-francis",
    title: "2-on-1 Partner Strategy",
    subtitle: "Master communication, stacking & doubles positioning",
    durationMinutes: 60,
    price: 350, // total (₱175 per player)
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
    coachId: "coach-francis",
    title: "Small Group Clinic (Up to 4 Players)",
    subtitle: "High-rep dynamic drills & live rotation games",
    durationMinutes: 90,
    price: 500, // total (₱125 per player)
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

  /* ── Dana Reyes — fundamentals-focused, friendly pricing ─────────────── */
  {
    id: "service-dana-1on1-60",
    coachId: "coach-dana",
    title: "1-on-1 Fundamentals",
    subtitle: "Consistency, footwork & a reliable dinking game",
    durationMinutes: 60,
    price: 200,
    maxPlayers: 1,
    description: "Build a rock-solid foundation with focused drills on consistency, split-step timing, and controlled kitchen play.",
    highlights: [
      "Dinking & reset fundamentals",
      "Split-step & recovery footwork",
      "Serve & return placement",
      "Post-session progress notes"
    ],
    recommendedLevel: "2.5 to 3.5",
    popular: true
  },
  {
    id: "service-dana-2on1-60",
    coachId: "coach-dana",
    title: "2-on-1 Basics & Drills",
    subtitle: "Partner drills for a confident rally game",
    durationMinutes: 60,
    price: 280, // total (₱140 per player)
    maxPlayers: 2,
    description: "Grab a friend and build a steady, reliable rally game with structured partner drills and live-feed feedback.",
    highlights: [
      "Partner dinking patterns",
      "Middle-court coverage basics",
      "Rally consistency drills",
      "Beginner-friendly pacing"
    ],
    recommendedLevel: "2.5 to 3.5 Pairs"
  },
  {
    id: "service-dana-group-90",
    coachId: "coach-dana",
    title: "Beginner Group Clinic (Up to 4)",
    subtitle: "Learn the game together in a supportive group",
    durationMinutes: 90,
    price: 400, // total (₱100 per player)
    maxPlayers: 4,
    description: "A patient, step-by-step clinic for new players and early intermediates covering rules, grips, and first rally patterns.",
    highlights: [
      "Rules, grips & stance basics",
      "Controlled dinking warm-ups",
      "Live rotation mini-games",
      "Q&A after the session"
    ],
    recommendedLevel: "New to 3.0 Groups",
    badge: "Best for Beginners"
  },

  /* ── Marcus Chen — tournament specialist, premium rates ─────────────── */
  {
    id: "service-marcus-1on1-60",
    coachId: "coach-marcus",
    title: "1-on-1 Tournament Strategy",
    subtitle: "Doubles tactics, stacking & shot selection",
    durationMinutes: 60,
    price: 350,
    maxPlayers: 1,
    description: "Think the game at the next level. Tactical 1-on-1 coaching that breaks down shot selection, transitions, and in-match decision-making.",
    highlights: [
      "3rd shot options & shot selection",
      "Stacking & switching execution",
      "Transition zone control",
      "Scouting opponent weaknesses"
    ],
    recommendedLevel: "3.5 to 5.0",
    popular: true,
    badge: "Pro Level"
  },
  {
    id: "service-marcus-1on1-90",
    coachId: "coach-marcus",
    title: "90-Min Intensive Deep Dive",
    subtitle: "Pressure-game reps & match preparation",
    durationMinutes: 90,
    price: 550,
    maxPlayers: 1,
    description: "A longer, higher-intensity session for players preparing for tournaments — full-game reps, situational drills, and detailed match analysis.",
    highlights: [
      "Live pressure-game simulations",
      "Tournament match strategy",
      "Serve & return under pressure",
      "Full video breakdown"
    ],
    recommendedLevel: "4.0 to 5.0"
  },
  {
    id: "service-marcus-video-45",
    coachId: "coach-marcus",
    title: "Video Match Review",
    subtitle: "Break down your recorded matches, frame by frame",
    durationMinutes: 45,
    price: 200,
    maxPlayers: 1,
    description: "Send Marcus a recording of your match and get a detailed breakdown of patterns, missed reads, and the adjustments that win points.",
    highlights: [
      "Frame-by-frame point analysis",
      "Pattern & error identification",
      "Written action plan",
      "Redeemable on court after"
    ],
    recommendedLevel: "All Levels"
  },

  /* ── Paolo Villanueva — doubles & highland specialist ───────────────── */
  {
    id: "service-paolo-1on1-60",
    coachId: "coach-paolo",
    title: "1-on-1 Highland Coaching",
    subtitle: "Court movement, serve placement & rally game",
    durationMinutes: 60,
    price: 280,
    maxPlayers: 1,
    description: "Valencia-area 1-on-1 coaching that sharpens court movement, serve placement, and building a rally game you can trust in matches.",
    highlights: [
      "Serve placement patterns",
      "Rally consistency drills",
      "Court movement & recovery",
      "Highland & HOA court experience"
    ],
    recommendedLevel: "3.0 to 4.5"
  },
  {
    id: "service-paolo-2on1-60",
    coachId: "coach-paolo",
    title: "2-on-1 Doubles Strategy",
    subtitle: "Positioning, communication & team play",
    durationMinutes: 60,
    price: 320, // total (₱160 per player)
    maxPlayers: 2,
    description: "Focused doubles coaching for teams and league pairs — positioning, communication, and coordinated shot patterns.",
    highlights: [
      "Doubles positioning & court coverage",
      "Partner communication systems",
      "Serve & return as a team",
      "League-match preparation"
    ],
    recommendedLevel: "3.0 to 4.5 Pairs",
    popular: true
  },
  {
    id: "service-paolo-group-90",
    coachId: "coach-paolo",
    title: "Highland Group Clinic (Up to 4)",
    subtitle: "High-energy drills on your local courts",
    durationMinutes: 90,
    price: 450, // total (₱112 per player)
    maxPlayers: 4,
    description: "A fast-moving group clinic for highland communities — rotation drills, live games, and doubles-focused coaching.",
    highlights: [
      "Rapid rotation drills",
      "Live doubles games",
      "Positioning emphasis",
      "Local court knowledge"
    ],
    recommendedLevel: "2.5 to 4.0 Groups"
  },

  /* ── Jenna Marquez — women's & drills coach ─────────────────────────── */
  {
    id: "service-jenna-1on1-60",
    coachId: "coach-jenna",
    title: "1-on-1 Drill Intensive",
    subtitle: "Structured drills for fast, fun improvement",
    durationMinutes: 60,
    price: 230,
    maxPlayers: 1,
    description: "Structured, high-energy 1-on-1 drills that make fundamentals stick — from first-ever games to steady 3.5+ advancement.",
    highlights: [
      "Structured drill progressions",
      "Soft game & dinking focus",
      "Footwork & balance work",
      "Fun, encouraging pace"
    ],
    recommendedLevel: "2.5 to 3.5",
    popular: true
  },
  {
    id: "service-jenna-group-90",
    coachId: "coach-jenna",
    title: "Women's Group Clinic",
    subtitle: "Weekly clinic built for women players",
    durationMinutes: 90,
    price: 400, // total (₱100 per player)
    maxPlayers: 4,
    description: "Jenna's signature women's clinic — a welcoming space to drill fundamentals, play games, and build confidence on the court.",
    highlights: [
      "Beginner-friendly drilling",
      "Confidence-building games",
      "Women's community play",
      "Q&A and goal setting"
    ],
    recommendedLevel: "New to 3.5 Women",
    badge: "Women's"
  },

  /* ── Karlo Bautista — power & youth coach ───────────────────────────── */
  {
    id: "service-karlo-1on1-60",
    coachId: "coach-karlo",
    title: "Power Drive 1-on-1",
    subtitle: "Controlled aggression & reliable drives",
    durationMinutes: 60,
    price: 300,
    maxPlayers: 1,
    description: "Develop a big serve and aggressive drives with proper mechanics — power you can control under pressure.",
    highlights: [
      "Power drive mechanics",
      "Erne attack setups",
      "Transition zone punishing",
      "Serve & return power"
    ],
    recommendedLevel: "3.0 to 4.5"
  },
  {
    id: "service-karlo-2on1-60",
    coachId: "coach-karlo",
    title: "Power Doubles Session",
    subtitle: "Aggressive doubles for attacking pairs",
    durationMinutes: 60,
    price: 360, // total (₱180 per player)
    maxPlayers: 2,
    description: "Two players, one attacking game plan — drives, poaches, and fast hands built for pairs that want to take control.",
    highlights: [
      "Aggressive serving patterns",
      "Poaching & fast hands",
      "Speed-up timing",
      "Attacking transition play"
    ],
    recommendedLevel: "3.5 to 4.5 Pairs"
  },
  {
    id: "service-karlo-group-60",
    coachId: "coach-karlo",
    title: "Youth & Junior Clinic",
    subtitle: "Fun, high-energy sessions for young players",
    durationMinutes: 60,
    price: 350, // total (₱58 per player)
    maxPlayers: 6,
    description: "Karlo's popular youth program — big serves, quick hands, and game-based learning in a high-energy, kid-friendly format.",
    highlights: [
      "Game-based skill stations",
      "Serve & rally challenges",
      "Hand-eye coordination drills",
      "Sibling & friend discounts"
    ],
    recommendedLevel: "Juniors 8–16",
    badge: "Junior Friendly"
  },

  /* ── Lena Navarro — community & entry-level coach ───────────────────── */
  {
    id: "service-lena-1on1-60",
    coachId: "coach-lena",
    title: "1-on-1 Intro Coaching",
    subtitle: "Your first session, done right",
    durationMinutes: 60,
    price: 200,
    maxPlayers: 1,
    description: "A relaxed first session covering grips, rules, and your first rally patterns — perfect for total beginners.",
    highlights: [
      "Grips, stance & rules",
      "First serve & return reps",
      "Gentle dinking intro",
      "A plan for your next steps"
    ],
    recommendedLevel: "Brand New to 2.5",
    popular: true
  },
  {
    id: "service-lena-group-90",
    coachId: "coach-lena",
    title: "Community Group Clinic (Up to 6)",
    subtitle: "Welcome, learn & play together",
    durationMinutes: 90,
    price: 300, // total (₱50 per player)
    maxPlayers: 6,
    description: "Lena's signature community session — a welcoming, social clinic for new players and families to learn the game together.",
    highlights: [
      "Social, low-pressure drills",
      "Family & friend friendly",
      "Community game time",
      "Post-session meet-up"
    ],
    recommendedLevel: "New Players & Families",
    badge: "New Players Welcome"
  }
];

// The geographic hierarchy (region → province → city/municipality) now comes from
// the official PSGC API via src/data/psgc.ts. These arrays are static fallbacks
// (Region VII / Central Visayas → Negros Oriental) shown while the API loads.
export const initialRegions: PickleballRegion[] = [
  {
    id: "region-vii",
    code: "0700000000",
    name: "Region VII (Central Visayas)",
    description: "Cebu, Bohol, Siquijor & Negros Oriental"
  }
];

export const initialSubregions: PickleballSubregion[] = [
  {
    id: "subregion-negros-oriental",
    code: "0704600000",
    name: "Negros Oriental",
    regionCode: "0700000000",
    description: "Dumaguete City & 24 municipalities"
  }
];

// All 25 cities/municipalities of Negros Oriental, keyed by their official PSGC
// code. `id` equals `psgcCode` so coach `locationIds` can be matched directly
// against the PSGC city list fetched from the API. Banilad is a barangay of
// Dumaguete City, so it is not a separate entry.
export const initialCourts: CourtLocation[] = [
  {
    id: "0704601000",
    name: "Amlan",
    psgcCode: "0704601000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Amlan, Negros Oriental",
    type: "Flexible / Private",
    notes: "Private & HOA courts in Amlan."
  },
  {
    id: "0704602000",
    name: "Ayungon",
    psgcCode: "0704602000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Ayungon, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Ayungon."
  },
  {
    id: "0704603000",
    name: "Bacong",
    psgcCode: "0704603000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Bacong, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Bacong, just south of Dumaguete."
  },
  {
    id: "0704604000",
    name: "City of Bais",
    psgcCode: "0704604000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Bais City, Negros Oriental",
    type: "Outdoor",
    notes: "City courts in Bais."
  },
  {
    id: "0704605000",
    name: "Basay",
    psgcCode: "0704605000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Basay, Negros Oriental",
    type: "Flexible / Private",
    notes: "Private & HOA courts in Basay."
  },
  {
    id: "0704606000",
    name: "City of Bayawan",
    psgcCode: "0704606000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Bayawan City, Negros Oriental",
    type: "Indoor",
    notes: "City courts & covered facilities in Bayawan."
  },
  {
    id: "0704607000",
    name: "Bindoy",
    psgcCode: "0704607000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Bindoy, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Bindoy."
  },
  {
    id: "0704608000",
    name: "Canlaon",
    psgcCode: "0704608000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Canlaon City, Negros Oriental",
    type: "Outdoor",
    notes: "City courts in Canlaon."
  },
  {
    id: "0704609000",
    name: "Dauin",
    psgcCode: "0704609000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Dauin, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Dauin."
  },
  {
    id: "0704610000",
    name: "City of Dumaguete",
    psgcCode: "0704610000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Dumaguete City, Negros Oriental",
    type: "Indoor",
    notes: "City courts & covered facilities, incl. the Banilad barangay."
  },
  {
    id: "0704611000",
    name: "City of Guihulngan",
    psgcCode: "0704611000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Guihulngan City, Negros Oriental",
    type: "Outdoor",
    notes: "City courts in Guihulngan."
  },
  {
    id: "0704612000",
    name: "Jimalalud",
    psgcCode: "0704612000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Jimalalud, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Jimalalud."
  },
  {
    id: "0704613000",
    name: "La Libertad",
    psgcCode: "0704613000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "La Libertad, Negros Oriental",
    type: "Flexible / Private",
    notes: "Private & HOA courts in La Libertad."
  },
  {
    id: "0704614000",
    name: "Mabinay",
    psgcCode: "0704614000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Mabinay, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Mabinay."
  },
  {
    id: "0704615000",
    name: "Manjuyod",
    psgcCode: "0704615000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Manjuyod, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Manjuyod."
  },
  {
    id: "0704616000",
    name: "Pamplona",
    psgcCode: "0704616000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Pamplona, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Pamplona."
  },
  {
    id: "0704617000",
    name: "San Jose",
    psgcCode: "0704617000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "San Jose, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in San Jose."
  },
  {
    id: "0704618000",
    name: "Santa Catalina",
    psgcCode: "0704618000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Sta. Catalina, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Sta. Catalina."
  },
  {
    id: "0704619000",
    name: "Siaton",
    psgcCode: "0704619000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Siaton, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Siaton."
  },
  {
    id: "0704620000",
    name: "Sibulan",
    psgcCode: "0704620000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Sibulan, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts just north of Dumaguete."
  },
  {
    id: "0704621000",
    name: "City of Tanjay",
    psgcCode: "0704621000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Tanjay City, Negros Oriental",
    type: "Outdoor",
    notes: "City courts in Tanjay."
  },
  {
    id: "0704622000",
    name: "Tayasan",
    psgcCode: "0704622000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Tayasan, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Tayasan."
  },
  {
    id: "0704623000",
    name: "Valencia",
    psgcCode: "0704623000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Valencia, Negros Oriental",
    type: "Flexible / Private",
    notes: "Highland area — private & HOA courts."
  },
  {
    id: "0704624000",
    name: "Vallehermoso",
    psgcCode: "0704624000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Vallehermoso, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Vallehermoso."
  },
  {
    id: "0704625000",
    name: "Zamboanguita",
    psgcCode: "0704625000",
    regionCode: "0700000000",
    provinceCode: "0704600000",
    address: "Zamboanguita, Negros Oriental",
    type: "Outdoor",
    notes: "Town courts in Zamboanguita."
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    author: "Marcus Vance",
    duprRating: "4.1 DUPR",
    rating: 5,
    date: "July 24, 2026",
    comment: "My coach fixed my 3rd shot drop in just two sessions. He pointed out a wrist flick error I didn't even know I was doing. Now I can consistently drop into the kitchen from the baseline!",
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
    comment: "The coach makes complex strategy so easy to understand. The on-court video review gave me instant clarity on my kitchen footwork. Highly recommended for anyone serious about improving!",
    sessionType: "1-on-1 Private Mastery"
  },
  {
    id: "rev-4",
    author: "Tom Miller",
    duprRating: "4.5 DUPR",
    rating: 5,
    date: "June 29, 2026",
    comment: "Even as an advanced player, the counter-attack drills and speed-up resets pushed my game to the next level. Worth every penny.",
    sessionType: "90-Min Intensive Deep Dive"
  }
];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** True when the coach regularly coaches on the weekday of `date` (0=Sun … 6=Sat). */
const isCoachAvailableOn = (coach: CoachProfile, date: Date) =>
  (coach.availableDays ?? ALL_DAYS).includes(date.getDay());

// Helper to generate initial dynamic time slots for next 14 days (8:00 AM - 4:00 PM) per active coach
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

  initialCoaches.filter((c) => c.isActive).forEach((coach) => {
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      // Skip days the coach is regularly unavailable (e.g. weekends off)
      if (!isCoachAvailableOn(coach, currentDate)) continue;
      const dateStr = toLocalDateStr(currentDate);

      sampleTimes.forEach((time, index) => {
        // Cycle through the coach's locations deterministically
        const locIndex = (i + index) % coach.locationIds.length;
        const courtId = coach.locationIds[locIndex];
        const court = initialCourts.find((c) => c.id === courtId) ?? initialCourts[0];

        // Mark a couple slots per coach as pre-booked for a realistic initial state
        const isBooked = (i === 1 && index === 1) || (i === 2 && index === 3);

        slots.push({
          id: `slot-${coach.id}-${dateStr}-${index}`,
          coachId: coach.id,
          date: dateStr,
          startTime: time.start,
          endTime: time.end,
          courtLocationId: court.id,
          courtLocationName: court.name,
          isAvailable: !isBooked,
          bookedByBookingId: isBooked ? `sample-booking-${coach.id}-${i}-${index}` : undefined
        });
      });
    }
  });

  return slots;
}

/** Builds a fresh 14-day schedule for a coach who just registered on the site. */
export function generateCoachSlots(coach: CoachProfile, courts: CourtLocation[]): TimeSlot[] {
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
    // Skip days the coach is regularly unavailable (e.g. weekends off)
    if (!isCoachAvailableOn(coach, currentDate)) continue;
    const dateStr = toLocalDateStr(currentDate);

    sampleTimes.forEach((time, index) => {
      const locIndex = (i + index) % coach.locationIds.length;
      const courtId = coach.locationIds[locIndex];
      const court = courts.find((c) => c.id === courtId) ?? courts[0];

      slots.push({
        id: `slot-${coach.id}-${dateStr}-${index}`,
        coachId: coach.id,
        date: dateStr,
        startTime: time.start,
        endTime: time.end,
        courtLocationId: court.id,
        courtLocationName: court.name,
        isAvailable: true,
        bookedByBookingId: undefined
      });
    });
  }

  return slots;
}

export const initialBookings: BookingRequest[] = [
  {
    id: "booking-101",
    coachId: "coach-francis",
    coachName: "Francis",
    serviceId: "service-1on1-60",
    serviceName: "1-on-1 Private Mastery",
    date: daysFromToday(1), // tomorrow
    timeSlotId: "slot-tomorrow-1",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    durationMinutes: 60,
    courtLocationName: "Dumaguete City",
    playerName: "Jordan Lee",
    playerEmail: "jordan.l@example.com",
    playerPhone: "+63 917 392 1084",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["3rd Shot Drop & Drive", "Kitchen Battles & Dinking"],
    notes: "Struggling with popping up soft dinks under pressure.",
    totalPrice: 1500,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Card",
    receiptId: "RCP-100123",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-102",
    coachId: "coach-francis",
    coachName: "Francis",
    serviceId: "service-2on1-60",
    serviceName: "2-on-1 Partner Strategy",
    date: daysFromToday(2), // in 2 days
    timeSlotId: "slot-in2days-3",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    durationMinutes: 60,
    courtLocationName: "Banilad",
    playerName: "Samantha & Brian Wright",
    playerEmail: "sam.wright@example.com",
    playerPhone: "+63 918 781 9921",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["Stacking & Court Positioning", "Fast Hands & Counter-Attacks"],
    notes: "Preparing for state level 3.5 tournament next month.",
    totalPrice: 2000,
    status: "confirmed",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-103",
    coachId: "coach-dana",
    coachName: "Dana Reyes",
    serviceId: "service-1on1-60",
    serviceName: "1-on-1 Private Mastery",
    date: daysFromToday(3), // in 3 days
    timeSlotId: "slot-coach-dana-day3-0",
    startTime: "08:00 AM",
    endTime: "09:00 AM",
    durationMinutes: 60,
    courtLocationName: "Tanjay City",
    playerName: "Priya Natarajan",
    playerEmail: "priya.n@example.com",
    playerPhone: "+63 919 118 7732",
    playerSkillLevel: "3.0 - Advanced Beginner",
    focusAreas: ["Dinking & Reset Fundamentals"],
    notes: "Brand new to dinking strategy.",
    totalPrice: 1500,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "E-wallet",
    receiptId: "RCP-100124",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-104",
    coachId: "coach-marcus",
    coachName: "Marcus Chen",
    serviceId: "service-group-4p",
    serviceName: "Small Group Clinic (Up to 4 Players)",
    date: daysFromToday(4), // in 4 days
    timeSlotId: "slot-coach-marcus-day4-2",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    durationMinutes: 90,
    courtLocationName: "Dauin",
    playerName: "The Bautista Crew",
    playerEmail: "crew.bautista@example.com",
    playerPhone: "+63 920 902 1184",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["Doubles Strategy & Stacking"],
    notes: "Group of 4 regulars working on doubles positioning.",
    totalPrice: 3000,
    status: "confirmed",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-105",
    coachId: "coach-dana",
    coachName: "Dana Reyes",
    serviceId: "service-2on1-60",
    serviceName: "2-on-1 Partner Strategy",
    date: daysFromToday(5), // in 5 days
    timeSlotId: "slot-coach-dana-day5-4",
    startTime: "12:00 PM",
    endTime: "01:00 PM",
    durationMinutes: 60,
    courtLocationName: "Bais City",
    playerName: "Luis & Andrea Moreno",
    playerEmail: "morenos@example.com",
    playerPhone: "+63 921 662 0841",
    playerSkillLevel: "3.5 - Intermediate",
    focusAreas: ["Dinking & Reset Fundamentals", "Doubles Strategy & Stacking"],
    notes: "New to stacking rotations — want to clean up our transitions.",
    totalPrice: 2000,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "E-wallet",
    receiptId: "RCP-100125",
    createdAt: new Date().toISOString()
  },
  {
    id: "booking-106",
    coachId: "coach-marcus",
    coachName: "Marcus Chen",
    serviceId: "service-1on1-90",
    serviceName: "90-Min Intensive Deep Dive",
    date: daysFromToday(6), // in 6 days
    timeSlotId: "slot-coach-marcus-day6-5",
    startTime: "01:00 PM",
    endTime: "02:30 PM",
    durationMinutes: 90,
    courtLocationName: "Zamboanguita",
    playerName: "Owen Caldwell",
    playerEmail: "owen.c@example.com",
    playerPhone: "+63 922 331 9057",
    playerSkillLevel: "4.0 - Advanced Intermediate",
    focusAreas: ["Doubles Strategy & Stacking", "Tournament Match Strategy"],
    notes: "Preparing for a 4.0 sectional — want pressure-game reps.",
    totalPrice: 2200,
    status: "confirmed",
    paymentStatus: "unpaid",
    paymentMethod: "oncourt",
    createdAt: new Date().toISOString()
  }
];

// LocalStorage Persistence Keys (bumped versions — multi-coach structure changed the shape)
const LS_COACHES_KEY = "pickleball_coach_coaches_v10";
const LS_SLOTS_KEY = "pickleball_coach_time_slots_v8";
const LS_BOOKINGS_KEY = "pickleball_coach_bookings_v8";

export function loadStoredCoaches(): CoachProfile[] {
  try {
    const raw = localStorage.getItem(LS_COACHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load coaches", e);
  }
  saveStoredCoaches(initialCoaches);
  return initialCoaches;
}

export function saveStoredCoaches(coaches: CoachProfile[]) {
  try {
    localStorage.setItem(LS_COACHES_KEY, JSON.stringify(coaches));
  } catch (e) {
    console.error("Failed to save coaches", e);
  }
}

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

// ── Reviews ──────────────────────────────────────────────────
// Persists user-submitted reviews so a refresh doesn't wipe them.
const LS_REVIEWS_KEY = "pickleball_coach_reviews_v1";

export function loadStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LS_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load reviews", e);
  }
  saveStoredReviews(initialReviews);
  return initialReviews;
}

export function saveStoredReviews(reviews: Review[]) {
  try {
    localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error("Failed to save reviews", e);
  }
}

// ── Auth session ─────────────────────────────────────────────
// Persists the signed-in user so a refresh keeps you logged in.
// NOTE: demo-only — the stored object includes `role`, so it is trivially
// tamperable. Replace with real token-based auth before production.
const LS_USER_KEY = "pickleball_coach_current_user_v1";

export function loadStoredUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  } catch (e) {
    console.error("Failed to load current user", e);
    return null;
  }
}

export function saveStoredUser(user: UserAccount) {
  try {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save current user", e);
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(LS_USER_KEY);
  } catch (e) {
    console.error("Failed to clear current user", e);
  }
}
