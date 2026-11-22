// Certification registry — one entry per exam supported by the site.
// Data files of each cert push into window.BANK[id], window.NOTES[id], window.FLASHCARDS[id], window.CHEATSHEET[id].
window.CERTS = {
  "ccar-p": {
    code: "CCAR-P",
    name: "Claude Certified Architect – Professional",
    storagePrefix: "ccarp:", // kept from v1 so existing progress survives the migration
    guide: {
      label: "Exam Guide v1.0 (July 2026)",
      url: "https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf"
    },
    officialPage: "https://anthropic-partners.skilljar.com/claude-certified-architect-professional-certification",
    exam: { items: 63, minutes: 120, pass: 720, scaleMin: 100, scaleMax: 1000, fee: "—", note: "proctored (Pearson VUE)" },
    targetBank: null,
    domains: {
      1: { name: "Solution Design & Architecture", weight: 17 },
      2: { name: "Claude Models, Prompting & Context Engineering", weight: 13 },
      3: { name: "Integration", weight: 19 },
      4: { name: "Evaluation, Testing & Optimization", weight: 16 },
      5: { name: "Governance, Safety & Risk Management", weight: 14 },
      6: { name: "Stakeholder Communication & Lifecycle Management", weight: 14 },
      7: { name: "Developer Productivity & Operational Enablement", weight: 7 }
    }
  },
  "ccdv-p": {
    code: "CCDV-P",
    name: "Claude Certified Developer – Professional",
    storagePrefix: "ccdvp:",
    guide: { label: "Exam Guide v1.0 (November 2026)", url: "https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf" },
    officialPage: "https://anthropic-partners.skilljar.com/claude-certified-developer-professional-certification/489458",
    exam: { items: 70, minutes: 120, pass: 720, scaleMin: 100, scaleMax: 1000, fee: "$175", note: "60 scored + 10 unscored items · proctored (Pearson)" },
    targetBank: 240,
    domains: {
      1: { name: "Advanced Agent Architecture and Orchestration", weight: 17 },
      2: { name: "Production Integration, Reliability, and Knowledge Grounding", weight: 20 },
      3: { name: "Observability and Production Monitoring", weight: 12 },
      4: { name: "Advanced Debugging and Incident Response", weight: 10 },
      5: { name: "Evaluation Engineering and Quality Assurance", weight: 12 },
      6: { name: "Cost and Latency Optimization at Scale", weight: 8 },
      7: { name: "Runtime Guardrails and Production Security", weight: 11 },
      8: { name: "Agent Fleet Operations for Software Delivery", weight: 10 }
    }
  }
};
window.CERTS["ccdv-f"] = {
  code: "CCDV-F",
  name: "Claude Certified Developer – Foundations",
  storagePrefix: "ccdvf:",
  guide: { label: "Exam Guide v1.1 (November 2026)", url: "https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946716/Claude_Certified_Developer_-_Foundations_Exam_Guide.pdf" },
  exam: { items: 53, minutes: 120, pass: 720, scaleMin: 100, scaleMax: 1000, fee: "$125", note: "proctored (Pearson VUE, OnVUE or test center)" },
  targetBank: 160,
  domains: {
    1: { name: "Agents and Workflows", weight: 14.7 },
    2: { name: "Applications and Integration", weight: 33.1 },
    3: { name: "Claude Code", weight: 3.1 },
    4: { name: "Eval, Testing, and Debugging", weight: 2.6 },
    5: { name: "Model Selection and Optimization", weight: 16.8 },
    6: { name: "Prompt and Context Engineering", weight: 11.0 },
    7: { name: "Security and Safety", weight: 8.1 },
    8: { name: "Tools and MCPs", weight: 10.6 }
  }
};
window.DEFAULT_CERT = "ccdv-p";
