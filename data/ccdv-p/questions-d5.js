// CCDV-P Revision — Domain 5: Evaluation Engineering and Quality Assurance (12%) — 2 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d5-01", domain:5, type:"single", select:1, difficulty:"hard", source:"exam-guide-sample",
  question:"A team gates prompt releases with an LLM-as-judge evaluator that compares the new response to the current production response and picks the better one. Over several weeks, every candidate prompt passes, yet user-reported quality has not improved. A sample of judge verdicts shows the judge agrees with human raters on only slightly more than half of the pairs, and it selects whichever response appears first far more often than the humans do. Which action should the team take first?",
  options:["Replace pairwise comparison with absolute scoring on a fixed rubric so the judge never sees two responses side by side.",
    "Switch the judge to a larger, more capable model, since a stronger model will agree with human raters more often.",
    "Randomize response order, re-measure agreement against the human labels, and withhold gating authority until agreement is acceptable.",
    "Lower the pass threshold so the gate becomes more sensitive to the small improvements each candidate prompt introduces."],
  correct:[2],
  explanation:"Official guide rationale: the evidence describes a position bias and poor agreement with human labels, so the judge's verdicts are not yet trustworthy. The first step is to control the bias (randomized or swapped ordering), re-calibrate against the human-labeled set, and withhold gating authority until agreement is acceptable. Changing the scoring format (A) or the judge model (B) may help later but does not establish calibration; lowering the threshold (D) makes an uncalibrated gate more permissive." },
{ id:"d5-02", domain:5, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"Before sharing a meeting-recap skill, an engineer runs skill-creator's evals. The first round shows the with-skill outputs are too wordy and skip the executive summary, while still beating the without-skill outputs. What should the next round do?",
  options:["Give feedback on both issues together so that one revision fixes them both in a single round",
    "Give feedback on the missing summary first, re-run the same prompts, then tackle wordiness",
    "Drop the without-skill outputs and compare each new version only against the last version",
    "Add prompts for other meeting types, rerun them all, then fix what the first round showed"],
  correct:[1],
  explanation:"Change one thing at a time and re-run the same prompts, so it is clear what moved the needle; the without-skill output stays as the baseline that shows what the skill adds. Fixing both at once (A) hides which change helped, dropping the baseline (C) loses the comparison that matters, and new prompts (D) change the test before the known issue is fixed." }
]);
