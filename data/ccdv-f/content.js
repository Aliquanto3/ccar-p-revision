// CCDV-F Revision — Domain notes & cheat sheet
// Objectives: public Exam Guide v1.1 (November 2026), skills paraphrased. Notes from the official
// Developer – Foundations course (modules 1–5), checked against platform.claude.com and code.claude.com.

window.NOTES = window.NOTES || {};
window.NOTES["ccdv-f"] = {
  1: {
    tagline: "Pick the simplest pattern that handles the variability, then wire the loop with exits and human checks.",
    examTasks: [
      "Agent architecture (4.5%) — workflow vs agent, manager/supervisor hierarchies, how subagents improve task execution",
      "Agent construction with Claude (5.3%) — Claude Agent SDK, custom loops and harnesses, self-hosted vs Anthropic-hosted, hooks for deterministic actions",
      "Agent patterns and frameworks (4.9%) — tool-use loops, subagents, memory, context-window management; frameworks such as Strands, LangGraph, PydanticAI"
    ],
    sections: [
      { title: "Workflow or agent", points: [
        "Workflow when you can write the steps in code, errors are costly, inputs are well-constrained, every run follows the same sequence. Agent when you know the goal and tools but not the path.",
        "Progression: single API call → workflow → agent. Move up only when the simpler pattern cannot handle the variability.",
        "Over-tooling degrades routing: start with the minimum tool set, add a tool when a gap is confirmed."
      ]},
      { title: "Wiring paths", points: [
        "Raw Messages API loop: you own everything (loop, tool execution, context, retries, exits). Agent SDK: Claude Code's loop as a library in your process. Managed Agents (beta): Anthropic runs loop + sandbox; agent = versioned API resource, events over SSE.",
        "Managed Agents sessions are stateful and stored server-side → not currently eligible for ZDR or a HIPAA BAA: PHI/ZDR work goes to the SDK or a raw loop on a covered configuration.",
        "Loop checklist: tools registered · system prompt scoped to the task and its tools · every tool_use answered · a human-in-the-loop point · an exit condition that does not rely on Claude stopping."
      ]},
      { title: "Human checks, memory, subagents", points: [
        "HITL placement by worst case: before destructive calls (write, delete, send) · after a planning step · on unexpected output (error flag, empty, out of bounds).",
        "Memory scope: in-context (short sessions) · external storage (state across sessions or users, inject the relevant subset) · summarized (long chats; only what the summarizer keeps) · stateless (self-contained jobs). Decide at design time.",
        "Subagents start clean: no conversation, no skills (list them in the subagent config), but they inherit the parent's permissions.",
        "Orchestrator-worker multiplies tokens (~15× in Anthropic's research system): only for work that splits into independent parts; coding-style coupled work → one agent. Capable lead, cheaper workers."
      ]}
    ],
    pitfalls: [
      "Choosing Managed Agents for PHI or ZDR workloads.",
      "An exit condition scoped to one file's validation with no checkpoint before the live write.",
      "Replaying all prior sessions in context.",
      "Assuming a subagent sees the skills the parent loaded."
    ]
  },
  2: {
    tagline: "A third of the exam: API mechanics, configuration, requirements and the lifecycle around a Claude application.",
    examTasks: [
      "Understanding requirements (3.4%) — functional and infrastructure requirements from business requirements and solution architecture",
      "Systems life cycle (2.8%) — developing, implementing, operating and maintaining IT systems",
      "Claude API mechanics (6.8%) — messages, tools, streaming, vision, extended thinking, caching, third-party access, data access, realtime vs batch",
      "Software engineering foundations (7.4%) — REST, JSON, async, version control, SDLC integration, code review, refactoring",
      "Claude application design (8.6%) — how Claude interprets instructions across Claude Code, Desktop, claude.ai, API, SDKs; content boundaries, schema design, session hygiene, plugin management",
      "Configuration management (4.1%) — CLAUDE.md, settings.json, model version pinning, prompt versioning, plugin dependencies"
    ],
    sections: [
      { title: "Message structure and tool turns", points: [
        "Blocks: text, tool_use (name, id, input), tool_result (tool_use_id, content, optional is_error), thinking (only with extended thinking).",
        "Each tool_use is answered in the immediately following user turn by a tool_result with the same id; tool_result blocks come first in that message. Keep Claude's text block next to its tool_use blocks.",
        "Thinking blocks (and redacted ones) go back unchanged: they carry a signature; editing or summarizing them breaks the request."
      ]},
      { title: "Streaming", points: [
        "Events: message_start → content_block_start → content_block_delta… → content_block_stop → message_delta (stop_reason, usage) → message_stop.",
        "Tool inputs arrive as partial JSON: parse only after content_block_stop. Append a turn to history only after message_stop; on interruption discard the partial turn and retry.",
        "Long or user-facing responses → stream; short backend jobs → non-streamed is simpler. Over ~10 minutes → streaming or batches."
      ]},
      { title: "Volume, files, vision", points: [
        "Message Batches API: up to 100,000 requests or 256 MB, async (up to 24 h, often faster), lower price, results in any order → custom_id. A chunked synchronous loop is not batching.",
        "Images and PDFs consume context before any text: measure the largest production input; resize when needed. Inline base64 for one-offs, URL reference, Files API (file_id) for assets reused across requests. PDFs use a document block (optional title, context).",
        "Visual prompts name how to handle ambiguity (overlap, occlusion, depth)."
      ]},
      { title: "Configuration, plugins, versioning", points: [
        "CLAUDE.md: always loaded, dilutes with size; keep behavior-changing rules, move history to reference docs, path rules to .claude/rules with paths frontmatter (no paths = loads at launch), must-hold rules to hooks.",
        "Plugins bundle skills, hooks, subagents, MCP servers; commands are namespaced (/plugin:command). Paths via ${CLAUDE_PLUGIN_ROOT} or $CLAUDE_PROJECT_DIR, document and check env vars, test on a clean machine. A deny rule the author relied on ships only if bundled.",
        "Pin full model IDs (alias = moving target; 4.6+ IDs pin a snapshot, older ones need the date suffix), version prompts with the code, keep the prior version, promote through the eval against a pinned baseline."
      ]},
      { title: "Requirements, lifecycle, platforms, reuse", points: [
        "Functional requirement = checkable behavior. Infrastructure = latency (from the user's region), scale, residency, identity. Write them down so the platform choice can be defended.",
        "Lifecycle: requirements → design → build → test → deploy → operate → iterate, with gates (no build before residency is satisfied, no full rollout before the eval clears).",
        "Platforms: first-party API (new features first) · Claude Platform on AWS · Claude in Amazon Bedrock (Messages API) · Vertex AI · Foundry (Azure-hosted or Anthropic-hosted per model). Customer's certified cloud usually decides; compliance is pass-or-fail; compare total cost (egress, fees, integration).",
        "Accelerators: parameterize customer values with defaults, document assumptions, bundle eval and audit log. Contributions: rights and attribution first, then focused code, runnable example, test, assumptions; Cookbook for focused patterns."
      ]}
    ],
    pitfalls: [
      "Parsing a tool input before content_block_stop, or committing a half-streamed turn.",
      "Looping over synchronous calls and calling it batching.",
      "Shipping on a moving alias with no prior version to roll back to.",
      "Choosing the platform the team knows instead of the one that passes residency."
    ]
  },
  3: {
    tagline: "Explore, plan, then code — with the right mode, memory files and settings scope.",
    examTasks: [
      "Claude Code operation (3.1%) — rules, skills, commands, agents, agent memory; session management, slash commands, headless and streaming modes, auto mode, CLAUDE.md hierarchy, repository initialization, settings.json"
    ],
    sections: [
      { title: "Modes and loop", points: [
        "Explore → plan → code. Plan mode holds Claude in read-only exploration until you approve.",
        "default (prompts for edits and commands) · acceptEdits (file edits and common filesystem commands, rm included, inside the working dir) · plan · auto (classifier) · dontAsk (deny what would prompt) · bypassPermissions (no prompts, no protected-path guard: isolated machines only).",
        "Settings scopes: user ~/.claude/settings.json · project .claude/settings.json (committed) · local .claude/settings.local.json (gitignored) · managed (cannot be overridden). Deny beats allow."
      ]},
      { title: "Context mechanisms", points: [
        "/init drafts a CLAUDE.md to refine. Rules files scope by paths glob. Hooks run at lifecycle events. Subagents isolate work: Explore and Plan skip CLAUDE.md and git status; general-purpose loads them.",
        "Pruning (rewind) · /compact (summarize, add instructions) · /clear (new session) · subagent handoff."
      ]}
    ],
    pitfalls: [
      "bypassPermissions on a live workstation without deny rules on sensitive paths.",
      "Expecting Explore to apply CLAUDE.md conventions."
    ]
  },
  4: {
    tagline: "Know which error you have, which layer produced it, and which grader can see it.",
    examTasks: [
      "Debugging and error handling (2.6%) — identify error types, choose recovery strategies, trace analysis for failure modes, isolate integration-layer vs model-output problems"
    ],
    sections: [
      { title: "Errors and recovery", points: [
        "Retriable: 429 (honor retry-after), 529 (overload), 500/502/503/504. Terminal: 400, 401, 403, 404. Unsure → terminal and raise.",
        "One retry layer only (the SDK already retries transient errors). Exponential backoff with jitter and a cap.",
        "A refusal is HTTP 200 with stop_reason refusal: fail fast, log, do not retry or store as output."
      ]},
      { title: "Tests, traces, evals", points: [
        "Unit (one function) · functional (one Claude call's shape) · integration (the seam between components, where silent failures hide) · end-to-end (whole flow, hard to localize). A trace shows which step failed.",
        "Graders: exact match (one correct form) · code check (structure: parse, range, required field) · LLM judge (open-ended quality; reasoning before score; calibrate against human labels).",
        "Change one thing at a time, read per-case results, prefer coverage (edge cases) over a perfect rubric."
      ]}
    ],
    pitfalls: [
      "Two retry loops around the same call.",
      "Treating every 200 as a valid answer.",
      "Trusting an uncalibrated judge."
    ]
  },
  5: {
    tagline: "Tokens, sampling, model tiers, thinking and caching: the levers behind quality, latency and cost.",
    examTasks: [
      "LLM fundamentals (5.2%) — tokens, context windows, sampling, non-determinism, fast mode, extended and adaptive thinking, effort, zero/single/multi-shot",
      "Technical fundamentals (6.1%) — integrating with SDKs that wrap REST APIs, websockets",
      "Model selection and tradeoffs (2.7%) — Opus, Sonnet, Haiku use cases, adaptive thinking support, quality/latency/cost, breaking behavior changes across releases",
      "Cost and token management (2.8%) — token budgeting, usage tracking, cost modeling, prompt caching and cache checkpoints"
    ],
    sections: [
      { title: "Fundamentals", points: [
        "Tokens are the unit of input, output, cost and the context window; chars-per-token varies by tokenizer.",
        "Context window: oversized input → validation error before generation; ceiling reached mid-generation → partial output, stop_reason model_context_window_exceeded. Trimming or summarizing is the app's job.",
        "Sampling makes output non-deterministic; temperature 0 is not a guarantee. Newest models reject non-default temperature/top_p/top_k (400): steer by prompt. Test properties, not exact text.",
        "Zero-shot for simple tasks; one or a few examples when structure, casing or edge cases keep being missed (each example costs tokens on every call)."
      ]},
      { title: "Models and reasoning", points: [
        "Course rule: start with Sonnet, move up when an eval shows it misses the bar, move down to Haiku when an eval shows the drop is acceptable. Model choice and reasoning mode are separate levers.",
        "Adaptive thinking: thinking {type: adaptive} + effort (output_config.effort); budget_tokens is deprecated and returns 400 on the newest generations. Thinking is omitted by default on the newest models (request summarized display). Thinking tokens bill as output.",
        "Python: AsyncAnthropic for non-blocking concurrency; TypeScript client is Promise-based. SDK = thin layer over REST with retries and parsing."
      ]},
      { title: "Cost", points: [
        "Instrument input/output tokens, latency and error rate per call. count_tokens checks a request before sending it.",
        "Caching: breakpoints (cache_control ephemeral, up to 4) or automatic; prefix order tools → system → messages; exact match; 5-minute TTL refreshed on read, 1 h option; minimum length per model; writes 1.25× (5 min) or 2× (1 h), reads ~0.1×.",
        "Routing: default model + override on a cheap signal. Set the reliability floor first, then cut cost above it. Total platform cost includes egress, fees and integration."
      ]}
    ],
    pitfalls: [
      "Keeping temperature or budget_tokens on the newest models.",
      "Exact-text assertions on generated output.",
      "Cutting retries below the reliability floor to save money."
    ]
  },
  6: {
    tagline: "Diagnose the failure type, add the one missing technique, and treat the context window as a budget.",
    examTasks: [
      "Context engineering (3.8%) — window management, preventing drift and bloat (tool-output pruning, compaction), isolation through subagents or multi-step workflows",
      "Prompt engineering (4.6%) — instruction clarity, few-shot, system vs user placement, output constraints, iterative refinement, input sanitization",
      "Output handling (2.6%) — structured output, response validation, defensive parsing, skepticism toward confident output"
    ],
    sections: [
      { title: "Prompt diagnosis", points: [
        "Wrong shape → output constraint. Drift across turns → (more specific) system prompt. Right task, invented structure → few-shot examples. Breaks on a variant → a constraint or example for that case.",
        "XML tags separate instructions, examples and data. Three failed re-prompts → stop adding words and diagnose; long prompts produce long outputs."
      ]},
      { title: "Structured outputs", points: [
        "JSON outputs (output_config.format, json_schema) constrain the final response; strict: true on a tool validates its arguments. Constrained decoding.",
        "Costs: first request on a new schema compiles a grammar (cached 24 h), extra input tokens for the injected format prompt, incompatible with prefill.",
        "Still check stop_reason: refusal and max_tokens can return output outside the schema."
      ]},
      { title: "Context budget", points: [
        "Tool outputs fill the window fastest; production results are often several times the fixtures. Tool choice degrading after N turns → check the window first.",
        "Prune used tool outputs, compact before the cap (write the summarizer to keep file paths, decisions, errors and fixes), hand off self-contained work to subagents.",
        "RAG breaks at chunking, embedding match (add lexical match for identifiers) or assembly into the prompt."
      ]}
    ],
    pitfalls: [
      "Rewording instead of adding the missing technique.",
      "Assuming JSON outputs always parse.",
      "A summarizer prompt that names nothing to keep."
    ]
  },
  7: {
    tagline: "Everything the agent reads that someone else wrote is data; the boundary lives in what it is allowed to do.",
    examTasks: [
      "AI application security (3.2%) — prompt injection and jailbreak defense, untrusted input, data leakage, PII, authentication, authorization, confidentiality, integrity",
      "Guardrails and safe deployment (2.3%) — content policy, layered guardrails, secure by design, IAM, least privilege",
      "Claude hooks (1.0%) — hooks to guard against destructive actions",
      "Identity, secrets and key management (1.6%) — secrets and API keys across environments, identity validation, access approval, monitoring authorized access"
    ],
    sections: [
      { title: "Layers", points: [
        "Prompt injection arrives through fetched pages, documents, records, emails, tool results — trusting your users does not help. Delimiters are a soft boundary.",
        "Reliable layers: least-privilege identity, locked auth configuration, PreToolUse hooks that block and log, OS-level sandboxing (filesystem + network) for what no rule names. Precedence deny > ask > allow.",
        "Every seam between components is a trust boundary: content leaving one component is untrusted at the next."
      ]},
      { title: "Secrets and identity", points: [
        "Config files hold variable references; values live in env vars (local, short-lived) or a secret store (shared, audited). A committed secret is in history: rotate it.",
        "OAuth for user-identity services (redirect URIs registered per host; often one app per environment); tokens or keys from env for service identity.",
        "Regulated reviews ask where data is processed, how access is logged (PostToolUse audit hook), and whether admins lock config (managed settings). ZDR eligibility varies by model and platform."
      ]}
    ],
    pitfalls: [
      "Relying on a system prompt line as a security control.",
      "A PostToolUse hook meant to block edits.",
      "Fixing a leaked key by committing over it."
    ]
  },
  8: {
    tagline: "Claude picks tools by their descriptions; MCP lets you reuse tools someone else maintains.",
    examTasks: [
      "Tool implementation (4.4%) — tool use and function calling, external system configuration, descriptions, error handling, dispatch, client vs server tools, approval patterns, tool-set construction",
      "MCP server development (2.1%) — authoring, deploying, integrating; resources, tools, prompts; transports such as stdio and sockets",
      "Agentic customization (4.1%) — choosing among built-in tools, custom tools, skills and MCPs"
    ],
    sections: [
      { title: "Tool schemas", points: [
        "Claude proposes calls; your code executes them and returns tool_result. Schema = specific name + description (what, when, when not, what it returns; 3–4 sentences) + input_schema.",
        "Required only when the call makes no sense without it (over-required fields get invented values). Overlapping tools → exclusion conditions; still overlapping → merge into one tool with a type parameter.",
        "Parallel calls are the default for independent work; dependent calls → separate turns, disable_parallel_tool_use if needed. Failed tools return is_error: true, never an empty result."
      ]},
      { title: "MCP", points: [
        "Tools (model-controlled) · resources (application-controlled data, direct or templated) · prompts (user-invoked templates). Build once, any MCP client connects.",
        "Transports: stdio (local subprocess) · Streamable HTTP (remote; SSE-only is deprecated). The API's MCP connector supports remote HTTP servers only (mcp_toolset: enabled, defer_loading).",
        "Scopes: local (~/.claude.json, this project) · user (all your projects) · project (.mcp.json committed) · enterprise (managed). Permission rules can target mcp__server__tool."
      ]},
      { title: "Choosing the customization", points: [
        "CLAUDE.md for always-on rules · skill for task-specific procedures loaded on description match (disable-model-invocation for explicit-only) · hook for must-happen actions · MCP for reusable integrations · custom tool when no server fits.",
        "Skills on the Messages API need the code-execution and skills beta headers and run in a container: no local files or tools."
      ]}
    ],
    pitfalls: [
      "Two descriptions that both say “find information”.",
      "Marking every parameter required.",
      "Expecting the API connector to reach a stdio server."
    ]
  }
};

window.CHEATSHEET = window.CHEATSHEET || {};
window.CHEATSHEET["ccdv-f"] = [
  { title: "Exam logistics", rows: [
    ["Items / time", "53 items · 120 minutes · multiple-choice and multiple-response (each item states how many to select)"],
    ["Scoring", "Scaled 100–1000 · pass ≥ 720 · report = pass/fail + scaled score + % correct per domain"],
    ["Fee / prerequisites", "$125 · no prerequisite, no mandatory course"],
    ["Delivery", "Proctored via Pearson VUE: OnVUE online or test center"],
    ["Validity", "12 months from the award date"]
  ]},
  { title: "Numbers worth knowing", rows: [
    ["Batch API", "Up to 100,000 requests or 256 MB · up to 24 h · lower price · results in any order (custom_id)"],
    ["Caching", "Up to 4 breakpoints · 5 min TTL (1 h option) · write 1.25× / 2× · read ~0.1× · minimum length per model"],
    ["Retry", "429, 529, 5xx retriable (honor retry-after) · 400, 401, 403, 404 terminal · refusal = 200, fail fast"],
    ["Structured outputs", "Grammar cached 24 h after last use · not with prefill · check refusal / max_tokens"],
    ["Orchestrator-worker", "~15× the tokens of a chat (Anthropic research system)"]
  ]}
];
