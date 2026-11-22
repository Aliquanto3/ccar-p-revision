// CCDV-P Revision — Domain 4: Advanced Debugging and Incident Response (10%) — 1 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d4-01", domain:4, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"After the rollback, a fix ships that restores the status panel's cache. The team wants future agent runs to be stopped automatically if they remove the cache again while making the panel feel live. What should be added?",
  options:["A CLAUDE.md line telling Claude to keep the cache whenever it edits the status panel",
    "A lower 3σ threshold so that a repeat breach triggers the rollback runbook sooner",
    "An eval that replays the request behind the incident and fails when the cache is gone",
    "A note in the memory store so the next diagnosis starts from this incident's cause"],
  correct:[2],
  explanation:"Each fixed incident leaves an eval behind: starting from the commit before the incident, it gives the agent the original request and checks that tests pass, lint is clean and the panel still caches. That checks automatically. A CLAUDE.md line (A) is advisory, a tighter band (B) reacts after the damage, and memory (D) speeds diagnosis without preventing the change." }
]);
