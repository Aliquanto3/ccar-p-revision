/* Build data/ccdv-p/questions-dN.js from the per-module sources in tools/ccdv-p/src/mNN.js.
   Sources are written with the key first; this script rotates key positions (round robin, reset per
   module so earlier modules keep their positions) and remaps option letters cited in explanations.
   Usage: node tools/ccdv-p/build.js   (then: node tools/lint-cues.js --cert ccdv-p) */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
global.window = {}; require(path.join(root, 'data', 'certs.js'));
const D = window.CERTS['ccdv-p'].domains, L = 'ABCDE';
const target = [2, 1, 3, 0, 2, 3, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0];
const srcDir = path.join(__dirname, 'src');
const items = [];
for (const f of fs.readdirSync(srcDir).filter(f => /^m\d+\.js$/.test(f)).sort()) {
  let rr = 0;
  for (const q of require(path.join(srcDir, f))) {
    if (q.source !== 'exam-guide-sample' && q.type === 'single') {
      const want = target[rr++ % target.length], k = q.correct[0];
      if (want !== k) {
        const order = [...q.options.keys()];
        [order[k], order[want]] = [order[want], order[k]];
        q.options = order.map(i => q.options[i]);
        q.correct = [want];
        q.explanation = q.explanation.replace(/\(([A-D])\)/g, (_, c) => '(' + L[order.indexOf(L.indexOf(c))] + ')');
      }
    }
    items.push(q);
  }
}
const ids = items.map(q => q.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) { console.error('Duplicate ids:', dup.join(', ')); process.exit(1); }
const ser = q => `{ id:${JSON.stringify(q.id)}, domain:${q.domain}, type:${JSON.stringify(q.type)}, select:${q.select}, difficulty:"hard", source:${JSON.stringify(q.source)},\n  question:${JSON.stringify(q.question)},\n  options:[${q.options.map(o => JSON.stringify(o)).join(',\n    ')}],\n  correct:${JSON.stringify(q.correct)},\n  explanation:${JSON.stringify(q.explanation)} }`;
for (const d of Object.keys(D)) {
  const qs = items.filter(q => q.domain == d).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  fs.writeFileSync(path.join(root, 'data', 'ccdv-p', `questions-d${d}.js`),
    `// CCDV-P Revision — Domain ${d}: ${D[d].name} (${D[d].weight}%) — ${qs.length} items\nwindow.BANK = window.BANK || {};\nwindow.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([\n${qs.map(ser).join(',\n')}\n]);\n`);
}
console.log(`${items.length} items written`);
