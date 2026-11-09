const HIGH_RISK_WORDS = ["unrecognized", "unknown device", "impossible travel", "suspicious", "unusual session", "unusual sign-in"];
const MEDIUM_RISK_WORDS = ["permission requested", "new location", "scope expanded", "multiple failures"];

export function assessEvent(input = {}) {
  const detail = String(input.detail || "").toLowerCase();
  const app = String(input.app || "").toLowerCase();
  const type = String(input.type || "Activity");
  const highMatch = HIGH_RISK_WORDS.find((word) => detail.includes(word) || app.includes(word));
  const mediumMatch = MEDIUM_RISK_WORDS.find((word) => detail.includes(word));

  if (highMatch) {
    return { severity: "High", riskPoints: 25, reason: `Matched high-risk demo indicator: "${highMatch}".` };
  }
  if (mediumMatch || type === "Permission") {
    return { severity: "Medium", riskPoints: 10, reason: mediumMatch ? `Matched review indicator: "${mediumMatch}".` : "Permission changes are marked for review." };
  }
  return { severity: "Normal", riskPoints: 0, reason: "No configured demo indicator matched." };
}

export function calculateTrustScore(apps, events) {
  const active = apps.filter((item) => item.active);
  const highRiskApps = active.filter((item) => item.risk === "High").length;
  const mediumRiskApps = active.filter((item) => item.risk === "Medium").length;
  const unreviewed = events.filter((item) => item.severity !== "Normal" && !item.ack).length;
  const enabledScopes = active.reduce((sum, item) => sum + item.scopes.filter((scope) => scope.on).length, 0);
  return Math.max(18, Math.min(99, 96 - highRiskApps * 15 - mediumRiskApps * 5 - unreviewed * 5 - Math.max(0, enabledScopes - 7)));
}
