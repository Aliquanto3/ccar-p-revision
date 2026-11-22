/* Build data/<cert>/ (cert = this script's folder name, e.g. ccdv-p) questions-dN.js from the per-module sources in tools/ccdv-p/src/mNN.js.
   Sources are written with the key first; this script rotates key positions (round robin, reset per
   module so earlier modules keep their positions) and remaps option letters cited in explanations.
   Usage: node tools/ccdv-p/build.js   (then: node tools/lint-cues.js --cert ccdv-p) */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
global.window = {}; require(path.join(root, 'data', 'certs.js'));
const CERT = path.basename(__dirname), CODE = window.CERTS[CERT].code;
const D = window.CERTS[CERT].domains, L = 'ABCDE';
// Target key positions, cycled per module: single-select keys, then select-2 key pairs.
const targetSingle = [2, 1, 3, 0, 2, 3, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0];
const targetPairs = [[1, 3], [0, 4], [2, 3], [1, 4], [0, 2], [3, 4], [1, 2], [0, 3], [2, 4]];
const targetPairs4 = [[1, 3], [0, 2], [2, 3], [0, 3], [1, 2], [0, 1]]; // select-2 items with four options
const srcDir = path.join(__dirname, 'src');
const items = [];
// Rewrite option letters cited in parentheses, e.g. "(B)" or "(B, D)", using old→new index map.
const remapLetters = (text, newIdx) => text.replace(/\(([A-E](?:\s*,\s*[A-E])*)\)/g, (_, list) =>
  '(' + list.split(/\s*,\s*/).map(c => L[newIdx[L.indexOf(c)]]).sort().join(', ') + ')');
function place(q, wantKeys) {
  const n = q.options.length, keys = [...q.correct].sort((a, b) => a - b);
  const others = [...q.options.keys()].filter(i => !keys.includes(i));
  const order = new Array(n); // order[newPos] = oldIndex
  wantKeys.forEach((pos, j) => { order[pos] = keys[j]; });
  let k = 0;
  for (let pos = 0; pos < n; pos++) if (order[pos] === undefined) order[pos] = others[k++];
  const newIdx = []; order.forEach((old, pos) => { newIdx[old] = pos; });
  q.options = order.map(i => q.options[i]);
  q.correct = keys.map(i => newIdx[i]).sort((a, b) => a - b);
  q.explanation = remapLetters(q.explanation, newIdx);
}
let rm = 0, r4 = 0; // select-2 pair rotation runs across modules so positions stay balanced bank-wide
for (const f of fs.readdirSync(srcDir).filter(f => /^m\d+\.js$/.test(f)).sort()) {
  let rs = 0; // offset pairs per module so they do not repeat
  for (const q of require(path.join(srcDir, f))) {
    if (q.source !== 'exam-guide-sample') {
      if (q.type === 'single') place(q, [targetSingle[rs++ % targetSingle.length]]);
      else if (q.correct.length === 2 && q.options.length === 5) place(q, targetPairs[rm++ % targetPairs.length]);
      else if (q.correct.length === 2 && q.options.length === 4) place(q, targetPairs4[r4++ % targetPairs4.length]);
    }
    items.push(q);
  }
}
const ids = items.map(q => q.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) { console.error('Duplicate ids:', dup.join(', ')); process.exit(1); }
const ser = q => `{ id:${JSON.stringify(q.id)}, domain:${q.domain}, type:${JSON.stringify(q.type)}, select:${q.select}, difficulty:"hard", source:${JSON.stringify(q.source)},\n  question:${JSON.stringify(q.question)},\n  options:[${q.options.map(o => JSON.stringify(o)).join(',\n    ')}],\n  correct:${JSON.stringify(q.correct)},\n  explanation:${JSON.stringify(q.explanation)} }`;
for (const d of Object.keys(D)) {
  const qs = items.filter(q => q.domain == d).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  fs.writeFileSync(path.join(root, 'data', CERT, `questions-d${d}.js`),
    `// ${CODE} Revision — Domain ${d}: ${D[d].name} (${D[d].weight}%) — ${qs.length} items\nwindow.BANK = window.BANK || {};\nwindow.BANK["${CERT}"] = (window.BANK["${CERT}"] || []).concat([\n${qs.map(ser).join(',\n')}\n]);\n`);
}
console.log(`${items.length} items written`);
