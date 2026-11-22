// CCDV-P Revision — Domain 7: Runtime Guardrails and Production Security (11%) — 3 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d7-01", domain:7, type:"single", select:1, difficulty:"hard", source:"exam-guide-sample",
  question:"An internal support agent reads customer tickets, has access to a CRM containing account details, and can send email through a tool. A red-team exercise shows that a ticket containing hidden instructions can cause the agent to look up another customer's record and email it to an external address. The team has already added a system prompt instruction telling the model to ignore instructions found in tickets. Which additional control most directly closes the exploit path?",
  options:["Enforce recipient allowlisting or human approval on the email tool, and scope CRM access to the ticket's own account.",
    "Add a stronger system prompt warning that exfiltrating customer data is prohibited and that ticket content must never be treated as instructions.",
    "Reduce the model's effort level so that it is less likely to follow multi-step instructions embedded in ticket content.",
    "Log every email the agent sends, including recipient and attachments, so that any exfiltration can be investigated after the fact."],
  correct:[0],
  explanation:"Official guide rationale: the agent combines private data access, untrusted input, and an external communication channel, so prompt-level instructions alone cannot be relied on to prevent exfiltration. A deterministic control enforced outside the model, such as recipient allowlisting, approval gates for external sends, and least-privilege data scoping, closes the demonstrated path regardless of what the injected text says. A stronger prompt (B) is not an enforceable boundary; reducing effort (C) does not remove the capability; logging (D) detects rather than prevents." },
{ id:"d7-02", domain:7, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"A production pipeline job runs claude -p with --allowedTools set to the production server's status and rollback tools and --permission-mode dontAsk. A PreToolUse hook on release allows the call only with a change ticket signed by the release manager. During a run, the hook script fails to start. What happens when Claude calls release?",
  options:["The release call waits for interactive approval until the job reaches its timeout",
    "The release call is denied, and the job carries on without waiting for any input",
    "The release call runs, as the hook that failed returned no deny decision for it",
    "The release call runs, as dontAsk approves any call that no other rule covers"],
  correct:[1],
  explanation:"release is off the allowlist, so the hook's allow is its only route; dontAsk denies anything that would otherwise prompt. Without a working hook the call is denied and the job never waits: production fails closed. dontAsk never waits for input (A), the absence of a deny is not an allow (C), and dontAsk denies rather than approves uncovered calls (D)." },
{ id:"d7-03", domain:7, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"Auditors reviewing an insurer's deployment logs cannot tell whether a release came from the coding agent or from the engineer who triggered the pipeline, because the agent job runs with that engineer's personal token. Which change best answers the audit finding?",
  options:["Keep the engineer's token and prefix each agent action with an explicit AGENT tag written by the prompt",
    "Give the agent job its own short-lived identity for its environment, separate from the triggering engineer",
    "Keep the engineer's token and require the engineer to approve each agent tool call during the run",
    "Give all pipeline jobs one shared service account key so that agent actions no longer use a person"],
  correct:[1],
  explanation:"Each non-interactive run should act under the agent's own identity, with short-lived credentials scoped to its environment, so the log separates the agent's actions from the engineer's. A prompt-written tag (A) is self-reported, per-call approval (C) still records the engineer as actor, and a shared static key (D) erases attribution between jobs and keeps a long-lived secret." }
]);
