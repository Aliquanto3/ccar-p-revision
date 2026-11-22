// CCDV-P Revision — Domain 3: Observability and Production Monitoring (12%) — 1 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d3-01", domain:3, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"A platform engineer has rolled out a read-only claude -p step that triages failed builds and posts a summary to the pull request. The VP wants an early signal, within weeks, that the step reduces load on engineers. Which indicator fits best?",
  options:["Average rating engineers give the summaries in a monthly survey on the triage step",
    "Change failure rate and lead time for changes over the next two quarters of releases",
    "Number of triage summaries the step posted, taken from the pull request thread history",
    "Share of pipeline failures triaged without paging a human, taken from the pipeline logs"],
  correct:[3],
  explanation:"The leading indicator for this play is the share of pipeline failures triaged without paging a human, read directly from the pipeline logs. DORA measures (B) are the lagging indicator, summary counts (C) measure output rather than load removed, and survey ratings (A) measure perceived quality with a monthly delay." }
]);
