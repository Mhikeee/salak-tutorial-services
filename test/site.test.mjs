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
  "testimonials/index.html",
  "book/index.html",
  "enroll/index.html",
  "faq/index.html",
  "contact/index.html",
  "privacy/index.html",
  "terms/index.html",
  "payment-policy/index.html",
  "thank-you/index.html",
  "404.html"
];

const approvedAssets = [
  "logo.png",
  "hero-photo.jpg",
  "center-session.jpg",
  "center-location.jpg",
  "tutors.jpg",
  "testi1.png",
  "testi2.png",
  "testi3.png"
];

test("copies the canonical replacement logo into the build", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-logo-"));
  await buildSite(output);
  const source = await readFile(join(process.cwd(), "elements", "logo.png"));
  const built = await readFile(join(output, "assets", "logo.png"));
  assert.deepEqual(built, source);
});

test("copies every approved launch image into the build", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-media-"));
  await buildSite(output);
  for (const asset of approvedAssets) {
    const source = await readFile(join(process.cwd(), "elements", asset));
    const built = await readFile(join(output, "assets", asset));
    assert.deepEqual(built, source, asset);
  }
});

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
  assert.doesNotMatch(html, /href="\/tutors\/"|>Our Tutors</);
});

test("does not publish the retired tutor route", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-no-tutors-"));
  await buildSite(output);
  await assert.rejects(readFile(join(output, "tutors", "index.html")), { code: "ENOENT" });
  const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/tutors\//);
});

test("publishes the approved business details and contact actions", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-contact-"));
  await buildSite(output);
  const home = await readFile(join(output, "index.html"), "utf8");
  const contact = await readFile(join(output, "contact/index.html"), "utf8");
  const combined = `${home}\n${contact}`;
  assert.match(combined, /salaktutorialservices@gmail\.com/);
  assert.match(combined, /\+63 969 628 3385/);
  assert.match(combined, /Monday[^<]*Saturday/i);
  assert.match(combined, /within 24 hours/i);
  assert.match(combined, /facebook\.com\/profile\.php\?id=100086394308897/);
  assert.match(combined, /wa\.me\/639696283385/);
  assert.match(combined, /sms:\+639696283385/);
  assert.match(combined, /Salak Tutorial Services \(Main\)/);
});

test("uses the approved all-caps brand and launch media", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-brand-"));
  await buildSite(output);
  const home = await readFile(join(output, "index.html"), "utf8");
  const about = await readFile(join(output, "about/index.html"), "utf8");
  const testimonials = await readFile(join(output, "testimonials/index.html"), "utf8");
  assert.match(home, /<span class="brand-primary">SALAK<\/span>/);
  assert.match(home, /<span class="brand-secondary">TUTORIAL SERVICES<\/span>/);
  assert.match(home, /assets\/hero-photo\.jpg/);
  assert.match(home, /assets\/center-session\.jpg/);
  assert.match(about, /assets\/center-location\.jpg/);
  assert.match(about, /assets\/tutors\.jpg/);
  assert.equal((testimonials.match(/Verified Parent Review/g) || []).length, 3);
  assert.match(testimonials, /assets\/testi1\.png/);
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
  assert.match(html, /per learner/i);
  assert.match(html, /50%/i);
  assert.match(html, /PHP monthly clients/i);
  assert.match(html, /Salak absorbing PayPal processing fees/i);
});

test("forms require guardian and policy consent and payment stays private", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-forms-"));
  await buildSite(output);
  const enroll = await readFile(join(output, "enroll/index.html"), "utf8");
  assert.match(enroll, /name="guardianName"[^>]*required/);
  assert.match(enroll, /name="consent"[^>]*required/);
  assert.match(enroll, /name="policyConsent"[^>]*required/);
  await assert.rejects(readFile(join(output, "payment/local/index.html")), { code: "ENOENT" });
  const pages = await Promise.all(routes.map((route) => readFile(join(output, route), "utf8")));
  assert.doesNotMatch(pages.join("\n"), /\/payment\/local\//);
});

test("publishes approved policies and service boundaries", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-policy-"));
  await buildSite(output);
  const terms = await readFile(join(output, "terms/index.html"), "utf8");
  const payment = await readFile(join(output, "payment-policy/index.html"), "utf8");
  const online = await readFile(join(output, "online-tutoring/index.html"), "utf8");
  const combined = `${terms}\n${payment}\n${online}`;
  assert.match(combined, /12 hours/i);
  assert.match(combined, /immediately following month/i);
  assert.match(combined, /first scheduled session/i);
  assert.match(combined, /non-refundable/i);
  assert.match(combined, /Google Meet/i);
  assert.match(combined, /Zoom/i);
  assert.match(combined, /device and reliable internet/i);
  assert.match(combined, /subject to tutor availability/i);
});

test("uses the temporary Pages origin for canonical launch metadata", async () => {
  const output = await mkdtemp(join(tmpdir(), "salak-origin-"));
  await buildSite(output);
  const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
  const robots = await readFile(join(output, "robots.txt"), "utf8");
  const home = await readFile(join(output, "index.html"), "utf8");
  assert.match(sitemap, /https:\/\/salaktutorialservices\.pages\.dev/);
  assert.match(robots, /https:\/\/salaktutorialservices\.pages\.dev\/sitemap\.xml/);
  assert.match(home, /property="og:image" content="https:\/\/salaktutorialservices\.pages\.dev\/assets\/hero-photo\.jpg"/);
});
