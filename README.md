# Salak Tutorial Services website

An original, parent-first website for Salak Tutorial Services, inspired by the information hierarchy and scroll rhythm of Tutorial Hub PH. It does not copy that site's brand, copy, or assets.

## What is included

- Responsive public pages for About, Services, Online Tutoring, Rates, Booking, Enrollment, Contact, FAQs, testimonials, and policies.
- Separate PHP and USD rate views.
- Cloudflare Pages Functions for inquiries, enrollments, PayMongo PHP checkout, PayPal USD checkout, and automated payment confirmation.
- Cloudflare D1 storage, automatic daily enrollment IDs, Brevo email notifications, and Cloudflare Turnstile protection.
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

The approved contact details, policies, photos, and anonymous testimonials are included. Create the external accounts and variables listed in `.env.example` before enabling production forms.

## Free Cloudflare deployment

1. Push this branch to a GitHub repository.
2. In Cloudflare Pages, create a project from the repository.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Create a D1 database, then add it to the Pages project as a binding named `DB`.
5. Apply all SQL files in `migrations/` in filename order.
6. Create a free Brevo account, verify `salaktutorialservices@gmail.com` as a sender, then add encrypted variables `BREVO_API_KEY`, `NOTIFICATION_EMAIL`, and `FROM_EMAIL`.
7. Create a Cloudflare Turnstile widget for the Pages hostname. Add `PUBLIC_TURNSTILE_SITE_KEY` as a build variable and `TURNSTILE_SECRET_KEY` as an encrypted variable.
8. Set `PUBLIC_SITE_URL=https://salak-tutorial-services.pages.dev`.
9. Deploy, submit every form once, and verify the D1 row, Salak notification, parent confirmation, and enrollment ID.

Brevo may replace the technical From address when a free Gmail sender is used; replies still route through the configured reply-to address. Never commit API keys.

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
