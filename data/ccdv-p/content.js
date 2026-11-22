// CCDV-P Revision — Domain notes & cheat sheet
// Objectives: public Exam Guide v1.0 (November 2026), Section 5. Notes are added module by module
// from the official course and verified against platform.claude.com documentation.

window.NOTES = window.NOTES || {};
window.NOTES["ccdv-p"] = {
  1: {
    tagline: "Run multi-agent systems that survive interruption, model changes and their own context limits.",
    examTasks: [
      "Multi-agent orchestration — supervisor/worker hierarchies, parallel subagent dispatch, delegation and context-isolation boundaries, inter-agent communication, human-in-the-loop and approval flows",
      "Durable execution and state management — session persistence, checkpointing, resumability, memory architecture for long-running agents that survive interruption, restart and model version change",
      "Architecture selection at scale — use production cost, reliability and quality data to evolve a running system between workflow and agentic patterns; choose harness, framework and reusable-pattern standards",
      "Context and memory architecture — compaction and editing, persistent memory, cache-safe instruction changes mid-conversation, keeping large tool catalogs out of the context window"
    ]
  },
  2: {
    tagline: "Keep Claude integrations up, grounded and changeable under real production traffic.",
    examTasks: [
      "Reliability engineering — retry and backoff, circuit breakers, graceful degradation, cross-model / cross-region / cross-platform fallbacks that tell rate limits from safety refusals from context-window stops, while respecting per-platform feature parity",
      "Scale and throughput — rate-limit strategy, queueing and backpressure, batch pipelines, multi-tenant quota and isolation, capacity planning; identify whether rate limits, token throughput or batch economics is the binding constraint",
      "Production MCP and change management — remote MCP deployment and authentication, tool and schema versioning, model migration testing, platform configuration parity, gateway/routing, prompt versioning, progressive rollout with rollback",
      "Retrieval and knowledge grounding at scale — agentic search vs RAG, chunking and embeddings, hybrid search, reranking, citations, uncertainty declaration, confidence signals, stage-by-stage diagnosis of retrieval failures"
    ],
    sections: [
      { title: "Web search tool — grounding on sources you trust", points: [
        "Server tool: runs on Anthropic's infrastructure. One entry in tools (type picks the version, name is always web_search); no handler, no tool_result to send back. Claude usually does all its searching inside one request.",
        "Versions: web_search_20250305 (basic) · web_search_20260209 (adds dynamic filtering) · web_search_20260318 (adds response_inclusion). Copy the type string from the tool reference.",
        "Dynamic filtering (20260209+, Claude 4.6 and later): Claude writes and runs code that filters results before they reach the context window. Runs inside code execution (allowed_callers defaults to the code-execution caller); no extra charge beyond tokens.",
        "Dynamic filtering is not ZDR- or HIPAA-eligible. Under ZDR: use the basic version, or keep 20260209+ and set allowed_callers: [\"direct\"]. Models without programmatic tool calling also need allowed_callers: [\"direct\"].",
        "Domain filtering: allowed_domains OR blocked_domains, never both (400). Bare domain, no scheme. A domain includes its subdomains; a specific subdomain restricts to that subdomain only. Paths work for web search (not web fetch). Wildcards only in the path. Request-level allowed list must be a subset of the organization's Console list.",
        "Errors come back with HTTP 200: web_search_tool_result whose content is a single object (web_search_tool_result_error with error_code: too_many_requests, invalid_tool_input, max_uses_exceeded, query_too_long, request_too_large, unavailable) instead of a list. No match = empty list, not an error.",
        "max_uses caps searches per turn; failed searches count toward it but are not billed. A turn can span several requests (pause_turn) and earlier searches count.",
        "Reading the answer: join every text block (text arrives in several blocks between searches). Each search adds a web_search_tool_result block with results (url, title, page_age, encrypted_content). Citations are always on; pass blocks back unchanged in multi-turn (encrypted_content / encrypted_index).",
        "pause_turn: append the paused response as the assistant message, resend with the same tools (and container ID if any), cap continuations, keep every paused response in order.",
        "Cost and parity: $10 per 1,000 searches plus tokens; results count as input tokens in later turns. Not every platform offers every version: Google-managed Vertex and Azure-hosted Foundry deployments have the basic version only."
      ]},
      { title: "Claude Code in CI/CD — non-interactive, sandboxed, gated", points: [
        "Run claude -p (or claude-code-action) for judgment steps: triage a failed build, summarize a flaky test, draft the changelog. Start read-only, then add write steps behind existing gates.",
        "Anything the agent writes arrives as a PR through branch protection: no route to push to main. Prerequisites: AI in the PR review loop and hooks as approval gates.",
        "Sandbox: containers, network policy, short-lived scoped tokens, no standing production credentials. Model traffic can stay on the organization's cloud agreement (Bedrock, Foundry, Vertex AI).",
        "Expose deployment as MCP tools (release, status, rollback). Allow rules name the server and the tool, not the arguments: one MCP server per environment is what lets an allowlist tell staging from production. Each job holds only its environment's token.",
        "--allowedTools pre-approves an explicit list; --permission-mode dontAsk denies anything that would otherwise prompt, so the job never hangs waiting for an answer.",
        "Autonomy tiers: dev → the hook allows release; staging → the hook asks, or allows from the pipeline on main; production → release is off the allowlist, so only the PreToolUse hook's allow (release manager, change ticket) lets it through: production fails closed if the hook does not run.",
        "rollback stays on the allowlist everywhere: a runbook approved in advance, one command, rehearsed regularly in staging (it is what the closing-the-loop play calls when a control band is breached).",
        "Managed settings: with allowManagedHooksOnly the gate hook must live in managed settings; with allowManagedMcpServersOnly the deploy servers must be on the managed allowlist.",
        "Each non-interactive run acts under the agent's own identity, so the pipeline log separates the agent's actions from the engineer who triggered it.",
        "Measure: leading = share of pipeline failures triaged without paging a human; lagging = DORA metrics already emitted by CI and deployment tooling."
      ]}
    ],
    pitfalls: [
      "Writing a handler or sending a tool_result for web search: it is a server tool.",
      "Assuming web_search_tool_result.content is always a list: on error it is a single error object (HTTP 200).",
      "Combining allowed_domains and blocked_domains in one request, or writing https:// or *.example.com.",
      "Keeping dynamic filtering on for a ZDR or HIPAA workload.",
      "Restarting the request on pause_turn instead of sending the paused content back with the same tools.",
      "Telling environments apart with tool arguments: allow rules cannot see arguments, servers can be told apart.",
      "Putting the production release tool on the allowlist and relying on the hook to deny: the gate must fail closed.",
      "Giving a CI agent job a long-lived production credential or a route to push to main."
    ]
  },
  3: {
    tagline: "See what an LLM system is doing, what it costs, and when its quality drifts.",
    examTasks: [
      "Telemetry and instrumentation — distributed traces for agent loops and tool calls, token and cost metrics, cache diagnostics, grounding and reasoning traceability, structured logs, content capture under privacy constraints such as ZDR",
      "Production monitoring and alerting — SLIs and SLOs, alerting and dashboards with token and cost telemetry, quality drift, behavioral regressions, anomalous usage, drift after model updates",
      "Trace analysis at scale — sampling, aggregation and failure-cohort analysis to surface systemic issues invisible in single traces"
    ]
  },
  4: {
    tagline: "Locate the failing layer — model, harness, tools or data — and turn every incident into a test.",
    examTasks: [
      "Complex failure diagnosis — multi-turn, multi-agent and non-deterministic failures; isolate model output vs harness vs tools vs data, including refusals and retrieval-grounding failures",
      "Incident response and learning loops — triage, mitigation, rollback, communication; convert incidents into regression evaluations, monitoring coverage and postmortem findings"
    ]
  },
  5: {
    tagline: "Gate releases with evaluations you can trust, offline and on live traffic.",
    examTasks: [
      "Evaluation system design — golden sets, regression suites, behavioral checks, CI/CD gates, retrieval precision and groundedness metrics, release criteria; keep suites valid against contamination, saturation and coverage gaps",
      "LLM-as-judge engineering — calibration against human labels, rubric design, bias and position effects, inter-rater reliability, judge drift across model versions",
      "Online quality measurement — live-traffic sampling, A/B tests, feedback loops, metrics matched to task type (extraction, generation, agentic, retrieval-grounded)"
    ]
  },
  6: {
    tagline: "Hit latency targets and budgets across a fleet, not one request at a time.",
    examTasks: [
      "Cost architecture at scale — cost modeling and forecasting, model routing and cascades, caching strategy and diagnostics, batch vs realtime economics, per-tenant budget enforcement",
      "Latency engineering — time-to-first-token vs total latency, streaming, parallel tool execution, cache checkpointing, effort-level tuning"
    ]
  },
  7: {
    tagline: "Enforce safety outside the model: layered guardrails, least privilege, auditable identity.",
    examTasks: [
      "Runtime guardrail systems — input/output filtering, PII redaction, hook-based policy, destructive-action prevention, sandboxing, approval gates, refusal handling, deterministic enforcement for irreversible actions, false-positive/negative tuning",
      "Threat defense and adversarial testing — prompt injection, tool and memory poisoning, exfiltration paths, the private data + untrusted input + external communication combination; defense-in-depth, red teaming, secure MCP config (OWASP LLM Top 10, NIST AI RMF and GenAI Profile)",
      "Identity, secrets and audit — agent identity, workload identity federation instead of static keys, secrets management, least-privilege tools, audit logging of security-relevant actions"
    ]
  },
  8: {
    tagline: "Direct fleets of coding agents whose output outpaces human review.",
    examTasks: [
      "Parallel agent orchestration — fan-out on isolated worktrees, task decomposition, merge and conflict strategy, fleet-level failure diagnosis from telemetry",
      "Verification and AI code review — AI review introduced in shadow mode, calibrated against human review before it gates merges, human oversight design",
      "Unattended and event-driven operations — agents running toward goals, on schedules or as event responders (CI/CD incident first response), with checkpointing, notification and escalation",
      "Organization-wide configuration — managed settings and policies, MCP allowlists, telemetry, gateway routing, quality and safety bar for sharing prompts, Skills and MCP servers"
    ]
  }
};

window.CHEATSHEET = window.CHEATSHEET || {};
window.CHEATSHEET["ccdv-p"] = [
  { title: "Exam logistics", rows: [
    ["Items / time", "70 items (60 scored + 10 unidentified unscored) · 120 minutes · scenario-based multiple-choice & multiple-response (each item states how many to select)"],
    ["Scoring", "Scaled 100–1000 · pass ≥ 720 · criterion-referenced · report = pass/fail + scaled score + % correct per domain (informational)"],
    ["Fee / prerequisites", "$175 · no prerequisite (Developer – Foundations recommended, its scope is assumed knowledge)"],
    ["Delivery", "Proctored via Pearson: OnVUE online or test center · government photo ID matching the registration name exactly"],
    ["Reschedule / cancel", "OnVUE up to 1 h before · test center up to 48 h before · later = fee forfeited"],
    ["Retakes", "Wait 14 d after 1st fail, 30 d after 2nd, 90 d after 3rd · max 4 attempts per rolling 12 months · fee per attempt"],
    ["Validity", "12 months · free non-proctored renewal on the Partner Academy if on time · lapsed = full exam at full fee"],
    ["Appeals", "Within 14 days (via Pearson) · standard-setting and item content are not appealable"]
  ]},
  { title: "Web search tool — the values to know", rows: [
    ["Versions", "20250305 basic · 20260209 + dynamic filtering · 20260318 + response_inclusion"],
    ["Domain filters", "allowed_domains XOR blocked_domains · no scheme · subdomains included · path OK for search, not fetch · wildcard only in path"],
    ["ZDR / HIPAA", "Dynamic filtering not eligible → basic version or allowed_callers: [\"direct\"]"],
    ["Errors", "HTTP 200 · content is one error object, not a list · empty list = no match"],
    ["Billing", "$10 / 1,000 searches + tokens · failed searches not billed but count toward max_uses"],
    ["pause_turn", "Send the paused content back as assistant message, same tools, same container · cap continuations"]
  ]},
  { title: "CI/CD agent gates by environment", rows: [
    ["Dev", "release, status, rollback allowlisted · hook allows release"],
    ["Staging", "release, status, rollback allowlisted · hook asks, or allows from pipeline on main"],
    ["Production", "status, rollback allowlisted · release only via PreToolUse hook allow (release manager + change ticket) · fails closed"],
    ["Headless flags", "claude -p · --allowedTools \"mcp__server__tool,…\" · --permission-mode dontAsk"],
    ["Managed settings", "allowManagedHooksOnly → hook in managed settings · allowManagedMcpServersOnly → servers on managed allowlist"]
  ]}
];
