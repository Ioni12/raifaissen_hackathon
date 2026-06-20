# Changelog — Raiffeisen Youth MVP

All notable changes to this project are documented here.

---

## [0.2.0] — 2026-06-20 (Session 002)

### Added
- Integrated all frontend screens with API routing:
  - `Login.jsx`: switchable login/register forms with support for KUIK referral codes.
  - `OnboardingFlow.jsx`: 6-step gamified mobile wizard (invite chests, first pulls, KYC quests, mid-quest bonuses, 2,000 ALL chest pulls, cohort legendary drops).
  - `Dashboard.jsx`: mock virtual debit card reflecting applied borders/skins, pity counters, streaks, and simulated banking transactions.
  - `SocialFeed.jsx`: auto-feed reactions, leaderboard ranking, and locked item silhouettes ("Visible Gaps").
  - `GachaVault.jsx`: weekly rotation banner pools, credit pull simulators, and customization drawer selections.
- Backend API endpoints:
  - `POST /api/quests/action` to register banking transactions, KUIK payments, savings milestones, and referrals (updates credits/streaks and auto-posts activities).
  - `POST /api/auth/cosmetic` to apply unlocked card skins or chromatic themes.
- Strategic pitch narrative (`PITCH_NARRATIVE.md`) detailing gamified acquisition loops and welcome bonus repackaging insights.

## [0.1.0] — 2026-06-20 (Session 001)

### Added
- Initial project scaffold: `client/` (React + Vite) and `server/` (Node.js + Express + MongoDB)
- History tracking folder (`history/`) with CHANGELOG and session logs
- Full backend:
  - Mongoose models: `User`, `Pull`, `Activity`
  - Routes: `auth`, `gacha`, `quests`, `social`, `leaderboard`
  - JWT middleware for protected routes
  - Gacha engine with tier probabilities and pity counter
- Full frontend:
  - Premium dark design system (`globals.css`) with Raiffeisen yellow accent
  - Rarity glow system (common / rare / ultra-rare / legendary)
  - `OnboardingFlow.jsx` — 7-step gacha-first onboarding
  - `Dashboard.jsx` — Home screen with card, credits, pity counter
  - `SocialFeed.jsx` — Friends-only auto-post feed with reactions + leaderboard
  - `GachaVault.jsx` — Weekly banner, pull history, tier gallery
  - Reusable components: `GachaPull`, `QuestChecklist`, `ActivityCard`, `Leaderboard`, `PhoneFrame`
- README with setup instructions
