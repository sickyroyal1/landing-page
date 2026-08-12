# PB Coach — Work Log

Auto-updated by Claude at the end of each working session. On a new session: read this file, then continue from the **Latest state** entry.

## Latest state (2026-08-13)

### Province glow fix — all 82 dropdown provinces now light up the map (complete, verified)
- **Bug**: selecting some provinces in the location picker didn't glow/zoom — the dropdown code had no matching key in `PHILIPPINE_PROVINCES`. Root cause: GADM 4.1 predates two things psgc.cloud has — the **ARMM→BARMM region recode** (15→19) and the **2013/2022 province splits**.
- **6 provinces were broken**, in 3 ways:
  1. **Basilan, Lanao del Sur, Sulu, Tawi-Tawi** — GADM carries the old ARMM region code (15), psgc.cloud uses BARMM region 19. Map had them as `15007/15036/15066/15070…`; dropdown asked for `19007/19036/19066/19070…`. Fixed in the generator.
  2. **Maguindanao del Norte (`1908700000`)** — GADM has ONE combined Maguindanao polygon (mapped to del Sur `1908800000`). No del Norte geometry exists.
  3. **Davao Occidental (`1108600000`)** — GADM merged it into Davao del Sur (`1102400000`). No separate geometry.
- **Fix** (`scripts/geojson-to-svg.mjs` + regenerated `PhilippineProvinces.ts`):
  - `toPsgc()` now remaps region `15` → `19` (ARMM → BARMM) before building the code.
  - New `PROVINCE_ALIASES` export mapping the two split provinces to their combined parent polygon: `1108600000 → 1102400000`, `1908700000 → 1908800000`.
  - Regenerated — geometry byte-identical, only the 4 BARMM keys changed (verified via git diff: no path data touched).
- **Map component** (`PhilippineMap.tsx`): `canonicalCode()` normalizes `highlight` through `PROVINCE_ALIASES` before both the zoom target lookup and the `code === highlight` glow test — so Davao Occidental / Maguindanao del Norte glow the combined parent shape (zoom included).
- Result: all 82 dropdown provinces (verified against the live psgc.cloud `/provinces` endpoint) resolve to a map key. Metro Manila is still in the map under `1303900000` but is not in `/provinces`, so it's never selectable — harmless.
- Verified: `npx tsc --noEmit` ✓.

### Logo assets live — navbar Vector logo + landing hero banner with the 3D logo (complete, verified)
- **Navbar logo → `DINKLAB + Text White.png`** (`Navbar.tsx`): transparent-background RGBA version of the white-on-black wordmark — background removed so white text sits directly on the dark navbar with no `mix-blend-screen` needed. Rendered at **3×** — `h-42 md:h-48` (`w-auto`) — white text overflows the normal-height navbar (`h-16 md:h-20` stays unchanged; transparent bg means the overflow is clean white text over the dark page content, no black box). Click-to-scroll-top behavior kept. The Vector PNG is now used only in the footer.
- **Hero banner → `DINKLAB + Logo 3d No BG.png`** (transparent-background RGBA version — avoids the "floating box" of the black-bg PNG) on the **landing page only** (NEW `HeroBanner.tsx`, wired in `App.tsx` above `FindCoachSection` — i.e. above the province → city location picker). The 3D flask logo at `w-80 sm:w-96 lg:w-[30rem]` (320/384/480px — enlarged per request), rendered as the **plain PNG — no `mix-blend-screen`**. **Animation**: `animate-heartbeat` (replaces the old `animate-float` bob) — a single pulse per cycle (slower, 2.5s loop; smaller pump, scale to 1.04) with a violet `filter: drop-shadow` glow that peaks with the beat and fades to nothing between beats (glow hugs the logo's alpha silhouette, no box). Headline → **"LEVEL UP YOUR GAME."** and sub-line → **"Precision coaching for players who want more from every session, every rally, and every match."**, plus a **"Book now"** CTA button (purple gradient, matches Hero CTA style) that smooth-scrolls (`scrollIntoView({ behavior: 'smooth' })`) down to the location picker (`#find-coach`). **Full-screen + scroll-snap**: hero banner is now `min-h-screen` flex-centered (so the "Find Your Coach Anywhere in the Philippines" heading below it is out of the initial viewport); `html { scroll-snap-type: y mandatory; scroll-behavior: smooth; scroll-padding-top: 5rem }` in `index.css` + `snap-start` on the hero banner and the location-picker section → **one scroll notch glides straight from the hero to the picker** (mandatory = the scroll always rests on a section; `scroll-behavior: smooth` makes the snap transition animate with a smooth glide rather than jumping abruptly; only the two landing sections snap, so coach-portal pages unaffected). `scroll-padding-top: 5rem` clears the sticky navbar so the picker heading isn't hidden behind it. NOT on the coach profile page (`Hero.tsx` was reverted to its original headline/achievements layout — the banner was briefly mis-placed there and removed).
- **Footer logo → same Vector PNG** (`Footer.tsx`): DL tile swapped for the logo at `h-9` with `mix-blend-screen`; the "DINKLAB +" text wordmark stays beside it there (footer is wide enough for a readable wordmark — at footer scale the text baked into the PNG would be too small).
- **`animate-float` utility**: added in `src/index.css` via Tailwind v4 `@theme` (6s up/down bob) — used by the hero banner.
- **Assets**: all three PNGs already live in `public/` (copied to `dist/` on build) — `DINKLAB + Text White.png` (navbar, transparent RGBA), `DINK LAB + Vector.png` (footer), `DINKLAB + Logo 3d No BG.png` (hero banner). No brand copy changed.
- Verified: `npm run lint` ✓, `npm run build` ✓. Tests not re-run (no logic touched).
- **Still flagged (deploy-time)**: `pbcoach.ph` domain placeholder (index.html / robots.txt / sitemap.xml) + Instagram `@pbcoach_pickleball` handle — unchanged.

## Previous state (2026-08-12)

### Full "DINKLAB +" rebrand — every user-facing surface (complete, verified)
- **Brand rename → "DINKLAB +"** applied site-wide (the 2026-08-11 pass was navbar-only). All "PB Coach" brand copy is gone from `src/`, `index.html`, `public/`, and generated assets.
- **Files touched** (user-facing text): `index.html` (title / og:site_name / og:title / og:image:alt / twitter:title / JSON-LD `name`), `src/data/mockData.ts` (7 coach emails `@pbcoach.com` → `@dinklab.com`, Coach Francis title/bio), `Footer.tsx` (DL tile + "DINKLAB +" wordmark + copy), `Hero.tsx` (gradient split marker `'PB Coach'` → `'DINKLAB +'`), `AuthModal.tsx` (heading + demo admin email), `RegistrationModal.tsx` (headings + coach bio), `AdminDashboard.tsx` (sidebar label), `BookingModal.tsx` (.ics PRODID "DINKLAB+", UID host `@dinklab.ph`, SUMMARY/DESCRIPTION, modal copy), `Testimonials.tsx` ("DINKLAB + structured coaching"), `public/favicon.svg` (DL), `metadata.json`.
- **`src/scripts/gen_og_image.py` (NEW)**: reproducible Pillow recipe for `public/og-image.jpg` (1200×630) — cover-crop of hero_header_image.jpg, blur+darken+purple-tint, "DINKLAB +" purple eyebrow pill, "Elevate Your Pickleball Game" headline, sub-line, "Book a Session →" CTA. OG image regenerated; re-run after any brand change.
- **Storage keys bumped** to force refresh of stale "PB Coach" data in existing clients: coaches `v10 → v11`, site copy `v4 → v5`. (Full current set: coaches `v11`, site copy `v5`, services `v4`, slots `v8`, bookings `v8`, reviews `v1`, user `v1`.)
- **Demo logins stay in sync automatically**: AuthModal builds `demoCoachAccounts` from the coach roster's `c.email`, so the email changes in mockData.ts flowed through with no extra edits.
- Verified: `npm run lint` ✓, `npm test` ✓ (**18/18**), `npm run build` ✓ (main bundle 375 kB + lazy chunks). Grep for `PB Coach`/`pbcoach` in `src/` returns only `@pbcoach_pickleball` (real Instagram handle, kept).
- **Still flagged (deploy-time, not blocking rebrand)**: `pbcoach.ph` domain placeholder in `index.html` (canonical, OG/Twitter URLs, JSON-LD `@id`/`url`/`image`/`logo`), `public/robots.txt`, `public/sitemap.xml` — swap for the real domain before going live. Instagram `@pbcoach_pickleball` handle in mockData.ts + JSON-LD sameAs stays unless the account is renamed. `CLAUDE.md` storage-key list updated to match.

## Previous state (2026-08-11)

### Navbar polish pass #2 — branding + typography + nav links (complete, visual)
- **Brand rename → "DINKLAB +"**: logo block now shows "DL" initials (purple gradient tile) + "DINKLAB +" wordmark. (Footer still says "PB Coach Pickleball" — rebrand scope was navbar-only.)
- **Font → Inter**: `index.html` now loads Google Font Inter (400–800 via preconnect + stylesheet); Navbar header applies it via `style={{ fontFamily: "'Inter', sans-serif" }}`.
- **4 nav links after coach selection**: Home (#home → smooth scroll to top), Availability (#availability), Rates (#services), Contact (#contact). Footer gained `id="contact"` so the Contact link has a target.
- **Spacing**: nav link gap bumped `space-x-8` → `space-x-12`; links `font-semibold tracking-wide` + purple underline hover.
- Verified via Playwright screenshots at desktop + landing width (v3 set) — clean layout, no CTA clutter.
- **Not touched (still deferred)**: "PB Coach" wording in index.html title/OG/JSON-LD, hero section, footer, AuthModal/RegistrationModal headings — these still say PB Coach. Decide if the whole site rebrands to DINKLAB +.

### Navbar redesign (complete, visual) — superseded by polish pass #2 above
- **3 CTAs → 1**: Removed standalone Register button (AuthModal already has Sign Up tab), removed "Book Now" (already in page body as "Book Your Session"). Single "Sign In" button opens AuthModal.
- **Fixed breakpoint gap**: Auth buttons moved from `lg` (1024px) to `md` (768px) to match nav links — no more awkward intermediate state.
- **Consistent styling**: All auth buttons use `bg-purple-500/10 text-purple-300 border border-purple-400/30` pill style.
- **Mobile drawer cleaned up**: Removed "Book Private Session", simplified to nav links + Sign In/logout only.
- **Compact height**: `h-16 md:h-20` (was `h-20`), nav link spacing `space-x-8` (was `space-x-10`).

## Previous state (2026-08-10)

### Deferred-items sweep → all 6 fixed (complete, verified) — multi-slot payment / UTC dates / review persistence / 24h cancel / JSON-LD / achievement images
- **Multi-slot payment gap — FIXED**: only the first of several sessions was payable; the rest were stuck "Payment Due". `PaymentModal.tsx` was rewritten to accept **all** confirmed `bookings` (`BookingRequest[]`), shows a combined order summary + total, processes every session in a single `Promise.all` pass (one chosen method applies to all), and returns one receipt per paid session. `App.tsx` payment state is now `pendingPaymentBookings: BookingRequest[]`; `handleProceedToPayment` takes the full array (wired from `BookingModal` which now calls `onProceedToPayment(confirmedBookings)` instead of `[0]`); `handlePaymentComplete` maps a `{bookingId, result}[]` back over the bookings. `BookingCard` gained a **"Pay Now"** button (shown only for unpaid non-oncourt sessions) so any unpaid session can be paid later from "My Booking" / the bookings popup. Stale note in BookingModal ("rest can be settled at the court") replaced with "One payment covers all N sessions."
- **Slot date UTC vs PH off-by-one — FIXED**: slot dates and "today" comparisons used `new Date().toISOString().split('T')[0]` (UTC), which shows the *previous day* in PH evenings. Added `toLocalDateStr(date)` / `todayLocalStr()` / `daysFromToday(n)` helpers in `mockData.ts` (local getFullYear/getMonth/getDate) and replaced every `.toISOString().split('T')[0]` date expression: both slot generators, all 6 seed bookings, `AvailabilityCalendar` (selected-date default + `isToday`), `CoachPortal` and `AdminDashboard` (new-slot date default). `LS_SLOTS_KEY` bumped `v7 → v8` so schedules regenerate with correct local dates.
- **Reviews not persisted — FIXED**: reviews only lived in React state and were wiped on refresh. Added `loadStoredReviews` / `saveStoredReviews` (key `pickleball_coach_reviews_v1`, same try/catch pattern as other storage). `App.tsx` loads them on mount and `handleAddReview` now saves the updated list.
- **24h cancellation policy — FIXED (was label-only)**: added pure helpers in `bookingLogic.ts` — `parse12h()` (AM/PM → 24h), `sessionStartDate(booking)` (local-time Date from `date` + `startTime`), `canCancelBooking(booking, now?)` (free before the 24h cutoff, locked after), and `cancellationRestriction(booking, now?)` (human-readable reason or null). `App.tsx` `handleCancelBooking` **blocks players** (role `user`) within 24h with a toast while **coaches/admins bypass** (their Cancel buttons in CoachPortal/AdminDashboard keep working). `BookingCard` shows a disabled Cancel + shield icon + hint when locked, plus the Pay Now button. Added 7 tests (parse12h, cutoff boundary, after-start, reason text) → suite now **18/18**.
- **JSON-LD openingHours mismatch — FIXED**: `index.html` LocalBusiness `openingHours` was `"Mo-Sa 08:00-18:00"`; the actual schedule is 8:00 AM–4:00 PM → now `"Mo-Sa 08:00-16:00"`.
- **placehold.co achievement images — FIXED**: created 3 local SVG medals in `public/achievements/` (`medal-silver.svg`, `medal-bronze.svg`, `medal-4th.svg`) — dark-slate rounded badge + ribbon + number, matching the site's palette — and pointed Coach Francis's 4 achievements at `/achievements/*.svg`. Grep for `placehold.co` returns no matches in code.
- Verified: `npm run lint` ✓, `npm test` ✓ (**18/18**), `npm run build` ✓ (main bundle 377 kB + lazy chunks; medal SVGs confirmed in `dist/achievements/`).
- **Still deferred**: `pbcoach.ph` placeholder swap at deploy (canonical, OG/Twitter URLs, JSON-LD `@id`/`url`, robots.txt, sitemap.xml). Demo one-click logins + role picker remain until real auth (noted below).

### Earlier same day (2026-08-10)

### Website review #2 → fixes (complete, verified) — .ics export / booking-account link / session persistence / PH phone numbers
- **Invalid .ics calendar export — FIXED**: `BookingModal.tsx` now exports proper RFC 5545 vCalendar. Added `to24h()` (parses "HH:MM AM/PM"), `icalDateStr()` (builds UTC Date → `YYYYMMDDTHHMMSSZ`), and `icalEscape()` (escapes `\`, `;`, `,`, newline) helpers. ICS now includes `DTSTART`, `DTEND`, `DTSTAMP`, `UID`, `CALSCALE:GREGORIAN`, `METHOD:PUBLISH`, and the correct PRODID ("PB Coach Pickleball"). Old file lacked all four required properties → calendar apps rejected/mis-imported it.
- **Bookings not tied to the account that made them — FIXED**: `App.tsx` now passes `currentUser` into `BookingModal`. On open, fields prefill from the account (name/email/phone/skillLevel); the email field is `readOnly` for logged-in players (visual lock styling + helper text); submit **forces** `playerEmail: currentUser.email` regardless of form state. `UserBookingsModal.tsx` and `AvailabilityCalendar.tsx` "My Bookings" filters changed from email-OR-name to **email-only**, so a booking can only ever appear under the account whose email made it.
- **Auth session lost on refresh — FIXED**: added `loadStoredUser` / `saveStoredUser` / `clearStoredUser` helpers in `src/data/mockData.ts` (localStorage key `pickleball_coach_current_user_v1`). `App.tsx` restores the user on mount (re-entering the coach portal view too via `selectedCoachId`) and saves on login/register, clears on logout.
- **US (555) placeholder phones — FIXED (full sweep)**: all 7 coaches + 6 seed bookings in `mockData.ts`, 3 in `AuthModal.tsx`, 2 in `RegistrationModal.tsx`, 1 placeholder in `BookingModal.tsx`, and the JSON-LD `telephone` in `index.html` → real Philippine format `+63 9XX XXX XXXX`. Grep for `(555)` / `555-` / `+1 555` returns **no matches**.
- Verified: `npm run lint` ✓, `npm test` ✓ (11/11), `npm run build` ✓ (main bundle 374 kB + lazy chunks).
- **Still deferred** (from review, not yet fixed): placehold.co achievement images for Coach Francis; reviews not persisted; JSON-LD `openingHours` "Mo-Sa 08:00-18:00" vs actual 8:00 AM–4:00 PM; multi-slot payment gap (only first session payable, rest stuck "Payment Due"); 24h cancellation policy is label-only; slot date generation UTC vs PH off-by-one; `pbcoach.ph` placeholder swap at deploy.

### Earlier same day (2026-08-10)

### Reminder #1, #2, #3 — SEO / auth-password cleanup / dead-code cleanup (complete, verified)
- **SEO / metadata (#2)**: `index.html` fully rewritten — meta description (targets "pickleball coach Negros Oriental", "private pickleball session Philippines"), canonical `https://pbcoach.ph/`, theme-color `#8b5cf6`, Open Graph (type/url/site_name/title/description/image 1200×630/locale `en_PH`), Twitter `summary_large_image` card, JSON-LD `LocalBusiness` (Dumaguete City geo 9.3077,123.3064, priceRange ₱200–₱550, areaServed for Negros Oriental cities, Instagram sameAs, founder Francis, openingHours, makesOffer), real favicon, title updated.
- **Static assets**: `public/favicon.svg` (purple "PB" rounded square), `public/robots.txt` (allow all + sitemap ref), `public/sitemap.xml` (root URL), `public/og-image.jpg` (1200×630, Pillow-generated from `hero_header_image.jpg` cover-crop, blurred/darkened + PB Coach branding + purple CTA). All confirmed copied into `dist/` by the build.
- **⚠️ Domain placeholder**: everything references `https://pbcoach.ph/` (canonical, OG/Twitter image URLs, JSON-LD `@id`/`url`, robots.txt, sitemap.xml). Flagged with HTML/XML comments. Must be swapped for the real domain at deploy time — the og-image.jpg + favicon.svg + all URL refs are one find-replace away.
- **Auth/password cleanup (#1)**: removed password field + `password` state from `AuthModal.tsx` and both tabs of `RegistrationModal.tsx` (client + coach). Passwords were collected but never validated or stored (`UserAccount` has no password field). Validation guards updated (`if (!name || !email) return;`), unused icon imports pruned. **Demo one-click logins + role picker KEPT intentionally** — they're the only way into admin/coach portals until real auth lands. See pending note below.
- **Dead-code cleanup (#3)**: deleted orphan `src/components/SkillQuizModal.tsx` (not imported anywhere). `npm uninstall` removed 129 packages for dead deps: `@google/genai`, `express`, `dotenv`, `motion` (deps) + `autoprefixer`, `@types/express` (devDeps). Verified no remaining references (grep). `package.json` now holds only real deps.
- Verified: `npm run lint` ✓, `npm test` ✓ (11/11), `npm run build` ✓ (main bundle 372 kB + lazy chunks for AdminDashboard / FindCoachSection).

## Latest state (2026-08-09)

### Reminder #3 — Tests / error boundary / code-splitting (complete, verified)
- **Greenfield test suite**: `vitest@4`, `jsdom@30`, `@testing-library/react@16`, `@testing-library/jest-dom@7`, `@testing-library/user-event@14` (devDeps). `vitest.config.ts` (separate from `vite.config.ts` — that one is function-form with the Tailwind plugin), `src/test/setup.ts` (jest-dom matchers), `test`/`test:watch` scripts.
- **Pure booking reducers extracted** to `src/bookingLogic.ts`: `confirmBookings`, `cancelBooking`, `updateBooking`, `isMember`. The four App.tsx handlers are now thin wrappers (setState + `saveStored*` + `showToast` only).
- **Tests**: `src/bookingLogic.test.ts` — the 4 priority cases (multi-slot confirm in a single pass, cancel frees slot, member gating, move-booking frees old slot + books new) + edge cases; `src/components/ErrorBoundary.test.tsx` — renders children / shows fallback on throw. **11/11 passing.**
- **Error boundary**: `src/components/ErrorBoundary.tsx` wraps `<App/>` in `main.tsx` (keeps StrictMode).
- **Code-splitting**: `React.lazy` + `<Suspense>` for `AdminDashboard` (48 kB chunk) and `FindCoachSection` (53 kB chunk — includes `PhilippineMap`). `CoachPortal` stays static on purpose (always mounted → would flash a loader every load). Build confirms both lazy chunks split out of the 374 kB main bundle.
- **SkillQuizModal scroll fix**: step bodies (lines 68/109) finally got `flex-1 min-h-0 overflow-y-auto` — the last modal missing the pattern.
- Verified: `npm run lint` ✓, `npm test` ✓ (11/11), `npm run build` ✓.

### Earlier same day (2026-08-09 — context)
### Modal header-clipping fix (complete, verified)
- Applied `max-h-[90vh] flex flex-col overflow-hidden` + `flex-1 min-h-0 overflow-y-auto` on the scrollable body to **all 5 remaining modals**: BookingModal, RegistrationModal, UserBookingsModal, EditSlotModal, SkillQuizModal.
- All modals now use the same pattern as AuthModal, CoachPortal, and BookingEditModal.
- Verified: `npm run lint` ✓, `npm run build` ✓.

### Earlier session (2026-08-08 — context)
- **Admin Dashboard page** complete: full-page layout (sidebar + 6 sections), BookingEditModal (move booking + slot re-sync), Navbar role-split, `ContentEditorModal.tsx` deleted.
- Admin modal flexbox fix applied to AuthModal + CoachPortal.

### Earlier features (context)
- Multi-select slot booking: clients toggle available time slots → floating "Book Slot" bar → one BookingRequest per slot → combined total in confirmation.
- "My Booking" tab next to Live Schedule (inline, not modal). Guest sees login prompt; logged-in player sees their BookingCards with Cancel.
- Member gating: `requireMember()` opens RegistrationModal for guests trying to book. "Already have an account? Log In" footer cross-switches to AuthModal.
- Hero achievements panel; coach weekly availability (`availableDays`); 3-state slot status (Available green / Booked red / Blocked grey); ₱ currency; 3 services at ₱250/₱350/₱500; Coach Francis has 4 real tournament achievements with placehold.co image URLs; purple scroll-to-top button; "Preferred Courts" section.
- PSGC real geographic picker (province → city) with offline fallback; Philippine map SVG.
- AuthModal: quick-login demo accounts + role picker (to be removed before production).
- RegistrationModal: full client + coach registration with PSGC geographic picker.

### Data / gotchas
- **React types are implicit `any`** — `react` ships no bundled types and `@types/react` is NOT installed, so `extends Component<Props, State>` resolves to `extends any` (no `this.props`). Class components must declare `props!: MyProps;` (type-only, no runtime emit) to type `this.props`. Alternatively install `@types/react` — not done yet because it could surface new type errors across the codebase.
- Test versions installed differ from the plan's assumptions: vitest **4** (not 3), jsdom **30**, @testing-library/jest-dom **7** (not 6). `vitest.config.ts` is separate from `vite.config.ts` (which is function-form + Tailwind plugin).
- `BookingRequest.timeSlotId` ↔ `TimeSlot.bookedByBookingId` must be kept in sync — now centralized in the `confirmBookings` / `cancelBooking` / `updateBooking` reducers in `src/bookingLogic.ts` (App.tsx handlers are thin wrappers over them).
- Seed bookings (`initialBookings`) reference slot ids that do NOT exist in the generated schedule — slot lookups must handle "not found" gracefully.
- localStorage keys (bump suffix to reset): coaches `v11`, site copy `v5`, services `v4`, time slots `v8`, bookings `v8`, reviews `v1`.
- tsconfig has NO `noUnusedLocals`/`noUnusedParameters` — unused imports don't fail lint, but keep code clean anyway.
- `SkillQuizModal.tsx` was an orphan (never imported) — **deleted 2026-08-10** as part of dead-code cleanup.
- Reviews ARE persisted since 2026-08-10 (`pickleball_coach_reviews_v1` in localStorage via `loadStoredReviews`/`saveStoredReviews`). They'll move to a real backend when user submissions land.
- Real app lives at `C:\Users\F\Desktop\Landing Page`. The session cwd `C:\Users\F\Desktop\omniroute-test` is just the harness workspace.

### Website review (2026-08-09)
- Comprehensive codebase review delivered. Perks: real PSGC geography, well-structured state architecture, multi-slot booking UX ahead of most competitors, substantial admin/coach tooling, clean payment abstraction ready for real gateway.
- Known issues addressed: modal header clipping (#4 done), auth is temporary (#1/#2), demo logins to be removed, placehold.co images are placeholders (#8).
- Orphan `SkillQuizModal.tsx` + dead deps (`@google/genai`, `express`, `dotenv`, `motion`, `autoprefixer`) noted for future cleanup.

### Pending reminders (to be done as features are developed)

#### Reminder #1: Passwords collected but meaningless — ✅ DONE (2026-08-10)
- AuthModal + RegistrationModal password fields removed. Note for real auth: **demo one-click logins + the role picker (Player/Coach/Admin) are still live** and are currently the only way to access admin/coach portals — remove them when Supabase/Firebase auth lands, since anyone can claim admin today.

#### Reminder #2: SEO / social metadata — ✅ DONE (2026-08-10)
- index.html: meta description, Open Graph + Twitter card tags, JSON-LD `LocalBusiness` structured data, canonical URL, theme-color, real favicon (`/favicon.svg`). Plus `public/robots.txt`, `public/sitemap.xml`, `public/og-image.jpg`. Keywords "pickleball coach Negros Oriental", "private pickleball session Philippines" baked into title + description. **Pending at deploy: swap `pbcoach.ph` placeholder for the real domain** (index.html, robots.txt, sitemap.xml).

#### Reminder #3: Tests / error boundary / code-splitting — ✅ DONE (2026-08-09)
- Vitest + Testing Library installed; pure booking reducers in `src/bookingLogic.ts`; 11 tests (multi-slot confirm, cancel frees slot, member gating, move booking, + edge cases, + ErrorBoundary). Error boundary wraps App in `main.tsx`. `AdminDashboard` + `FindCoachSection` (incl. PhilippineMap) lazy-loaded via `React.lazy` + Suspense.
