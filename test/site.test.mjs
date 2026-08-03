import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite } from "../scripts/build.mjs";

const routes = [
  "index.html",
  "about/index.html",
  "services/index.html",
  "online-tutoring/index.html",
  "rates/index.html",
  "tutors/index.html",
  "testimonials/index.html",
  "book/index.html",
  "enroll/index.html",
  "faq/index.html",
  "contact/index.html",
  "privacy/index.html",
  "terms/index.html",
  "payment-policy/index.html",
  "payment/local/index.html",
  "thank-you/index.html"
];

test("builds every approved public route", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-site-"));
  await buildSite(output);
  for (const route of routes) {
    const html = await readFile(join(output, route), "utf8");
    assert.match(html, /<!doctype html>/i, route);
    assert.match(html, /Salak Tutorial Services/, route);
  }
});

test("home mirrors the reference hierarchy with Salak content", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-home-"));
  await buildSite(output);
  const html = await readFile(join(output, "index.html"), "utf8");
  const sequence = [
    "Every learner can move forward",
    "Why families choose Salak",
    "Get to know our tutorial center",
    "Academic services for every stage",
    "A safe, guided online learning experience",
    "Choose the support that fits"
  ];
  let previous = -1;
  for (const text of sequence) {
    const position = html.indexOf(text);
    assert.ok(position > previous, '"' + text + '" should appear in order');
    previous = position;
  }
  assert.doesNotMatch(html, /Tutorial Hub PH|Tutors From UP/);
});

test("rates explain hourly focus and monthly all-subject support", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-rates-"));
  await buildSite(output);
  const html = await readFile(join(output, "rates/index.html"), "utf8");
  assert.match(html, /PHP 400/);
  assert.match(html, /USD 8/);
  assert.match(html, /one focused subject/i);
  assert.match(html, /assistance in all subjects/i);
  assert.match(html, /performance tasks, assignments, projects/i);
});

test("forms require guardian consent and expose no receipt upload", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-forms-"));
  await buildSite(output);
  const enroll = await readFile(join(output, "enroll/index.html"), "utf8");
  const payment = await readFile(join(output, "payment/local/index.html"), "utf8");
  assert.match(enroll, /name="guardianName"[^>]*required/);
  assert.match(enroll, /name="consent"[^>]*required/);
  assert.doesNotMatch(payment, /type="file"/);
  assert.match(payment, /name="referenceNumber"[^>]*required/);
});
