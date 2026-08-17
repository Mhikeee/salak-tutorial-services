import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aboutPage, bookPage, checkoutPage, contactPage, enrollPage, faqPage, homePage, notFoundPage, onlinePage, paymentConfirmationPage, policyPage, ratesPage, servicesPage, testimonialsPage, thankYouPage } from '../src/templates/pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = new Map([
  ['index.html', homePage],
  ['about/index.html', aboutPage],
  ['services/index.html', servicesPage],
  ['online-tutoring/index.html', onlinePage],
  ['rates/index.html', ratesPage],
  ['testimonials/index.html', testimonialsPage],
  ['book/index.html', bookPage],
  ['enroll/index.html', enrollPage],
  ['checkout/index.html', checkoutPage],
  ['payment-confirmation/index.html', paymentConfirmationPage],
  ['faq/index.html', faqPage],
  ['contact/index.html', contactPage],
  ['privacy/index.html', () => policyPage('privacy')],
  ['terms/index.html', () => policyPage('terms')],
  ['payment-policy/index.html', () => policyPage('payment')],
  ['thank-you/index.html', thankYouPage],
  ['404.html', notFoundPage],
]);

export async function buildSite(outputDir = join(root, 'dist')) {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(join(outputDir, 'assets'), { recursive: true });
  for (const [route, render] of routes) {
    const destination = join(outputDir, route);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, render(), 'utf8');
  }
  for (const asset of ['logo.png', 'hero-photo.jpg', 'center-session.jpg', 'center-location.jpg', 'tutors.jpg', 'testi1.png', 'testi2.png', 'testi3.png']) await cp(join(root, 'elements', asset), join(outputDir, 'assets', asset));
  await cp(join(root, 'public', 'styles.css'), join(outputDir, 'assets', 'styles.css'));
  await cp(join(root, 'public', 'home-media.css'), join(outputDir, 'assets', 'home-media.css'));
  await cp(join(root, 'public', 'site.js'), join(outputDir, 'assets', 'site.js'));
  await cp(join(root, 'public', 'checkout.js'), join(outputDir, 'assets', 'checkout.js'));
  const origin = (process.env.PUBLIC_SITE_URL || 'https://salak-tutorial-services.pages.dev').replace(/\/$/, '');
  await writeFile(join(outputDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(join(outputDir, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }, null, 2));
  await writeFile(join(outputDir, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com
`);
  const urls = [...routes.keys()].filter((route) => route !== '404.html').map((route) => `  <url><loc>${origin}/${route === 'index.html' ? '' : route.replace('index.html', '')}</loc></url>`).join('\n');
  await writeFile(join(outputDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  return outputDir;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await buildSite();
  const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  console.log(`Built ${routes.size} routes for ${packageJson.name}.`);
}
