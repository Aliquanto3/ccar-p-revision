// CCDV-P Revision — Flashcards
// Schema: {id, domain, front, back}
window.FLASHCARDS = window.FLASHCARDS || {};
window.FLASHCARDS["ccdv-p"] = [
  // D2 — Production Integration, Reliability, and Knowledge Grounding (module 1)
  { id: "v201", domain: 2, front: "Web search: what does your code NOT have to do, and why?", back: "Write a handler or send a tool_result. It is a server tool running on Anthropic's infrastructure; you add one entry to tools and get the finished answer back." },
  { id: "v202", domain: 2, front: "allowed_domains — four formatting rules", back: "Bare domain (no https://) · subdomains included · a specific subdomain restricts to it only · cannot be combined with blocked_domains in the same request (400)." },
  { id: "v203", domain: 2, front: "Dynamic filtering: what is it, which versions, which models?", back: "Claude runs code that filters search results before they enter the context window. web_search_20260209 and later, Claude 4.6 and later models, on by default." },
  { id: "v204", domain: 2, front: "ZDR or HIPAA workload + web search 20260209: what changes?", back: "Dynamic filtering is not eligible (it runs in code execution). Use web_search_20250305, or set allowed_callers: [\"direct\"] to disable it." },
  { id: "v205", domain: 2, front: "How does a failed web search show up in the response?", back: "HTTP 200. A web_search_tool_result whose content is a single web_search_tool_result_error object (error_code), not a list. No results = empty list, not an error." },
  { id: "v206", domain: 2, front: "stop_reason: pause_turn — what do you send next?", back: "The paused response content as an assistant message, with the same tools (and container ID if any). Repeat with a cap; keep every paused response in order." },
  { id: "v207", domain: 2, front: "Why one MCP server per environment for CI deployment tools?", back: "Permission rules name the server and the tool, not its arguments. Separate servers (and per-environment tokens) let an allowlist distinguish staging from production." },
  { id: "v208", domain: 2, front: "--permission-mode dontAsk in a pipeline job", back: "Any call that would prompt is denied, so a tool off --allowedTools is refused and the job never hangs. A call a PreToolUse hook approves still runs." },
  { id: "v209", domain: 2, front: "Why does production 'fail closed' in the CI/CD play?", back: "release is off the production allowlist: the only path is the PreToolUse hook's allow (release manager, change ticket). If the hook does not run, the release is denied." },
  { id: "v210", domain: 2, front: "Why is rollback on the allowlist even in production?", back: "It is a runbook approved in advance: one command, rehearsed in staging, called automatically when a control band is breached." },
  { id: "v211", domain: 2, front: "CI/CD agent play — leading and lagging indicators", back: "Leading: share of pipeline failures triaged without paging a human (pipeline logs). Lagging: DORA metrics from CI and deployment tooling." }
];
