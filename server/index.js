import "dotenv/config";
import express from "express";
import cors from "cors";
import { db, getApps, getEvents } from "./db.js";
import { assessEvent, calculateTrustScore } from "./detection.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((value) => value.trim()).filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: "32kb" }));

function apiError(res, status, message) {
  return res.status(status).json({ error: message });
}

function relativeTime(iso) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}

function serializeEvents(limit = 100) {
  return getEvents(limit).map((event) => ({ ...event, time: relativeTime(event.created_at) }));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "edith-api", mode: "demo", timestamp: new Date().toISOString() });
});

app.get("/api/apps", (_req, res) => res.json({ data: getApps() }));

app.get("/api/events", (req, res) => {
  const requested = Number(req.query.limit || 100);
  if (!Number.isInteger(requested) || requested < 1 || requested > 500) return apiError(res, 400, "limit must be an integer from 1 to 500");
  res.json({ data: serializeEvents(requested) });
});

app.get("/api/summary", (_req, res) => {
  const apps = getApps();
  const events = getEvents(500);
  const pendingAlerts = events.filter((event) => event.severity !== "Normal" && !event.ack).length;
  const activeApps = apps.filter((item) => item.active).length;
  const enabledPermissions = apps.reduce((sum, item) => sum + item.scopes.filter((scope) => scope.on).length, 0);
  res.json({
    data: {
      trustScore: calculateTrustScore(apps, events),
      activeApps,
      totalApps: apps.length,
      pendingAlerts,
      enabledPermissions,
      simulated: true
    }
  });
});

app.patch("/api/apps/:id/access", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || ![true, false].includes(req.body?.active)) return apiError(res, 400, "Provide a valid app id and boolean active value");
  const result = db.prepare("UPDATE apps SET active = ? WHERE id = ?").run(req.body.active ? 1 : 0, id);
  if (!result.changes) return apiError(res, 404, "Application not found");
  const target = getApps().find((item) => item.id === id);
  const detail = req.body.active ? `Demo access restored for ${target.name}` : `Demo access revoked for ${target.name}`;
  db.prepare("INSERT INTO events (app,detail,severity,type,reason,ack,created_at) VALUES (?,?,?,?,?,?,?)")
    .run(target.name, detail, "Normal", "Control", "A local demo access toggle was recorded; no external account was changed.", 0, new Date().toISOString());
  res.json({ data: target, simulated: true });
});

app.patch("/api/apps/:id/permissions", (req, res) => {
  const id = Number(req.params.id);
  const { scope, enabled } = req.body || {};
  if (!Number.isInteger(id) || typeof scope !== "string" || typeof enabled !== "boolean") return apiError(res, 400, "Provide scope (string) and enabled (boolean)");
  const target = getApps().find((item) => item.id === id);
  if (!target) return apiError(res, 404, "Application not found");
  const match = target.scopes.find((item) => item.name === scope);
  if (!match) return apiError(res, 404, "Permission scope not found");
  if (!target.active) return apiError(res, 409, "Restore demo app access before changing its scopes");
  const scopes = target.scopes.map((item) => item.name === scope ? { ...item, on: enabled } : item);
  db.prepare("UPDATE apps SET scopes = ? WHERE id = ?").run(JSON.stringify(scopes), id);
  db.prepare("INSERT INTO events (app,detail,severity,type,reason,ack,created_at) VALUES (?,?,?,?,?,?,?)")
    .run(target.name, `Demo permission ${enabled ? "enabled" : "disabled"}: ${scope}`, "Normal", "Permission", "A local demo permission toggle was recorded.", 0, new Date().toISOString());
  res.json({ data: getApps().find((item) => item.id === id), simulated: true });
});

app.post("/api/events", (req, res) => {
  const { app: appName, detail, type = "Activity" } = req.body || {};
  if (typeof appName !== "string" || !appName.trim() || typeof detail !== "string" || !detail.trim() || detail.length > 500) {
    return apiError(res, 400, "app and detail are required strings; detail must be at most 500 characters");
  }
  const assessment = assessEvent({ app: appName, detail, type });
  const createdAt = new Date().toISOString();
  const result = db.prepare("INSERT INTO events (app,detail,severity,type,reason,ack,created_at) VALUES (?,?,?,?,?,?,?)")
    .run(appName.trim().slice(0, 100), detail.trim(), assessment.severity, String(type).slice(0, 40), assessment.reason, 0, createdAt);
  const event = getEvents(1)[0];
  res.status(201).json({ data: { ...event, time: "Just now", riskPoints: assessment.riskPoints }, simulated: true });
});

app.post("/api/events/:id/acknowledge", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return apiError(res, 400, "Invalid event id");
  const result = db.prepare("UPDATE events SET ack = 1 WHERE id = ?").run(id);
  if (!result.changes) return apiError(res, 404, "Event not found");
  res.json({ data: getEvents(500).find((event) => event.id === id), simulated: true });
});

app.post("/api/demo/reset", (_req, res) => {
  const reset = db.transaction(() => {
    db.prepare("DELETE FROM events").run();
    db.prepare("UPDATE apps SET active = 1").run();
    const rows = db.prepare("SELECT id, name, scopes FROM apps").all();
    const resetScopes = rows.map((row) => {
      const scopes = JSON.parse(row.scopes).map((scope) => ({ ...scope, on: scope.name !== "Manage contacts" && scope.name !== "Edit team files" }));
      db.prepare("UPDATE apps SET scopes = ? WHERE id = ?").run(JSON.stringify(scopes), row.id);
      return { id: row.id, name: row.name };
    });
    const now = new Date().toISOString();
    db.prepare("INSERT INTO events (app,detail,severity,type,reason,ack,created_at) VALUES (?,?,?,?,?,?,?)")
      .run("Unknown Device", "Unrecognized sign-in pattern detected", "High", "Anomaly", "Matched high-risk demo indicator: unrecognized.", 0, now);
    return resetScopes;
  });
  reset();
  res.json({ data: { apps: getApps(), events: serializeEvents() }, simulated: true });
});

app.use((req, res) => apiError(res, 404, `Route not found: ${req.method} ${req.path}`));
app.use((err, _req, res, _next) => {
  console.error("API error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`E.D.I.T.H. demo API listening on port ${port}`);
});
