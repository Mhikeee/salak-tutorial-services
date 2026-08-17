import { navigation, site } from '../content/site.mjs';

const escapeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function layout({ title, description = site.description, path = '/', body, pageClass = '' }) {
  const fullTitle = title === 'Home' ? `${site.name} | Learning support that moves with your child` : `${title} | ${site.name}`;
  const nav = navigation.map(([label, href]) => `<a href="${href}"${path === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const emailLink = site.email ? `<a href="mailto:${site.email}">${site.email}</a>` : '';
  const canonical = `${site.origin}${path}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: site.name,
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3 Dover Street, J. Miranda Avenue',
      addressLocality: 'Naga City',
      addressCountry: 'PH',
    },
    areaServed: ['Philippines', 'Worldwide'],
    url: site.origin,
    telephone: site.phone,
    email: site.email,
  };
  const launchSections = {
    '/about/': '<section class="section"><div class="wrap media-pair"><figure><img src="/assets/center-location.jpg" alt="Salak Tutorial Services main center"><figcaption>Salak Tutorial Services (Main)</figcaption></figure><figure><img src="/assets/tutors.jpg" alt="The Salak tutorial team"><figcaption>Our Tutorial Team</figcaption></figure></div><p class="center">Serving families since October 2022.</p></section>',
    '/testimonials/': '<section class="section"><div class="wrap quote-grid"><figure class="review-card"><img src="/assets/testi1.png" alt="Anonymous parent testimonial"><figcaption>Verified Parent Review</figcaption></figure><figure class="review-card"><img src="/assets/testi2.png" alt="Anonymous parent testimonial"><figcaption>Verified Parent Review</figcaption></figure><figure class="review-card"><img src="/assets/testi3.png" alt="Anonymous parent testimonial"><figcaption>Verified Parent Review</figcaption></figure></div></section>',
    '/rates/': '<section class="section soft"><div class="wrap narrow prose"><h2>Payment arrangements</h2><p>All rates are per learner. PHP monthly clients may pay in full or make a 50% initial installment, with the remaining 50% due halfway through the package. Hourly and USD plans are paid in full.</p><p>Philippine checkout uses PayMongo for GCash, Maya, cards, and supported online banking. International USD checkout uses PayPal at the published rate, with Salak absorbing PayPal processing fees.</p></div></section>',
    '/online-tutoring/': '<section class="section soft"><div class="wrap narrow prose"><h2>What online families need</h2><p>Sessions may use Google Meet or Zoom. The family provides a suitable device and reliable internet plus relevant school materials; Salak provides practice tests and exercises. Curriculum and specialized subjects are subject to tutor availability.</p></div></section>',
    '/contact/': `<section class="section soft"><div class="wrap narrow prose"><h2>Salak Tutorial Services (Main)</h2><p>${site.hours}. We respond within 24 hours.</p><p><a href="${site.maps}" target="_blank" rel="noopener">Open in Google Maps</a></p></div></section>`,
    '/terms/': '<section class="section soft"><div class="wrap narrow prose"><h2>Attendance and scheduling</h2><p>Please give at least 12 hours notice to reschedule. Missed or late-cancelled sessions count as used. An excused unused session may move only to the immediately following month. If Salak or the tutor cancels, the session is rescheduled or credited at no cost.</p><p>Online lessons require a suitable device and reliable internet. Services and specialized subjects are subject to tutor availability.</p></div></section>',
    '/payment-policy/': '<section class="section soft"><div class="wrap narrow prose"><h2>Package validity and refunds</h2><p>A monthly package begins on the first scheduled session and is consumable within that month, except an approved excused rollover to the immediately following month. Payments are non-refundable.</p></div></section>',
  };
  const formSecurity = site.turnstileSiteKey && ['/book/', '/enroll/', '/contact/'].includes(path)
    ? `<div class="wrap turnstile-wrap"><div class="cf-turnstile" data-sitekey="${site.turnstileSiteKey}"></div></div><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#197CC5">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${site.origin}/assets/hero-photo.jpg">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="stylesheet" href="/assets/home-media.css">
  <script type="application/ld+json">${escapeJson(schema)}</script>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/checkout.js" defer></script>
</head>
<body class="${pageClass}">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="utility"><div class="wrap utility-inner"><span>Supporting learners in Naga City and worldwide</span><div>${emailLink}<span class="utility-divider">|</span><a href="tel:${site.phoneCompact}">${site.phone}</a></div></div></div>
  <header class="site-header">
    <div class="wrap nav-row">
      <a class="brand" href="/" aria-label="Salak Tutorial Services home"><img src="/assets/logo.png" alt="" width="60" height="60"><span class="brand-text"><span class="brand-primary">SALAK</span><span class="brand-secondary">TUTORIAL SERVICES</span></span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span><span class="sr-only">Open menu</span></button>
      <nav id="primary-nav" aria-label="Primary navigation">${nav}<a class="button button-small" href="/enroll/">Enroll now</a></nav>
    </div>
  </header>
  <main id="main">${body}${formSecurity}${launchSections[path] || ''}</main>
  <section class="closing-cta">
    <div class="wrap closing-grid"><div><p class="eyebrow light">A brighter next step starts here</p><h2>Let us build the right learning plan together.</h2></div><div class="button-row"><a class="button button-white" href="/enroll/">Enroll now</a><a class="text-link light" href="/rates/">View rates <span aria-hidden="true">&rarr;</span></a></div></div>
  </section>
  <footer>
    <div class="wrap footer-grid">
      <div><a class="brand brand-footer" href="/"><img src="/assets/logo.png" alt="" width="64" height="64"><span>Salak <small>Tutorial Services</small></span></a><p>Motivating, guided academic support from pre-school to senior high school.</p></div>
      <div><h2>Explore</h2><a href="/about/">Who We Are</a><a href="/services/">Academic Services</a><a href="/rates/">Rates</a><a href="/testimonials/">Family Stories</a></div>
      <div><h2>Get started</h2><a href="/enroll/">Enroll now</a><a href="/contact/">Contact us</a></div>
      <div><h2>Visit or connect</h2><p>${site.address}</p><p>${site.hours}</p>${emailLink}<a href="tel:${site.phoneCompact}">${site.phone}</a><a href="${site.facebook}" target="_blank" rel="noopener">Facebook</a></div>
    </div>
    <div class="wrap footer-bottom"><span>&copy; ${new Date().getFullYear()} ${site.name}</span><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/payment-policy/">Payment policy</a></div></div>
  </footer>
  <nav class="contact-dock" aria-label="Quick contact"><a href="sms:${site.phoneCompact}">SMS</a><a href="${site.facebook}" target="_blank" rel="noopener">Messenger</a><a href="tel:${site.phoneCompact}">Call</a><a href="https://wa.me/${site.phoneCompact.replace('+', '')}" target="_blank" rel="noopener">WhatsApp</a></nav>
</body>
</html>`;
}

export function pageHero(kicker, title, copy, actions = '') {
  return `<section class="page-hero"><div class="wrap narrow"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lead">${copy}</p>${actions}</div></section>`;
}

export function formField({ label, name, type = 'text', required = true, options, autocomplete = '', placeholder = '' }) {
  const req = required ? ' required' : '';
  if (options) return `<label><span>${label}${required ? ' *' : ''}</span><select name="${name}"${req}><option value="">Choose one</option>${options.map((option) => `<option>${option}</option>`).join('')}</select></label>`;
  return `<label><span>${label}${required ? ' *' : ''}</span><input type="${type}" name="${name}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}${req}></label>`;
}
