# Salak Tutorial Services website

An original, parent-first website for Salak Tutorial Services, inspired by the information hierarchy and scroll rhythm of Tutorial Hub PH. It does not copy that site's brand, copy, or assets.

## What is included

- 16 responsive public pages, including About, Services, Online Tutoring, Rates, Booking, Enrollment, Contact, FAQs, policies, and local payment reference submission.
- Separate PHP and USD rate views.
- Cloudflare Pages Functions for inquiries, bookings, enrollments, and payment references.
- Cloudflare D1 storage with a migration and optional Resend email notifications.
- A separate Sanity Studio schema scaffold for staff-friendly content editing in phase two.
- Sitemap, robots file, structured data, metadata, keyboard-friendly navigation, and reduced-motion support.

## Run locally

Node.js 22 or newer is the only requirement for the public site.

```powershell
npm test
npm run build
npm run dev
```

Open `http://localhost:4321`. The local zero-dependency server previews the pages; production forms require Cloudflare Pages Functions and D1.

## Required details before launch

Set `PUBLIC_CONTACT_EMAIL` and optionally `PUBLIC_CONTACT_PHONE` in the build environment. Without an email value, the site uses the inquiry form and does not print a made-up public address.

Replace placeholder testimonials with verified family stories only after obtaining consent. Confirm the payment channel, scheduling/cancellation rules, and final privacy-policy wording before accepting payments.

## Free Cloudflare deployment

1. Push this branch to a GitHub repository.
2. In Cloudflare Pages, create a project from the repository.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Create a D1 database, then add it to the Pages project as a binding named `DB`.
5. Apply `migrations/0001_submissions.sql` to that database from the Cloudflare dashboard or Wrangler CLI.
6. Add encrypted environment variables: `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, and `FROM_EMAIL`.
7. Add build variables: `PUBLIC_CONTACT_EMAIL` and, if desired, `PUBLIC_CONTACT_PHONE`.
8. Deploy, submit each form once, and verify both the D1 row and notification email.

Resend's free tier can be used initially, but sender-domain verification is required for a branded `FROM_EMAIL`. Never commit API keys.

## Git connection and the earlier push error

If GitHub already contains a README or another initial commit, synchronize before pushing:

```powershell
git remote -v
git fetch origin
git pull --rebase origin main
git push -u origin main
```

If the remote default branch is not `main`, substitute its real name. Do not force-push unless you have intentionally decided to overwrite the remote history.

## Phase-two content editing

The public site currently builds from the reviewed content in `src/content/site.mjs`. The Sanity scaffold lives in `apps/studio` and includes settings, services, tutors, testimonials, FAQs, and rate plans.

When the team is ready for editing:

```powershell
cd apps/studio
npm install
npm run dev
```

Create a free Sanity project, set the two `SANITY_STUDIO_*` variables, seed reviewed content, and add a build-time content fetch to the public generator. Keeping this as phase two lets the initial public launch remain fast and low-maintenance.

## Data handling

Inquiry records should be deleted after 12 months when no longer needed. Enrollment and transaction records should be reviewed after 24 months, subject to legal or accounting requirements. Restrict Cloudflare and Sanity accounts with individual logins and multi-factor authentication.
