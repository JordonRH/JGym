# JGym

A calm, self-hosted gym app. Your workouts, your people, your own pace.

Built on [OpenGym](https://github.com/DuarteSantos8/openGym), retaining routines, exercise library, set logging, rest timers, history, statistics, accounts, invitations, device sync, and backups.

## JGym additions

- Responsive overview with weekly sessions, routines, and weight trends.
- **Sage**, **Sand**, and **Midnight** appearances, saved per profile.
- Weight page with dated weigh-ins, edit/delete, trend ranges, goal, CSV export, and saved height.
- Adult BMI from your latest weight, supporting kilograms and pounds, with its limitations explained.
- **CSV and Excel (.xlsx)** imports: sheet selection, weight-column mapping, unit conversion, preview, validation, and duplicate-date protection. Workout sheets use OpenGym's exercise matching and review.
- **People** for administrators to manage accounts and single-use invitations.
- Linux Docker Compose with optional Cloudflare Tunnel.
- Free local exercise illustrations for 414 entries, position controls, and an illustrated-only library filter. See [image coverage and credits](docs/EXERCISE_IMAGES.md); the full catalogue is not yet illustrated.

## Deploy on Linux

```sh
git clone https://github.com/JordonRH/JGym.git
cd JGym
cp .env.jgym.example .env
# Set your final RP_ID, ORIGIN and optional TUNNEL_TOKEN in .env.
docker compose -f compose.jgym.yml up -d --build
```

For the bundled Cloudflare connector:

```sh
docker compose -f compose.jgym.yml --profile tunnel up -d --build
```

Point the tunnel at `http://web:80`. If cloudflared already runs directly on your host, use `http://localhost:8080`. The app and data live on your Linux box; Cloudflare supplies the public HTTPS route. **Read the [deployment guide](docs/JGYM_DEPLOYMENT.md)** for first-account setup, invitations, backup, updates, and verification.

Keep the address private until you register your administrator account. Then set `INVITE_ONLY=1` before sharing it. Import data while signed into the intended person's account. Guest mode is disabled in the supplied deployment example.

## Local development

Use Node 22.12+ and npm. In separate terminals:

```sh
cd api
npm ci --omit=optional
npm start
```

```sh
cd frontend
npm ci --ignore-scripts
npm run dev
```

Open the Vite address. Its proxy forwards `/api` to port 3000. To enable password sign-up locally, set `PASSWORD_LOGIN=1` in the API process environment. The API reads environment variables; Docker Compose loads `.env` for you.

```sh
cd frontend
npm run build
npm test -- src/lib/jgym.test.js src/lib/import-csv.test.js src/lib/import-bodyweight.test.js src/lib/import-reimport.test.js src/views/Admin.test.jsx src/views/Admin.password.test.jsx
npm run test:e2e
```

Browser tests use locally installed Chrome and verify the overview, weight/BMI edits, saved themes, CSV duplicates, a real XLSX workbook, and mobile layout. They stub the guest API; backend account and sync tests launch real isolated API processes. The retained OpenGym tests cover the underlying app; `npm test` runs its full frontend suite.

## Import format

For weigh-ins, include headers (names can be mapped in the UI):

```csv
date,weight,unit
2026-01-01,80.2,kg
2026-01-08,79.8,kg
```

Dates must be `YYYY-MM-DD` or Excel date cells. Units are `kg`, `lb`, or `lbs`. Without a unit column, choose the file's unit. Existing dates are skipped; edit them on Weight & BMI if needed. Limits: 10 MB and 20,000 data rows. Save older `.xls` files as `.xlsx`. Fix invalid rows before confirming.

For workouts, use Strong, Hevy or FitNotes exports, or the downloadable template. Each row describes a set. For a complete OpenGym profile, use **Settings → Data & backup** to restore JSON/ZIP.

## Licence and upstream

AGPL-3.0-or-later. See [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), and [upstream provenance](JGYM_UPSTREAM.md). The original README is preserved as [README.opengym.md](README.opengym.md).

Gym visual's exercise stills and animations are separately licensed for OpenGym and excluded from JGym. Exercise metadata, instructions, and muscle diagrams remain. Neutral icons replace bundled artwork; custom exercises can use your own uploaded media.

New JGym screens are currently English; retained screens preserve upstream languages. Native mobile releases and upstream publishing workflows are outside this web/self-hosted delivery.
