// CCDV-F Revision — Flashcards
// Schema: {id, domain, front, back}
window.FLASHCARDS = window.FLASHCARDS || {};
window.FLASHCARDS["ccdv-f"] = [
  { id: "f101", domain: 1, front: "Workflow or agent?", back: "Workflow when you can write the steps in code and errors are costly. Agent when you know the goal and tools but not the path." },
  { id: "f102", domain: 1, front: "Why not Managed Agents for PHI?", back: "Sessions are stateful and stored server-side: not currently eligible for ZDR or a HIPAA BAA. Use the Agent SDK or a raw loop on a covered configuration." },
  { id: "f103", domain: 1, front: "Where does the first human check go?", back: "Before any irreversible call (write, delete, send) — then after planning, then on unexpected output." },
  { id: "f104", domain: 1, front: "What does a subagent inherit?", back: "The parent's permissions. Not the conversation, not the skills (list them in its config)." },
  { id: "f201", domain: 2, front: "tool_use / tool_result pairing", back: "Every tool_use answered in the next user turn by a tool_result with the same id, tool_result blocks first. Keep Claude's text block." },
  { id: "f202", domain: 2, front: "When can a streamed turn go into history?", back: "After message_stop. Parse tool input after content_block_stop. Interrupted stream → discard the partial turn and retry." },
  { id: "f203", domain: 2, front: "Image, PDF, reused asset", back: "Inline base64 for one-offs · Files API file_id for reuse · PDFs in a document block. Measure the largest production input." },
  { id: "f204", domain: 2, front: "Alias vs pinned ID", back: "Alias can move to a new snapshot. Pin the full ID, keep the prior version, promote through the eval against a pinned baseline." },
  { id: "f205", domain: 2, front: "Functional vs infrastructure requirement", back: "Functional = checkable behavior. Infrastructure = latency, scale, residency, identity (they usually decide the platform)." },
  { id: "f206", domain: 2, front: "Plugin works only for its author", back: "Absolute paths or undocumented env vars. Use ${CLAUDE_PLUGIN_ROOT} / $CLAUDE_PROJECT_DIR, document and check env vars, test on a clean machine." },
  { id: "f301", domain: 3, front: "acceptEdits and rm", back: "acceptEdits auto-approves rm and other filesystem commands inside the working directory. Only default mode prompts for them." },
  { id: "f302", domain: 3, front: "Explore and Plan subagents", back: "Skip CLAUDE.md and git status. Use general-purpose or a custom subagent when project rules apply." },
  { id: "f401", domain: 4, front: "Retriable or terminal?", back: "Retriable: 429, 529, 500–504. Terminal: 400, 401, 403, 404. Refusal: 200, fail fast." },
  { id: "f402", domain: 4, front: "Which grader?", back: "One correct form → exact match. Structure → code check. Open-ended quality → LLM judge, calibrated against human labels." },
  { id: "f403", domain: 4, front: "Where do silent failures hide?", back: "At integration seams: each component passes alone, the handoff is broken." },
  { id: "f501", domain: 5, front: "temperature on the newest models", back: "Non-default temperature / top_p / top_k → 400. Steer with prompts and structured outputs." },
  { id: "f502", domain: 5, front: "Context window: two edge behaviors", back: "Oversized input → error before generation. Ceiling mid-generation → partial output with model_context_window_exceeded." },
  { id: "f503", domain: 5, front: "Adaptive thinking", back: "thinking {type: adaptive} + effort. budget_tokens deprecated (400 on newest). Thinking billed as output, omitted by default on newest models." },
  { id: "f504", domain: 5, front: "Async client or batch?", back: "User waiting + concurrency → AsyncAnthropic. Nobody waiting + volume → Message Batches." },
  { id: "f601", domain: 6, front: "Failure → missing technique", back: "Wrong shape → output constraint · drift → system prompt · invented structure → few-shot · variant breaks → constraint/example for it." },
  { id: "f602", domain: 6, front: "Structured outputs: what can still break", back: "refusal and max_tokens stops. Also: grammar compile on first use, extra input tokens, no prefill." },
  { id: "f603", domain: 6, front: "Manual compaction prompt", back: "Name what to keep: files modified, decisions, errors and their fixes." },
  { id: "f701", domain: 7, front: "Committed API key", back: "In history and every clone: rotate it. Config holds ${VAR} references only." },
  { id: "f702", domain: 7, front: "What hooks and roles do not cover", back: "Anything they do not name (e.g. a shell call to an unknown endpoint): OS-level sandbox, filesystem + network." },
  { id: "f801", domain: 8, front: "Two tools keep being confused", back: "Add when-to and when-not-to sentences to both. Still overlapping → merge into one tool with a type parameter." },
  { id: "f802", domain: 8, front: "API MCP connector limits", back: "Remote HTTP servers only. mcp_toolset: enabled (visibility), defer_loading (context cost)." },
  { id: "f803", domain: 8, front: "MCP scopes", back: "local (~/.claude.json, one project) · user (all your projects) · project (.mcp.json committed) · enterprise (managed)." }
];
