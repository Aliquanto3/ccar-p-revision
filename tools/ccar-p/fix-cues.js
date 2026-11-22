/* One-off hygiene pass on the CCAR-P bank (no source/build pipeline for this cert):
   1) option rewrites (cue-edits.js) and length rebalancing (cue-edits2.js) that remove odd-one-out leads (lint R7) and a key-letter citation (R8);
   2) rebalance select-2 key positions across the bank, remapping letters cited in explanations.
   Idempotent. Usage: node tools/ccar-p/fix-cues.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..'), L = 'ABCDE';
const edits = {};
for (const f of ['./cue-edits.js', './cue-edits2.js', './cue-edits3.js']) for (const [id, e] of Object.entries(require(f))) {
  const t = edits[id] = edits[id] || { options: [] };
  t.options.push(...(e.options || [])); if (e.explanation) t.explanation = e.explanation;
}
const files = [1,2,3,4,5,6,7].map(d => path.join(root, 'data', 'ccar-p', `questions-d${d}.js`));
global.window = {};
const perFile = files.map(f => { window.BANK = {}; require(f); return window.BANK['ccar-p']; });
const used = new Set();
for (const items of perFile) for (const q of items) {
  const e = edits[q.id]; if (!e) continue; used.add(q.id);
  for (const [a, b] of e.options || []) { const i = q.options.indexOf(a); if (i < 0) continue; /* already applied, or superseded by a later edit */ q.options[i] = b; }
  if (e.explanation && !q.explanation.includes(e.explanation[1])) { if (!q.explanation.includes(e.explanation[0])) throw new Error(q.id + ' expl'); q.explanation = q.explanation.replace(e.explanation[0], e.explanation[1]); }
}
const missing = Object.keys(edits).filter(id => !used.has(id)); if (missing.length) throw new Error('not found: ' + missing);
const remap = (t, ni) => t.replace(/\(([A-E](?:\s*,\s*[A-E])*)\)/g, (_, l) => '(' + l.split(/\s*,\s*/).map(c => L[ni[L.indexOf(c)]]).sort().join(', ') + ')');
function place(q, want) {
  const n = q.options.length, keys = [...q.correct].sort((a, b) => a - b), others = [...q.options.keys()].filter(i => !keys.includes(i));
  const order = new Array(n); want.forEach((p, j) => { order[p] = keys[j]; }); let k = 0;
  for (let p = 0; p < n; p++) if (order[p] === undefined) order[p] = others[k++];
  const ni = []; order.forEach((o, p) => { ni[o] = p; });
  q.options = order.map(i => q.options[i]); q.correct = keys.map(i => ni[i]).sort((a, b) => a - b); q.explanation = remap(q.explanation, ni);
}
const pairs5 = [[1, 3], [0, 4], [2, 3], [1, 4], [0, 2], [3, 4], [1, 2], [0, 3], [2, 4], [0, 1]], pairs4 = [[1, 3], [0, 2], [2, 3], [0, 3], [1, 2], [0, 1]];
let r5 = 0, r4 = 0;
for (const items of perFile) for (const q of items)
  if (q.type === 'multi' && q.correct.length === 2 && q.source !== 'exam-guide-sample')
    place(q, q.options.length === 5 ? pairs5[r5++ % pairs5.length] : pairs4[r4++ % pairs4.length]);
const ser = q => `{ id:${JSON.stringify(q.id)}, domain:${q.domain}, type:${JSON.stringify(q.type)}, select:${q.select}, difficulty:${JSON.stringify(q.difficulty)}, source:${JSON.stringify(q.source)},\n  question:${JSON.stringify(q.question)},\n  options:[${q.options.map(o => JSON.stringify(o)).join(',\n    ')}],\n  correct:${JSON.stringify(q.correct)},\n  explanation:${JSON.stringify(q.explanation)} }`;
files.forEach((f, i) => {
  const header = fs.readFileSync(f, 'utf8').split('\n')[0];
  fs.writeFileSync(f, `${header}\nwindow.BANK = window.BANK || {};\nwindow.BANK["ccar-p"] = (window.BANK["ccar-p"] || []).concat([\n${perFile[i].map(ser).join(',\n')}\n]);\n`);
});
console.log('edited', used.size, 'items; select-2 items rebalanced', r5 + r4);
