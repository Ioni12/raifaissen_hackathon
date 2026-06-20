# Session 001 — 2026-06-20

**Goal:** Build the initial MVP from scratch.

## What Was Built

### Backend (server/)
- Express server with CORS, JWT auth, MongoDB via Mongoose
- Models: User (pulls, credits, pityCounter, cohort, friends), Pull, Activity
- Gacha engine: weighted probability draw (60/28/10/2), pity counter resets on Ultra Rare+
- Routes: /api/auth, /api/gacha, /api/quests, /api/social, /api/leaderboard

### Frontend (client/)
- Vite + React 18
- Premium dark design system: #0A0A0F base, #FFD600 Raiffeisen yellow, glassmorphism cards
- OnboardingFlow: invite screen → free pull → quest checklist → chest pull → legendary → vault
- Dashboard: virtual card display, credits, pity counter widget
- SocialFeed: auto-generated activity cards, emoji reactions, friends leaderboard
- GachaVault: banner pool, pull history, rarity gallery

## Key Design Decisions
- Gacha IS the onboarding — pulls happen before KYC, not after
- 2,000 Lek bonus is discovered through the pull mechanic, not a balance update
- Social feed is auto-generated only — no user content composition
- Pity counter is visible — transparency as retention mechanic
- Credits NEVER purchasable — compliance-safe, purely cosmetic rewards

## Files Created
```
history/CHANGELOG.md
history/SESSION_001.md
server/package.json
server/.env.example
server/index.js
server/models/User.js
server/models/Pull.js
server/models/Activity.js
server/middleware/auth.js
server/routes/auth.js
server/routes/gacha.js
server/routes/quests.js
server/routes/social.js
server/routes/leaderboard.js
client/ (Vite scaffold + all src files)
README.md
```
