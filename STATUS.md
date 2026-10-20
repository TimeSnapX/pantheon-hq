# How agents update Pantheon HQ

The dashboard polls `./status.json` every 60 s (`cache: "no-store"`; the service worker never caches it).

## status.json
- `agents.<id>`: `status` (`working` | `watching` | `idle`), `activity` (short line), `updatedAt` (ISO time), `source` (`live`, `real`, or `default` for role-based seed values).
- `ticker`: newest-first `{text, at, agent, source}` items, shown in the LIVE bar and Activity tab.
- `routines`: `{name, agent, schedule, source}` for the Routines tab.

If an agent's `updatedAt` is older than **6 hours**, the UI shows it as **idle** and rotates its role-based idle lines, labelled **ambient** in the side panel. Nothing ambient claims to be live.

## Updating
```
node tools/update-status.mjs --agent plutus --status working --activity "Logging Wednesday's payslip"
node tools/update-status.mjs --agent plutus --ticker "Plutus logged Wednesday's payslip"
node tools/update-status.mjs --agent atlas --status idle
```
Then commit and push. **Pushes go through the Kenny PC** (gh authenticated as TimeSnapX):
```
cd C:\Users\kenny\pantheon-hq; git pull; node tools/update-status.mjs ...; git commit -am "status: ..."; git push
```
(PowerShell 5: chain commands with `;`.) GitHub Pages redeploys in about a minute and open dashboards pick it up on their next poll.
