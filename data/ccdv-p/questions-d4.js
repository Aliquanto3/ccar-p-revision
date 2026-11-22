// CCDV-P Revision — Domain 4: Advanced Debugging and Incident Response (10%) — 1 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d4-01", domain:4, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"After the rollback, a fix ships that restores the status panel's cache. Before adopting any new model or prompt version, the team wants to measure whether agents asked to make the panel feel live would remove the cache again. What should be added?",
  options:["A PostToolUse hook that rejects edits setting the cache duration of the status panel to zero",
    "A required pull-request check that fails when the panel's cache duration is set to zero",
    "A replay eval that gives agents the incident's request and checks that the panel still caches",
    "A CLAUDE.md line telling Claude to keep the cache whenever it edits the status panel"],
  correct:[2],
  explanation:"Each fixed incident leaves an eval behind: from the commit before the incident, it gives the agent the original request and checks tests, lint and that the panel still caches, which measures agent behavior before a new version is adopted. A hook (A) and a PR check (B) are good deterministic guards that block the change, but they do not measure how a candidate model or prompt behaves. A CLAUDE.md line (D) is advisory and measures nothing." }
]);
