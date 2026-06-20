# Onboarding Game Ideas — Raiffeisen Youth

These ideas plug directly into the existing 4-step onboarding flow
(Step 0: Welcome → Step 1: First Pull → Step 2: KYC Quests → Step 3: Complete).
Each idea can replace or extend one of those steps.

---

## Idea 1 — "The Heist" (Narrative Wrapper)

Frame the entire onboarding as a mini-narrative: the user is a new recruit joining
a secret financial crew. Each KYC step is a "mission briefing."

- Step 0 shows a dossier card with the user's codename (randomly generated).
- Each quest (phone verify, ID scan, PIN) is a "clearance level" — bronze → silver → gold.
- Completing all quests triggers an animated vault door opening to reveal the 2,000 Lek chest.
- The cohort badge becomes a squad patch ("Tirana Cell · June 2026").

Why it works: narrative investment makes even boring KYC steps feel like progression.
Minimal code change — just new copy, icons, and one entry animation on the vault door.

---

## Idea 2 — "Scratch Card Cascade"

Replace the single first-pull button with a scratch-card interaction.

- On Step 1, user sees three scratch panels (like lottery tickets).
- Scratching reveals partial reward previews — e.g. a blurred card skin, a question-mark
  badge, a credit amount.
- Only one panel gives the real reward; the other two give small bonus credits (50 each).
- The key mechanic: user _must_ scratch all three to see which is the winner, so they
  see all the reward types that exist in the system — organic reward discovery.

Why it works: variable-ratio reinforcement + teaches reward tiers before the full gacha vault.
Implementation: CSS clip-path scratch reveal + canvas or SVG mask layer.

---

## Idea 3 — "Friend Invite Cascade" (Social Chain Onboarding)

Make the social proof on Step 0 interactive rather than static.

- Instead of "3 friends already joined in Tirana", show an animated chain:
  avatars of existing friends with connection lines, like a mini social graph.
- The user sees which friend referred them (or a placeholder if organic signup).
- They get a bonus pull slot for every friend who is in the app already —
  show "You have 2 bonus pulls waiting because Ana and Joni are your friends."
- This frames friends as a resource, not just social proof.

Why it works: anchors the referral system visually at the very first screen.
Pairs with the existing /api/social and /api/leaderboard routes already built.

---

## Idea 4 — "Personality Sort" (Personalization Gate)

Before the first pull, add a 3-question speed-swipe quiz (Tinder-style left/right).

Questions (swipe left = no, right = yes):

1. "I prefer saving over spending." → maps to Saver/Spender archetype
2. "I like competing with friends." → maps to Competitor/Solo archetype
3. "I love collecting rare things." → maps to Collector/Casual archetype

Based on answers, the first pull is "seeded" toward a cosmetic that fits the archetype
(e.g. Collectors get a rare skin more often on their very first pull — not guaranteed,
just weighted). The archetype label ("The Collector") appears on the user's profile card.

Why it works: perceived personalization = higher emotional ownership of the reward.
Low implementation cost: 3 extra UI screens + a weight modifier passed to /api/gacha/pull.

---

## Idea 5 — "XP Bar Replace" for KYC Quests (Upgrade to Existing Step 2)

The current QuestChecklist shows checkboxes. Replace with a continuous XP bar
that fills across all 5 quests, with milestone pops at 20%, 40%, 60%, 80%, 100%.

- At each 20% milestone a small confetti burst fires and a bonus label appears
  ("Bonus: +10 credits!").
- The bar is persistent — it stays at the top of every step, so even on Steps 0 and 1
  the user can see it partially filled (it starts at 0% but is visible), creating pull
  toward completion before they even reach Step 2.
- When the bar hits 100%, the vault door animation plays (ties into Idea 1 if used).

Why it works: Zeigarnik effect — seeing an incomplete bar is psychologically uncomfortable,
driving users to finish. Extremely low-cost UI addition on top of existing questProgress state.

---

## Idea 6 — "Time-Locked Legendary" (Urgency Mechanic)

After completing KYC, instead of immediately granting the cohort legendary badge,
show a countdown timer: "Your Legendary pull unlocks in 23:47:12."

- The timer is fake (or very short — 30 seconds) but creates anticipation.
- Push notification fires when it "unlocks."
- When the user returns and taps the pull, the animation plays at full intensity.

Why it works: anticipation amplifies reward experience (same reason unboxing videos work).
The notification is a re-engagement hook that brings the user back within 24 hours of signup.
Backend: store a `legendaryUnlockAt` timestamp on the User model, check it in the gacha route.

---

## Idea 7 — "Co-op Onboarding" (Duo Challenge)

If a user was referred by a friend, show an optional "complete together" mode.

- Both users see each other's quest progress in real-time (websocket or polling).
- When both complete their KYC, each gets a bonus pull on top of the standard reward.
- A shared achievement badge ("Duo · Tirana · June 2026") appears on both profiles.

Why it works: social accountability dramatically increases completion rates.
Pairs directly with the existing referral system and the KUIK contact graph.
Implementation complexity: medium — needs a simple room/session pairing endpoint.

---

## Quick Comparison

| Idea                      | Effort   | Wow Factor | Retention Impact |
| ------------------------- | -------- | ---------- | ---------------- |
| 1 — The Heist             | Low      | High       | Medium           |
| 2 — Scratch Card          | Medium   | Very High  | Medium           |
| 3 — Friend Chain          | Low      | Medium     | High             |
| 4 — Personality Sort      | Low      | High       | High             |
| 5 — XP Bar                | Very Low | Medium     | Very High        |
| 6 — Time-Locked Legendary | Low      | High       | Very High        |
| 7 — Co-op Onboarding      | High     | Very High  | Very High        |

---

## Recommended Combo for the Hackathon Demo

Stack these three together for maximum demo impact with minimum build time:

1. Idea 4 (Personality Sort) — 3 swipe screens before Step 1, adds personalization story.
2. Idea 5 (XP Bar) — replaces QuestChecklist UI in Step 2, trivial upgrade.
3. Idea 6 (Time-Locked Legendary) — adds urgency + notification hook after Step 3.

This combo hits: personalization, engagement loops, and re-engagement — three of the
five judging criteria — without requiring backend changes beyond a minor User model update.
