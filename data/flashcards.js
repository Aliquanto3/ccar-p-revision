// CCAR-P Revision — Flashcards
// Schema: {id, domain, front, back}
window.FLASHCARDS = [
  // D1 — Solution Design & Architecture
  { id: "f101", domain: 1, front: "The four decisions to make before building a Claude solution", back: "1) What work Claude owns · 2) What form it takes (augmented call / workflow / agent) · 3) Which reference architecture pattern · 4) Which model + context strategy." },
  { id: "f102", domain: 1, front: "When does an agent beat a workflow?", back: "Only when the path is dynamic: step count unknown in advance, or intermediate results determine the next action. Otherwise a workflow is cheaper, faster, and testable." },
  { id: "f103", domain: 1, front: "What does choosing an agent cost you?", back: "Latency, spend, and predictability. Every agentic choice must be justified by a genuinely dynamic path." },
  { id: "f104", domain: 1, front: "Retrieval vs live-state: the rule", back: "Retrieval = slow-changing knowledge (docs, policies). Live-state = facts that must be current at request time (balances, statuses) — call the system of record, don't mirror it into an index." },
  { id: "f105", domain: 1, front: "When is orchestrator–worker multi-agent justified?", back: "When sub-tasks are separable and parallelizable, or need isolated contexts/tool sets — and the coordination overhead (shared state, hand-offs, error propagation) is worth it." },
  { id: "f106", domain: 1, front: "Business value pillars a solution aligns to", back: "Efficiency, transformation, productivity, cost, performance SLAs." },
  { id: "f107", domain: 1, front: "Enterprise delivery routes for Claude", back: "Direct Anthropic API · AWS Bedrock · Google Vertex AI · third-party platforms. Governance/regulated constraints rule routes out before latency or cost trade-offs apply." },

  // D2 — Models, Prompting & Context
  { id: "f201", domain: 2, front: "The rule for any model swap", back: "Gate it with the eval suite: run the candidate model against existing evals, swap only if quality holds. Never swap on price alone." },
  { id: "f202", domain: 2, front: "Zero-shot vs few-shot vs chain-of-thought", back: "Zero-shot: instructions only (start here). Few-shot: add examples when format/edge-case behavior must be demonstrated. CoT: request reasoning before the answer for multi-step logic." },
  { id: "f203", domain: 2, front: "How to make prompt caching effective", back: "Order static content first (system prompt, policies, examples), dynamic content last — repeated stable prefixes become cacheable, cutting cost AND time-to-first-token." },
  { id: "f204", domain: 2, front: "When is prompt caching the first lever?", back: "When the same large static context (system prompt + reference docs) ships on every request with only a short varying user message." },
  { id: "f205", domain: 2, front: "Prompt reuse strategies", back: "Prompt caching (repeated prefixes) · modular prompts (assembled from reusable blocks) · Skills (packaged instructions + resources reusable across surfaces)." },
  { id: "f206", domain: 2, front: "Token budget estimation formula", back: "(input tokens + output tokens) × request volume — estimate before building, monitor after shipping." },

  // D3 — Integration
  { id: "f301", domain: 3, front: "Least privilege for agent tools", back: "Remove tools the role does not need. Removal eliminates attack surface; logging is detective and confirmation prompts are compensating — neither removes the privilege." },
  { id: "f302", domain: 3, front: "Authentication vs authorization", back: "Authentication = who is calling. Authorization = what they may do. Agents must act with the requesting user's permissions, never a blanket super-user service account." },
  { id: "f303", domain: 3, front: "When to choose MCP as the integration mechanism", back: "When tools/data must be exposed to Claude across multiple surfaces (Claude.ai, Claude Code, API apps): one server, consumed everywhere, one security review." },
  { id: "f304", domain: 3, front: "Agent-to-agent protocol: right use case", back: "Interoperability between autonomous agents. It is NOT the answer for exposing data/tools to Claude — that's MCP." },
  { id: "f305", domain: 3, front: "Progressive discovery vs monolithic context", back: "Progressive: load tools/context when needed — scales, keeps prompts lean. Monolithic: everything upfront — simpler for small stable tool sets, bloats as the set grows." },
  { id: "f306", domain: 3, front: "Chunking strategy for structured documents", back: "Chunk along section boundaries and attach metadata (section number, title, type) so clauses stay intact and become addressable by filters." },
  { id: "f307", domain: 3, front: "Why hybrid retrieval (semantic + BM25)?", back: "Embeddings capture meaning but miss exact identifiers ('section 12.3', part numbers, jargon); keyword/BM25 catches them. Corpora with both need both." },
  { id: "f308", domain: 3, front: "What to log per request for observability", back: "Prompt version, model, tokens in/out, latency, tool calls, retrieval hits — then aggregate and alert on drift (cost/request, refusal rate, error rate)." },

  // D4 — Evaluation, Testing & Optimization
  { id: "f401", domain: 4, front: "Code-based vs model-based evals", back: "Code-based: deterministic properties (schema, exact values, latency, cost). Model-based (LLM-as-judge): subjective qualities (tone, helpfulness, faithfulness) — calibrated and spot-checked." },
  { id: "f402", domain: 4, front: "When are evals built, relative to production code?", back: "Before it. Success criteria and the eval suite come first; evals then gate every subsequent change (prompt, model, retrieval)." },
  { id: "f403", domain: 4, front: "Three things fixed BEFORE an A/B test", back: "The hypothesis, the metric, and the required sample size. Reading a small-sample difference as a win is overclaiming." },
  { id: "f404", domain: 4, front: "Confident-but-wrong answers right after a document refresh: first suspect?", back: "The retrieval/indexing step — stale or irrelevant chunks, broken re-index, or mismatched embedding versions." },
  { id: "f405", domain: 4, front: "Symptom → diagnosis: violates format/instructions", back: "Prompt failure — check prompt version, contradictory instructions, or context overflow pushing rules out." },
  { id: "f406", domain: 4, front: "Symptom → diagnosis: fine on simple inputs, fails on complex ones", back: "Model mismatch — the selected tier is below the task's reasoning demands." },
  { id: "f407", domain: 4, front: "Cost/latency optimization levers, in order", back: "1) Cache static prefixes · 2) Trim context (retrieve less, summarize) · 3) Right-size the model per step (eval-gated) · 4) Parallelize independent calls · 5) Batch non-interactive work." },

  // D5 — Governance, Safety & Risk
  { id: "f501", domain: 5, front: "What model training does NOT do for your system", back: "It reduces generally harmful behavior but does not enforce your business rules — anything the model was never told, the application layer must enforce." },
  { id: "f502", domain: 5, front: "The four control points on the request path", back: "Input screening (before the model) → system-prompt guardrails (in the model) → output screening (before the user) → tool-call authorization (before any action)." },
  { id: "f503", domain: 5, front: "Deterministic vs model-based safety checks", back: "Deterministic where rules are crisp (allowlists, schemas, permissions) — they block. Model-based where judgment is needed (toxicity, topic) — they screen." },
  { id: "f504", domain: 5, front: "Fail closed vs fail open", back: "Fail closed: when a control errors, refuse or escalate. A safety design that defaults to allowing the action when screening fails is broken." },
  { id: "f505", domain: 5, front: "The three HITL routing factors", back: "Confidence, reversibility, and the cost of a wrong answer. Irreversible/high-cost actions get mandatory approval; low-stakes reversible ones flow with monitoring." },
  { id: "f506", domain: 5, front: "Compliance obligation mapping (audit-ready)", back: "Each obligation → a named control + an owner + an evidence artifact. That triple is what auditors check." },
  { id: "f507", domain: 5, front: "GDPR / HIPAA / FedRAMP in one line each", back: "GDPR: EU personal-data rules (lawful basis, minimization, erasure). HIPAA: US healthcare PHI safeguards. FedRAMP: US federal cloud authorization — often decides the delivery route." },

  // D6 — Stakeholder Communication & Lifecycle
  { id: "f601", domain: 6, front: "The trade-off presentation formula", back: "Each option = its cost + its risk + what reversing it later would take. That triple lets a business stakeholder actually decide." },
  { id: "f602", domain: 6, front: "Output of structured discovery", back: "Architectural requirements + documented assumptions, traceable to the business case — not to the architect's technical preference." },
  { id: "f603", domain: 6, front: "Iterate vs re-architect", back: "Iterate when the architecture holds and a component underperforms. Re-architect when the pattern itself no longer fits volume, data shape, or constraints." },
  { id: "f604", domain: 6, front: "What an SLA breach requires", back: "Defined comms to stakeholders, remediation, and a post-mortem — named in advance as part of the feedback loop, with governance checkpoints in the same loop." },
  { id: "f605", domain: 6, front: "Architect's role in a partner GTM motion", back: "Discovery, scenario-based demo, technical objection handling, and joint scoping with the Anthropic Applied AI team — then an outcome document reusable as partner IP." },

  // D7 — Developer Productivity & Enablement
  { id: "f701", domain: 7, front: "First fix for inconsistent Claude Code usage across a team", back: "Shared, version-controlled configuration: checked-in CLAUDE.md conventions, a Skills distribution strategy, a rollout pattern, and team-level spend controls." },
  { id: "f702", domain: 7, front: "Review discipline for AI-generated work", back: "Same gates as human work: code review, tests, CI. Define what reviewers check (correctness, security, conventions) — trust is earned per artifact, not assumed per tool." },
  { id: "f703", domain: 7, front: "Goal of operational enablement", back: "A team that connects symptoms to architecture causes via runbooks and resolves routine issues without the architect — escalation reserved for architectural change." }
];
