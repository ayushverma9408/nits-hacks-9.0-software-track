# E.D.I.T.H.

**Enhanced Digital Identity, Trust & Heuristics** — a hackathon prototype for visibility and control over connected-app access.

## Run locally

Requirements: Node.js 18 or later.

```bash
npm install
npm run dev
```

Run the API in a second terminal:

```bash
npm run server:dev
```

The frontend defaults to `http://localhost:4000` for its API. Copy `.env.example` to `.env` and change `VITE_API_URL` only when using a different API address.

## Frontend stack

| Area | Technology |
|---|---|
| UI | React + Vite |
| Styling | Tailwind CSS 3 + existing E.D.I.T.H. theme |
| Icons | Lucide React |
| Charts | Recharts |
| Language | JavaScript (ES modules) |

Vite's React plugin is configured in `vite.config.js`. Tailwind configuration lives in `tailwind.config.cjs`; PostCSS is configured in `postcss.config.cjs`.

## Prototype features

- Identity overview with a dynamic heuristic trust score
- Connected-app directory and granular permission controls
- Activity timeline with simulated anomaly signals
- Revoke / restore controls and an audit history
- Alert review and acknowledgement
- Responsive navigation and dashboard layouts
- Recharts-based weekly activity visualization
- API-connected mode with browser-local demo fallback

## Backend API

The Express API and SQLite persistence layer live in `server/`.

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

`server/detection.js` contains deterministic, explainable demo rules. It is not a trained model or production security product.

### Tests

```bash
npm test
npm run build
```

## Deployment — Phase 4

### 1. Deploy the API on Render

Create a **Node Web Service** from this repository:

- Build command: `npm install`
- Start command: `npm run server`
- Health check path: `/api/health`

Set these environment variables in Render:

| Key | Value |
|---|---|
| `CORS_ORIGIN` | `https://nits-hacks-9-0-software-track.vercel.app` |
| `DB_PATH` | `/var/data/edith.sqlite` |

For persistence, attach a Render persistent disk mounted at `/var/data`. Persistent disks require a paid Render service; without one, SQLite data on the service filesystem can be lost on redeploy/restart. Do not configure a disk unless the team has approved the cost.

Render supplies `PORT` automatically; the API listens on that value.

### 2. Connect Vercel to the API

In the Vercel project settings, add this environment variable for the relevant deployment environments:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Use the actual Render service hostname and omit the trailing slash. Redeploy the Vercel frontend after saving the variable.

### 3. Verify the live integration

Open these endpoints on the deployed API:

- `/api/health` — should return status `ok`
- `/api/apps` — should return the seeded demo applications
- `/api/events` — should return the demo activity feed
- `/api/summary` — should return dashboard totals

Then test the dashboard: revoke/restore an app, toggle a permission, generate an event, review an alert, and reset the demo. Confirm the UI shows **API CONNECTED** and that changes remain after refreshing.

### Demo limitation

This is a hackathon demonstration. Connected services, activity signals, risk assessments and permission changes are simulated. The app does not access real accounts, monitor operating-system activity, or revoke real-world permissions.
