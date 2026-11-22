# Claude certifications — Revision

Unofficial revision site for two Anthropic certifications, switchable from the top bar:

- **CCAR-P** — Claude Certified Architect – Professional (63 items, 7 domains)
- **CCDV-P** — Claude Certified Developer – Professional (70 items incl. 10 unscored, 8 domains) — *bank in progress, filled module by module*

Static site — no build step, no backend, no dependencies. Works offline once loaded, and directly from the filesystem (`file://`).

## Features (per certification)

- **Domain notes** — official exam objectives per blueprint domain, key concepts, classic traps
- **Practice mode** — instant feedback per question, filterable by domain, per-domain stats (localStorage)
- **Mock exam** — questions drawn according to the official domain weights, timed, scaled score /1000 (pass ≥ 720), per-domain breakdown, full answer review
- **Flashcards** and **cheat sheet** (print-friendly)
- **Dark-first design** following the [charte-generique](https://github.com/Aliquanto3/charte-generique) design system (tokens and OFL fonts served from `charte/`, no CDN), progress persistence per certification, zero tracking

Links take the form `#/<cert>/<view>` (e.g. `#/ccdv-p/practice`); older links such as `#/practice` open the last certification used.

## Question bank — hard level only

Only multi-constraint scenario items ("hard" level) are served: they are the closest to the real exam. The former CCAR-P "core" items (231, including the 4 partner-track items) are archived in `archive/ccar-p-core/` and no longer loaded.

| Cert | Live items | Notes |
|---|---|---|
| CCAR-P | 217 | 214 hard + 3 official Exam Guide samples |
| CCDV-P | 121 | 3 official samples + 96 items from course modules 1–5 + 22 Foundations refresher items (API mechanics) — target ~240 |

CCDV-P items are written per course module in `tools/ccdv-p/src/mNN.js` (key first) and built with `node tools/ccdv-p/build.js`, which rotates key positions and writes `data/ccdv-p/`. Every generated item passes the anti-cue linter (`node tools/lint-cues.js --cert ccdv-p`, rules R1–R6: no justification clauses in options, no absolutes in distractors only, symmetric punctuation / enumeration / register, option lengths within ±15 % of the median). Official samples (`exam-guide-sample`) are excluded from the lint and never edited.

## Run locally

Open `index.html` in a browser. That's it.

Optionally serve it: `python3 -m http.server` then http://localhost:8000.

## Deploy on GitHub Pages

1. Create a repository and push these files to the `main` branch
2. Repository **Settings → Pages → Source**: `Deploy from a branch`, branch `main`, folder `/ (root)`
3. The site is published at `https://<user>.github.io/<repo>/` within a minute

## Contributing questions

Questions live in `data/<cert>/questions-dN.js` (one file per domain; certifications are declared in `data/certs.js`). Add an object to the relevant file:

```js
{ id:"d3-49",            // unique: d<domain>-<number>
  domain:3,              // 1–7 (CCAR-P) or 1–8 (CCDV-P)
  type:"single",         // "single" (4 options) or "multi" (5 options)
  select:1,              // how many answers to select (matches correct.length)
  difficulty:"hard",     // only hard items are served
  source:"generated",    // never remove the exam-guide-sample flag from official items
  question:"…",
  options:["…","…","…","…"],
  correct:[2],           // 0-based indices
  explanation:"Why the right answer is right AND why the tempting distractors are wrong." }
```

Quality bar: every distractor is a position a competent practitioner could hold, the explanation addresses each one, key positions vary, and `node tools/lint-cues.js` returns 0 flags.

## Disclaimers

- **Unofficial study aid.** Not affiliated with, endorsed by, or approved by Anthropic. "Claude" is a trademark of Anthropic, PBC.
- Question content is original, written from the **publicly available** Exam Guides, course material and Anthropic documentation. It reproduces no proprietary course or exam content. Real exam questions differ.
- Exam logistics (fees, retake policy, passing score) can change — always verify against the official Exam Guide before booking.

## License

MIT for the code. Question content © contributors, released under CC BY-SA 4.0.
