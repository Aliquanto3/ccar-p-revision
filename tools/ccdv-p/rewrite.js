/* Replace items of tools/ccdv-p/src/mNN.js by id with the versions in a rewrite file (key first),
   keeping each source file's header comment. Usage: node tools/ccdv-p/rewrite.js <rewrite-file.js> */
const fs = require('fs'), path = require('path');
const rw = require(path.resolve(process.argv[2]));
const byId = new Map(rw.map(q => [q.id, q]));
const srcDir = path.join(__dirname, 'src');
const ser = q => `{ id:${JSON.stringify(q.id)}, domain:${q.domain}, type:${JSON.stringify(q.type)}, select:${q.select}, source:${JSON.stringify(q.source)},\n  question:${JSON.stringify(q.question)},\n  options:[${q.options.map(o => JSON.stringify(o)).join(',\n    ')}],\n  correct:${JSON.stringify(q.correct)},\n  explanation:${JSON.stringify(q.explanation)} }`;
const done = new Set();
for (const f of fs.readdirSync(srcDir).filter(f => /^m\d+\.js$/.test(f)).sort()) {
  const file = path.join(srcDir, f), text = fs.readFileSync(file, 'utf8');
  const items = require(file);
  if (!items.some(q => byId.has(q.id))) continue;
  const header = text.split('\n').filter(l => l.startsWith('//')).slice(0, 3).join('\n');
  const out = items.map(q => { if (byId.has(q.id)) { done.add(q.id); return byId.get(q.id); } return q; });
  fs.writeFileSync(file, `${header}\nmodule.exports = [\n${out.map(ser).join(',\n')}\n];\n`);
  console.log(f, out.filter(q => byId.has(q.id)).length, 'items replaced');
}
const missing = rw.map(q => q.id).filter(id => !done.has(id));
if (missing.length) { console.error('Not found:', missing.join(', ')); process.exit(1); }
