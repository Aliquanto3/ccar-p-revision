// CCDV-P Revision — Flashcards
// Schema: {id, domain, front, back}
window.FLASHCARDS = window.FLASHCARDS || {};
window.FLASHCARDS["ccdv-p"] = [
  // D3 / D6 — observability, control bands, spend (module 3)
  { id: "v301", domain: 3, front: "Compliance API vs audit logs vs OpenTelemetry", back: "Compliance API: what was said (content + audit events). Audit logs: who did what when (metadata only). OTel: how surfaces run (optional, operational)." },
  { id: "v302", domain: 3, front: "Why enable the Compliance API before members get access?", back: "Activity feed events and local session transcripts are captured only while it is on: a late start leaves gaps that cannot be filled." },
  { id: "v303", domain: 3, front: "Retention defaults and limits", back: "Default: kept indefinitely. Custom window: organization-wide, minimum 30 days, no zero option. Deleted content does not come back." },
  { id: "v304", domain: 3, front: "Retention exceptions in the Compliance API", back: "Activity feed: 6 years. Remote Cowork transcripts: 6 years unless deleted. Local Cowork/Claude Code transcripts: custom window (or 6 years), 30 days with HIPAA readiness." },
  { id: "v305", domain: 3, front: "Control-band tiers", back: "1σ log · 2σ or drift rule: read-only diagnosis · 3σ: propose via PR or pre-approved runbook. Detection is a deterministic, tested script." },
  { id: "v306", domain: 3, front: "Western Electric drift rules used in the play", back: "4 of the last 5 readings above 1σ, or 8 readings in a row above the mean (counted as 2σ)." },
  { id: "v307", domain: 3, front: "Noise rates at 720 hourly readings a month", back: ">1σ ≈ 4 per day · >2σ ≈ 16 per month · >3σ ≈ 1 per month." },
  { id: "v601", domain: 6, front: "Biggest Enterprise spend lever before touching caps", back: "The default model and effort level (organization-wide or per role), plus effort caps for routine work: most members never change the picker." },
  { id: "v602", domain: 6, front: "Analytics API vs Spend Limits API", back: "Analytics API reads usage and cost (by group, for chargeback). Spend Limits API sets per-member caps." },
  // D1 — Advanced Agent Architecture and Orchestration (module 2)
  { id: "v101", domain: 1, front: "What does a subagent start with, and what comes back?", back: "Its own system prompt plus a task description written by the parent, in a fresh context window. Only a summary returns; the full run goes to a separate transcript." },
  { id: "v102", domain: 1, front: "Two roles of a subagent's description", back: "It decides when the main agent launches the subagent, and it guides the input prompt the main agent writes when delegating." },
  { id: "v103", domain: 1, front: "Single most important subagent improvement", back: "An output format in its system prompt: a natural stopping point and a report the main thread can use. Add an Obstacles Encountered section." },
  { id: "v104", domain: 1, front: "Three subagent anti-patterns", back: "Expert personas (no new capability), sequential pipelines with dependent steps (lost in handoffs), test runners (hide failure output)." },
  { id: "v105", domain: 1, front: "Managed agents — the four primitives in order", back: "Agent (model, system prompt, tools; reusable) → Environment (sandbox, networking) → Session (one run, unit of work) → Events (in and out)." },
  { id: "v106", domain: 1, front: "Managed agents: stream or kickoff first?", back: "Open the event stream first: it only delivers events that occur after it opens. Then send the user.message event." },
  { id: "v107", domain: 1, front: "session.status_idle — how to know if the work is done?", back: "Read stop_reason.type: end_turn = turn finished (or interrupted); requires_action = a tool call needs your answer." },
  { id: "v108", domain: 1, front: "Four context-management patterns", back: "Just-in-time (design pattern) · server-side compaction (context_management edit compact_20260112) · prompt caching · memory tool (your storage backend)." },
  { id: "v109", domain: 1, front: "Do subagents get the skills the main thread invoked?", back: "No. Custom subagents preload skills listed in their skills field (in full, at startup); keep Skill in their tools to invoke others. Built-ins don't preload." },
  // D7 / D8 — skills, hooks, plugins (module 2)
  { id: "v701", domain: 7, front: "PostToolUse hook exits with code 2 — what happens?", back: "The edit stays (a post hook cannot undo it); stderr is shown to Claude, which can fix the line." },
  { id: "v702", domain: 7, front: "Which keys of a plugin's settings.json does Claude Code honor?", back: "Only two: agent (promotes a plugin subagent to the main thread) and the subagent status line key." },
  { id: "v801", domain: 8, front: "Which skill wins on a name clash?", back: "Enterprise skills from managed settings: they override personal and project skills of the same name." },
  { id: "v802", domain: 8, front: "strictKnownMarketplaces", back: "Managed setting that limits which marketplaces people can add and install plugins from (entries like source github + repo, or source url + url)." },
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
