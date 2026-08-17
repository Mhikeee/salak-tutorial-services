# Salak Tutorial Services Launch-Readiness Design

## Objective

Prepare the existing Salak Tutorial Services website for an initial launch on the free Cloudflare Pages address `https://salaktutorialservices.pages.dev`. The release must present accurate business information, use approved real photos and anonymous testimonials, collect consultation and enrollment requests reliably, notify staff and parents by email, and keep scheduling and payments under manual staff control.

## Delivery Approach

Retain the existing zero-dependency static-site generator and Cloudflare Pages Functions architecture. Cloudflare Pages serves the generated site, Cloudflare D1 stores form submissions, Cloudflare Turnstile protects public forms, Cloudflare Web Analytics measures site usage, and Brevo sends transactional email.

This launch will not add a CMS, automatic calendar booking, public payment processing, or a tutor-profile directory. Those additions are outside the immediate low-cost launch scope.

## Brand and Header

- The header and footer brand text must read `SALAK TUTORIAL SERVICES` in all caps.
- `SALAK` uses Montserrat Bold and `#197CC5`.
- `TUTORIAL SERVICES` uses Montserrat Bold and black in the header; the footer may use white where required for contrast.
- The approved logo remains the canonical logo asset.
- The established white, black, and `#197CC5` brand palette remains unchanged.

## Public Business Information

- Public email: `salaktutorialservices@gmail.com`.
- Notification inbox: `salaktutorialservices@gmail.com`.
- Public phone: `+63 969 628 3385`.
- The phone supports calls, SMS, and WhatsApp.
- Facebook Page: `https://www.facebook.com/profile.php?id=100086394308897`.
- Address: `3 Dover Street, J. Miranda Avenue, Naga City, Philippines`.
- Google Maps listing: `Salak Tutorial Services (Main)`.
- Business hours: Monday through Saturday, 9:00 AM to 7:00 PM Philippine time.
- International online sessions may be arranged outside standard business hours.
- Staff responds to inquiries, consultation requests, and enrollments within 24 hours.
- The center was established in October 2022. The site will not invent a founding story or unsupported statistics.

## Contact Experience

- The utility bar, footer, and contact page expose the public email, phone, address, and Facebook Page.
- Mobile visitors receive a floating contact menu with equally prominent SMS and Facebook Messenger actions plus phone and WhatsApp actions.
- Consultation follow-up preferences are SMS, Facebook Messenger, or phone call.
- The consultation form allows the parent to select a preferred contact method.

## Approved Media

The following owner-supplied files have publication permission for every identifiable person:

- `elements/hero-photo.jpg`: homepage hero image.
- `elements/center-session.jpg`: in-person learning or center-session image.
- `elements/center-location.jpg`: location image for About or Contact content.
- `elements/tutors.jpg`: About-page team image captioned `Our Tutorial Team`; no individual tutor profiles or names.
- `elements/testi1.png`, `elements/testi2.png`, and `elements/testi3.png`: anonymous, consented testimonials labeled `Verified Parent Review`.

The site does not require an online-tutoring photograph for launch. The current branded graphic treatment remains for that section. Build output must copy and serve optimized versions of approved media while retaining the original source files.

## Services and Learning Arrangements

- Salak serves learners from pre-school through senior high school.
- Face-to-face and online tutorials are available.
- Both one-to-one and group tutorials are available.
- No maximum group size is advertised; group arrangements depend on learner needs and tutor availability.
- All rates are per learner.
- Google Meet and Zoom are the supported online platforms.
- Salak provides practice tests and learning exercises.
- Families provide the learner's device and reliable internet access for online sessions.
- Learners may share current lessons, assignments, and review coverage so tutorials align with schoolwork.
- All subjects, specialized SHS subjects, and international curricula remain subject to tutor availability.
- There are no registration, material, platform, or enrollment fees beyond the published tutorial rates.

## Rates and Payment Rules

Published rates remain:

- Philippines hourly: PHP 400 per learner per hour.
- Philippines monthly: PHP 4,000 for 20 hours; PHP 5,000 for 30 hours; PHP 6,000 for 40 hours.
- International hourly: USD 8 per learner per hour.
- International monthly: USD 80 for 20 hours; USD 100 for 30 hours; USD 120 for 40 hours.

Payment rules:

- Philippine hourly sessions are paid in full before the scheduled session.
- Philippine monthly packages may be paid in two installments: 50% before tutorials begin and the remaining 50% halfway through the package.
- The installment option applies only to PHP clients.
- International clients pay in full before tutorials begin.
- International clients cover transaction and currency-conversion fees so Salak receives the full USD amount.
- Accepted local methods are cash, GCash, Maya, BDO, GoTyme, and other bank transfers.
- Accepted international methods are PayPal and international bank transfer.
- Account details are never published. Staff sends them privately after confirming the learner plan and schedule.
- Receipt screenshots and payment reference numbers are exchanged privately with staff after confirmation.
- The public payment-reference page, route, navigation links, API route, and associated launch copy are removed.
- The policy states that payments are non-refundable. If Salak or the tutor cancels, the family receives a free reschedule or session credit.

## Scheduling and Package Policies

- Consultation requests are free and do not automatically reserve a schedule.
- Staff manually reviews every consultation request and contacts the parent within 24 hours.
- A cancellation or rescheduling request requires at least 12 hours' advance notice.
- Valid notice channels are email, SMS, WhatsApp, Facebook Messenger, or direct communication with the assigned tutor.
- With at least 12 hours' notice, the session may be rescheduled at no extra charge.
- A missed session or late cancellation counts as used.
- A monthly package is valid for one month beginning on the learner's first scheduled session.
- Excused unused hours may roll into the immediately following month and expire at the end of that month.
- If Salak or the assigned tutor cancels, the family receives a free reschedule or session credit.
- Parents must explicitly accept scheduling, missed-session, validity, payment, and no-refund policies before submitting enrollment.

## Consultation and Enrollment Forms

All public forms retain guardian consent and server-side validation. Consultation and enrollment remain distinct workflows.

Consultation form behavior:

- Collect guardian name, email, phone, country, learner name, age, year level, delivery mode, preferred plan, preferred date, preferred time, time zone, preferred contact method, and learning needs.
- Accept SMS, Facebook Messenger, or phone call as follow-up preferences.
- Treat the selected time as a request until staff confirms it manually.

Enrollment form behavior:

- Collect guardian and learner details, including learner age and year level but not date of birth.
- Collect school, curriculum, selected plan, delivery mode, and learning needs.
- Require acceptance of the approved service and payment policies.
- Generate an enrollment ID immediately after valid submission in the format `STS-yyyy-mmdd-001`.
- Reset the three-digit sequence each Philippine calendar day and increment it safely for each enrollment.
- Include the generated enrollment ID in the stored record, API response, admin notification, and parent confirmation.

## Submission Data and Email Flow

For inquiries, consultations, and enrollments:

1. The browser submits JSON to the relevant Cloudflare Pages Function.
2. The function validates the request and verifies a Cloudflare Turnstile token.
3. The function stores the complete normalized record in Cloudflare D1 before attempting email.
4. Brevo sends a detailed notification to `salaktutorialservices@gmail.com` containing all relevant submitted fields.
5. Brevo sends the parent an automatic receipt stating that the request was received and will be reviewed within 24 hours.
6. The parent confirmation does not claim that a tutor, schedule, or enrollment is confirmed.
7. The browser redirects to the thank-you page only after the database write succeeds.

Brevo setup:

- Sender display name: `Salak Tutorial Services`.
- Verified sender during the free-domain launch: `salaktutorialservices@gmail.com` where Brevo permits it.
- Reply-to address: `salaktutorialservices@gmail.com`.
- Brevo may replace the technical sender address until a custom domain is purchased; the site and setup documentation disclose this operational limitation.
- The API key remains an encrypted Cloudflare secret and is never committed.

Email failures must not erase an already stored request. The API response records whether admin and parent messages were sent, skipped, or failed. Staff can recover the full request from D1.

## Database Design

The D1 `submissions` table remains the canonical record of inquiry, booking, and enrollment submissions. The migration adds an `enrollment_id` field and a uniqueness constraint or dedicated sequence mechanism sufficient to prevent duplicate enrollment IDs for accepted requests.

Data retention policy:

- Inquiry and consultation records: up to 12 months.
- Enrollment and transaction records: up to 24 months, subject to legal or accounting requirements.
- Privacy requests use `salaktutorialservices@gmail.com`.

## Spam Protection and Analytics

- Cloudflare Turnstile protects inquiry, consultation, and enrollment forms.
- Turnstile verification occurs server-side before the database write.
- Existing honeypot protection remains as a low-cost secondary layer.
- Cloudflare Web Analytics is enabled during deployment.
- No advertising trackers or marketing cookies are added.

## Domain and SEO

- Initial canonical origin: `https://salaktutorialservices.pages.dev`.
- Sitemap and robots output use the initial canonical origin instead of the unowned `.com` domain.
- The origin must be configurable so a purchased domain can replace it later without editing every template.
- Use the hero image as the default social-sharing image.
- Add a favicon derived from the approved logo.
- Add a custom 404 page.

## Content Editing

The first launch continues to build from repository content files. Sanity Studio is postponed. Non-technical content changes will be performed through AI-assisted edits to the project files.

## Launch Dependencies

The owner must create:

- A free Cloudflare account for Pages, D1, Turnstile, and Web Analytics.
- A free Brevo account with `salaktutorialservices@gmail.com` registered and verified as a sender.

The implementation must provide exact setup instructions for project creation, D1 binding and migration, Turnstile keys, Brevo API key, environment variables, deployment, and end-to-end form verification.

## Testing and Acceptance Criteria

- Automated tests verify content, routes, approved media copying, all-caps brand markup, policies, contact links, and temporary canonical URLs.
- Contract tests verify learner age, preferred contact method, policy consent, Turnstile token handling, and enrollment ID data.
- API tests verify D1-first persistence, daily enrollment-ID generation, detailed admin email, parent acknowledgment, Turnstile rejection, and graceful email failure.
- The removed payment-reference page and API route return no published build route.
- The full test suite, production build, HTML/link checker, JavaScript syntax checks, and `git diff --check` pass.
- Browser verification covers desktop and mobile navigation, photo rendering, testimonial legibility, rate toggles, floating contact actions, form validation, accessibility basics, and absence of the payment-reference route.
- Deployment is complete only after production submissions create D1 records and both admin and parent emails are verified in real inboxes.
