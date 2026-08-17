# Salak Tutorial Services Launch-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a launch-ready Salak Tutorial Services site with approved content and media, manual consultation handling, D1-backed enrollment records, Brevo notifications, Turnstile protection, and Cloudflare deployment instructions.

**Architecture:** Extend the existing static generator and Cloudflare Pages Functions without adding runtime dependencies. Keep business content centralized, render responsive pages from templates, store normalized form records in D1, generate enrollment IDs atomically in D1, and call Turnstile and Brevo through injected `fetch` for deterministic tests.

**Tech Stack:** Node.js ES modules, static HTML/CSS/JavaScript, Cloudflare Pages Functions, Cloudflare D1, Cloudflare Turnstile, Brevo Transactional Email API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-17-launch-readiness-design.md`

## Global Constraints

- Initial canonical origin is `https://salaktutorialservices.pages.dev` and must be overridable with `PUBLIC_SITE_URL`.
- Do not add a CMS, automatic calendar confirmation, public payment processing, tutor profiles, or paid dependencies.
- Consultation requests are manually confirmed within 24 hours.
- Public payment-reference pages and API routes must be removed.
- Original owner-supplied media stays under `elements/`; generated public assets are copied into `dist/assets/`.
- Use test-first development for every behavior change.
- Never commit API keys, Turnstile secrets, account identifiers, or payment credentials.

---

### Task 1: Approved content, contact details, policies, and routes

**Files:**
- Modify: `test/site.test.mjs`
- Modify: `src/content/site.mjs`
- Modify: `src/templates/layout.mjs`
- Modify: `src/templates/pages.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: centralized `site`, `businessHours`, `contactChannels`, and `policies` content consumed by page templates.
- Produces: 15 launch routes including `404.html` and excluding `payment/local/index.html`.

- [ ] **Step 1: Write failing public-site tests**

Add assertions that generated pages contain the supplied email, phone, Facebook URL, Monday-Saturday hours, 24-hour response promise, October 2022 date, approved payment methods, 12-hour notice policy, monthly validity and rollover rules, PHP-only installment terms, international fee rule, and Google Meet/Zoom copy. Assert the payment route and all `/payment/local/` links are absent, and `404.html` exists.

```js
assert.match(home, /salaktutorialservices@gmail\.com/);
assert.match(home, /\+63 969 628 3385/);
assert.match(contact, /Monday[^<]*Saturday/i);
assert.match(terms, /12 hours/i);
assert.doesNotMatch([...pages].join('\n'), /\/payment\/local\//);
await readFile(join(output, '404.html'), 'utf8');
```

- [ ] **Step 2: Run the site tests and verify RED**

Run: `node --test test/site.test.mjs`

Expected: failures for missing contact information, policy copy, removed route, and 404 page.

- [ ] **Step 3: Centralize approved content and update page copy**

Add exact business data to `src/content/site.mjs`. Render contact actions, policies, service limitations, online platforms, and payment rules from that data. Replace generic legal copy with the approved scheduling, package, installment, no-refund, retention, and staff-cancellation rules.

- [ ] **Step 4: Remove public payment-reference publishing and add 404**

Remove `paymentPage` from imports and routes, remove all public payment-reference links, and add a generated `404.html` page that directs visitors to Home, Contact, and Book a Consultation.

- [ ] **Step 5: Run the site tests and verify GREEN**

Run: `node --test test/site.test.mjs`

Expected: all site tests pass.

- [ ] **Step 6: Commit the content and route changes**

```powershell
git add test/site.test.mjs src/content/site.mjs src/templates/layout.mjs src/templates/pages.mjs scripts/build.mjs
git commit -m "feat: apply launch content and policies"
```

### Task 2: Brand treatment, approved photos, testimonials, and contact menu

**Files:**
- Modify: `test/site.test.mjs`
- Modify: `src/templates/layout.mjs`
- Modify: `src/templates/pages.mjs`
- Modify: `public/styles.css`
- Modify: `public/site.js`
- Modify: `scripts/build.mjs`
- Add: `elements/hero-photo.jpg`
- Add: `elements/center-session.jpg`
- Add: `elements/center-location.jpg`
- Add: `elements/tutors.jpg`
- Add: `elements/testi1.png`
- Add: `elements/testi2.png`
- Add: `elements/testi3.png`

**Interfaces:**
- Produces: generated assets named `hero-photo.jpg`, `center-session.jpg`, `center-location.jpg`, `tutors.jpg`, `testi1.png`, `testi2.png`, and `testi3.png`.
- Produces: `.contact-dock` markup with `tel:`, `sms:`, WhatsApp, and Messenger actions.

- [ ] **Step 1: Write failing media and brand tests**

Assert that build output contains byte-identical copies of all approved source images, page HTML references each intended asset, testimonial images use `Verified Parent Review` alt text, and brand markup separates `SALAK` from `TUTORIAL SERVICES` in all caps. Assert contact URLs use the supplied number and Facebook profile.

```js
assert.deepEqual(await readFile(join(output, 'assets/hero-photo.jpg')), await readFile('elements/hero-photo.jpg'));
assert.match(home, /<span class="brand-primary">SALAK<\/span>/);
assert.match(home, /wa\.me\/639696283385/);
assert.match(testimonials, /Verified Parent Review/g);
```

- [ ] **Step 2: Run the site tests and verify RED**

Run: `node --test test/site.test.mjs`

Expected: missing media outputs, old brand markup, and missing contact dock.

- [ ] **Step 3: Copy media and render it in the intended sections**

Update the build script to copy approved files. Replace CSS-only homepage and About placeholders with semantic `<img>` elements, render the location and team images, and replace placeholder testimonial quotes with the three anonymous screenshots.

- [ ] **Step 4: Implement the all-caps brand and floating contact menu**

Render separate brand spans and style `SALAK` as Montserrat 700+ in `#197CC5`; use high-contrast black or white for the secondary text. Add an accessible expandable mobile contact dock with SMS and Messenger visually equal, plus call and WhatsApp.

- [ ] **Step 5: Add favicon and social image metadata**

Copy the canonical logo as `assets/favicon.png`, use `assets/hero-photo.jpg` as the default Open Graph image, and render absolute social image URLs from the configurable canonical origin.

- [ ] **Step 6: Run site and syntax tests and verify GREEN**

Run: `node --test test/site.test.mjs`

Run: `node --check public/site.js`

Expected: all tests and syntax checks pass.

- [ ] **Step 7: Commit media and interface changes**

```powershell
git add elements src/templates public scripts/build.mjs test/site.test.mjs
git commit -m "feat: add approved media and contact actions"
```

### Task 3: Form contracts and enrollment policy consent

**Files:**
- Modify: `packages/contracts/test/contracts.test.mjs`
- Modify: `packages/contracts/src/index.mjs`
- Modify: `src/templates/pages.mjs`
- Modify: `test/site.test.mjs`

**Interfaces:**
- Produces: booking data fields `learnerAge` and `preferredContactMethod`.
- Produces: enrollment fields `learnerAge`, `policyConsent`, and optional server-assigned `enrollmentId`.
- Produces: required `turnstileToken` mapping from `cf-turnstile-response` at the API boundary, not in persisted learner data.

- [ ] **Step 1: Write failing contract tests**

Test that booking and enrollment reject missing or invalid learner ages, booking rejects unknown contact methods, and enrollment rejects absent policy consent.

```js
const result = validateEnrollment({ ...validEnrollment, learnerAge: 10, policyConsent: false });
assert.equal(result.ok, false);
assert.equal(result.fieldErrors.policyConsent, 'You must accept the service policies.');
```

- [ ] **Step 2: Run contract tests and verify RED**

Run: `node --test packages/contracts/test/contracts.test.mjs`

Expected: new validation assertions fail because fields are not validated.

- [ ] **Step 3: Implement minimal contract validation**

Accept integer ages from 3 through 21, restrict contact methods to `SMS`, `Facebook Messenger`, and `Phone call`, require boolean policy consent for enrollment, and preserve normalized values in returned data.

- [ ] **Step 4: Render matching form fields and consent copy**

Add age inputs, the consultation contact-method select, and a separate required enrollment policy checkbox linked to Terms and Payment Policy. Keep guardian consent distinct.

- [ ] **Step 5: Run contract and site tests and verify GREEN**

Run: `node --test packages/contracts/test/contracts.test.mjs test/site.test.mjs`

Expected: all selected tests pass.

- [ ] **Step 6: Commit form contract changes**

```powershell
git add packages/contracts src/templates/pages.mjs test/site.test.mjs
git commit -m "feat: collect launch enrollment details"
```

### Task 4: Turnstile verification and protected form rendering

**Files:**
- Modify: `functions/api/test/submissions.test.mjs`
- Modify: `functions/api/_submission.js`
- Modify: `src/templates/layout.mjs`
- Modify: `src/templates/pages.mjs`
- Modify: `public/site.js`
- Modify: `scripts/build.mjs`
- Modify: `.env.example`

**Interfaces:**
- Produces: `verifyTurnstile(token, remoteIp, env, fetcher) -> Promise<{ success: boolean }>`.
- Consumes: `TURNSTILE_SECRET_KEY` in Functions and `PUBLIC_TURNSTILE_SITE_KEY` at build time.

- [ ] **Step 1: Write failing API tests**

Add tests that reject a missing token when a secret is configured, reject a failed Turnstile response before D1 writes, and allow a verified token. Assert the verification request targets Cloudflare and includes `secret`, `response`, and optional `remoteip`.

- [ ] **Step 2: Run API tests and verify RED**

Run: `node --test functions/api/test/submissions.test.mjs`

Expected: spam-protection tests fail because no verification occurs.

- [ ] **Step 3: Implement server-side Turnstile verification**

Verify the token before normalization and database access. Return HTTP 400 for missing or invalid tokens and HTTP 503 when production protection is expected but its secret is unavailable. Preserve the honeypot fast-path.

- [ ] **Step 4: Render Turnstile and submit its token**

When `PUBLIC_TURNSTILE_SITE_KEY` is present, include the official Turnstile script, widget markup, and required CSP hosts. Ensure the form serializer includes `cf-turnstile-response`.

- [ ] **Step 5: Document environment variables**

Add `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to `.env.example` with non-secret placeholders.

- [ ] **Step 6: Run API, site, and syntax tests and verify GREEN**

Run: `node --test functions/api/test/submissions.test.mjs test/site.test.mjs`

Run: `node --check functions/api/_submission.js`

Expected: all selected checks pass.

- [ ] **Step 7: Commit Turnstile protection**

```powershell
git add functions src/templates public/site.js scripts/build.mjs .env.example test/site.test.mjs
git commit -m "feat: protect forms with Turnstile"
```

### Task 5: Atomic enrollment IDs and D1 persistence

**Files:**
- Modify: `functions/api/test/submissions.test.mjs`
- Modify: `functions/api/_submission.js`
- Add: `migrations/0002_launch_enrollment_ids.sql`

**Interfaces:**
- Produces: `nextEnrollmentId(db, now) -> Promise<string>` formatted as `STS-yyyy-mmdd-NNN` in Asia/Manila.
- Produces: stored `submissions.enrollment_id` for enrollment records.

- [ ] **Step 1: Write failing ID-generation tests**

Test the first and second enrollment on one Philippine date, the reset on the following date, ID inclusion in payload/API response, and the absence of IDs for inquiries and bookings.

```js
assert.equal(first.enrollmentId, 'STS-2026-0817-001');
assert.equal(second.enrollmentId, 'STS-2026-0817-002');
assert.equal(nextDay.enrollmentId, 'STS-2026-0818-001');
```

- [ ] **Step 2: Run API tests and verify RED**

Run: `node --test functions/api/test/submissions.test.mjs`

Expected: enrollment ID assertions fail.

- [ ] **Step 3: Add the D1 migration**

Add nullable unique `enrollment_id` to submissions and create `enrollment_sequences(sequence_date TEXT PRIMARY KEY, last_value INTEGER NOT NULL)`. Use an atomic SQLite UPSERT with `RETURNING last_value`.

- [ ] **Step 4: Generate and store enrollment IDs**

Use `Intl.DateTimeFormat` with `Asia/Manila` to derive the date key. Allocate the sequence immediately before inserting a validated enrollment and include the ID in both the normalized payload and dedicated column.

- [ ] **Step 5: Run API tests and verify GREEN**

Run: `node --test functions/api/test/submissions.test.mjs`

Expected: all API tests pass.

- [ ] **Step 6: Commit enrollment persistence**

```powershell
git add functions/api migrations/0002_launch_enrollment_ids.sql
git commit -m "feat: generate enrollment IDs"
```

### Task 6: Brevo admin and parent transactional emails

**Files:**
- Modify: `functions/api/test/submissions.test.mjs`
- Modify: `functions/api/_submission.js`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces: `sendBrevoEmail(message, env, fetcher) -> Promise<{ messageId?: string }>`.
- Consumes: `BREVO_API_KEY`, `NOTIFICATION_EMAIL`, `FROM_EMAIL`, and `REPLY_TO_EMAIL`.
- Produces API response `notifications: { admin: 'sent'|'failed'|'not-configured', parent: 'sent'|'failed'|'not-configured' }`.

- [ ] **Step 1: Write failing email-flow tests**

Assert D1 write happens before email calls, admin email contains every submitted field and enrollment ID, parent email contains the 24-hour/manual-confirmation wording, Brevo receives an `api-key` header, and one failed email does not discard the stored record.

- [ ] **Step 2: Run API tests and verify RED**

Run: `node --test functions/api/test/submissions.test.mjs`

Expected: tests fail because the handler still uses Resend and sends only one summary email.

- [ ] **Step 3: Replace Resend with Brevo**

POST to `https://api.brevo.com/v3/smtp/email` with the verified sender, reply-to Gmail address, HTML and text bodies, and escaped field values. Send the detailed admin message and parent acknowledgment independently after persistence.

- [ ] **Step 4: Return per-message status without losing data**

Use `Promise.allSettled` or equivalent independent error handling. Return `ok: true` with explicit admin and parent notification statuses after a successful D1 write.

- [ ] **Step 5: Update configuration documentation**

Replace Resend variables and instructions with Brevo account creation, Gmail sender verification, API-key setup, sender-replacement limitation, and Cloudflare secret configuration.

- [ ] **Step 6: Run API tests and verify GREEN**

Run: `node --test functions/api/test/submissions.test.mjs`

Expected: all API tests pass.

- [ ] **Step 7: Commit transactional email changes**

```powershell
git add functions/api/_submission.js functions/api/test/submissions.test.mjs .env.example README.md
git commit -m "feat: send booking confirmation emails"
```

### Task 7: Remove obsolete payment endpoint and finalize deployment configuration

**Files:**
- Delete: `functions/api/payment-references.js`
- Modify: `functions/api/_submission.js`
- Modify: `scripts/build.mjs`
- Modify: `test/site.test.mjs`
- Modify: `functions/api/test/submissions.test.mjs`
- Modify: `README.md`
- Modify: `wrangler.toml`

**Interfaces:**
- Produces: no public `payment-references` function route.
- Produces: canonical URL generation from `PUBLIC_SITE_URL` with default `https://salaktutorialservices.pages.dev`.

- [ ] **Step 1: Write failing removal and canonical tests**

Assert `handleSubmission` rejects `payment-references`, generated route metadata excludes the endpoint and page, sitemap/robots use the Pages URL by default, and a custom `PUBLIC_SITE_URL` replaces it in an isolated build process.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test test/site.test.mjs functions/api/test/submissions.test.mjs`

Expected: payment API remains accepted and canonical URLs remain hard-coded to `.com`.

- [ ] **Step 3: Remove the endpoint and parameterize canonical URLs**

Delete the Pages Function entry, remove the kind from the submission handler, and normalize `PUBLIC_SITE_URL` by trimming trailing slashes before generating robots, sitemap, Open Graph URLs, and schema URLs.

- [ ] **Step 4: Write exact launch instructions**

Document Cloudflare signup, GitHub connection, Pages build settings, D1 creation and both migrations, `DB` binding, Turnstile widget creation, Brevo sender/API setup, encrypted variables, Web Analytics enablement, and production form verification.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test test/site.test.mjs functions/api/test/submissions.test.mjs`

Expected: all focused tests pass.

- [ ] **Step 6: Commit route removal and deployment setup**

```powershell
git add functions scripts/build.mjs test/site.test.mjs README.md wrangler.toml
git commit -m "chore: finalize Cloudflare launch setup"
```

### Task 8: Full verification and browser QA

**Files:**
- Modify only if verification exposes a regression.

**Interfaces:**
- Consumes the complete production build.
- Produces verification evidence and a clean launch candidate.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Build and validate generated pages**

Run: `npm run build`

Run: `npm run check`

Expected: build and HTML/link checks exit successfully.

- [ ] **Step 3: Run syntax and whitespace checks**

Run: `node --check public/site.js`

Run: `node --check functions/api/_submission.js`

Run: `node --check scripts/build.mjs`

Run: `git diff --check`

Expected: every command exits with code 0.

- [ ] **Step 4: Run local browser QA**

Verify desktop and mobile header behavior, all approved photos, anonymous testimonial legibility, PHP/USD rate toggle, contact dock keyboard operation, form fields and validation, temporary canonical metadata, 404 page, and absence of public payment-reference links.

- [ ] **Step 5: Inspect Git state and commit verification fixes if required**

Run: `git status --short`

Expected: no uncommitted implementation changes. If QA required a fix, follow a new RED/GREEN cycle and commit it before repeating verification.

### Task 9: Account and production deployment handoff

**Files:**
- No source changes unless real deployment reveals a documented configuration correction.

**Interfaces:**
- Consumes owner-created Cloudflare and Brevo accounts.
- Produces the live `salaktutorialservices.pages.dev` deployment.

- [ ] **Step 1: Create or sign in to Cloudflare**

The owner creates the account and completes any email or MFA challenge. Create the Pages project using the GitHub repository, `npm run build`, and `dist`.

- [ ] **Step 2: Configure D1 and Turnstile**

Create D1, execute migrations `0001` and `0002`, bind it as `DB`, create a Turnstile widget for the Pages hostname, and set its public and secret keys in the correct Cloudflare variable scopes.

- [ ] **Step 3: Create or sign in to Brevo**

The owner verifies `salaktutorialservices@gmail.com`, creates an API key, and stores it as `BREVO_API_KEY` in Cloudflare together with notification, sender, and reply-to variables.

- [ ] **Step 4: Enable analytics and deploy**

Enable Cloudflare Web Analytics, deploy the latest branch, and confirm the hostname is `salaktutorialservices.pages.dev`.

- [ ] **Step 5: Perform production smoke tests**

Submit one inquiry, consultation, and enrollment. Confirm each D1 row, the automatic enrollment ID, the detailed admin email, the parent acknowledgment, Turnstile enforcement, contact actions, photos, sitemap, robots, and 404 behavior.
