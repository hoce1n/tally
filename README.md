# Tally

**Ask. Vote. Watch it move.**

Tally is a live poll for small rooms. You write a question, people pick once, and the result bars fill in as the count changes — not as a spreadsheet, as a moment.

It is deliberately not a survey platform, not a webinar add-on, and not an internet-poll farm. It is a decision object: one question, a handful of options, a visible commitment, and motion you can feel.

---

## Why this exists

Polling is a solved mechanic and a failed product category.

- Social polls (X, Instagram, Slack) optimize for engagement, not a decision. The UI is a widget inside someone else's feed.
- Conference tools (Mentimeter, Slido, Poll Everywhere) assume a stage, an account, a deck, and a paid plan. They are excellent at 400-person keynotes and clumsy at Friday lunch.
- Link polls (StrawPoll and its cousins) are disposable, ad-heavy, and ugly. They treat a question like spam.

The gap is the **4–12 person room**: a standup, a dinner table, a classroom, a group chat that has stalled. Those groups already vote — they just do it with “any objections?”, a thread of reacting emojis, or a form that kills the energy.

Tally’s claim is simple: **a poll should feel like raising a hand, not filling out a form.**

That is the product. The bars moving are not decoration. They are the reason to open it instead of typing into a chat.

---

## What makes it unique

### 1. The room is the unit, not the form

Most tools start with an authoring surface: question types, logic jumps, branding, export. Tally starts with a question already in the air. You land on a live poll, you choose, you watch. Creating a new one is a secondary act, not the homepage.

### 2. One vote, made visible

After you choose, the option is marked, the others disable, and the percentages appear. The social contract is on screen. You are not an anonymous tick in a histogram; you are in the count. Reset exists for rehearsal. It is not the default.

### 3. Results as motion

Percentages and a total are table stakes. Tally treats the **update** as the experience: bars ease to their new width, the lead label moves, a live feed can keep the room breathing. Hide-until-vote avoids anchoring on early social proof; reveal-after-vote is the payoff.

### 4. Editorial, not dashboard

Commodity polls look like admin. Tally looks like a question worth answering — dark ink, one sage accent, a display serif on the prompt, quiet chrome. Design is not a skin. For a one-question product, how it feels *is* the differentiator.

### 5. Ephemeral by default

Most decisions do not need an account, a permalink that lives for a year, or a CSV. Local state is a product choice: the poll is of this moment. Persistence and sharing can come later without making identity the price of entry.

### What we will not become

- A form builder with 40 question types
- A login wall around the core loop
- A viral poll mill competing on embed widgets and ads
- An enterprise webinar suite

Stay a decision object. Grow the room around it, not the feature list.

---

## Who it is for

| Moment | Why Tally fits |
| --- | --- |
| A team choosing where to eat, which option to ship, when to stop | Faster than a thread, lighter than a meeting tool |
| A teacher or facilitator checking the room | One question, visible split, no student accounts |
| Friends deciding in person | Pass a phone, vote once, watch the bars |
| Anyone rehearsing a question | Templates, reset, and a live simulation so the motion is real before a real room exists |

The anti-persona is the researcher who needs skip logic, the marketer who needs an embed with UTM tracking, and the conference MC who needs Q&A moderation. Those people are well served elsewhere.

---

## Features (now)

- **Create a poll** — question plus 2–8 options, with validation for blanks and duplicates
- **Templates** — start from a written prompt instead of an empty form
- **Vote once** — tap an option; it locks as selected, the rest disable
- **Animated result bars** — width eases to the new share; percentages and vote counts appear after you choose
- **Total votes** — live counter with a leading label on the unique leader
- **Live mode** — after a vote, a gentle feed of incoming counts so the bars keep moving; pause anytime
- **Reset** — clear votes and your choice, keep the question
- **New poll** — throw out the room and write another
- **Responsive** — phone-first tap targets, no horizontal overflow, selected and disabled states that read at a glance

State lives in the browser (Zustand). There is no account and no database for the poll itself.

---

## How a round works

1. Land on a sample question, or open **New poll**.
2. Choose an option. Results reveal; your choice is marked.
3. Watch the bars. Toggle **Live** / **Paused** if you want the room to keep moving.
4. **Reset votes** to run the same question again, or **New poll** to ask something else.

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TanStack Start / Router |
| State | Zustand (local, no persistence) |
| Styling | Tailwind CSS v4, Radix primitives |
| Language | TypeScript |
| Icons | lucide-react |

Key files:

```
src/routes/index.tsx          Home route
src/components/tally-app.tsx  Shell
src/components/poll-room.tsx  Vote + live results
src/components/create-poll.tsx  Authoring
src/lib/poll-store.ts         Poll state and templates
src/styles.css                Design tokens
```

---

## Setup

**Prerequisites:** Node.js 22 and npm.

```bash
git clone https://github.com/hoce1n/tally.git
cd tally
npm install
```

### Develop

```bash
npm run dev
```

The app listens on port 8080.

### Production build

```bash
npm run build
npm run preview
```

### Checks

```bash
npm run typecheck
npm run lint
```

---

## Product direction

The current build is a **faithful prototype of the feeling**: one device, one voter, motion that is real. That is enough to judge whether the room metaphor works. It is not yet a shared product.

The path that stays unique:

1. **A shareable room without an account** — a link is the room. Presence is enough. The first visitor is the host; everyone else raises a hand. Local state becomes a session, not a user database.
2. **Honest live** — replace the simulated feed with real incoming votes. Keep hide-until-you-vote, then let the bars move on other people’s choices. That is the screenshot that sells the product.
3. **The question as an artifact** — a Tally should be screenshotable, sendable, and done. Optional expiry. No dashboard of “my 400 polls.”
4. **Facilitation, not analytics** — a host can reset, lock, or reveal. They should not get a funnel report. If we ever show a breakdown, it is “the room split like this,” not “engagement.”
5. **Keep the authoring tiny** — templates and a good question field beat a CMS. If a poll needs branching, it is no longer a Tally.

The test for every new feature: *does this make the room feel more like a room, or more like software?*

If Tally has something new to say, it is this: **software for deciding together should disappear into the question.** The unique value is not more poll types. It is a calmer, faster, more physical way to see a small group make up its mind.

---

## License

Private repository. All rights reserved unless a license is added.
