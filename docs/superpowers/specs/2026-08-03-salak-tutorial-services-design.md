# Salak Tutorial Services Website Design Specification

Date: 2026-08-03  
Status: Approved brief; awaiting review of written specification

## 1. Project objective

Create a motivational, multi-page business website for Salak Tutorial Services that builds trust with parents and converts local and international visitors into inquiries, assessment bookings, enrollments, and paying clients.

Success will be measured primarily through the number of qualified inquiries and completed enrollments during the first six months after launch. Secondary conversion events are assessment or session booking requests, payment-action clicks, and contact-channel clicks.

This is a new website rather than a replacement for an existing site.

## 2. Audiences and positioning

### Primary audience

Parents and guardians seeking structured academic support for children from pre-school through senior high school. Parent or guardian information is required when a student inquires or enrolls.

### Secondary audience

Students who may discover and explore the website themselves but need a parent or guardian involved in enrollment.

### Geographic audiences

- Local families near 3 Dover Street, J. Miranda Avenue, Naga City, Philippines, seeking face-to-face or online support.
- Filipino families living abroad seeking online tutorials.
- International families and students of any nationality seeking online tutorials.

The website must distinguish local face-to-face services from international online services without making either audience feel secondary.

### Curricula

The service intends to support the Philippine curriculum and international curricula. The exact supported international curricula must be supplied before those claims are published. Likely examples such as US, UK, IB, or Cambridge must not be presented as supported until Salak confirms tutor capability.

## 3. Brand and experience direction

- Brand colors: white, black, and `#197CC5`.
- Typeface: Montserrat family.
- Voice: motivational, warm, reassuring, clear, and academically credible.
- Visual balance: child-friendly enough for younger learners while remaining professional enough for parents and older students.
- Primary emotional outcome: parents should feel that Salak provides caring, structured, dependable academic support.
- Mobile experience is the priority, including lower-cost phones and slower connections.

The website may take inspiration from Tutorial Hub PH's attention-holding landing-page rhythm and progressive disclosure while scrolling. It must use Salak's own visual identity, structure, copy, imagery, and components rather than copying the reference.

## 4. Information architecture

### Home

A conversion-focused overview containing an introductory hero, trust signals, tutorial formats, learning levels, services preview, process, rates preview, testimonials, frequently asked questions, location details, and repeated calls to inquire, book, or enroll.

### About Salak

The center's story, mission, teaching philosophy, learning environment, tutor standards, and reasons parents can trust the center. This page primarily helps visitors understand what the center is and how it supports learners.

### Academic Services

Programs organized by learning level, subjects, tutorial format, and need. Potential categories include foundational learning, academic support, remediation, enrichment, homework support, and examination preparation. Only confirmed offerings will be published.

### Online Tutoring

A dedicated international landing page explaining supported curricula, session delivery, parental involvement, technology requirements, time-zone coordination, USD pricing, and the online enrollment process.

### Rates

PHP and USD options, package comparison, inclusions, eligibility, validity, scheduling, cancellation and rescheduling terms, refund rules, and payment actions.

### Tutors

Tutor profiles, qualifications, subject areas, supported curricula, learning levels, teaching approach, and safeguarding standards. Publication requires consent from each tutor.

### Testimonials

Parent and student outcomes. Testimonials involving minors require parent or guardian permission and should avoid unnecessary personal information.

### Book an Assessment or Session

A booking-request form for preferred dates and times. Submission does not guarantee a slot. Salak receives an email and manually confirms the schedule. This workflow is intentionally simpler and less costly than real-time calendar inventory.

### Online Enrollment

An enrollment form collecting student details, required parent or guardian details, selected program, curriculum, schedule preferences, and consent. The confirmation screen leads to the applicable payment method.

### FAQ

Answers covering formats, curricula, schedules, time zones, enrollment, payments, packages, cancellations, online requirements, and parental involvement.

### Contact and Location

Contact information is available in the global footer, persistent action buttons, and contextual calls to action. Supported channels are inquiry form, phone or SMS, email, Facebook Messenger, and Viber. Location content includes the Naga City address, map, and operating hours.

### Legal pages

Privacy notice, enrollment terms, payment and refund policy, and parental consent information.

## 5. Rates

| Plan | Philippine rate | International rate |
| --- | ---: | ---: |
| Hourly | PHP 400 per hour | USD 8 per hour |
| 20-hour package | PHP 4,000 | USD 80 |
| 30-hour package | PHP 5,000 | USD 100 |
| 40-hour package | PHP 6,000 | USD 120 |

Local and international pricing must be visibly separated. Currency is determined by the applicable service market rather than solely by the visitor's detected location. Package inclusions and policies must be confirmed before publication.

## 6. Functional design

### Contact and inquiry

- Visitors can choose an inquiry form, phone or SMS, email, Messenger, or Viber.
- Form submissions are stored in the database and emailed to Salak.
- Submissions show a clear success or failure state and do not silently fail.

### Booking requests

- Visitors provide student and parent or guardian details, service type, curriculum, time zone, and preferred schedule options.
- Times are stored with an explicit time-zone identifier.
- Salak receives an email notification.
- Staff reviews availability and sends a confirmation manually.
- The interface clearly labels the request as pending until confirmed.

### Enrollment

- Enrollment collects only the information required to assess and onboard the learner.
- Parent or guardian information and consent are mandatory for minors.
- Salak receives an email, and the submission is stored in the database.
- Visitors are directed to the appropriate PHP or USD payment path after submission.

### Payments

- The website does not collect or store card information.
- International USD payments use a hosted PayPal checkout or payment link.
- Philippine payments initially use GCash or bank transfer with a reference or proof-submission workflow.
- Staff manually verifies payment and confirms enrollment.
- Transaction fees may apply even when the website infrastructure has no monthly fee.
- Automated local card or wallet confirmation is outside the initial low-cost scope unless a payment gateway is selected and approved.

### Content management

Non-technical staff can update services, rates, tutor profiles, testimonials, FAQs, photos, schedules, and general page content through a visual editing interface. Permissions should prevent accidental changes to application logic or form handling.

### Analytics

Measure page views and conversion events without collecting unnecessary student data. Key events are inquiry submissions, booking requests, enrollment submissions, payment-action clicks, and contact-channel clicks.

## 7. Technical architecture

### Recommended stack

- Astro for the responsive, mostly static frontend.
- Cloudflare Pages for free-tier hosting and deployment.
- Sanity Studio for visually managed content.
- Cloudflare Workers for form endpoints and server-side validation.
- Cloudflare D1 for inquiries, booking requests, and enrollment records.
- Resend for transactional email notifications on its initial free tier.
- Cloudflare Web Analytics for lightweight measurement.
- Hosted payment pages for payment security and reduced implementation complexity.

This architecture minimizes recurring infrastructure costs, supports strong mobile performance, and gives staff a visual editing experience. Free-tier limits must be monitored, and the site may need a paid service later if usage grows.

### Data flow

1. Public page content is retrieved from the content management system and delivered through the static frontend.
2. A visitor submits an inquiry, booking request, or enrollment form.
3. A Cloudflare Worker validates and normalizes the submission.
4. Valid data is written to D1.
5. The server sends an email notification through Resend.
6. The visitor receives an on-screen confirmation and next steps.
7. Enrollment submissions direct the visitor to the appropriate hosted payment path.
8. Staff manually confirms the schedule and payment.

### Error handling and security

- Validate all form data on the server, regardless of browser validation.
- Add rate limiting and bot protection to public forms.
- Store secrets only in hosting-platform environment variables.
- Minimize data collected about minors and restrict database access.
- Do not expose submitted records through the public content editor.
- Log technical failures without logging sensitive form contents.
- Provide retry guidance and direct contact alternatives when a submission fails.
- Define a retention and deletion policy for inquiry and enrollment records before launch.

## 8. SEO, accessibility, and performance

- Prioritize local search intent around tutoring and academic support in Naga City.
- Give international online tutoring a dedicated, crawlable page.
- Use descriptive page titles, metadata, canonical URLs, structured data, and share images.
- Do not target unsupported curriculum or subject keywords.
- Use semantic headings, keyboard-accessible controls, visible focus states, sufficient contrast, descriptive alternative text, and appropriately sized touch targets.
- Optimize and responsively serve images, limit third-party scripts, and respect reduced-motion preferences.
- Test on mobile viewport sizes and simulated slower connections.

## 9. Content and asset intake

Salak already has brand and business materials. The owner may attach them in the conversation or place them in the project intake structure after it is created. Required asset groups are:

- Logo and brand files.
- Center and classroom photos.
- Tutor photos, biographies, qualifications, subjects, and curricula.
- Confirmed academic services and learning levels.
- Testimonials and publication consent.
- Contact details and social or messaging links.
- Operating hours and scheduling availability.
- Enrollment, cancellation, refund, and package-validity policies.
- GCash, bank, PayPal, and notification-email details.

Website copy will be written by the project team in Salak's approved motivational voice after the written specification is accepted.

## 10. Delivery phases

### Phase 1: Decisions and assets

Confirm remaining service, policy, scheduling, payment, privacy, and contact details. Organize supplied assets.

### Phase 2: Information architecture and visual design

Create wireframes and establish the responsive design system, navigation, typography, component language, photography treatment, and conversion flow. Obtain design approval before implementation.

### Phase 3: Content

Draft and review parent-focused local and international copy, services, tutor profiles, FAQs, rates explanations, and calls to action.

### Phase 4: Development

Build the pages and reusable components, configure content management, implement forms and data storage, send notifications, and connect hosted payment actions.

### Phase 5: Quality assurance

Test content, responsive behavior, accessibility, performance, SEO, form validation, email delivery, database writes, payment links, privacy behavior, and editor workflows.

### Phase 6: Launch and handoff

Publish to a free Cloudflare subdomain, train staff on content editing, verify analytics, and monitor production forms. Connect a custom domain after one is purchased.

A same-week launch is feasible only if assets, policy decisions, account access, and payment details are supplied promptly. Merchant or payment-account verification can delay the full payment workflow.

## 11. Pre-development decisions

The following must be resolved before affected features or claims are implemented:

- Exact international curricula and subjects supported by available tutors.
- Languages available for instruction.
- Tutor qualifications and consent to publish profiles.
- Center operating hours and online availability by time zone.
- Package validity, rescheduling, cancellations, refunds, and unused-hour rules.
- GCash, bank, and PayPal accounts and the proof-verification workflow.
- Tax and transaction-fee treatment for displayed prices.
- Parent or guardian consent wording and student-data retention period.
- Notification email, phone, Messenger, Viber, and map details.
- Final domain choice and purchase timing.

The default approved scheduling model is a booking request followed by manual staff confirmation. The default approved payment model is hosted or externally completed payment followed by manual verification.

## 12. Acceptance criteria

The launch candidate is acceptable when:

- Every approved page is available and usable on mobile and desktop.
- Staff can edit routine content without modifying code.
- Inquiry, booking, and enrollment forms validate, store records, and send email notifications.
- Booking requests correctly preserve the visitor's time zone and pending status.
- PHP and USD pricing and payment paths are clearly separated.
- No card data is handled by the Salak website.
- All contact channels work.
- Accessibility and performance checks reveal no launch-blocking issues.
- Privacy, enrollment, payment, and refund terms are published.
- Analytics records the agreed conversion events without sensitive student data.

