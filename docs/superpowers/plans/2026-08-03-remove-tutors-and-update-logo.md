# Tutor Page Removal and Logo Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the canonical website logo with the user-supplied asset and completely remove the Our Tutors navigation item, route, sitemap entry, page renderer, and CMS schema.

**Architecture:** Keep the existing static generator and shared navigation model. Canonicalize the uploaded image to `elements/logo.png`, then remove the tutor feature at its source boundaries so the build no longer generates or links the route. Regression tests verify both the asset pipeline and absence of the retired route.

**Tech Stack:** Node.js 22+, Node test runner, zero-dependency static generator, Cloudflare Pages output, Sanity schema scaffold.

## Global Constraints

- Preserve the user-supplied replacement logo currently at `elements/updated logo.png`.
- The canonical build input remains `elements/logo.png`; the generic uploaded filename must not remain after migration.
- Remove `/tutors/` completely without a redirect.
- Retain ordinary copy references to tutors where they describe tutoring services.
- Do not alter owner-supplied rates, contact configuration, payment behavior, or policies.
- Do not push or deploy.

---

### Task 1: Canonicalize and verify the replacement logo

**Files:**
- Modify: `test/site.test.mjs`
- Replace: `elements/logo.png` using `elements/updated logo.png`

**Interfaces:**
- Consumes: `buildSite(outputDir)` from `scripts/build.mjs`.
- Produces: a canonical `elements/logo.png` copied byte-for-byte to `dist/assets/logo.png`.

- [ ] **Step 1: Write the failing asset-pipeline test**

Add imports for `stat` and a test that builds into a temporary directory, reads `elements/logo.png` and the generated `assets/logo.png`, and asserts the buffers are deeply equal:

```js
test('copies the canonical replacement logo into the build', async () => {
  const output = await mkdtemp(join(tmpdir(), 'salak-logo-'));
  await buildSite(output);
  const source = await readFile(join(process.cwd(), 'elements', 'logo.png'));
  const built = await readFile(join(output, 'assets', 'logo.png'));
  assert.deepEqual(built, source);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test test/site.test.mjs`

Expected: FAIL with `ENOENT` for `elements/logo.png`, because the old canonical asset was removed and the replacement is not yet canonicalized.

- [ ] **Step 3: Apply the minimal asset migration**

Move `elements/updated logo.png` to `elements/logo.png` using a literal, workspace-verified path. Do not edit or recompress the image.

- [ ] **Step 4: Run the page tests and verify green**

Run: `node --test test/site.test.mjs`

Expected: all current page tests plus the asset-pipeline test PASS.

---

### Task 2: Remove the tutor route from the public site

**Files:**
- Modify: `test/site.test.mjs`
- Modify: `src/content/site.mjs`
- Modify: `src/templates/pages.mjs`
- Modify: `scripts/build.mjs`
- Modify: `apps/studio/schemaTypes/index.ts`

**Interfaces:**
- Consumes: `navigation` from `src/content/site.mjs` and the `routes` map internal to `scripts/build.mjs`.
- Produces: 15 public HTML routes with no `/tutors/` output, navigation entry, sitemap entry, renderer, or tutor CMS document type.

- [ ] **Step 1: Write the failing removal regression test**

Remove `tutors/index.html` from the expected route list. Extend the homepage hierarchy test with:

```js
assert.doesNotMatch(html, /href="\/tutors\/"|>Our Tutors</);
```

Add a dedicated route-absence test:

```js
test('does not publish the retired tutor route', async () => {
  const output = await mkdtemp(join(tmpdir(), 'salak-no-tutors-'));
  await buildSite(output);
  await assert.rejects(readFile(join(output, 'tutors', 'index.html')), { code: 'ENOENT' });
  const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /\/tutors\//);
});
```

- [ ] **Step 2: Run the regression test and verify the expected failure**

Run: `node --test test/site.test.mjs`

Expected: FAIL because the homepage still links `Our Tutors` and the generator still emits `tutors/index.html`.

- [ ] **Step 3: Remove the feature at its source boundaries**

Apply these exact changes:

1. Delete `['Our Tutors', '/tutors/']` from `navigation` in `src/content/site.mjs`.
2. Delete the exported `tutorsPage()` function from `src/templates/pages.mjs`.
3. Remove `tutorsPage` from the import list and `['tutors/index.html', tutorsPage]` from the route map in `scripts/build.mjs`.
4. Delete the `tutor` document type declaration and remove `tutor` from `schemaTypes` in `apps/studio/schemaTypes/index.ts`.

- [ ] **Step 4: Run the focused tests and verify green**

Run: `node --test test/site.test.mjs`

Expected: all tests PASS and the generated route count is 15.

---

### Task 3: Verify and commit the complete change

**Files:**
- Verify all changed files from Tasks 1 and 2.
- Preserve: `docs/superpowers/specs/2026-08-03-remove-tutors-and-placeholder-audit-design.md`
- Preserve: `docs/superpowers/plans/2026-08-03-remove-tutors-and-update-logo.md`

**Interfaces:**
- Consumes: the complete repository test and build scripts.
- Produces: one clean main-branch implementation commit with the updated logo and retired tutor route.

- [ ] **Step 1: Run the complete verification suite**

Run:

```powershell
npm test
npm run build
npm run check
node --check scripts/build.mjs
git diff --check
```

Expected: 0 failures, `Built 15 routes`, `Checked 15 HTML pages`, no syntax errors, and no whitespace errors.

- [ ] **Step 2: Verify repository and generated output state**

Run:

```powershell
git status --short
rg -n "Our Tutors|/tutors/|tutors/index.html" src scripts apps test
```

Expected: only intentional modified files are present and the search returns no production or test references to the retired route. Ordinary lower-case prose references to tutors may remain.

- [ ] **Step 3: Commit the implementation**

Run:

```powershell
git add elements/logo.png test/site.test.mjs src/content/site.mjs src/templates/pages.mjs scripts/build.mjs apps/studio/schemaTypes/index.ts
git commit -m "feat: remove tutor page and update logo"
```

- [ ] **Step 4: Confirm clean final status**

Run: `git status --short`

Expected: no output.
