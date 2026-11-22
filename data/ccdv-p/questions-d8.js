// CCDV-P Revision — Domain 8: Agent Fleet Operations for Software Delivery (10%) — 1 items
window.BANK = window.BANK || {};
window.BANK["ccdv-p"] = (window.BANK["ccdv-p"] || []).concat([
{ id:"d8-01", domain:8, type:"single", select:1, difficulty:"hard", source:"generated",
  question:"The pipeline runners carry managed settings with allowManagedHooksOnly and allowManagedMcpServersOnly. A team adds its production gate hook to the project's .claude/settings.json and its deploy servers to the project's .mcp.json. In production, release is never authorized even with a valid ticket, and the deploy tools are missing. What fixes this within the organization's policy?",
  options:["Define the gate hook in the managed settings and add the deploy servers to the managed MCP allowlist",
    "Move the gate hook to the runner account's user settings and keep the servers in the project's .mcp.json",
    "Keep the project files and run the production job with the bypassPermissions mode for release calls",
    "Keep the project files and ask the platform team to drop both managed flags on the pipeline runners"],
  correct:[0],
  explanation:"With allowManagedHooksOnly only hooks from managed settings run, and with allowManagedMcpServersOnly only servers on the managed allowlist load: the gate and the servers must move there. User settings (B) are ignored under the same flag, bypassing permissions (C) removes the production gate, and dropping the flags (D) solves the symptom by leaving the organization's policy." }
]);
