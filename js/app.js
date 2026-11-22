/* Claude certifications revision — app engine (vanilla JS, no build, offline-friendly).
   Multi-certification: the active cert comes from the route (#/<cert>/<view>/<arg>). */
"use strict";

const CERTS = window.CERTS;
let CERT_ID = null, CERT = null, DOMAINS = {}, EXAM = {}, BANK = [];
function setCert(id) {
  if (!CERTS[id]) id = localStorage.getItem("certrev:cert") || window.DEFAULT_CERT;
  if (!CERTS[id]) id = Object.keys(CERTS)[0];
  CERT_ID = id; CERT = CERTS[id]; DOMAINS = CERT.domains; EXAM = CERT.exam;
  BANK = ((window.BANK || {})[id] || []).filter(q => !q.partnerTrack);
  try { localStorage.setItem("certrev:cert", id); } catch { /* private mode */ }
}
const DOM_IDS = () => Object.keys(DOMAINS).map(Number);
const link = view => `#/${CERT_ID}/${view}`;

/* ---------- utils ---------- */
const $ = sel => document.querySelector(sel);
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// Per-cert storage (CCAR-P keeps its v1 "ccarp:" prefix so earlier progress survives).
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(CERT.storagePrefix + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(CERT.storagePrefix + k, JSON.stringify(v)); } catch { /* private mode */ } }
};
const themeStore = {
  get() { try { return JSON.parse(localStorage.getItem("ccarp:theme")); } catch { return null; } },
  set(v) { try { localStorage.setItem("ccarp:theme", JSON.stringify(v)); } catch { /* private mode */ } }
};
const scaled = pct => Math.round(EXAM.scaleMin + (EXAM.scaleMax - EXAM.scaleMin) * pct);
const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/* ---------- theme ---------- */
function initTheme() {
  const saved = themeStore.get();
  if (saved) document.documentElement.dataset.theme = saved;
  else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    themeStore.set(next);
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
  const maxW = Math.max(...Object.values(DOMAINS).map(i => i.weight));
  const bpRows = Object.entries(DOMAINS).map(([d, info]) => `
    <div class="bp-row">
      <span class="bp-num">D${d}</span>
      <div><div class="bp-name">${esc(info.name)}</div>
        <div class="bp-track"><div class="bp-fill" style="width:${info.weight / maxW * 100}%"></div></div></div>
      <span class="bp-w">${info.weight}%</span>
    </div>`).join("");
  app.innerHTML = `
    <p class="eyebrow">Exam code ${CERT.code} · ${esc(CERT.guide.label)}</p>
    <h1>Revise for ${esc(CERT.name)}</h1>
    <div class="stat-line">
      <span>${EXAM.items} items</span><span>${EXAM.minutes} min</span><span>pass ≥ ${EXAM.pass} / ${EXAM.scaleMax}</span>
      <span>${esc(EXAM.note)}</span>${EXAM.fee && EXAM.fee !== "—" ? `<span>${esc(EXAM.fee)}</span>` : ""}<span>valid 12 months</span>
    </div>
    <div class="grid2">
      <div class="card">
        <p class="eyebrow">Exam blueprint — domain weights</p>
        ${bpRows}
      </div>
      <div class="card">
        <p class="eyebrow">Your progress</p>
        <p style="font-size:.9rem">
          Question bank: <strong>${BANK.length}</strong>${CERT.targetBank ? ` / ${CERT.targetBank} target` : ""} (hard level only)<br>
          Practice answers so far: <strong>${answered}</strong><br>
          Best mock score: <strong>${best !== null ? best + " / 1000" : "—"}</strong>
        </p>
        <div class="setup-row">
          <a class="btn" href="${link("mock")}">Start a mock exam</a>
          <a class="btn secondary" href="${link("practice")}">Practice by domain</a>
        </div>
      </div>
    </div>
    <h2>How to use this site</h2>
    <p style="font-size:.92rem">Read the <a href="${link("domains")}">domain notes</a> against the blueprint, drill weak domains in <a href="${link("practice")}">Practice</a> (instant feedback with rationale), then sit a timed <a href="${link("mock")}">mock exam</a> drawn according to the official domain weights. Every question is written at the level of the real exam (multi-constraint scenarios). Your progress stays in this browser (localStorage) — nothing is sent anywhere.</p>`;
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
        <button class="btn" id="p-start">Start practice</button>
      </div>
    </div>
    <div id="p-zone"></div>`;
  $("#p-start").addEventListener("click", () => {
    const doms = [...app.querySelectorAll('.checkgroup input[type="checkbox"]:checked')].map(c => Number(c.value));
    let pool = shuffle(BANK.filter(q => doms.includes(q.domain)));
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
// Draw up to EXAM.items questions following the official domain weights (largest-remainder rounding),
// then top up from the remaining pool if a domain is short.
function weightedDraw() {
  const n = Math.min(EXAM.items, BANK.length);
  const quotas = DOM_IDS().map(d => ({ d, raw: n * DOMAINS[d].weight / 100 }));
  quotas.forEach(x => x.want = Math.floor(x.raw));
  let left = n - quotas.reduce((s, x) => s + x.want, 0);
  [...quotas].sort((a, b) => (b.raw - b.want) - (a.raw - a.want)).forEach(x => { if (left > 0) { x.want++; left--; } });
  const picked = [], leftovers = [];
  quotas.forEach(({ d, want }) => {
    const pool = shuffle(BANK.filter(q => q.domain === d));
    picked.push(...pool.splice(0, want));
    leftovers.push(...pool);
  });
  const rest = shuffle(leftovers);
  while (picked.length < n && rest.length) picked.push(rest.pop());
  return shuffle(picked.slice(0, n));
}

function viewMock(app) {
  const n = Math.min(EXAM.items, BANK.length);
  const minutes = Math.ceil(n * EXAM.minutes / EXAM.items);
  const short = n < EXAM.items;
  const covered = DOM_IDS().filter(d => BANK.some(q => q.domain === d)).length;
  app.innerHTML = `
    <p class="eyebrow">Mock exam</p>
    <h1>Timed simulation</h1>
    <div class="card">
      <p style="font-size:.92rem"><strong>${n} questions</strong> drawn according to the official domain weights ·
      <strong>${minutes} minutes</strong> · no feedback until the end · score reported on the ${EXAM.scaleMin}–${EXAM.scaleMax} scale (pass ≥ ${EXAM.pass}).</p>
      ${short ? `<p style="font-size:.88rem;color:var(--err)">The bank holds ${BANK.length} questions covering ${covered} of ${DOM_IDS().length} domains, below the ${EXAM.items} items of the real exam: time is prorated and the domain mix cannot match the blueprint yet. Use Practice until the bank is complete.</p>` : ""}
      <div class="setup-row"><button class="btn" id="m-start" ${n ? "" : "disabled"}>Start mock exam</button></div>
    </div>
    <div id="m-zone"></div>`;
  $("#m-start").addEventListener("click", () => runMock($("#m-zone"), weightedDraw(), minutes));
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
  const NOTES = (window.NOTES || {})[CERT_ID] || {};
  if (arg && NOTES[arg]) return viewDomainFiche(app, Number(arg));
  const cards = Object.entries(DOMAINS).map(([d, info]) => {
    const nQ = BANK.filter(q => q.domain == d).length;
    return `<a class="card domain-card" href="${link("domains/" + d)}">
      <div class="q-meta"><span class="tag domain">D${d}</span><span class="tag">${info.weight}%</span><span class="tag">${nQ} questions</span></div>
      <strong>${esc(info.name)}</strong>
      <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0 0">${esc(NOTES[d]?.tagline || "")}</p></a>`;
  }).join("");
  app.innerHTML = `<p class="eyebrow">Domain notes</p>
    <h1>The ${DOM_IDS().length} exam domains</h1>
    <p style="font-size:.92rem">One revision sheet per blueprint domain: the official exam objectives, the concepts behind them, and the classic traps. Weights indicate the share of the ${EXAM.items} exam items.</p>
    <div class="grid2">${cards}</div>`;
}

function viewDomainFiche(app, d) {
  const info = DOMAINS[d], note = window.NOTES[CERT_ID][d];
  const last = Math.max(...DOM_IDS());
  const nav = `<div class="setup-row">
    <a class="btn secondary small" href="${link("domains")}">← All domains</a>
    ${d > 1 ? `<a class="btn secondary small" href="${link("domains/" + (d - 1))}">D${d - 1}</a>` : ""}
    ${d < last ? `<a class="btn secondary small" href="${link("domains/" + (d + 1))}">D${d + 1} →</a>` : ""}
    <a class="btn small" href="${link("practice")}">Drill this domain</a></div>`;
  const sections = (note.sections || []).map(s => `<h2>${esc(s.title)}</h2>
    <ul class="notes">${s.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`).join("");
  app.innerHTML = `<p class="eyebrow">Domain ${d} · ${info.weight}% of the exam</p>
    <h1>${esc(info.name)}</h1>
    <p style="font-size:.95rem;font-style:italic">${esc(note.tagline)}</p>
    <div class="card"><p class="eyebrow">Official exam objectives (blueprint)</p>
      <ul class="notes">${note.examTasks.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
    ${sections || '<p class="empty">Revision notes for this domain are added as the course modules are covered.</p>'}
    ${(note.pitfalls || []).length ? `<div class="card" style="border-left:3px solid var(--err)"><p class="eyebrow">Classic traps</p>
      <ul class="notes">${note.pitfalls.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
    ${nav}`;
}

/* ---------- flashcards ---------- */
function viewFlashcards(app) {
  const CARDS = (window.FLASHCARDS || {})[CERT_ID] || [];
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
  const SHEET = (window.CHEATSHEET || {})[CERT_ID] || [];
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
function renderChrome() {
  document.title = `Revision · ${CERT.name}`;
  $("#brand-mark").textContent = CERT.code;
  $("#brand-sub").textContent = `${CERT.name} · Revision`;
  const sel = $("#cert-select");
  if (!sel.options.length) {
    Object.entries(CERTS).forEach(([id, c]) => sel.add(new Option(`${c.code} · ${c.name.replace("Claude Certified ", "")}`, id)));
    sel.addEventListener("change", () => { location.hash = `#/${sel.value}/home`; });
  }
  sel.value = CERT_ID;
  document.querySelectorAll(".nav a[data-route]").forEach(a => a.href = link(a.dataset.route));
  const g = CERT.guide;
  $("#disclaimer").innerHTML = `Unofficial study aid — built from the public ${g.url ? `<a href="${g.url}" target="_blank" rel="noopener">${esc(g.label)}</a>` : esc(g.label)} and course material.
    Practice questions are <strong>not</strong> from the official item bank; items flagged “exam-guide sample” are the examples published in the guide itself. Runs fully offline. Not affiliated with Anthropic.`;
  $("#footer").innerHTML = `${CERT.code} Revision · community study aid${CERT.officialPage ? ` · <a href="${CERT.officialPage}" target="_blank" rel="noopener">official certification page</a>` : ""}`;
}
function route() {
  if (activeMockTimer) { clearInterval(activeMockTimer); activeMockTimer = null; }
  let parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!CERTS[parts[0]]) parts = [null, ...parts]; // legacy links (#/practice) keep the current cert
  const [certId, name = "home", arg] = parts;
  setCert(certId);
  renderChrome();
  const view = routes[name] || viewHome;
  document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
  const app = $("#app"); app.innerHTML = ""; view(app, arg); window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
initTheme();
route();
