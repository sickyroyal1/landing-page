# PB Coach — Work Log

Auto-updated by Claude at the end of each working session. On a new session: read this file, then continue from the **Latest state** entry.

## Latest state (2026-08-10)

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
- localStorage keys (bump suffix to reset): coaches `v10`, site copy `v4`, services `v4`, time slots `v8`, bookings `v8`, reviews `v1`.
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
