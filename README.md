# CCAR-P Revision

Unofficial revision site for the **Claude Certified Architect – Professional (CCAR-P)** certification exam.

Static site — no build step, no backend, no dependencies. Works offline once loaded, and directly from the filesystem (`file://`).

## Features

- **Domain notes** — one revision sheet per blueprint domain: official exam objectives, key concepts, classic traps
- **Practice mode** — instant feedback per question, filterable by domain, with per-domain stats (localStorage)
- **Mock exam** — 63 questions drawn according to official domain weights, 120-minute timer, scaled score /1000 (pass ≥ 720), per-domain breakdown, full answer review
- **Flashcards** — 43 cards with flip animation, "got it" tracking
- **Cheat sheet** — dense decision tables for last-mile review (print-friendly)
- **Dark mode**, progress persistence, zero tracking

## Question bank

252 original questions across the 7 blueprint domains, proportional to official exam weights:

| Domain | Weight | Questions |
|---|---|---|
| D1 Solution Design & Architecture | 17% | 43 |
| D2 Models, Prompting & Context | 13% | 33 |
| D3 Integration | 19% | 48 |
| D4 Evaluation, Testing & Optimization | 16% | 40 |
| D5 Governance, Safety & Risk | 14% | 35 |
| D6 Stakeholder Communication & Lifecycle | 14% | 35 |
| D7 Developer Productivity & Enablement | 7% | 18 |

Three questions are the official samples published in the public Exam Guide (flagged `exam-guide-sample`). Everything else is original material written from the public blueprint and course catalog objectives.

## Run locally

Open `index.html` in a browser. That's it.

Optionally serve it: `python3 -m http.server` then http://localhost:8000.

## Deploy on GitHub Pages

1. Create a repository and push these files to the `main` branch
2. Repository **Settings → Pages → Source**: `Deploy from a branch`, branch `main`, folder `/ (root)`
3. The site is published at `https://<user>.github.io/<repo>/` within a minute

## Contributing questions

Questions live in `data/questions-d1.js` … `questions-d7.js` (one file per domain). Add an object to the relevant file:

```js
{ id:"d3-49",            // unique: d<domain>-<number>
  domain:3,              // 1–7
  type:"single",         // "single" (4 options) or "multi" (5 options)
  select:1,              // how many answers to select (matches correct.length)
  difficulty:"core",     // "core" or "hard"
  source:"generated",    // never remove the exam-guide-sample flag from official items
  question:"…",
  options:["…","…","…","…"],
  correct:[2],           // 0-based indices
  explanation:"Why the right answer is right AND why the tempting distractors are wrong." }
```

Quality bar: every question needs at least one genuinely plausible distractor, and the explanation must address it. Keep correct-answer positions varied.

## Disclaimers

- **Unofficial study aid.** Not affiliated with, endorsed by, or approved by Anthropic. "Claude" is a trademark of Anthropic, PBC.
- Question content is original, written from the **publicly available** Exam Guide and course catalog descriptions. It reproduces no proprietary course or exam content. Real exam questions differ.
- Exam logistics (fees, retake policy, passing score) can change — always verify against the official Exam Guide before booking.

## License

MIT for the code. Question content © contributors, released under CC BY-SA 4.0.
