# PB Coach — project notes for Claude Code

Player-facing pickleball booking site for Negros Oriental, Philippines. React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + lucide-react. All data persists to browser localStorage. The app lives in THIS directory (`C:\Users\F\Desktop\Landing Page`) — launch `claude` from here so this file auto-loads.

## Run
- Dev server (port 3001): `npm run dev`
- Type-check: `npm run lint`
- Production build: `npm run build`
- Always verify with `npm run lint` + `npm run build` after non-trivial changes.

## Data / storage
- localStorage keys (bump the trailing version to reset stored data):
  - coaches: `pickleball_coach_coaches_v11`
  - site copy: `pickleball_coach_site_copy_v5`
  - services: `pickleball_coach_services_v3`
  - time slots: `pickleball_coach_time_slots_v6`
  - bookings: `pickleball_coach_bookings_v7`
- All state lives in `src/App.tsx` and flows down as props. Persist through `loadStored*` / `saveStored*` helpers in `src/data/mockData.ts` — never mutate in place.

## Session protocol (auto-resume)
- AT SESSION START: read `WORKLOG.md` and continue from the most recent entry — do not re-derive state the user has already covered.
- WHEN A TASK IS DONE (or a meaningful step finishes): update `WORKLOG.md` with what changed, what's pending, and key decisions/notes, so a disconnected/closed session can be resumed from the file.
- The user relies on this file to survive accidental session loss.
