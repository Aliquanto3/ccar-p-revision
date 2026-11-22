// CCDV-P Revision — Domain 6: Cost and Latency Optimization at Scale (8%) — 1 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d6-01", domain:6, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"An internal assistant sends the same 4,000-token system prompt and an unchanged set of tool definitions about 100 times an hour, with short user turns. Finance asks for a lower bill, and the product owner wants no change in behavior. Which change fits?",
  options:["Move the system prompt into the memory tool so that it is read only when Claude needs it",
    "Turn on server-side compaction so the system prompt is summarized after the first calls",
    "Mark the system prompt and tool definitions for prompt caching so later calls reuse them",
    "Cut the examples from the system prompt so that each call sends fewer tokens to the model"],
  correct:[2],
  explanation:"Prompt caching is built for stable parts of a request, such as a system prompt and tool definitions, reused across calls at a fraction of the cost, and it does not change what the model sees. Compaction (B) summarizes old conversation turns rather than the prompt, moving instructions to memory (A) makes them optional reads, and removing examples (D) changes behavior." }
]);
