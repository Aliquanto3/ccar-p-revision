// Items shared with CCDV-P: the "Foundations refresher" batches written for the Professional bank
// (tools/ccdv-p/src/m06.js, m07.js, m11.js, m12.js) cover Foundations scope. They are reused here, re-filed in the
// Foundations blueprint domain they test. Fix wording in the CCDV-P source, both banks pick it up.
const map = {
  // m06 — API mechanics, caching, effort, structured outputs
  "d4-07":2, "d4-08":2, "d4-09":6, "d4-10":4, "d4-11":4, "d4-12":2, "d6-05":5, "d6-06":5, "d6-07":5,
  "d6-08":2, "d6-09":5, "d6-10":5, "d6-11":5, "d6-12":5, "d6-13":5, "d2-16":2, "d2-17":6, "d2-18":6,
  "d2-19":6, "d2-20":2, "d2-21":8, "d2-22":6,
  // m07 — Claude Code configuration, Agent SDK, adaptive thinking, MCP servers
  "d8-12":3, "d8-13":2, "d8-14":3, "d8-15":2, "d8-16":3, "d1-19":1, "d7-22":7, "d1-20":1, "d1-21":2,
  "d3-15":5, "d4-13":5, "d4-14":3, "d5-11":1, "d2-23":8, "d2-24":8, "d2-25":7, "d2-26":8, "d2-27":8,
  // m11 — tool-heavy workflows, effort, parallel and streamed tool calls (module 8)
  "d6-15":5, "d6-17":3, "d6-18":8, "d6-20":5, "d6-21":2, "d2-29":8, "d6-22":2,
  // m12 — orchestration, architecture evolution, grounding, multi-tenant throughput
  "d1-22":1, "d1-24":1, "d1-26":1, "d1-27":1, "d2-30":6, "d2-33":6, "d2-34":2
};
const src = [...require('../../ccdv-p/src/m06.js'), ...require('../../ccdv-p/src/m07.js'), ...require('../../ccdv-p/src/m11.js'), ...require('../../ccdv-p/src/m12.js')];
const n = {};
module.exports = src.filter(q => map[q.id]).map(q => {
  const d = map[q.id]; n[d] = (n[d] || 0) + 1;
  return Object.assign(JSON.parse(JSON.stringify(q)), { id: `d${d}-p${String(n[d]).padStart(2, '0')}`, domain: d, from: 'ccdv-p:' + q.id });
});
