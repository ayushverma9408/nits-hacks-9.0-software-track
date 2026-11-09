import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || "server/data/edith.sqlite");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    connected TEXT NOT NULL,
    risk TEXT NOT NULL DEFAULT 'Low',
    active INTEGER NOT NULL DEFAULT 1,
    scopes TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app TEXT NOT NULL,
    detail TEXT NOT NULL,
    severity TEXT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    ack INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
`);

const appCount = db.prepare("SELECT COUNT(*) AS count FROM apps").get().count;
if (appCount === 0) {
  const seedApps = [
    { id: 1, name: "Google Workspace", category: "Productivity", icon: "G", color: "blue", connected: "12 days ago", risk: "Low", active: 1, scopes: [{ name: "Basic profile", on: true }, { name: "Read email", on: true }, { name: "Read and write Drive files", on: true }, { name: "Manage contacts", on: false }] },
    { id: 2, name: "Notion", category: "Productivity", icon: "N", color: "light", connected: "8 days ago", risk: "Low", active: 1, scopes: [{ name: "Basic profile", on: true }, { name: "Read workspace", on: true }, { name: "Edit workspace content", on: true }] },
    { id: 3, name: "Unknown Device", category: "Unverified", icon: "?", color: "red", connected: "Just now", risk: "High", active: 1, scopes: [{ name: "Basic profile", on: true }, { name: "Location access", on: true }, { name: "Session access", on: true }] },
    { id: 4, name: "Figma", category: "Design", icon: "F", color: "purple", connected: "3 days ago", risk: "Medium", active: 1, scopes: [{ name: "Basic profile", on: true }, { name: "Read team files", on: true }, { name: "Edit team files", on: false }] }
  ];
  const insert = db.prepare("INSERT INTO apps (id,name,category,icon,color,connected,risk,active,scopes) VALUES (@id,@name,@category,@icon,@color,@connected,@risk,@active,@scopes)");
  const seed = db.transaction((items) => items.forEach((item) => insert.run({ ...item, scopes: JSON.stringify(item.scopes) })));
  seed(seedApps);
}

const eventCount = db.prepare("SELECT COUNT(*) AS count FROM events").get().count;
if (eventCount === 0) {
  const now = Date.now();
  const seedEvents = [
    ["Unknown Device", "Unrecognized sign-in pattern detected", "High", "Anomaly", "Matched high-risk demo indicator: unrecognized.", 0, 2],
    ["Google Workspace", "Drive permission accessed", "Normal", "Access", "No configured demo indicator matched.", 0, 18],
    ["Notion", "Workspace session refreshed", "Normal", "Session", "No configured demo indicator matched.", 0, 60],
    ["Google Workspace", "Connected application verified", "Normal", "Verification", "No configured demo indicator matched.", 1, 1440],
    ["Figma", "New permission scope reviewed", "Medium", "Permission", "Permission changes are marked for review.", 1, 1440]
  ];
  const insert = db.prepare("INSERT INTO events (app,detail,severity,type,reason,ack,created_at) VALUES (?,?,?,?,?,?,?)");
  const seed = db.transaction((items) => items.forEach((item) => insert.run(item[0], item[1], item[2], item[3], item[4], item[5], new Date(now - item[6] * 60000).toISOString())));
  seed(seedEvents);
}

export function getApps() {
  return db.prepare("SELECT * FROM apps ORDER BY id").all().map((row) => ({
    ...row,
    active: Boolean(row.active),
    scopes: JSON.parse(row.scopes)
  }));
}

export function getEvents(limit = 100) {
  return db.prepare("SELECT * FROM events ORDER BY created_at DESC, id DESC LIMIT ?").all(limit).map((row) => ({
    ...row,
    ack: Boolean(row.ack),
    time: row.created_at
  }));
}
