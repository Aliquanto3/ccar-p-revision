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
      ]},
      { title: "Foundations refresher — Agent SDK and adaptive thinking", points: [
        "Agent SDK = Claude Code's loop, tools, permissions, sessions and hooks as a library in your process; Client SDK = you run the tool loop; Managed Agents = Anthropic hosts it.",
        "settingSources omitted = user + project + local (CLAUDE.md, settings, skills, hooks). [] = only what you pass in code. Managed settings, ~/.claude.json and auto memory load anyway → multi-tenant: own filesystem per tenant, settingSources [] and CLAUDE_CODE_DISABLE_AUTO_MEMORY=1.",
        "Permission order: hooks → deny rules → ask rules → permission mode → allow rules → canUseTool. A call approved earlier never reaches canUseTool (bare names in allowedTools, acceptEdits, bypass).",
        "allowedTools does not constrain bypassPermissions: unlisted tools fall through to the mode. Locked-down headless agent = allowedTools + dontAsk; hide a tool with disallowedTools.",
        "Adaptive thinking: thinking {type: adaptive} + output_config.effort. Pass thinking blocks back unmodified in tool loops. Thinking billed as output (usage.output_tokens; output_tokens_details.thinking_tokens). Keep thinking config and effort stable to keep the cache."
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
      ]},
      { title: "MCP connector in the Messages API", points: [
        "Tools for your own systems (you maintain them), skills for your processes, MCP for third-party services (the provider maintains the server).",
        "mcp_servers declares the connection (type url, url, name, optional authorization_token); a tools entry of type mcp_toolset with mcp_server_name grants access. Claude introspects the server: no schemas to write. Beta header mcp-client-2025-11-20.",
        "Restrict to a subset: default_config {enabled: false}, then enable named tools in configs (e.g. read-only search) — also keeps unused definitions out of context."
      ]},
      { title: "Foundations refresher — structured outputs, long requests, batches", points: [
        "JSON outputs = output_config.format {type: json_schema}; strict tool use = strict: true on a tool. Both can be combined, and work with batches and streaming.",
        "Output can still miss the schema: stop_reason refusal (200, billed) or max_tokens (truncated). Enum/const casing may differ → compare case-insensitively.",
        "Schema limits: additionalProperties must be false; minLength/maxLength/minimum not enforced by the API (SDK helpers validate); no arbitrary-key maps → array of {key, value}; required fields come out first.",
        "Complexity caps across all strict schemas: 20 strict tools, 24 optional parameters, 16 union-typed parameters → 400 “too complex”. Mark only critical tools strict.",
        "New schema structure = compilation latency; grammar cached 24 h after last use. Incompatible with citations (400) and with prefill. No PHI in property names, enum/const values or patterns.",
        "Over ~10 minutes: stream (get_final_message) or use batches. An error after a 200 on a stream arrives as an error event.",
        "Batches: results in any order → match by custom_id (1–64 chars, unique)."
      ]},
      { title: "Foundations refresher — building MCP servers", points: [
        "Primitives by control: tools = model-controlled · resources = application-controlled context · prompts = user-controlled templates (slash commands, menus).",
        "Errors: bad input or business failure → tool result with isError: true and actionable text (Claude self-corrects). JSON-RPC protocol errors = unknown tool, malformed request, server fault.",
        "outputSchema → structuredContent must conform; also return the serialized JSON in a text block for older clients.",
        "Annotations (readOnlyHint, destructiveHint…) are untrusted unless the server is trusted: never auto-approve on them for third-party servers.",
        "Tools that change at runtime: declare tools.listChanged, send notifications/tools/list_changed; the client re-lists. Servers must validate inputs, control access, rate limit, sanitize outputs."
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
    ],
    sections: [
      { title: "Tool misuse — fix the definition first", points: [
        "Claude never sees the function, only the definition you send and the results you return: when it misuses a tool, look at the definition first.",
        "Four parts: name · description (does the most work) · input_schema (each parameter with type and its own description, required list) · input_examples (optional; each must be valid against the schema or the API returns 400).",
        "Description: at least 3–4 sentences covering what the tool does, when to use it and when not (naming the alternative tools), what each parameter means, what it does not return.",
        "Overlapping thin tools confuse selection: combine them into one tool with a parameter (e.g. fields), keep tools that do different jobs. Meridian: 6 thin tools 14/30 → 3 consolidated 26/30, same model.",
        "Wrong tool or too many calls → change the description (and merge overlaps). Wrong type or format → change the parameter description and add input_examples. Change only the part at fault, then rerun the eval.",
        "Measure with an eval: fixed labeled questions, run on the same model before and after, scored on tool calls."
      ]},
      { title: "Incident response with an agent in the loop (module 6)", points: [
        "Standing responsibility: give the job and the runbook once, as a channel-level instruction (not in a thread). Route alerts to the agent through the integration's message template; with proactive replies on it reads every post, so say which post types to investigate and which to ignore.",
        "Triage reply: does each alert need action, who owns it, what broke (evidence: logs, dashboards), why (the change that preceded it), proposed fix matched to the runbook. Before approving, check that the suspected change came before the symptom.",
        "Human gates: the agent runs a rollback only after the on-call engineer approves in the thread; without a deploy connection it writes the step out. Customer replies are drafts an agent sends; mention a person only when the instructions say so (e.g. P1 only, or only when a decision is needed). Connection permissions decide what the agent may change.",
        "Pattern over tickets: several customers, same symptom, short window, same shard → one suspected incident (P1): link the tickets, mention the lead, leave declaration and customer communication to them.",
        "Learning loop: the fix ships with a regression check (e.g. load test on connection wait in CI) so the same change fails next time; a routine compares dashboards with their last state and posts only on change, to catch slow problems that never page.",
        "Postmortem prompt: reconstruct the timestamped sequence from the record (not memory), separate root cause from contributing factors, blameless (system behavior), owners on every action item, your template as context, flag uncertainty. Customer-facing version: name the audience, quantify how many and how long, direct quotes, bounded time window."
      ]},
      { title: "Foundations refresher — stop reasons and HTTP errors", points: [
        "Stop reasons arrive in a 200 response; errors are 4xx/5xx. Handle them separately.",
        "max_tokens ending in an incomplete tool_use → retry with a higher max_tokens (continuing is for truncated text).",
        "Empty end_turn after tools → text sent after tool_result blocks; send tool_result blocks alone. Last resort: a new user message “Please continue”.",
        "refusal → read stop_details, retry on a fallback model; for reasoning_extraction change the prompt (e.g. ask for a short explanation, not step-by-step reasoning in a field).",
        "Retry with backoff: 429 (with retry-after), 500, 529 — the SDKs retry twice by default (max_retries). A spend-cap 429 has no retry-after and keeps failing until access resumes.",
        "Do not retry unchanged: 400, 401, 403, 404, 413 (size limit: 128 MB Messages, 256 MB Batch). Keep the request-id for support."
      ]}
    ],
    pitfalls: [
      "Fixing a format error in the tool description instead of the schema and examples.",
      "Lengthening descriptions of tools that overlap instead of merging them.",
      "Changing model and tool definitions in the same comparison."
    ]
  },
  5: {
    tagline: "Gate releases with evaluations you can trust, offline and on live traffic.",
    examTasks: [
      "Evaluation system design — golden sets, regression suites, behavioral checks, CI/CD gates, retrieval precision and groundedness metrics, release criteria; keep suites valid against contamination, saturation and coverage gaps",
      "LLM-as-judge engineering — calibration against human labels, rubric design, bias and position effects, inter-rater reliability, judge drift across model versions",
      "Online quality measurement — live-traffic sampling, A/B tests, feedback loops, metrics matched to task type (extraction, generation, agentic, retrieval-grounded)"
    ],
    sections: [
      { title: "Continuous evals in CI", points: [
        "Evals are the AI-native stage gate: the suite runs non-interactively in CI on a schedule and on any change to CLAUDE.md, skills or hooks (paths CLAUDE.md, .claude/**, evals/**), because that configuration steers the agent.",
        "Build the suite from 20–50 real tasks with accepted outcomes; each eval = prompt + checks (tests pass, lint clean, behavior unchanged, policy followed). Each production incident gets an eval, written by the team that owned it.",
        "Each eval starts from an older commit (from), in a scratch worktree, with evals/ removed from the checkout and the branch's CLAUDE.md and .claude/ copied in: old code, new configuration.",
        "Do not use --bare here: it speeds headless runs by skipping CLAUDE.md, skills and hooks, the very files under test.",
        "The checker runs from a copy made before any run, fails runs that changed files outside may_change (Git-ignored files excepted), and fails results that are empty or not is_error false.",
        "Prefer behavioral checks (call the code with synthetic data, inspect logs) over checks on how the code is written; a policy script on pii-tagged fields missed a free-text field.",
        "Gate configuration changes on the pass rate as a merge check (all-pass in the example; a 20–50 suite may set a lower threshold); log runs to compare over time. Live suite: replace cases that stop discriminating as models improve.",
        "Measure: leading = pass rate over time and incident → eval time; lagging = regressions caught in CI vs found in production."
      ]}
    ],
    pitfalls: [
      "Running the eval suite with --bare.",
      "Letting a run pass after editing the Makefile or the checks.",
      "Grading code that never changed because the run ended in an error.",
      "Keeping a suite that passes 100% forever as proof of quality."
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
      ]},
      { title: "Foundations refresher — caching, batches, effort, model choice", points: [
        "Cache prefix order tools → system → messages: any tool change (order included) invalidates all; tool_choice and images invalidate system + messages. Put per-request content (timestamps, the new message) after the last breakpoint.",
        "Both cache fields at 0 = not cached, often below the minimum length (512 tokens on current models). No error is returned.",
        "5-minute TTL refreshed on each read; 1 h TTL for gaps over 5 minutes. Pre-warm with max_tokens 0 on the shared prefix (not in batches, not streamed).",
        "Batch API: 50% off, stacks with caching; up to 100,000 requests or 256 MB; most done within 1 h, expire after 24 h; results kept 29 days. Not allowed: stream, speed (fast mode), fallbacks, max_tokens 0.",
        "Effort (output_config.effort): low · medium · high · xhigh · max. Defaults: high on most models, medium on Opus 5.5 and Haiku 5.5. Set it explicitly; vary it across workloads, not inside a cached conversation.",
        "Model choice: Opus 5.5 by default; Fable 5.2 where Opus at higher effort still falls short on your evals; Sonnet 5.5 for speed + intelligence; Haiku 5.5 for high-volume classification, extraction, routing."
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
      ]},
      { title: "Hooks — deterministic control", points: [
        "Events to know: PreToolUse (enforcement), PostToolUse (format, lint; too late to stop the call), Stop and SubagentStop (refuse to end the turn), PreCompact/PostCompact, InstructionsLoaded (audit what loaded), SessionStart (prime the environment; source startup or compact), UserPromptSubmit, Notification. /hooks shows a read-only list.",
        "Exit codes: 0 = success (JSON on stdout parsed; plain text added to context only on SessionStart, UserPromptSubmit, UserPromptExpansion) · 2 = blocking, stderr fed to Claude · anything else, 1 included = non-blocking, the call runs. Notification and SessionStart ignore blocking.",
        "PreToolUse JSON: permissionDecision allow | deny | ask (| defer, only for -p runs paused and resumed by a calling process), with permissionDecisionReason. updatedInput rewrites the call (e.g. redact a secret) but replaces the whole input: echo back unchanged fields.",
        "Re-inject context after compaction with SessionStart + compact matcher, not PostCompact.",
        "Approval gates: ask shows the reason to the person; deny shows it to Claude, so put the route to approval in it. Non-interactive runs deny any ask (allow the pipeline on main, where the merge is the approval). The gate must read records the agent cannot write.",
        "Team hooks in .claude/settings.json (in Git, ${CLAUDE_PROJECT_DIR} for scripts); non-negotiable hooks in managed settings (with allowManagedHooksOnly, project hooks are blocked).",
        "Measure gates: leading = waiting time per gate (hook decisions in the OTel export); lagging = gate violations reaching production."
      ]},
      { title: "Managed settings for a regulated enterprise", points: [
        "permissions.deny keeps secrets out (Read(.env*)) and tool egress closed (WebFetch, curl, wget); permissions.allow pre-approves the inner loop (git, make build/test/lint) against prompt fatigue.",
        "disableBypassPermissionsMode + allowManagedPermissionRulesOnly: no project file, flag or engineer can widen the rules.",
        "sandbox: OS-level network allowedDomains blocks egress by any program; failIfUnavailable (refuse to start without it) and allowUnsandboxedCommands false (no retry outside). credentials: deny files like ~/.ssh, ~/.aws/credentials and strip env vars like GITHUB_TOKEN from sandboxed commands — permissions.deny only covers Claude's file tools.",
        "allowManagedHooksOnly, allowManagedMcpServersOnly, disableSideloadFlags + strictKnownMarketplaces (plugins only from the approved marketplace), requiredMinimumVersion (assessed build floor)."
      ]},
      { title: "Connectors and multiplayer agents", points: [
        "Three gates, all open for access: organization (Owner/Primary Owner adds the connector), role (per group, custom role's Connectors tab), member (connects their own account). Existing custom roles were set to Always allow; new roles start at Needs approval.",
        "Per tool: Always allow / Needs approval / Blocked; blocking write and delete holds a connector read-only. Claude inherits the member's own permissions in the source system.",
        "Read first; write per group when the workflow needs it, signed off by the data-risk owner. Enterprise-managed authorization (EMA) provisions the member gate through the IdP for supporting providers.",
        "A multiplayer agent (e.g. Claude Tag) has its own identity and credentials, shared memory and shared context; the team decides what it can reach."
      ]}
    ],
    pitfalls: [
      "Treating a well-triggered skill as enforcement.",
      "Expecting exit code 2 of a PostToolUse hook to roll back the edit.",
      "Relying on an Edit|Write hook alone while Bash can rewrite files.",
      "Assuming a plugin's hooks replace yours, or that a marketplace listing means vetted.",
      "Exiting 1 to block: the call still runs.",
      "Returning partial updatedInput.",
      "Using PostCompact to re-inject context.",
      "Relying on permissions.deny to keep a sandboxed shell away from ~/.ssh or the network."
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
      ]},
      { title: "Permission modes and unattended runs", points: [
        "Manual (reads only without asking) · Accept edits (reads, edits, common file system commands) · Plan (research, no edits) · Auto (classifier reviews most actions for intent) · Don't ask (reads in working dirs + pre-approved tools; anything that would prompt is denied) · Bypass permissions (no checks; only in isolated containers or VMs). Shift-tab cycles manual, accept edits, plan, auto.",
        "Auto's classifier blocks production deploys and migrations, force pushes, piping downloads into a shell, sending sensitive data out, destroying pre-existing files; it checks intent, not correctness → pair it with a Stop hook running tests.",
        "dontAsk for CI, scheduled jobs and batches with a known tool list; auto rather than bypass for unattended work whose actions cannot be listed.",
        "Verify in proportion to how unsupervised the run was: start with the diff (/code-review, git diff, files outside the plan), not the summary; tests as a Stop hook gate, lint and type check as PostToolUse; headless runs by JSON result and exit code; a cold second opinion from a fresh session or subagent."
      ]},
      { title: "Running a fleet: parallel work, verification, review (module 7)", points: [
        "Parallel sessions = full Claude Code instances, each on its own worktree (claude --worktree name), sharing nothing but the engineer. Tasks that share files run in one session, one after another. Start with 2–3; the ceiling is how many streams one person can review. .worktreeinclude copies git-ignored files (.env, local config) into each worktree.",
        "Subagents = scoped helpers in .claude/agents/*.md (name, description, tools), checked into Git: simplifier, verifier (fresh context, reports only), researcher.",
        "Feedback loop: one-command targets (make test) that exit non-zero, healthy output listed in CLAUDE.md, quantifiable targets, visual check for UI. Bug fix: failing test first, committed, then a hook blocks test-file edits during the fix.",
        "AI review: REVIEW.md passes (bugs · security · compliance against spec.md/plan.md), what Important means, nit cap, paths to skip. Findings never approve or block on their own; code owner approval via branch protection. Shadow mode, calibrate against human review before gating on severity counts. A mistake flagged twice → CLAUDE.md.",
        "Managed Code Review: Owner enables it, GitHub app, runs on open / each push / @claude review; inline findings by severity, never pushes fixes (/code-review --fix locally). claude-code-action@v1 (/install-github-app): @claude fix loop, prompt for automated runs, cron, use_bedrock/vertex/foundry, claude_args (--max-turns, permission mode, allowed tools).",
        "Indicators: concurrent sessions per engineer with review quality held · first-pass CI success · time to first review · share of comments resolved without a human · defects caught before vs after merge."
      ]},
      { title: "Unattended runs and long sessions (module 7)", points: [
        "Cloud scheduled tasks: prompt + repo + connectors + trigger (cron, HTTP POST, GitHub event). Research preview, at most hourly, fresh clone of the default branch, push to claude/… (branch protection governs pushes).",
        "Headless (-p): your environment and pipeline; --output-format json + --json-schema → structured_output; --resume with session_id for multi-step. --bare: skips hooks, skills, plugins, MCP, CLAUDE.md; needs ANTHROPIC_API_KEY; same setup on every machine (not for testing the repo's own config).",
        "Agent SDK = the same engine inside your product (query, allowedTools, system prompt, permission mode).",
        "Long sessions: plan mode first and read the plan · /compact with instructions · rewind (Esc Esc): restore code/conversation, summarize from/up to here · /goal = completion condition checked by an evaluator that reads only the transcript · /loop = prompt on an interval (fixed loops stop after 7 days).",
        "Customization governance: Owner provisioning · skill sharing · share with groups · Publishing Off / Requires review / Open. Postures: open build reviewed spread · centralized · fully open; a custom role can turn sharing off for one group. Tightening Publishing does not remove published skills; turning Public projects off makes them private for good."
      ]},
      { title: "Foundations refresher — CLAUDE.md and settings scopes", points: [
        "CLAUDE.md: managed → user (~/.claude) → project (./CLAUDE.md or .claude/) → local (CLAUDE.local.md). Files walking up from cwd are concatenated, not overridden; subdirectory files load when Claude reads files there.",
        "@imports resolve from the importing file, four hops max, load at launch. .claude/rules/*.md with paths frontmatter load when matching files are read. Keep each file under ~200 lines; must-happen → hook.",
        "After /compact the root CLAUDE.md is re-read; nested ones come back when Claude reads in that directory again. claudeMdExcludes (glob on absolute paths) skips files; managed CLAUDE.md cannot be excluded.",
        "Settings precedence: managed > --settings > .claude/settings.local.json > .claude/settings.json > ~/.claude/settings.json. Lists such as permissions.allow merge across scopes.",
        "Committed permissions.allow waits for folder trust; deny/ask apply at once. defaultMode auto or bypassPermissions is ignored from project/local files. “Don't ask again” writes to the local file, where an allow does not beat a project ask.",
        "A -p run skips a broken settings file silently: check with claude doctor and /status."
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
  { title: "API mechanics — Foundations values", rows: [
    ["Cache prices", "5 min write 1.25× · 1 h write 2× · read 0.1× (0.05× Opus/Sonnet 5.5, 0.025× Fable 5.2) · max 4 breakpoints · 20-block lookback"],
    ["Batch API", "−50% · 100,000 requests / 256 MB · 24 h expiry · results 29 days · match by custom_id"],
    ["Effort defaults", "high on most models · medium on Opus 5.5 and Haiku 5.5"],
    ["Models (per MTok in/out)", "Fable 5.2 $8/$40 · Opus 5.5 $4/$20 · Sonnet 5.5 $2/$10 · Haiku 5.5 from $0.10/$0.50 · 1M context · 128K output"],
    ["Retryable", "429 with retry-after · 500 · 529 (SDK: 2 retries) — not a spend-cap 429, not 4xx request errors"],
    ["Long requests", "> 10 min → streaming or batches"]
  ]},
  { title: "CI/CD agent gates by environment", rows: [
    ["Dev", "release, status, rollback allowlisted · hook allows release"],
    ["Staging", "release, status, rollback allowlisted · hook asks, or allows from pipeline on main"],
    ["Production", "status, rollback allowlisted · release only via PreToolUse hook allow (release manager + change ticket) · fails closed"],
    ["Headless flags", "claude -p · --allowedTools \"mcp__server__tool,…\" · --permission-mode dontAsk"],
    ["Managed settings", "allowManagedHooksOnly → hook in managed settings · allowManagedMcpServersOnly → servers on managed allowlist"]
  ]}
];
