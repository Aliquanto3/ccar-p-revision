// CCAR-P Revision — Domain notes & cheat sheet
// Synthesized from the public Exam Guide v1.0 blueprint (Section 6) and the
// learning objectives of the five official prep courses. No proprietary course content.

window.DOMAIN_NOTES = {
  1: {
    tagline: "Translate an ambiguous business problem into a defensible Claude architecture.",
    examTasks: [
      "Translate business problems into Claude-based AI solutions",
      "Design end-to-end architectures (input → processing → output → feedback loops)",
      "Select architectural patterns: workflow, agentic, augmented LLM",
      "Design multi-agent systems and orchestration strategies",
      "Apply decomposition techniques for complex problem solving",
      "Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs)"
    ],
    sections: [
      { title: "Four decisions before you build", points: [
        "1 · What work Claude owns — decompose the request into what Claude does, what existing systems do, and what humans do.",
        "2 · What form it takes — augmented call, workflow, or agent.",
        "3 · Which reference architecture pattern fits the problem shape.",
        "4 · Which model and context strategy keep it accurate and affordable."
      ]},
      { title: "Augmented call vs workflow vs agent", points: [
        "Augmented LLM call: one model call enriched with retrieval/tools. Cheapest, fastest — no intermediate control.",
        "Workflow: predefined steps chained in code, validation gates between them. Choose when the path is known and success criteria are checkable per step. Predictable cost, testable, debuggable.",
        "Agent: the model decides the next action from intermediate results. Choose only when the step count is unknown or branching depends on results. Costs: latency, spend, less predictability — every agentic choice must be justified by a dynamic path.",
        "Name what each choice costs. 'Agent because it is more powerful' is the classic wrong answer."
      ]},
      { title: "Retrieval vs live-state", points: [
        "Retrieval serves knowledge that changes slowly (docs, policies). Live-state (an API call at request time) serves facts that must be current (account balance, ticket status).",
        "Red flag: a RAG index being re-synced constantly to mirror an operational database — retrieval is doing a job live-state should own."
      ]},
      { title: "Multi-agent and decomposition", points: [
        "Orchestrator–worker: a lead agent decomposes and delegates to specialized sub-agents; justified when sub-tasks are separable and parallelizable, or need isolated contexts/tool sets.",
        "Coordination overhead is real: shared state, hand-off contracts, error propagation. A workflow of single calls beats a multi-agent design when the split is static."
      ]},
      { title: "Platform entry points", points: [
        "User-facing entry points: Claude.ai / desktop / mobile apps. Build-time interfaces: the API and SDKs, Claude Code, MCP servers. Delivery routes an enterprise procures: direct API, AWS Bedrock, Google Vertex AI, third-party platforms.",
        "Governance and regulated-industry constraints rule delivery routes in or out before any latency/cost trade-off applies.",
        "Customization lives at the right layer: prompts and Skills at the app layer, tools via MCP, org policy at the platform layer."
      ]}
    ],
    pitfalls: [
      "Choosing an agent for a fixed-sequence task (unpredictability with zero benefit).",
      "Justifying architecture by capability instead of by business value pillar and SLA.",
      "Letting retrieval mirror live operational data instead of calling the system of record."
    ]
  },

  2: {
    tagline: "Pick the right model, then make every token earn its place.",
    examTasks: [
      "Select appropriate Claude models based on trade-offs",
      "Design system prompts, templates, and guardrails",
      "Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)",
      "Optimize context windows and manage token usage",
      "Implement prompt reuse strategies (caching, modular prompts, Skills)"
    ],
    sections: [
      { title: "Model selection", points: [
        "Trade capability against cost and latency per task, not per project — a pipeline can mix tiers (frontier model for judgment steps, small model for classification/extraction).",
        "Any model swap is gated by the eval suite: run the candidate against existing evals, swap only if quality holds. Never swap on price alone.",
        "High-volume + simple + fixed labels → smaller model is the default hypothesis to test."
      ]},
      { title: "Prompt engineering levels", points: [
        "Zero-shot: instructions only — start here. Few-shot: add input→output examples when format or edge-case behavior must be demonstrated. Chain-of-thought: ask for reasoning before the answer when the task needs multi-step logic.",
        "System prompt = role, rules, guardrails, output contract. Keep dynamic user content out of the static instruction block.",
        "Templates and modular prompts: assemble from reusable blocks; Skills package instructions + resources for reuse across surfaces."
      ]},
      { title: "Context & token economics", points: [
        "Order matters for caching: static content (system prompt, policies, examples) first, dynamic content last — a stable prefix becomes cacheable.",
        "Prompt caching cuts both cost and time-to-first-token on repeated prefixes. It is the first lever when the same large context ships on every request.",
        "Context window discipline: retrieve/summarize instead of stuffing; long-context is a capability, not a strategy.",
        "Token budget = (input + output) × volume — estimate before building, monitor after shipping."
      ]}
    ],
    pitfalls: [
      "Truncating required policy content to save tokens (breaks correctness for pennies).",
      "Downsizing the model without running evals.",
      "Putting static reference content after dynamic content, making it uncacheable."
    ]
  },

  3: {
    tagline: "Connect Claude to real systems without multiplying attack surface or latency.",
    examTasks: [
      "Evaluate tool/agent configuration for capability bloat",
      "Analyze authentication and authorization requirements to identify security gaps",
      "Evaluate accuracy-latency trade-offs and justify configuration decisions",
      "Analyze observability challenges and select monitoring strategies at scale",
      "Design a RAG pipeline with appropriate chunking and indexing strategies",
      "Apply retrieval strategies matched to data shape and query pattern",
      "Evaluate connection protocols and select the integration mechanism (MCP, API/CLI, agent-to-agent)",
      "Evaluate progressive discovery vs. monolithic context strategy"
    ],
    sections: [
      { title: "Least privilege & capability bloat", points: [
        "Every tool an agent can call is attack surface. Remove tools the role does not need — removal beats logging (detective) and confirmation prompts (compensating).",
        "Authentication = who is calling. Authorization = what they may do. The agent must act with the permissions of the requesting user, not a super-user service account.",
        "Deterministic authorization checks live outside the model, on each tool call."
      ]},
      { title: "Connection protocols", points: [
        "MCP: the standard for exposing tools/resources/prompts to Claude across surfaces (Claude.ai, Claude Code, API apps) — build once, consume everywhere.",
        "Direct API/CLI integration: when one application owns the connection and no cross-surface reuse is needed.",
        "Agent-to-agent: for interoperability between autonomous agents — not a substitute for MCP when the need is 'expose my data/tools to Claude'.",
        "Progressive discovery (tools/context loaded when needed) vs monolithic context (everything upfront): progressive scales better and keeps prompts lean; monolithic is simpler for small, stable tool sets."
      ]},
      { title: "RAG pipeline design", points: [
        "Chunking follows document structure: section-boundary chunks with metadata for structured docs; semantic/recursive chunking for prose; small chunks + parent-document retrieval when precision and context both matter.",
        "Retrieval matched to query pattern: semantic embeddings for meaning, keyword/BM25 for exact identifiers and jargon, hybrid for corpora with both — plus metadata filtering when queries target sections, dates, or types.",
        "Index freshness is part of the design: re-index triggers, embedding-version consistency, and eval checks after every refresh."
      ]},
      { title: "Observability at scale", points: [
        "Log per request: prompt version, model, tokens in/out, latency, tool calls, retrieval hits. Aggregate into dashboards; alert on drift (cost per request, refusal rate, error rate).",
        "Trace across the pipeline (retrieval → model → tools), not just the model call — most production incidents are found in the steps around the model."
      ]}
    ],
    pitfalls: [
      "Granting an agent broad tools 'for flexibility' (capability bloat).",
      "Pure semantic search over documents full of exact identifiers (misses '12.3').",
      "Re-implementing the same integration per surface instead of one MCP server."
    ]
  },

  4: {
    tagline: "If it isn't evaluated, it isn't done: evals are the gate for every change.",
    examTasks: [
      "Define evaluation metrics (accuracy, latency, cost, safety, security)",
      "Design evaluation datasets and test frameworks using mixed methodologies",
      "Conduct A/B testing and iterative improvements",
      "Diagnose system issues (prompt failure, hallucinations, model mismatch)",
      "Optimize token usage, latency, and cost-performance trade-offs",
      "Monitor system performance using logging and observability tools"
    ],
    sections: [
      { title: "Eval methodology", points: [
        "Define success criteria and build the eval suite before production code — evals then gate every change: prompt edits, model swaps, retrieval changes.",
        "Code-based evals for deterministic properties: schema compliance, exact values, latency, cost. Cheap, fast, reliable.",
        "Model-based evals (LLM-as-judge) for subjective qualities: tone, helpfulness, faithfulness. Calibrate the judge, spot-check with humans.",
        "Mixed methodology is the norm; the mistake is using an expensive judge for what code checks perfectly."
      ]},
      { title: "A/B testing without overclaiming", points: [
        "State the hypothesis and the metric before the test; estimate required sample size before reading results.",
        "Small samples produce noise that looks like signal — a few points of difference on dozens of conversations decides nothing.",
        "Post-hoc segmentation of a small sample makes statistics worse (patterns in noise). Read the result you designed for."
      ]},
      { title: "Diagnosis playbook", points: [
        "Confident-but-wrong after a data refresh → retrieval/indexing first (stale or irrelevant chunks, embedding mismatch).",
        "Format/instruction violations → prompt failure: check prompt version, contradictions, context overflow.",
        "Good on simple, bad on complex → model mismatch: the tier is below the task.",
        "Fabricated facts with healthy retrieval → hallucination controls: grounding instructions, citations, output screening."
      ]},
      { title: "Optimization levers", points: [
        "Cost/latency, in order: cache static prefixes → trim context (retrieve less, summarize) → right-size the model per step (eval-gated) → parallelize independent calls → batch non-interactive work.",
        "Monitor after optimizing: cost per request, p95 latency, quality metrics — an optimization that moves quality is a regression."
      ]}
    ],
    pitfalls: [
      "Shipping a change because a tiny A/B sample 'looked better'.",
      "Judging JSON schema compliance with an LLM judge.",
      "Optimizing cost with no eval suite in place to catch the quality drop."
    ]
  },

  5: {
    tagline: "Safety is a stack of controls on the request path — each one fails, the next must catch it.",
    examTasks: [
      "Implement guardrails and safety controls",
      "Identify risks, limitations, and failure modes of LLM systems",
      "Apply human-in-the-loop validation strategies",
      "Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP)",
      "Address ethical AI considerations (bias, fairness, transparency)"
    ],
    sections: [
      { title: "The control stack", points: [
        "Model training reduces harmful behavior; it does not enforce your business rules. Anything the model was never told, the application layer must enforce.",
        "Placement on the request path: input screening (before the model) → the model with its system-prompt guardrails → output screening (before the user) → tool-call authorization (before any action).",
        "Deterministic checks where rules are crisp (allowlists, schemas, permissions); model-based checks where judgment is needed (toxicity, topic). Deterministic blocks; model-based screens.",
        "Fail closed: when a control errors, the system refuses/escalates — it never defaults to allowing the action."
      ]},
      { title: "Human-in-the-loop routing", points: [
        "Route decisions to a reviewer based on three factors: confidence, reversibility, and the cost of a wrong answer.",
        "Irreversible or high-cost actions (payments, deletions, medical/legal output) get mandatory approval; low-stakes reversible actions flow through with monitoring — review effort goes where it pays."
      ]},
      { title: "Compliance mapping", points: [
        "Each obligation maps to a named control, an owner, and an evidence artifact — that triple is what an auditor checks.",
        "GDPR: lawful basis, data minimization, right to erasure, EU data handling. HIPAA: PHI safeguards and access controls in healthcare. FedRAMP: US federal cloud authorization — often decides the delivery route (e.g., Bedrock/Vertex in an authorized region) before any other trade-off.",
        "Data handling questions to settle in design: what enters prompts, what is logged, retention, who can read logs."
      ]},
      { title: "Fairness & transparency", points: [
        "Unequal outcomes can arise from training data, retrieval corpus skew, or prompt framing — identify where in *your* system, not in the abstract.",
        "Define required explanations per audience: users (why this answer), regulators (how decisions are made), your own team (enough logging to debug a contested decision)."
      ]}
    ],
    pitfalls: [
      "Assuming Claude enforces a rule it was never given — the most common way a safety design breaks.",
      "Relying on system-prompt instructions as the only barrier before irreversible tool calls.",
      "Controls that fail open when the screening service errors."
    ]
  },

  6: {
    tagline: "A working system still needs the meeting that approves it and the handoff that keeps it alive.",
    examTasks: [
      "Conduct structured discovery and requirement gathering",
      "Communicate architectural decisions and trade-offs",
      "Manage stakeholder feedback loops and expectation alignment (including SLAs)",
      "Document architectures and provide implementation guidance",
      "Support lifecycle phases (discovery, design, handoff, monitoring, iteration)"
    ],
    sections: [
      { title: "Structured discovery", points: [
        "Interview non-technical stakeholders for outcomes, constraints, and current process — then translate into architectural requirements plus documented assumptions.",
        "The design must trace back to the business case, not to the architect's technical preference. Write assumptions down; unvalidated assumptions become change requests."
      ]},
      { title: "Presenting trade-offs", points: [
        "Formula for an actionable trade-off: each option = its cost + its risk + what reversing it later would take.",
        "Executives decide on that triple; they stall on benchmarks and jargon. Answer in the business register, with your own eval results, not public leaderboards."
      ]},
      { title: "Lifecycle & feedback loops", points: [
        "Name what triggers a review (metric drift, SLA breach, model deprecation, new regulation) and what an SLA breach requires (comms, remediation, post-mortem).",
        "Iterate when the architecture holds and a component underperforms; re-architect when the pattern itself no longer fits volume, data shape, or constraints.",
        "Governance checkpoints live inside the same loop — not a separate annual exercise."
      ]},
      { title: "GTM & cross-platform delivery", points: [
        "Architect's role in partner go-to-market: discovery, scenario-based demo, technical objection handling, joint scoping with the Anthropic Applied AI team.",
        "Delivery route comparison — direct API (latest features, direct relationship), AWS Bedrock / Google Vertex AI (cloud governance, existing enterprise agreements, regional/compliance authorizations), third-party platforms — compared on latency, compliance, and cost.",
        "Close with an outcome document: value legible to a non-technical sponsor, reusable as partner IP."
      ]}
    ],
    pitfalls: [
      "Presenting a trade-off as a technology comparison instead of cost/risk/reversibility.",
      "Undocumented assumptions surfacing as scope disputes at handoff.",
      "Choosing a delivery route on latency while a compliance constraint rules it out."
    ]
  },

  7: {
    tagline: "Enable the team to run the system without the architect in every loop.",
    examTasks: [
      "Configure Claude tools and environments for teams (e.g., Claude Code)",
      "Improve developer workflows using AI-assisted tooling",
      "Support debugging and operational issue resolution"
    ],
    sections: [
      { title: "Team configuration", points: [
        "Shared, version-controlled configuration: checked-in CLAUDE.md conventions, a Skills distribution strategy, and a deliberate rollout pattern (pilot group → team-wide).",
        "Spend controls belong in team setup from day one: budgets, alerts, per-team visibility — unpredictable spend is a configuration smell, not a usage smell."
      ]},
      { title: "Review discipline", points: [
        "AI-generated work enters production through the same gates as human work: code review, tests, CI. Define what reviewers check (correctness, security, conventions) so trust is earned per artifact, not assumed per tool."
      ]},
      { title: "Operational self-sufficiency", points: [
        "Connect symptoms to architecture causes (cost spike → context growth or model tier; quality drop → prompt/retrieval change) and document these paths as runbooks.",
        "The goal is a team that resolves routine issues without the architect — escalation reserved for architectural change."
      ]}
    ],
    pitfalls: [
      "Per-developer personal configs drifting apart (the problem shared config exists to solve).",
      "Copy-paste prompt libraries that fork silently instead of version-controlled distribution.",
      "No spend controls until the first surprising invoice."
    ]
  }
};

window.CHEATSHEET = [
  { title: "Exam logistics", rows: [
    ["Items / time", "63 questions · 120 minutes · multiple-choice & multiple-response (each item states how many to select)"],
    ["Scoring", "Scaled 100–1000 · pass ≥ 720 · criterion-referenced (vs a fixed standard, not other candidates)"],
    ["Score report", "Pass/fail + scaled score + percent-correct per domain (domain % is informational only)"],
    ["Delivery", "Proctored — Pearson VUE online or test center · government photo ID matching registration name"],
    ["Retakes", "Waiting periods: 14 d after 1st fail, 30 d after 2nd, 90 d after 3rd · max 4 attempts / rolling 12 months · fee per attempt"],
    ["Validity", "12 months · free non-proctored renewal assessment on time · lapsed = full exam at full fee"],
    ["Reschedule", "Free until 24 h before the appointment; inside 24 h the fee is forfeited"]
  ]},
  { title: "Domain weights (highest first)", rows: [
    ["D3 Integration", "19%"], ["D1 Solution Design & Architecture", "17%"],
    ["D4 Evaluation, Testing & Optimization", "16%"], ["D5 Governance, Safety & Risk", "14%"],
    ["D6 Stakeholder & Lifecycle", "14%"], ["D2 Models, Prompting & Context", "13%"],
    ["D7 Developer Productivity & Enablement", "7%"]
  ]},
  { title: "Architecture decision table", rows: [
    ["Fixed steps, checkable criteria", "Workflow with validation gates"],
    ["Unknown step count / result-dependent branching", "Agent"],
    ["One enriched answer, no intermediate control needed", "Augmented LLM call"],
    ["Separable parallel sub-tasks, isolated contexts", "Orchestrator–worker multi-agent"],
    ["Data must be current at request time", "Live-state API call, not retrieval"]
  ]},
  { title: "Integration decision table", rows: [
    ["Expose tools/data to Claude across surfaces", "MCP server (build once, consume everywhere)"],
    ["Single app owns the connection", "Direct API/SDK integration"],
    ["Autonomous agents interoperating", "Agent-to-agent protocol"],
    ["Exact identifiers & jargon in queries", "Hybrid retrieval (semantic + keyword/BM25)"],
    ["Structured docs (sections, clauses)", "Section-boundary chunking + metadata"],
    ["Large/growing tool set", "Progressive discovery over monolithic context"]
  ]},
  { title: "Evaluation decision table", rows: [
    ["Schema, exact values, latency, cost", "Code-based evals"],
    ["Tone, helpfulness, faithfulness", "Model-based evals (calibrated judge)"],
    ["Any prompt/model/retrieval change", "Gated by the existing eval suite"],
    ["A/B test", "Hypothesis + metric + sample size BEFORE reading results"],
    ["Wrong answers after data refresh", "Investigate retrieval/indexing first"]
  ]},
  { title: "Safety control placement", rows: [
    ["Before the model", "Input screening"],
    ["Before the user", "Output screening"],
    ["Before any action", "Deterministic tool-call authorization (outside the model)"],
    ["Crisp rules", "Deterministic checks (block)"],
    ["Judgment calls", "Model-based checks (screen)"],
    ["Control errors out", "Fail closed — refuse/escalate, never allow by default"],
    ["HITL routing factors", "Confidence · reversibility · cost of a wrong answer"],
    ["Unneeded capability", "Remove the tool (beats logging or confirmation)"]
  ]},
  { title: "Stakeholder formulas", rows: [
    ["Trade-off presentation", "Option = cost + risk + what reversal would take"],
    ["Discovery output", "Architectural requirements + documented assumptions"],
    ["Iterate vs re-architect", "Component underperforms → iterate · pattern no longer fits → re-architect"],
    ["Compliance mapping", "Obligation → named control + owner + evidence artifact"],
    ["Delivery routes", "Direct API vs Bedrock vs Vertex vs third-party, on latency · compliance · cost — compliance rules out first"]
  ]}
];
