# Tutor Page Removal and Launch Placeholder Audit

Date: 2026-08-03
Status: Approved design

## Objective

Remove the Our Tutors navigation item and the `/tutors/` page completely. Preserve the user-supplied replacement logo and identify every remaining owner-provided value or policy needed before launch.

## Navigation and Routing

- Remove `Our Tutors` from the shared primary navigation used on desktop and mobile.
- Remove `/tutors/` from the production route map and generated sitemap.
- Remove the tutor page renderer and its page-specific content.
- Do not add a redirect because the website has not launched and has no established tutor-page backlinks.
- Remove the unused tutor document type from the phase-two Sanity schema.
- Retain ordinary references to tutors as service providers where the copy describes how tutoring works; only the dedicated page and navigation destination are removed.

## Logo

- Treat the user-supplied `elements/updated logo.png` as the replacement logo.
- Replace the canonical `elements/logo.png` asset with that image, then continue copying it to `dist/assets/logo.png` during builds. Do not retain the generic upload filename after the replacement is verified.
- Verify that the replacement renders through the existing header and footer image elements without changing its content.

## Launch Placeholder Checklist

The following inputs remain owner decisions before production launch:

1. Public contact email.
2. Optional public phone or WhatsApp number.
3. Private notification inbox.
4. Verified notification sender email/domain.
5. Resend API key.
6. Final public website domain and canonical sitemap base URL.
7. Three consented testimonials, or a decision to withhold the Testimonials page.
8. Local payment method and account instructions.
9. International payment method.
10. Enrollment ID format and assignment workflow.
11. Cancellation and rescheduling window.
12. Missed-session policy.
13. Monthly-package validity and unused-hour rules.
14. Refund or credit policy.
15. Business hours and expected response time.
16. Final confirmation of the published Naga City address.
17. Final privacy-policy review and responsible contact person.
18. Sanity project ID and dataset only if the visual editing dashboard is enabled.
19. Optional real center or learner photography, with consent; the current abstract learning graphics may remain.

Test fixtures using example domains are not launch placeholders and must remain isolated to automated tests.

## Verification

- Add a route regression test that fails while `/tutors/` is still generated.
- Add a navigation regression assertion that fails while `Our Tutors` remains in the homepage navigation.
- Run the full test suite, production build, page-integrity check, and Git whitespace check.
- Confirm the resulting build contains 15 public HTML routes and no `/tutors/` output.
- Confirm the user-modified logo is included in the final commit.

## Out of Scope

- Rewriting unrelated tutor references in service copy.
- Creating payment credentials, policy decisions, testimonials, or Sanity accounts without owner-provided information.
- Deploying or pushing to GitHub.
