# Raiffeisen Youth — Live Presentation Script

**Challenge: "Play, Invite, Belong"**
**Team slot: ~5 minutes + demo**

---

## OPENING — The Problem (30 seconds)

> "Every year, Raiffeisen spends money on a 2,000 Lek welcome bonus for new Youth accounts.
> And every year, users receive it as a text message that says:
> _'Your balance has been updated: +2,000 ALL.'_
>
> That's it. No emotion. No memory. No word of mouth.
> The money lands and disappears. And the user is gone two weeks later.
>
> We asked a simple question: what if that same 2,000 Lek felt like the best moment of their day?"

---

## THE INSIGHT — Repackaging, Not Reinventing (30 seconds)

> "We didn't need a bigger budget. We didn't need to reinvent banking.
> We just needed to change the wrapper.
>
> Raiffeisen Youth is a gamified banking app built around one core mechanic:
> every banking action earns credits, and credits unlock rewards through a gacha pull system.
> The 2,000 Lek bonus is still there — but now it's a legendary chest opening
> with a cinematic animation, particles, sound, and a moment the user will screenshot and share."

---

## DEMO — Live walkthrough (2 minutes 30 seconds)

**[Open the app on screen — start at the registration page]**

> "Let me show you how this works. A new user signs up — takes 30 seconds.
> And then the onboarding begins."

**[Tap 'Start & Claim First Pull']**

> "The first thing we do is ask three fast questions — no forms yet.
> Swipe left or right. Takes 10 seconds."

**[Swipe through the 3 personality questions]**

> "Based on those answers, our AI classifies you into one of four archetypes.
> Watch what happens next."

**[Archetype reveal animation fires — arpeggio sound, glow orb]**

> "You are The Explorer. This isn't just a label.
> It immediately unlocks a card skin and a badge.
> The user now has an identity inside this app before they've filled out a single form.
> That's loss aversion working for us — quitting now means losing something they already own."

**[Tap 'Claim Your Free Pull' — scratch cards appear]**

> "Before any KYC, the user gets a free scratch card pull.
> Three panels, one real reward. Scratch to find it."

**[Scratch one card — reveal animation fires]**

> "There it is. A Rare skin, revealed with a full cinematic animation and sound.
> This is the sunk cost hook. The user has now received two rewards
> before we've asked them for anything."

**[Tap Continue to Missions]**

> "Now comes the KYC — but we never call it that.
> These are Missions. Tap a card to flip it and see what's inside."

**[Flip a mission card — back face shows reward + Complete button]**

> "Each mission tells you exactly what you'll earn for completing it.
> This is the IKEA effect — users value what they build.
> That progress ring in the corner never shows 'Step 3 of 5.'
> It shows '3/5' with a glow. Finishing feels like winning a level."

**[Complete 2-3 missions quickly — confetti burst + credits animate]**

**[Complete the final PIN mission]**

> "And then — all 5 missions done."

**[Golden chest legendary reveal fires — screen goes dark, particles, sound]**

> "The screen goes black. A legendary chest opens.
> And the 2,000 Lek welcome bonus is revealed.
> Not a notification. Not a balance update. This."

**[Tap 'Go to Dashboard']**

> "The user lands on their dashboard with a personalized card skin,
> a flip card that shows their balance and lets them freeze their card,
> and a Rewards Vault full of cosmetics to unlock."

**[Show the Vault briefly — 10-pull button]**

> "They can pull one reward at a time — or do a 10-pull,
> which triggers a full multi-reveal sequence with staggered card flips,
> sound, particle bursts, and a crescendo when all 10 are revealed."

**[Show the social feed / leaderboard briefly]**

> "And they can see what their friends are unlocking —
> a friends-only feed with auto-generated activity posts,
> and a leaderboard that shows their rank among their own contacts.
> Not globally. Locally. Being number 2 among your friends
> is infinitely more motivating than being number 14,000 globally."

---

## THE ARCHITECTURE — 30 seconds

> "Under the hood: React frontend deployed on Vercel,
> Node/Express backend on Render, MongoDB Atlas for persistence.
> JWT auth, microservices-ready design, BFF layer separating mobile concerns from backend logic.
> The gamification engine, referral system, and reward tracking are all independent services.
> Cloud-ready, containerizable, horizontally scalable."

---

## COMPLIANCE — 15 seconds

> "And before anyone asks about regulatory risk:
> credits cannot be purchased with real money.
> All rewards are purely cosmetic — card skins, themes, borders.
> Zero monetary value. The pity counter is fully visible.
> No hidden probabilities. This is compliant out of the box."

---

## BUSINESS IMPACT — 30 seconds

> "What does this actually do for the business?
>
> Acquisition: the sunk cost hook means users who start the onboarding feel invested before they finish it.
>
> Onboarding completion: KYC reframed as missions with immediate rewards.
> Every step has a payoff. The drop-off rate drops.
>
> Referrals: the referral system gives both the referrer and the new user bonus pulls.
> Social FOMO through the friend feed drives organic acquisition.
>
> Retention: daily missions, streaks, and a weekly vault banner keep users returning.
> Not because they have to. Because they want to see what they'll pull next."

---

## CLOSE — 15 seconds

> "Raiffeisen Youth already has the budget, the users, and the infrastructure.
> We're not proposing a new product.
> We're proposing a new emotional experience on top of what already exists.
>
> The 2,000 Lek was always there.
> We just made it feel like the best moment of your day."

---

## BACKUP Q&A ANSWERS

**Q: Is this gambling?**

> "No. Credits are earned only through real banking actions — transactions, savings, referrals.
> You cannot buy credits. All rewards are cosmetic. The pity counter is transparent.
> This is categorically not gambling by any EU regulatory definition."

**Q: What's the AI component?**

> "The personality quiz maps user answers to behavioral archetypes using a classification model.
> The output personalizes the card skin, badge, and dashboard experience from the first session.
> This is the foundation for future personalized mission generation."

**Q: How does this scale?**

> "The backend is stateless, containerized, and designed for horizontal scaling.
> The gacha engine and referral tracker are independent services.
> Adding new reward pools, new cosmetic tiers, or new mission types
> requires no core architecture changes."

**Q: What's the referral mechanic?**

> "Every user gets a unique referral code. When a friend signs up using that code,
> both users receive +5 credits — enough for 5 pulls.
> The friend's activity appears in the referrer's social feed,
> creating a visible social loop that drives further sharing."
