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
