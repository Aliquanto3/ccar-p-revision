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
    ],
    sections: [
      { title: "Subagents — when the intermediate work does not matter", points: [
        "A subagent runs in its own context window: its custom system prompt plus a task description written by the parent. Only a summary returns; the full run is saved in a separate transcript. Trade-off: the main thread does not see how the conclusion was reached.",
        "Built-ins: general-purpose (explore + act), Explore (fast codebase search), Plan (research during plan mode). Custom subagents add their own system prompt and tool list.",
        "Name and description of every subagent sit in the main agent's system prompt: they decide when it is launched AND guide the input prompt the main agent writes (“tell the agent precisely which files to review”, “return sources that can be cited”).",
        "Most important improvement: an output format in the system prompt. It creates a stopping point and a usable report; without it, subagents run too long.",
        "Add an “Obstacles Encountered” section (setup quirks, workarounds, special flags, problem imports) so the main thread does not rediscover them.",
        "Least privilege: research = Glob, Grep, Read · reviewer = + Bash for git diff, no Edit/Write · styling/modification = Edit and Write.",
        "Use for: research and exploration, code review (fresh context, team standard in the prompt), tasks needing a custom system prompt (copywriting, styling that reads the design system first).",
        "Avoid: “expert” personas (no new capability), sequential pipelines where each step depends on the previous one (lost in handoff), test runners (hide the failure output). Decision rule: does the intermediate work matter? Yes → main thread."
      ]},
      { title: "Tool use and Claude Managed Agents", points: [
        "A tool = name + description + input_schema in the tools array. Claude requests, your code executes, the result returns as a tool_result tied to tool_use_id. Vague descriptions are the first cause of misfires.",
        "Several tool_use blocks in one turn → all their tool_result blocks go back together in the next user message. Dispatch on the tool name; a new tool = array entry + switch case.",
        "Tool runner (beta, all SDKs): define each tool once (TypeScript: betaZodTool, Zod ≥ 3.25.0), the runner handles the loop and validates inputs; await it for the final message.",
        "Managed agents: the agent loop hosted on Anthropic's infrastructure, in an isolated container (files, bash, web search). Primitives in order: Agent (model, system prompt, tools — reusable) → Environment (cloud or self-hosted, networking) → Session (one run, the unit of work, own sandbox) → Events (in and out).",
        "agent_toolset_20260401 = bundled file, bash and web tools. Networking limited → sandbox and web tools reach only allowed_hosts; unrestricted only for hosts you cannot list in advance.",
        "Open the event stream BEFORE sending the user.message kickoff: the stream only delivers later events. Reconnect: new stream + list past events + skip live events already listed (history is server-side).",
        "Key events: agent.message, agent.tool_use, session.status_idle. On idle, check stop_reason.type: end_turn (finished or interrupted) vs requires_action (a tool call, e.g. a custom tool, awaits your answer).",
        "Building blocks: custom tools on your back end, MCP (Slack, Asana), memory store read before / written after a run, outcomes (rubric + separate grader in its own context, Claude iterates), multi-agent coordination (coordinator + specialists in own contexts on a shared file system), permission policies for sensitive actions.",
        "Choose managed agents when the loop runs long, touches many files, keeps state or must survive a connection drop; keep your own loop when you want full control."
      ]},
      { title: "Context management", points: [
        "Context = system prompt, message history, tool definitions and results, files and skills, thinking blocks. Re-sent and paid on every turn; a full window makes the request fail.",
        "Four patterns: just-in-time (design pattern: load now, pull the rest with tools) · server-side compaction (context_management edit compact_20260112, beta compact-2026-01-12, triggers past a threshold, lossy) · prompt caching (stable prefix reused at a fraction of the cost) · memory tool (memory directory via tool calls, storage backend you implement; an instruction to check it is auto-injected).",
        "Compaction continues one conversation; memory carries durable facts across sessions (keep preferences, projects; look up volatile details fresh).",
        "Managed agents ship with caching and compaction on by default.",
        "Skills and subagents: a subagent does not see skills invoked in the main thread (a fork starts from a copy of the conversation). Built-ins (Explore, Plan) do not preload skills; custom subagents preload the skills in their skills field, in full, at startup — keep Skill in a restricted tools list to invoke unlisted ones."
      ]}
    ],
    pitfalls: [
      "Making a subagent ask the main agent for missing details: the description must shape the delegation prompt instead.",
      "Capping turns instead of defining an output format.",
      "Chaining reproduce → debug → fix subagents for one bug.",
      "Sending the managed-agent kickoff before opening the event stream.",
      "Treating every session.status_idle as done without reading stop_reason.type.",
      "Sending one user message per tool_result when Claude called several tools in one turn.",
      "Expecting the memory tool to host storage, or caching to carry state across sessions.",
      "Assuming a subagent inherits skills the main thread invoked."
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
    ],
    sections: [
      { title: "Visibility — three records, set up before access", points: [
        "Compliance API = content record (chat data, file content, activity feed events) + audit log events. Covers Claude chat, Cowork and Claude Code sessions. Enabled by the Primary Owner; integrates with CASB, DLP, eDiscovery, SIEM.",
        "Audit logs = metadata only (who did what when, no prompts or completions). Full data export = separate Primary Owner capability, wholesale pull.",
        "Activity feed events and local session transcripts are captured only while the Compliance API is on: turning it on late leaves gaps that cannot be filled. Route it to a review a named owner already runs — an unread record is not a control.",
        "Key scope is chosen per key at creation: Primary Owner keys can cover the whole parent or one child organization; Owner keys cover their own organization.",
        "OpenTelemetry = how surfaces run (usage, performance), optional and complementary. Claude Code: operational by default, prompt logging is an opt-in. Cowork (current Desktop): metadata only unless the otlpContentCapture device policy adds content; metadata always includes member emails and folder paths → filter in the collector.",
        "Retention: default = kept indefinitely; custom window ≥ 30 days, no zero option; organization-wide (a chat in a project follows the project's window). Shortening later deletes history for good.",
        "Exceptions: activity feed 6 years regardless · remote (cloud) session transcripts have no default period: kept until the member deletes them, except cloud sessions Claude started from a chat, deleted with that chat (the course says “6 years”; the compliance docs say no default period) · local Cowork / Claude Code transcripts = finite custom window (chats or all data), else 6 years from capture; with HIPAA readiness 30 days from capture, or the custom window if shorter.",
        "Inference hooks: every prompt from chat, Cowork and Claude Code goes to the security team’s server for allow-or-deny before Claude answers — block at the door instead of governing after the fact."
      ]},
      { title: "Closing the loop — control bands", points: [
        "Detection is deterministic, version-controlled and unit-tested: mean and σ over a rolling window (30 days of hourly readings), no model involved. Tiers live in version-controlled config (bands.yaml).",
        "Noise alone (bell curve, 720 readings/month): above 1σ ≈ 1 in 6 (≈ 4/day), above 2σ ≈ 1 in 44 (≈ 16/month), above 3σ ≈ 1 in 740 (≈ 1/month).",
        "Tiers: 1σ → log only · 2σ (or a drift rule) → Claude read-only diagnosis (Read, Grep, Bash(gh run view *)) · 3σ → propose: PR into the review gate or a pre-approved runbook (e.g. rollback-deploy).",
        "Western Electric drift rules: 4 of the last 5 readings above 1σ, or 8 in a row above the mean.",
        "Floor σ (MIN_SIGMA in the metric’s units) so a flat baseline does not turn every blip into a breach; the newest reading is excluded from the baseline.",
        "Claude runs stateless and non-interactive (CI step or Agent SDK service in a sandbox) and writes its diagnosis as intent.md (problem, evidence, proposed outcome, affected systems, constraints, action taken, open questions). People triage: fix, schedule or dismiss — dismissals tune the bands.",
        "When the fix ships, add an eval for the incident (start commit, original request, checks) so the class cannot come back unnoticed.",
        "Measure: leading = breach → intent.md in the triage queue; lagging = share of findings merged as fixes, repeat incidents of the same class.",
        "Claude Tag (public beta, Slack): Claude in the channel under its own identity, verifies recovery through MCP, writes post-mortems to a version-controlled lessons file; small bounded fixes → PR, larger work → intent.md."
      ]}
    ],
    pitfalls: [
      "Answering a content request with audit logs (metadata only).",
      "Enabling the Compliance API after rollout, or enabling it with no named reviewer.",
      "Assuming otlpContentCapture off also removes emails and folder paths.",
      "Expecting a per-group retention window or a zero-retention option.",
      "Letting a model decide whether a reading is anomalous, or letting Claude act at 2σ.",
      "Forgetting the σ floor on a flat baseline."
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
    ],
    sections: [
      { title: "Managing Claude Enterprise spend", points: [
        "Billing: per-member platform fee + pooled token consumption (sales-assisted: monthly in arrears; self-serve: prepaid credits, usage pauses when they run out). The pool is organization-wide; agentic surfaces consume more per task.",
        "Biggest levers before any cap: the default model and default effort (most members never touch the picker), per-role defaults, effort caps for routine work.",
        "Organization instructions = soft steering at the point of use (short answers, only the needed files, highest effort only when needed). Skills load on demand (cheaper than re-sharing prompts); project context is present in each project conversation.",
        "Agentic habits: scheduled tasks keep consuming whether or not anyone reads them → review and delete. “Run Cowork in the cloud” is off by default, but unified-experience members run agentic work on Anthropic’s infrastructure anyway.",
        "Before raising a cap: is usage the symptom (change settings) or was the cap set too low (re-base it)? Review caps on a cadence in both directions — monthly by default, tighter early in a rollout.",
        "Reading spend: dashboard (trends, Groups view) · Analytics chat (ad-hoc questions) · Analytics API (programmatic, by group, for chargeback; Primary Owner key) · Spend Limits API sets per-member caps · spend CSV is per member."
      ]}
    ],
    pitfalls: [
      "Raising a cap when the default model is the cause.",
      "Using the Spend Limits API or the per-member CSV for group chargeback.",
      "Relying on organization instructions as a hard limit."
    ]
  },
  7: {
    tagline: "Enforce safety outside the model: layered guardrails, least privilege, auditable identity.",
    examTasks: [
      "Runtime guardrail systems — input/output filtering, PII redaction, hook-based policy, destructive-action prevention, sandboxing, approval gates, refusal handling, deterministic enforcement for irreversible actions, false-positive/negative tuning",
      "Threat defense and adversarial testing — prompt injection, tool and memory poisoning, exfiltration paths, the private data + untrusted input + external communication combination; defense-in-depth, red teaming, secure MCP config (OWASP LLM Top 10, NIST AI RMF and GenAI Profile)",
      "Identity, secrets and audit — agent identity, workload identity federation instead of static keys, secrets management, least-privilege tools, audit logging of security-relevant actions"
    ],
    sections: [
      { title: "Skills are advisory, hooks are deterministic", points: [
        "A skill makes a policy likely to be applied while code is written; nothing forces compliance. A rule that must always hold needs a hook at the edit plus the same check required on the pull request.",
        "Build-phase hooks: block edits to protected paths, run formatter/linter after edits, keep credentials out of the diff, back skill rules. Keep them fast and scoped to the changed file; heavy checks go to commit/PR.",
        "PostToolUse cannot undo the edit: exit code 2 shows stderr to Claude, which can fix the line. An empty args list runs the script directly instead of through a shell.",
        "An Edit|Write hook does not fire when a shell command rewrites the file: the required PR check covers that route.",
        "Human approval hooks belong at deployment gates, not in build hooks: they would put a person on the critical path of every parallel session."
      ]},
      { title: "Plugins — trust before install", points: [
        "A plugin runs code with your privileges; its hooks fire on every matching call. Read its hooks, agents and MCP servers before enabling it. Listed on a marketplace ≠ trusted (community = submitted by the author; official = curated separately).",
        "Components run alongside yours: hooks stack (both PreToolUse hooks fire); skills, agents and commands are namespaced /plugin-name:skill.",
        "A plugin's settings.json is honored for two keys only (agent, subagent status line). The agent key promotes one of its subagents — prompt, tools, model — to the main thread."
      ]}
    ],
    pitfalls: [
      "Treating a well-triggered skill as enforcement.",
      "Expecting exit code 2 of a PostToolUse hook to roll back the edit.",
      "Relying on an Edit|Write hook alone while Bash can rewrite files.",
      "Assuming a plugin's hooks replace yours, or that a marketplace listing means vetted."
    ]
  },
  8: {
    tagline: "Direct fleets of coding agents whose output outpaces human review.",
    examTasks: [
      "Parallel agent orchestration — fan-out on isolated worktrees, task decomposition, merge and conflict strategy, fleet-level failure diagnosis from telemetry",
      "Verification and AI code review — AI review introduced in shadow mode, calibrated against human review before it gates merges, human oversight design",
      "Unattended and event-driven operations — agents running toward goals, on schedules or as event responders (CI/CD incident first response), with checkpointing, notification and escalation",
      "Organization-wide configuration — managed settings and policies, MCP allowlists, telemetry, gateway routing, quality and safety bar for sharing prompts, Skills and MCP servers"
    ],
    sections: [
      { title: "Distributing skills and plugins", points: [
        "Repository: .claude/skills/<name>/SKILL.md, shared through Git, updates on next pull — team standards, project workflows.",
        "Plugin: skills/, agents/, hooks/hooks.json and .mcp.json at the root, optional .claude-plugin/plugin.json (only name is required; it namespaces skills; version it). Distributed through marketplaces (/plugin marketplace add org/repo).",
        "Managed settings: skills in .claude/skills of the managed settings directory (e.g. /etc/claude-code/.claude/skills/) take the highest priority and override personal and project skills of the same name — for what “must” apply.",
        "strictKnownMarketplaces (managed settings) limits the marketplaces people can add: entries such as {source: github, repo} or {source: url, url}.",
        "Skill as institutional knowledge: one policy, named owner, written source of truth; change the skill by PR with the owner's sign-off; engineers get it in their next session. Test that it triggers on differently phrased requests.",
        "Measure: leading = time from policy approval to skill merge; lagging = PR review findings citing the policy, trending to zero."
      ]}
    ],
    pitfalls: [
      "Distributing a mandatory standard as a plugin people may or may not install.",
      "Expecting a same-name project skill to beat the managed one.",
      "Running the full test suite or approval prompts in build-phase hooks."
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
