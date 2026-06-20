# Onboarding Redesign — Gamified Flow

**Goal:** Make onboarding as frictionless as possible while keeping every KYC step
tied to a gacha reward moment. The user should feel like they're playing a game,
not filling out a form.

---

## Core Design Principle

Every required action (KYC step) must feel like it unlocks something.
The user should never see a form for its own sake — they see a reward opportunity
that happens to require some information from them.

**Sunk cost chain:** Each completed step gives a reward that the user now "owns."
Quitting means abandoning something they already earned. This is the primary
retention mechanic for onboarding completion.

---

## Revised Flow

```
1. Welcome Screen          → 1 tap, no friction
2. Personality Swipe       → 3 quick questions, AI assigns archetype + starter skin
3. First Free Pull         → Scratch card (already built) — immediate reward before any form
4. KYC Quest Chain         → Each step is a "mission" with a gacha pull reward on completion
5. Final Chest             → Golden chest with the 2,000 Lek bonus — cinematic reveal
6. Dashboard               → Personalized based on archetype
```

---

## Step 2: Personality Swipe (AI Element)

**What it is:** 3 fast swipe-left / swipe-right questions (Tinder-style).
Each question has an image/emoji + a short label. No text to read.
Total time: ~10 seconds.

**Questions (examples):**

1. 🎯 "Save for something big" vs 💸 "Enjoy it now"
2. 🤝 "Split bills with friends" vs 🚀 "Go solo"
3. 📈 "Grow my money" vs 🛍️ "Reward myself"

**AI logic:** The three answers map to a 3-bit vector (0 or 1 per question).
8 possible combinations → 4 archetypes (pair similar combos):

| Archetype    | Behavior profile                | Starter skin  | Badge             |
| ------------ | ------------------------------- | ------------- | ----------------- |
| The Builder  | Saver, solo, growth-focused     | Forest Green  | 🏗️ Builder Badge  |
| The Explorer | Spender, social, growth-focused | Aurora Border | 🧭 Explorer Badge |
| The Hustler  | Saver, solo, reward-focused     | Midnight      | ⚡ Hustler Badge  |
| The Social   | Spender, social, reward-focused | Neon Border   | 🌐 Social Badge   |

**What the AI does:**

- Assigns the archetype label
- Unlocks the starter skin immediately (applied to their card on dashboard)
- Shows a one-line "You are..." reveal with a short punchy description
- Unlocks the archetype badge in their vault

This is the "sorting hat" moment without the Harry Potter theme.
The user gets an identity, a cosmetic, and a badge — all before filling out a single form.

**Why it works psychologically:**

- Identity investment: the user now has a named archetype they relate to
- Immediate reward: a skin is already applied to their card
- Personalization signal: the app "knows" them before they've done anything

---

## Step 4: KYC Quest Chain — Gamified

Instead of a checklist, each KYC step is framed as a "mission card" with:

- A name (not "Upload ID" but "Verify Your Identity" with a spy emoji)
- A reward preview (blurred cosmetic that unlocks on completion)
- A progress ring that fills as steps are completed
- A mini gacha pull on completion of each step

**Mission → Reward mapping:**

| KYC Step          | Mission Name            | Reward on completion      |
| ----------------- | ----------------------- | ------------------------- |
| Email verified    | 📧 Confirm Your Signal  | +20 credits               |
| Phone verified    | 📱 Lock In Your Number  | +20 credits + common pull |
| ID uploaded       | 🪪 Prove You're Real    | +30 credits + rare pull   |
| Address confirmed | 🏠 Claim Your Territory | +20 credits               |
| PIN set           | 🔐 Set Your Code        | +30 credits + final chest |

**UI behavior:**

- Missions are shown as stacked cards (like a deck), not a checklist
- Tapping a mission card flips it to reveal what's inside
- On completion a mini confetti burst fires + credits animate into the counter
- The progress ring at the top shows X/5 with a glow

---

## Step 5: Final Chest — 2,000 Lek Reveal

After all 5 missions complete, the screen blacks out and a GOLDEN CHEST appears.
This uses the existing `RewardReveal` component at `legendary` tier.

The reward shown:

- "2,000 ALL Welcome Bonus" as the label
- "Deposited to your account" as the description
- Legendary tier animation (full portal charge, shockwave, gold particles)

This reframes a boring "balance updated" notification into the biggest moment of
the onboarding. The user will remember and share this moment.

---

## AI Integration Points

### Option A: Archetype classification (simple, no external API)

- Pure frontend logic — 3 binary answers mapped to 4 buckets
- Zero latency, works offline
- "AI" is the mapping logic, presented as personalization

### Option B: OpenAI for the archetype reveal copy (nice-to-have)

- After the 3 questions, call GPT with the answers
- GPT generates a 2-sentence personalized description
- e.g. "You're a Builder — someone who plays the long game. Your card is already
  set up for your style."
- Adds genuine personalization feel
- Requires: OpenAI API key on the backend, one new endpoint `/api/ai/archetype`
- Fallback: use static copy if API fails

### Option C: AI-personalized first missions (advanced)

- The first 3 daily missions shown on the dashboard after onboarding are
  generated by AI based on the archetype
- Builders get savings-focused missions
- Socials get referral/split-pay missions
- Requires: same OpenAI endpoint, stored in user profile

**Recommended for hackathon:** Option A for the core flow + Option B for the
reveal copy only. Fast to build, impressive to demo.

---

## Onboarding Completion Rate Strategy

### Friction removers:

1. Scratch card before any form → user has something to lose if they quit
2. Archetype reveal before any form → user has an identity to protect
3. Mission framing → "I'm 3/5 done" feels like a game save point, not a form
4. Each step has an immediate visual reward → no deferred gratification

### Social pressure:

- Show "X friends completed onboarding this week" on the welcome screen
- After each mission: "Y people also completed this mission today"

### Re-engagement if they drop off:

- Push notification after 2h: "Your [Archetype] badge is waiting"
- Push notification after 24h: "You're 3/5 done — your 2,000 Lek bonus is locked"

---

## Live Theme/Skin Preview During Onboarding

### The Idea

When a user pulls a theme or card skin during the scratch card step (Step 3),
they get a "Try it now?" prompt immediately after the reveal animation.

One tap applies the theme/skin live — the entire onboarding screen transforms
in real-time using the existing `ThemeApplier` + CSS variable system.

The user is now completing KYC in _their own personalized app_. Every button,
every background, every accent color is theirs. Quitting now means losing that.

### Why This Works

- **Ownership before commitment:** The user customizes before they've finished
  signing up. Loss aversion kicks in — they don't want to lose the theme they
  just applied.
- **Immediate proof of value:** The reward isn't abstract ("+50 credits") —
  it visibly changes the product they're using right now.
- **Social sharing moment:** "Look what I pulled during signup" is shareable.
  A screenshot of a dark Neon City themed onboarding screen is compelling.

### Implementation Approach (no code changes yet)

After the `RewardReveal` modal closes in `OnboardingFlow`:

1. Check if `revealReward.type === "theme"` or `"skin"`
2. If yes, show an inline "Apply now?" banner (not a modal — keep it light)
3. On tap: call `POST /api/auth/cosmetic` with the type and id
4. `updateUser({ activeTheme: ..., activeCardSkin: ... })` updates context
5. `ThemeApplier` in `App.jsx` picks up the change and sets `data-theme` on `<html>`
6. The entire app re-renders with the new CSS variables — instant visual transformation

The banner should disappear after 5 seconds if not tapped (non-intrusive).
The theme/skin stays applied even if the user ignores the banner — they already
own it from the pull.

### UI Copy

- Theme pulled: "🎨 Apply **Neon City** to your app now?" [Apply] [Later]
- Skin pulled: "💳 Use **Aurora Border** on your card now?" [Apply] [Later]

### Edge Case: User pulls a theme during onboarding before the account is fully set up

The cosmetic API requires auth (JWT). Since the user is already registered
(they went through the register/login step before onboarding), the token
exists in localStorage and the call will succeed. No changes needed to auth flow.

### What Gets Added to the Onboarding Flow

Current: Welcome → Scratch → KYC → Complete
New: Welcome → Scratch → [Live theme apply if cosmetic] → KYC → Complete

The "live theme apply" step is optional (triggered only if the pull is a cosmetic)
and non-blocking (can be skipped). It adds ~2 seconds to the flow maximum.

---

| Component                      | Status      | Notes                                      |
| ------------------------------ | ----------- | ------------------------------------------ |
| Personality swipe screen       | Not started | 3 swipe questions, Tinder-style UI         |
| Archetype reveal animation     | Not started | Uses existing RewardReveal at rare tier    |
| Mission card UI                | Partial     | QuestChecklist → redesign as mission deck  |
| Mission flip animation         | Not started | Card flip on tap                           |
| Per-step confetti + credits    | Not started | Mini burst on each completion              |
| Golden chest final step        | Partial     | Exists but needs trigger on PIN completion |
| AI archetype endpoint          | Not started | Option B — /api/ai/archetype               |
| Archetype badge in vault       | Not started | Auto-unlocked after personality quiz       |
| Starter skin auto-apply        | Not started | Applied immediately after quiz result      |
| Live theme apply in onboarding | Not started | "Apply now?" banner after cosmetic reveal  |

---

## Demo Script (for the hackathon presentation)

1. Show the welcome screen → tap "Start"
2. Swipe through 3 personality questions (fast, fun)
3. "You are The Explorer" reveal with Aurora skin applied to card
4. Scratch 3 cards → reward reveal
5. Start KYC missions — flip card UI, mini gacha on each
6. Final mission (PIN) → screen blacks out → GOLDEN CHEST → 2,000 Lek reveal
7. Dashboard shows personalized card with Explorer skin + archetype badge

Total onboarding demo time: ~90 seconds. Every second has something moving.
