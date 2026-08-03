import { navigation, site } from '../content/site.mjs';

const escapeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function layout({ title, description = site.description, path = '/', body, pageClass = '' }) {
  const fullTitle = title === 'Home' ? `${site.name} | Learning support that moves with your child` : `${title} | ${site.name}`;
  const nav = navigation.map(([label, href]) => `<a href="${href}"${path === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const emailLink = site.email ? `<a href="mailto:${site.email}">${site.email}</a>` : '';
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
  };
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">${escapeJson(schema)}</script>
  <script src="/assets/site.js" defer></script>
</head>
<body class="${pageClass}">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="utility"><div class="wrap utility-inner"><span>Supporting learners in Naga City and worldwide</span><div>${emailLink}${emailLink ? '<span class="utility-divider">|</span>' : ''}<span>${site.address}</span></div></div></div>
  <header class="site-header">
    <div class="wrap nav-row">
      <a class="brand" href="/" aria-label="Salak Tutorial Services home"><img src="/assets/logo.png" alt="" width="60" height="60"><span>Salak <small>Tutorial Services</small></span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span><span class="sr-only">Open menu</span></button>
      <nav id="primary-nav" aria-label="Primary navigation">${nav}<a class="button button-small" href="/book/">Book a consultation</a></nav>
    </div>
  </header>
  <main id="main">${body}</main>
  <section class="closing-cta">
    <div class="wrap closing-grid"><div><p class="eyebrow light">A brighter next step starts here</p><h2>Let us build the right learning plan together.</h2></div><div class="button-row"><a class="button button-white" href="/book/">Book a consultation</a><a class="text-link light" href="/rates/">View rates <span aria-hidden="true">&rarr;</span></a></div></div>
  </section>
  <footer>
    <div class="wrap footer-grid">
      <div><a class="brand brand-footer" href="/"><img src="/assets/logo.png" alt="" width="64" height="64"><span>Salak <small>Tutorial Services</small></span></a><p>Motivating, guided academic support from pre-school to senior high school.</p></div>
      <div><h2>Explore</h2><a href="/about/">Who We Are</a><a href="/services/">Academic Services</a><a href="/rates/">Rates</a><a href="/testimonials/">Family Stories</a></div>
      <div><h2>Get started</h2><a href="/book/">Book a consultation</a><a href="/enroll/">Enroll online</a><a href="/payment/local/">Submit payment reference</a><a href="/contact/">Contact us</a></div>
      <div><h2>Visit or connect</h2><p>${site.address}</p>${emailLink}<a href="/contact/">Send an online inquiry</a></div>
    </div>
    <div class="wrap footer-bottom"><span>&copy; ${new Date().getFullYear()} ${site.name}</span><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/payment-policy/">Payment policy</a></div></div>
  </footer>
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
