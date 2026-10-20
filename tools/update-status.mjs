#!/usr/bin/env node
// Usage:
//   node tools/update-status.mjs --agent hephaestus --status working --activity "Shipping Shift Clock"
//   node tools/update-status.mjs --ticker "Plutus logged the payslip" [--agent plutus]
//   node tools/update-status.mjs --agent atlas --status idle
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const file = fileURLToPath(new URL("../status.json", import.meta.url));
const args = {}; const a = process.argv.slice(2);
for (let i = 0; i < a.length; i++) if (a[i].startsWith("--")) args[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : true;
const s = JSON.parse(readFileSync(file, "utf8")); const now = new Date().toISOString();
const ok = Object.keys(s.agents);
if (args.agent && !ok.includes(args.agent)) { console.error("Unknown agent. Use one of: " + ok.join(", ")); process.exit(1); }
if (args.status && !["working", "watching", "idle"].includes(args.status)) { console.error("status must be working|watching|idle"); process.exit(1); }
if (args.agent && (args.status || args.activity)) {
  const g = s.agents[args.agent];
  if (args.status) g.status = args.status; if (args.activity) g.activity = String(args.activity).slice(0, 80);
  g.updatedAt = now; g.source = "live";
}
if (args.ticker) { s.ticker.unshift({ text: String(args.ticker).slice(0, 120), at: now, agent: args.agent || null, source: "live" }); s.ticker = s.ticker.slice(0, 50); }
if (!args.ticker && !(args.agent && (args.status || args.activity))) { console.error("Nothing to do. See usage at top of file."); process.exit(1); }
s.updatedAt = now;
writeFileSync(file, JSON.stringify(s, null, 1) + "\n");
console.log("status.json updated", args);
