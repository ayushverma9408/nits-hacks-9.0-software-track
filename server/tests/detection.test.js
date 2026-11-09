import test from "node:test";
import assert from "node:assert/strict";
import { assessEvent, calculateTrustScore } from "../detection.js";

test("flags an unrecognized sign-in as high risk", () => {
  const result = assessEvent({ app: "Unknown Device", detail: "Unrecognized sign-in pattern detected", type: "Anomaly" });
  assert.equal(result.severity, "High");
  assert.ok(result.riskPoints > 0);
  assert.match(result.reason, /high-risk demo indicator/i);
});

test("marks permission changes for review", () => {
  const result = assessEvent({ app: "Figma", detail: "A scope changed", type: "Permission" });
  assert.equal(result.severity, "Medium");
});

test("keeps ordinary events at normal severity", () => {
  const result = assessEvent({ app: "Notion", detail: "Workspace session refreshed", type: "Session" });
  assert.equal(result.severity, "Normal");
  assert.equal(result.riskPoints, 0);
});

test("calculates a bounded trust score", () => {
  const apps = [{ active: true, risk: "Low", scopes: [{ on: true }] }];
  const events = [];
  const score = calculateTrustScore(apps, events);
  assert.ok(score >= 18 && score <= 99);
});
