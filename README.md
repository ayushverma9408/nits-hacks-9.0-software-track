# E.D.I.T.H.

**Enhanced Digital Identity, Trust & Heuristics** — a hackathon prototype for visibility and control over connected-app access.

## Run locally

Requirements: Node.js 18 or later.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Frontend stack

| Area | Technology |
|---|---|
| UI | React + Vite |
| Styling | Tailwind CSS 3 + existing E.D.I.T.H. theme |
| Icons | Lucide React |
| Charts | Recharts |
| Language | JavaScript (ES modules) |

Tailwind configuration lives in `tailwind.config.cjs`; PostCSS is configured in `postcss.config.cjs`. The existing custom CSS theme is intentionally retained while Tailwind utilities are introduced incrementally.

## Prototype features

- Identity overview with a dynamic trust score
- Connected-app access and granular permission controls
- Activity timeline with simulated anomaly signals
- Revoke / restore controls and a local audit history
- Responsive navigation and dashboard layouts
- Recharts-based weekly activity visualization
- Lucide iconography

## Current implementation status

**Phase 1 — Frontend foundation:** React/Vite, Tailwind CSS, Lucide React and Recharts are integrated.

**Next phase:** Express API, SQLite persistence and a reusable JavaScript detection engine.

> This is a demonstration prototype. Activity, risk signals, connected services and permission changes are simulated locally in the browser; it does not connect to real accounts or revoke real-world permissions.


## Backend API — Phase 2

The Express API and SQLite persistence layer live in `server/`.

### Run the API locally

Open a second terminal alongside the Vite frontend:

```bash
npm install
cp server/.env.example server/.env
npm run server:dev
```

The API listens on `http://localhost:4000` by default. The SQLite database is created automatically at `server/data/edith.sqlite`; database files are intentionally excluded from Git.

### API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Service health and demo mode |
| GET | `/api/summary` | Trust score and dashboard counts |
| GET | `/api/apps` | Connected demo applications |
| PATCH | `/api/apps/:id/access` | Toggle simulated application access |
| PATCH | `/api/apps/:id/permissions` | Toggle a simulated permission scope |
| GET | `/api/events` | Activity and alert history |
| POST | `/api/events` | Add an event and evaluate its risk |
| POST | `/api/events/:id/acknowledge` | Mark an alert as reviewed |
| POST | `/api/demo/reset` | Restore the demo workspace |

### Detection engine

`server/detection.js` contains deterministic, explainable rules. It returns a severity, risk-points value and human-readable reason for each submitted event. This is a transparent demo heuristic, not a trained model or a production security product.

### Tests

```bash
npm test
npm run build
```

### Deployment note

Deploy the API as a separate Node service (for example, on Render) and set `CORS_ORIGIN` to the deployed frontend origin. Set `DB_PATH` to a mounted persistent-disk location such as `/var/data/edith.sqlite` if the hosting plan supports persistent disks. Without persistent storage, a host restart or redeploy may reset the SQLite database.

The Vite frontend is not connected to these endpoints yet; that is the next integration phase.


## Frontend ↔ backend integration — Phase 3

The React dashboard now attempts to load applications and events from the Express API on startup. App access toggles, permission changes, alert acknowledgements, demo event generation and demo reset use the API when it is reachable. The frontend falls back to browser-local demo state if the API is unavailable.

### Local development

1. Start the API in one terminal: `npm run server:dev`.
2. Start the frontend in another terminal: `npm run dev`.
3. The frontend defaults to `http://localhost:4000` for its API. Override it with `VITE_API_URL` when deploying.

### Vercel + API hosting

Add `VITE_API_URL` to the Vercel project's Environment Variables, pointing to the deployed API base URL (for example, `https://your-api-service.onrender.com`, without a trailing slash), then redeploy the frontend.

On the API host, set `CORS_ORIGIN` to the exact deployed Vercel origin (for example, `https://your-project.vercel.app`). If using a custom domain, include that origin too, comma-separated.

The UI shows whether the API is connected. If the API is unreachable, it continues in local demo mode. All account and event data remains simulated; no external accounts are accessed or changed.
