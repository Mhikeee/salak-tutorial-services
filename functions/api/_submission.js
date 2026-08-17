import { validateBooking, validateEnrollment, validateInquiry } from '../../packages/contracts/src/index.mjs';

const allowedKinds = new Set(['inquiries', 'bookings', 'enrollments']);
const labels = { inquiries: 'inquiry', bookings: 'consultation request', enrollments: 'enrollment' };

function normalize(kind, input) {
  if (kind === 'inquiries') return { ...input, guardianName: input.guardianName || input.name };
  if (kind === 'bookings') return { ...input, preferredSlots: input.preferredSlots || [{ date: input.preferredDate, time: input.preferredTime, timeZone: input.timeZone }] };
  return {
    ...input,
    studentName: input.studentName || input.learnerName,
    market: input.market || (/philippines/i.test(input.country || '') ? 'philippines' : 'international'),
    ratePlanId: input.ratePlanId || ({ Hourly: 'hourly', 'Monthly - 20 hours': 'monthly-20', 'Monthly - 30 hours': 'monthly-30', 'Monthly - 40 hours': 'monthly-40' }[input.plan]),
  };
}

function validate(kind, input) {
  if (kind === 'inquiries') return validateInquiry(input);
  if (kind === 'bookings') return validateBooking(input);
  return validateEnrollment(input);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function detailsHtml(data) {
  return Object.entries(data).filter(([key]) => !['website', 'turnstileToken'].includes(key)).map(([key, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(key)}</th><td style="padding:6px 0">${escapeHtml(Array.isArray(value) ? JSON.stringify(value) : value)}</td></tr>`).join('');
}

async function verifyTurnstile(input, env, fetcher, remoteip) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', input.turnstileToken || input['cf-turnstile-response'] || '');
  if (remoteip) body.set('remoteip', remoteip);
  const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  return response.ok && (await response.json()).success === true;
}

function manilaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

async function nextEnrollmentId(DB) {
  const date = manilaDate();
  const statement = DB.prepare('INSERT INTO enrollment_sequences (date_key, last_value) VALUES (?, 1) ON CONFLICT(date_key) DO UPDATE SET last_value = last_value + 1 RETURNING last_value').bind(date);
  const row = await statement.first();
  return `STS-${date.replaceAll('-', '')}-${String(row.last_value).padStart(3, '0')}`;
}

async function sendBrevo(kind, data, enrollmentId, env, fetcher) {
  if (!env.BREVO_API_KEY || !env.NOTIFICATION_EMAIL) return { skipped: true };
  const senderEmail = env.FROM_EMAIL || 'salaktutorialservices@gmail.com';
  const common = { sender: { name: 'SALAK TUTORIAL SERVICES', email: senderEmail }, replyTo: { email: env.NOTIFICATION_EMAIL } };
  const admin = {
    ...common,
    to: [{ email: env.NOTIFICATION_EMAIL }],
    replyTo: data.email ? { email: data.email } : common.replyTo,
    subject: `New Salak ${labels[kind]}${enrollmentId ? `+�u���T ${enrollmentId}` : ''}`,
    htmlContent: `<h1>New ${escapeHtml(labels[kind])}</h1>${enrollmentId ? `<p><strong>Enrollment ID:</strong> ${enrollmentId}</p>` : ''}<table>${detailsHtml(data)}</table>`,
  };
  const parent = {
    ...common,
    to: [{ email: data.email, name: data.guardianName }],
    subject: `We received your Salak ${labels[kind]}`,
    htmlContent: `<p>Hello ${escapeHtml(data.guardianName)},</p><p>We received your ${escapeHtml(labels[kind])}${enrollmentId ? ` with enrollment ID <strong>${enrollmentId}</strong>` : ''}. Our tutorial team will review it and contact you within 24 hours by your preferred contact method.</p><p>Please do not send payment until we privately confirm the tutor, schedule, and payment instructions.</p>`,
  };
  for (const message of [admin, parent]) {
    const response = await fetcher('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify(message) });
    if (!response.ok) throw new Error(`Email service returned ${response.status}`);
  }
  return { sent: true };
}

async function sendLegacyResend(kind, data, env, fetcher) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) return { skipped: true };
  const response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: env.FROM_EMAIL || 'Salak Website <onboarding@resend.dev>', to: [env.NOTIFICATION_EMAIL], subject: `New Salak website ${kind}`, reply_to: data.email, text: 'A new website submission was saved in Cloudflare D1.' }) });
  if (!response.ok) throw new Error(`Email service returned ${response.status}`);
  return { sent: true };
}

export async function handleSubmission({ kind, input, env, fetcher = fetch, remoteip = '' }) {
  if (!allowedKinds.has(kind)) return json({ error: 'Unknown submission type.' }, 404);
  if (typeof input?.website === 'string' && input.website.trim()) return json({ ok: true });
  if (!(await verifyTurnstile(input || {}, env, fetcher, remoteip))) return json({ error: 'Please complete the security check and try again.' }, 400);
  const result = validate(kind, normalize(kind, input || {}));
  if (!result.ok) return json({ error: 'Please correct the highlighted information.', fieldErrors: result.fieldErrors }, 400);
  if (!env.DB) return json({ error: 'The form service is not configured yet.' }, 503);
  const id = crypto.randomUUID();
  const enrollmentId = kind === 'enrollments' ? await nextEnrollmentId(env.DB) : null;
  const createdAt = new Date().toISOString();
  await env.DB.prepare('INSERT INTO submissions (id, kind, email, enrollment_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, kind, result.data.email || '', enrollmentId, JSON.stringify(result.data), createdAt).run();
  let notification = 'sent';
  try {
    let sent = await sendBrevo(kind, result.data, enrollmentId, env, fetcher);
    if (sent.skipped) sent = await sendLegacyResend(kind, result.data, env, fetcher);
    if (sent.skipped) notification = 'not-configured';
  } catch { notification = 'failed'; }
  return json({ ok: true, id, enrollmentId, notification });
}

export async function fromRequest(kind, context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  let input;
  try { input = await context.request.json(); } catch { return json({ error: 'Send valid JSON.' }, 400); }
  return handleSubmission({ kind, input, env: context.env, remoteip: context.request.headers.get('CF-Connecting-IP') || '' });
}
