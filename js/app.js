/* CCAR-P Revision — app engine (vanilla JS, no build, offline-friendly) */
"use strict";

const DOMAINS = {
  1: { name: "Solution Design & Architecture", weight: 17 },
  2: { name: "Claude Models, Prompting & Context Engineering", weight: 13 },
  3: { name: "Integration", weight: 19 },
  4: { name: "Evaluation, Testing & Optimization", weight: 16 },
  5: { name: "Governance, Safety & Risk Management", weight: 14 },
  6: { name: "Stakeholder Communication & Lifecycle Management", weight: 14 },
  7: { name: "Developer Productivity & Operational Enablement", weight: 7 }
};
const EXAM = { items: 63, minutes: 120, pass: 720, scaleMin: 100, scaleMax: 1000 };
const BANK = window.QUESTIONS || [];
const SCORED = BANK.filter(q => !q.partnerTrack); // partner-track exclu du mock exam
const TARGET_BANK = 452;

/* ---------- utils ---------- */
const $ = sel => document.querySelector(sel);
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("ccarp:" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ccarp:" + k, JSON.stringify(v)); } catch { /* private mode */ } }
};
const scaled = pct => Math.round(EXAM.scaleMin + (EXAM.scaleMax - EXAM.scaleMin) * pct);
const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/* ---------- theme ---------- */
function initTheme() {
  const saved = store.get("theme", null);
  if (saved) document.documentElement.dataset.theme = saved;
  else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("theme", next);
  });
}

/* ---------- question rendering (shared) ---------- */
// Renders one question card. onAnswer(selectedIdx[]) is called on validation.
function questionCard(q, num, total, { showSource = true } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "card";
  const multi = q.type === "multi";
  wrap.innerHTML = `
    <div class="q-meta">
      <span class="tag domain">D${q.domain} · ${esc(DOMAINS[q.domain].name)}</span>
      <span class="tag">${multi ? `select ${q.select}` : "select 1"}</span>
      ${showSource && q.source === "exam-guide-sample" ? '<span class="tag official">exam-guide sample</span>' : ""}
      ${q.partnerTrack ? '<span class="tag">partner track — not exam-tested</span>' : ""}
      <span class="tag">${num} / ${total}</span>
    </div>
    <p class="q-text">${esc(q.question)}</p>
    <div class="opts"></div>
    <div class="q-actions"></div>
    <div class="q-feedback"></div>`;
  const optsEl = wrap.querySelector(".opts");
  const letters = "ABCDE";
  const selected = new Set();
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "opt"; b.type = "button"; b.dataset.i = i;
    b.innerHTML = `<span class="k">${letters[i]}</span><span>${esc(opt)}</span>`;
    b.addEventListener("click", () => {
      if (wrap.dataset.locked) return;
      if (multi) {
        if (selected.has(i)) { selected.delete(i); b.classList.remove("selected"); }
        else if (selected.size < q.select) { selected.add(i); b.classList.add("selected"); }
      } else {
        selected.clear(); selected.add(i);
        optsEl.querySelectorAll(".opt").forEach(o => o.classList.remove("selected"));
        b.classList.add("selected");
      }
      wrap.dispatchEvent(new CustomEvent("selection", { detail: [...selected] }));
    });
    optsEl.appendChild(b);
  });
  wrap.getSelected = () => [...selected];
  wrap.lock = () => { wrap.dataset.locked = "1"; optsEl.querySelectorAll(".opt").forEach(o => o.disabled = true); };
  wrap.reveal = (userSel) => {
    wrap.lock();
    optsEl.querySelectorAll(".opt").forEach(o => {
      const i = Number(o.dataset.i);
      const isCorrect = q.correct.includes(i), wasPicked = userSel.includes(i);
      if (isCorrect && wasPicked) o.classList.add("correct");
      else if (isCorrect) o.classList.add("missed");
      else if (wasPicked) o.classList.add("wrong");
    });
    const ok = sameSet(userSel, q.correct);
    wrap.querySelector(".q-feedback").innerHTML = `
      <div class="verdict ${ok ? "ok" : "err"}">${ok ? "Correct" : "Incorrect"}</div>
      <div class="explain">${esc(q.explanation)}</div>`;
    return ok;
  };
  return wrap;
}

/* ---------- views ---------- */
function viewHome(app) {
  const stats = store.get("practiceStats", {});
  const mocks = store.get("mockHistory", []);
  const best = mocks.length ? Math.max(...mocks.map(m => m.score)) : null;
  const answered = Object.values(stats).reduce((s, d) => s + (d.attempts || 0), 0);
  const bpRows = Object.entries(DOMAINS).map(([d, info]) => `
    <div class="bp-row">
      <span class="bp-num">D${d}</span>
      <div><div class="bp-name">${esc(info.name)}</div>
        <div class="bp-track"><div class="bp-fill" style="width:${info.weight / 19 * 100}%"></div></div></div>
      <span class="bp-w">${info.weight}%</span>
    </div>`).join("");
  app.innerHTML = `
    <p class="eyebrow">Exam code CCAR-P · Guide v1.0 · July 2026</p>
    <h1>Revise for Claude Certified Architect – Professional</h1>
    <div class="stat-line">
      <span>63 items</span><span>120 min</span><span>pass ≥ 720 / 1000</span>
      <span>proctored (Pearson VUE)</span><span>valid 12 months</span>
    </div>
    <div class="grid2">
      <div class="card">
        <p class="eyebrow">Exam blueprint — domain weights</p>
        ${bpRows}
      </div>
      <div class="card">
        <p class="eyebrow">Your progress</p>
        <p style="font-size:.9rem">
          Question bank: <strong>${BANK.length}</strong> / ${TARGET_BANK} target<br>
          Practice answers so far: <strong>${answered}</strong><br>
          Best mock score: <strong>${best !== null ? best + " / 1000" : "—"}</strong>
        </p>
        <div class="setup-row">
          <a class="btn" href="#/mock">Start a mock exam</a>
          <a class="btn secondary" href="#/practice">Practice by domain</a>
        </div>
      </div>
    </div>
    <h2>How to use this site</h2>
    <p style="font-size:.92rem">Read the <a href="#/domains">domain notes</a> against the blueprint, drill weak domains in <a href="#/practice">Practice</a> (instant feedback with rationale), then sit a timed <a href="#/mock">mock exam</a> drawn according to the official domain weights. Your progress stays in this browser (localStorage) — nothing is sent anywhere.</p>`;
}

function viewPractice(app) {
  const stats = store.get("practiceStats", {});
  const checks = Object.entries(DOMAINS).map(([d, info]) => {
    const s = stats[d] || { attempts: 0, correct: 0 };
    const n = BANK.filter(q => q.domain == d).length;
    return `<label><input type="checkbox" value="${d}" checked ${n ? "" : "disabled"}>
      D${d} · ${esc(info.name)} <span class="tag">${n} q</span>
      ${s.attempts ? `<span class="tag">${Math.round(s.correct / s.attempts * 100)}% right</span>` : ""}</label>`;
  }).join("");
  app.innerHTML = `
    <p class="eyebrow">Practice mode</p>
    <h1>Drill by domain</h1>
    <div class="card checkgroup">
      <p class="eyebrow">Domains to include</p>${checks}
      <div class="setup-row">
        <label>Questions: <select id="p-count">
          <option>5</option><option selected>10</option><option>20</option><option value="all">all</option>
        </select></label>
        <label><input type="checkbox" id="p-hard"> hard only</label>
        <button class="btn" id="p-start">Start practice</button>
      </div>
    </div>
    <div id="p-zone"></div>`;
  $("#p-start").addEventListener("click", () => {
    const doms = [...app.querySelectorAll('.checkgroup input[type="checkbox"]:checked')].filter(c => c.id !== "p-hard").map(c => Number(c.value));
    const hardOnly = $("#p-hard").checked;
    let pool = shuffle(BANK.filter(q => doms.includes(q.domain) && (!hardOnly || q.difficulty === "hard")));
    const cv = $("#p-count").value;
    if (cv !== "all") pool = pool.slice(0, Number(cv));
    if (!pool.length) return;
    runPractice($("#p-zone"), pool);
    $("#p-zone").scrollIntoView({ behavior: "smooth" });
  });
}

function runPractice(zone, pool) {
  let idx = 0, good = 0;
  const stats = store.get("practiceStats", {});
  const next = () => {
    zone.innerHTML = "";
    if (idx >= pool.length) {
      zone.innerHTML = `<div class="card"><p class="eyebrow">Practice complete</p>
        <p class="score-big ${good / pool.length >= .7 ? "pass" : "fail"}">${good} / ${pool.length}</p>
        <p style="font-size:.9rem">${good / pool.length >= .7 ? "On track — the real pass bar sits around this level of consistency." : "Below the comfort zone — review the rationales and the domain notes, then retry."}</p>
        <button class="btn" id="p-again">New practice run</button></div>`;
      $("#p-again").addEventListener("click", () => location.reload());
      return;
    }
    const q = pool[idx];
    const card = questionCard(q, idx + 1, pool.length);
    const actions = card.querySelector(".q-actions");
    const validate = document.createElement("button");
    validate.className = "btn small"; validate.textContent = "Check answer"; validate.disabled = true;
    actions.appendChild(validate);
    card.addEventListener("selection", e => { validate.disabled = e.detail.length !== q.select; });
    validate.addEventListener("click", () => {
      const ok = card.reveal(card.getSelected());
      if (ok) good++;
      const s = stats[q.domain] || { attempts: 0, correct: 0 };
      s.attempts++; if (ok) s.correct++;
      stats[q.domain] = s; store.set("practiceStats", stats);
      validate.remove();
      const nextBtn = document.createElement("button");
      nextBtn.className = "btn small"; nextBtn.textContent = idx + 1 < pool.length ? "Next question" : "See result";
      nextBtn.addEventListener("click", () => { idx++; next(); });
      actions.appendChild(nextBtn); nextBtn.focus();
    });
    zone.appendChild(card);
  };
  next();
}

/* ---------- mock exam ---------- */
// Draw n questions following official domain weights, filtered by difficulty mode.
// mode: "easy" (core only), "hard" (hard only), "medium" (balanced mix per domain).
function weightedDraw(mode) {
  const inMode = q => mode === "easy" ? q.difficulty !== "hard"
                    : mode === "hard" ? q.difficulty === "hard"
                    : true;
  const n = Math.min(EXAM.items, SCORED.filter(inMode).length);
  const picked = [];
  const leftovers = [];
  Object.entries(DOMAINS).forEach(([d, info]) => {
    const want = Math.round(n * info.weight / 100);
    const core = shuffle(SCORED.filter(q => q.domain == d && q.difficulty !== "hard"));
    const hard = shuffle(SCORED.filter(q => q.domain == d && q.difficulty === "hard"));
    let take = [];
    if (mode === "easy") take = core.splice(0, want);
    else if (mode === "hard") take = hard.splice(0, want);
    else { // medium: balanced mix, alternating rounding, fallback across pools
      const wantHard = Math.min(hard.length, Math.round(want / 2));
      take = hard.splice(0, wantHard).concat(core.splice(0, want - wantHard));
    }
    // fallback within domain if the mode pool ran short
    if (take.length < want && mode !== "easy") take = take.concat(core.splice(0, want - take.length));
    if (take.length < want && mode !== "hard") take = take.concat(hard.splice(0, want - take.length));
    picked.push(...take);
    leftovers.push(...(mode === "easy" ? core : mode === "hard" ? hard : core.concat(hard)));
  });
  const rest = shuffle(leftovers);
  while (picked.length < n && rest.length) picked.push(rest.pop());
  return shuffle(picked.slice(0, n));
}

function viewMock(app) {
  const n = Math.min(EXAM.items, SCORED.length);
  const minutes = Math.ceil(n * EXAM.minutes / EXAM.items);
  const nHard = SCORED.filter(q => q.difficulty === "hard").length;
  app.innerHTML = `
    <p class="eyebrow">Mock exam</p>
    <h1>Timed simulation</h1>
    <div class="card">
      <p style="font-size:.92rem"><strong>${n} questions</strong> drawn according to the official domain weights ·
      <strong>${minutes} minutes</strong> · no feedback until the end · score reported on the 100–1000 scale (pass ≥ ${EXAM.pass}).</p>
      <p style="font-size:.9rem">Pick a difficulty: <strong>Easy</strong> draws core questions only, <strong>Hard</strong> draws from the ${nHard}-question hard set (multi-constraint scenarios), and <strong>Medium</strong> mixes both evenly per domain. The real exam sits between Medium and Hard.</p>
      <div class="setup-row">
        <button class="btn secondary" id="m-easy">Easy mock</button>
        <button class="btn secondary" id="m-medium">Medium mock</button>
        <button class="btn secondary" id="m-hard">Hard mock</button>
      </div>
    </div>
    <div id="m-zone"></div>`;
  const modeBtns = [["m-easy","easy"],["m-medium","medium"],["m-hard","hard"]];
  modeBtns.forEach(([id,mode])=>{
    $("#"+id).addEventListener("click", () => {
      modeBtns.forEach(([other])=>$("#"+other).classList.add("secondary"));
      $("#"+id).classList.remove("secondary"); // seul le mode choisi est mis en avant
      runMock($("#m-zone"), weightedDraw(mode), minutes);
    });
  });
}

let activeMockTimer = null; // single live interval — cleared on route change or restart

function runMock(zone, pool, minutes) {
  if (activeMockTimer) { clearInterval(activeMockTimer); activeMockTimer = null; }
  let idx = 0;
  const answers = new Array(pool.length).fill(null);
  let remaining = minutes * 60, tick = null;
  const finish = () => {
    clearInterval(tick); activeMockTimer = null;
    let good = 0; const perDom = {};
    pool.forEach((q, i) => {
      const sel = answers[i] || [];
      const ok = sameSet(sel, q.correct);
      if (ok) good++;
      const d = perDom[q.domain] || { n: 0, ok: 0 }; d.n++; if (ok) d.ok++; perDom[q.domain] = d;
    });
    const pct = good / pool.length, score = scaled(pct), pass = score >= EXAM.pass;
    const hist = store.get("mockHistory", []);
    hist.push({ date: new Date().toISOString().slice(0, 10), score, n: pool.length });
    store.set("mockHistory", hist);
    const domRows = Object.entries(perDom).map(([d, r]) => `
      <div class="dom-res"><span>D${d} · ${esc(DOMAINS[d].name)}</span>
      <strong>${Math.round(r.ok / r.n * 100)}%</strong></div>`).join("");
    zone.innerHTML = `<div class="card">
      <p class="eyebrow">Result</p>
      <p class="score-big ${pass ? "pass" : "fail"}">${score} / 1000</p>
      <p style="font-family:var(--mono);font-size:.85rem">${good} / ${pool.length} correct · ${pass ? "PASS" : "FAIL"} (bar: ${EXAM.pass})</p>
      <p class="eyebrow" style="margin-top:1rem">Percent correct by domain (as on the real score report)</p>
      ${domRows}
      <div class="setup-row"><button class="btn" id="m-review">Review answers</button></div>
    </div><div id="m-review-zone"></div>`;
    $("#m-review").addEventListener("click", () => {
      const rz = $("#m-review-zone"); rz.innerHTML = "";
      pool.forEach((q, i) => {
        const c = questionCard(q, i + 1, pool.length);
        c.reveal(answers[i] || []);
        rz.appendChild(c);
      });
      $("#m-review").disabled = true;
    });
  };
  const render = () => {
    zone.innerHTML = `<div class="quiz-head">
      <span class="progress">Question ${idx + 1} / ${pool.length} · answered ${answers.filter(Boolean).length}</span>
      <span class="timer" id="m-timer"></span></div><div id="m-q"></div>
      <div class="setup-row">
        <button class="btn secondary small" id="m-prev" ${idx === 0 ? "disabled" : ""}>← Previous</button>
        ${idx + 1 < pool.length
          ? '<button class="btn small" id="m-next">Next →</button>'
          : '<button class="btn small" id="m-finish">Finish exam</button>'}
      </div>`;
    const q = pool[idx];
    const card = questionCard(q, idx + 1, pool.length, { showSource: false });
    // restore previous selection
    (answers[idx] || []).forEach(i => card.querySelector(`.opt[data-i="${i}"]`)?.click());
    card.addEventListener("selection", e => { answers[idx] = e.detail.length ? e.detail : null; });
    $("#m-q").appendChild(card);
    $("#m-prev")?.addEventListener("click", () => { idx--; render(); });
    $("#m-next")?.addEventListener("click", () => { idx++; render(); });
    $("#m-finish")?.addEventListener("click", () => {
      const blank = answers.filter(a => !a).length;
      if (!blank || confirm(`${blank} question(s) unanswered. Finish anyway?`)) finish();
    });
    updateTimer();
  };
  const updateTimer = () => {
    const el = $("#m-timer"); if (!el) return;
    const m = Math.floor(remaining / 60), s = remaining % 60;
    el.textContent = `${m}:${String(s).padStart(2, "0")}`;
    el.classList.toggle("low", remaining < 300);
  };
  tick = setInterval(() => {
    remaining--;
    if (remaining <= 0) { finish(); return; }
    updateTimer();
  }, 1000);
  activeMockTimer = tick;
  render();
}

/* ---------- domains ---------- */
function viewDomains(app, arg) {
  const NOTES = window.DOMAIN_NOTES || {};
  if (arg && NOTES[arg]) return viewDomainFiche(app, Number(arg));
  const cards = Object.entries(DOMAINS).map(([d, info]) => {
    const nQ = BANK.filter(q => q.domain == d).length;
    return `<a class="card domain-card" href="#/domains/${d}">
      <div class="q-meta"><span class="tag domain">D${d}</span><span class="tag">${info.weight}%</span><span class="tag">${nQ} questions</span></div>
      <strong>${esc(info.name)}</strong>
      <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0 0">${esc(NOTES[d]?.tagline || "")}</p></a>`;
  }).join("");
  app.innerHTML = `<p class="eyebrow">Domain notes</p>
    <h1>The seven exam domains</h1>
    <p style="font-size:.92rem">One revision sheet per blueprint domain: the official exam objectives, the concepts behind them, and the classic traps. Weights indicate the share of the 63 exam items.</p>
    <div class="grid2">${cards}</div>`;
}

function viewDomainFiche(app, d) {
  const info = DOMAINS[d], note = window.DOMAIN_NOTES[d];
  const nav = `<div class="setup-row">
    <a class="btn secondary small" href="#/domains">← All domains</a>
    ${d > 1 ? `<a class="btn secondary small" href="#/domains/${d - 1}">D${d - 1}</a>` : ""}
    ${d < 7 ? `<a class="btn secondary small" href="#/domains/${d + 1}">D${d + 1} →</a>` : ""}
    <a class="btn small" href="#/practice">Drill this domain</a></div>`;
  const sections = note.sections.map(s => `<h2>${esc(s.title)}</h2>
    <ul class="notes">${s.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`).join("");
  app.innerHTML = `<p class="eyebrow">Domain ${d} · ${info.weight}% of the exam</p>
    <h1>${esc(info.name)}</h1>
    <p style="font-size:.95rem;font-style:italic">${esc(note.tagline)}</p>
    <div class="card"><p class="eyebrow">Official exam objectives (blueprint)</p>
      <ul class="notes">${note.examTasks.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
    ${sections}
    <div class="card" style="border-left:3px solid var(--err)"><p class="eyebrow">Classic traps</p>
      <ul class="notes">${note.pitfalls.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>
    ${nav}`;
}

/* ---------- flashcards ---------- */
function viewFlashcards(app) {
  const CARDS = window.FLASHCARDS || [];
  const known = new Set(store.get("knownCards", []));
  const opts = Object.entries(DOMAINS).map(([d, i]) =>
    `<option value="${d}">D${d} · ${esc(i.name)}</option>`).join("");
  app.innerHTML = `<p class="eyebrow">Flashcards</p>
    <h1>Flip to recall</h1>
    <div class="card">
      <div class="setup-row">
        <label>Domain: <select id="f-dom"><option value="all">All domains</option>${opts}</select></label>
        <label><input type="checkbox" id="f-hide-known" checked> hide cards marked “got it” (${known.size})</label>
        <button class="btn" id="f-start">Start deck</button>
        ${known.size ? '<button class="btn secondary small" id="f-reset">Reset “got it” marks</button>' : ""}
      </div></div>
    <div id="f-zone"></div>`;
  $("#f-reset")?.addEventListener("click", () => { store.set("knownCards", []); route(); });
  $("#f-start").addEventListener("click", () => {
    const dom = $("#f-dom").value, hide = $("#f-hide-known").checked;
    let deck = CARDS.filter(c => (dom === "all" || c.domain == dom) && !(hide && known.has(c.id)));
    deck = shuffle(deck);
    if (!deck.length) { $("#f-zone").innerHTML = '<div class="card empty">Nothing left in this selection — well done. Untick “hide” to review everything.</div>'; return; }
    runFlashcards($("#f-zone"), deck, known);
  });
}

function runFlashcards(zone, deck, known) {
  let idx = 0;
  const render = () => {
    if (idx >= deck.length) {
      zone.innerHTML = `<div class="card empty">Deck finished — ${deck.length} card(s) reviewed.</div>`;
      return;
    }
    const c = deck[idx];
    zone.innerHTML = `
      <div class="quiz-head"><span class="progress">Card ${idx + 1} / ${deck.length}</span>
        <span class="tag domain">D${c.domain} · ${esc(DOMAINS[c.domain].name)}</span></div>
      <button class="flashcard" id="f-card" aria-label="Flip card">
        <span class="fc-side fc-front">${esc(c.front)}</span>
        <span class="fc-side fc-back">${esc(c.back)}</span>
      </button>
      <p class="eyebrow" style="text-align:center">click / tap the card to flip</p>
      <div class="setup-row" style="justify-content:center">
        <button class="btn secondary small" id="f-again">Again later</button>
        <button class="btn small" id="f-got">Got it ✓</button>
      </div>`;
    $("#f-card").addEventListener("click", e => e.currentTarget.classList.toggle("flipped"));
    $("#f-got").addEventListener("click", () => {
      known.add(c.id); store.set("knownCards", [...known]); idx++; render();
    });
    $("#f-again").addEventListener("click", () => { idx++; render(); });
  };
  render();
}

/* ---------- cheat sheet ---------- */
function viewCheatsheet(app) {
  const SHEET = window.CHEATSHEET || [];
  const blocks = SHEET.map(b => `<div class="card">
    <p class="eyebrow">${esc(b.title)}</p>
    <table class="cheat"><tbody>
      ${b.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}
    </tbody></table></div>`).join("");
  app.innerHTML = `<p class="eyebrow">Cheat sheet</p>
    <h1>Last-mile reference</h1>
    <p style="font-size:.92rem">Dense decision tables and the numbers worth memorizing — best reviewed the day before the exam. Print-friendly.</p>
    ${blocks}`;
}

/* ---------- router ---------- */
const routes = {
  home: viewHome, practice: viewPractice, mock: viewMock,
  domains: viewDomains, flashcards: viewFlashcards, cheatsheet: viewCheatsheet
};
function route() {
  if (activeMockTimer) { clearInterval(activeMockTimer); activeMockTimer = null; }
  const [name, arg] = (location.hash.replace(/^#\//, "") || "home").split("/");
  const view = routes[name] || viewHome;
  document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
  const app = $("#app"); app.innerHTML = ""; view(app, arg); window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
initTheme();
route();
