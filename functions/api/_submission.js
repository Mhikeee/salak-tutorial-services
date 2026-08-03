import { validateBooking, validateEnrollment, validateInquiry, validatePaymentReference } from '../../packages/contracts/src/index.mjs';

const allowedKinds = new Set(['inquiries', 'bookings', 'enrollments', 'payment-references']);

function normalize(kind, input) {
  if (kind === 'inquiries') return { ...input, guardianName: input.guardianName || input.name };
  if (kind === 'bookings') return {
    ...input,
    preferredSlots: input.preferredSlots || [{ date: input.preferredDate, time: input.preferredTime, timeZone: input.timeZone }],
  };
  if (kind === 'enrollments') return {
    ...input,
    studentName: input.studentName || input.learnerName,
    market: input.market || (/philippines/i.test(input.country || '') ? 'philippines' : 'international'),
    ratePlanId: input.ratePlanId || ({ Hourly: 'hourly', 'Monthly - 20 hours': 'monthly-20', 'Monthly - 30 hours': 'monthly-30', 'Monthly - 40 hours': 'monthly-40' }[input.plan]),
  };
  return {
    ...input,
    payerName: input.payerName || input.guardianName,
    transactionDate: input.transactionDate || input.paymentDate,
    currency: 'PHP',
  };
}

function validate(kind, input) {
  if (kind === 'inquiries') return validateInquiry(input);
  if (kind === 'bookings') return validateBooking(input);
  if (kind === 'enrollments') return validateEnrollment(input);
  return validatePaymentReference(input);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

async function sendNotification(kind, data, env, fetcher) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) return { skipped: true };
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'Salak Website <onboarding@resend.dev>',
      to: [env.NOTIFICATION_EMAIL],
      subject: `New Salak website ${kind.replace('-', ' ')}`,
      reply_to: data.email || undefined,
      text: `A new ${kind} submission was saved. Reply-to email: ${data.email || 'not provided'}. Review the full record in Cloudflare D1.`,
    }),
  });
  if (!response.ok) throw new Error(`Email service returned ${response.status}`);
  return { sent: true };
}

export async function handleSubmission({ kind, input, env, fetcher = fetch }) {
  if (!allowedKinds.has(kind)) return json({ error: 'Unknown submission type.' }, 404);
  if (typeof input?.website === 'string' && input.website.trim()) return json({ ok: true });
  const normalized = normalize(kind, input || {});
  const result = validate(kind, normalized);
  if (!result.ok) return json({ error: 'Please correct the highlighted information.', fieldErrors: result.fieldErrors }, 400);
  if (!env.DB) return json({ error: 'The form service is not configured yet.' }, 503);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await env.DB.prepare('INSERT INTO submissions (id, kind, email, payload, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, kind, result.data.email || '', JSON.stringify(result.data), createdAt).run();
  let notification = 'sent';
  try {
    const emailResult = await sendNotification(kind, result.data, env, fetcher);
    if (emailResult.skipped) notification = 'not-configured';
  } catch {
    notification = 'failed';
  }
  return json({ ok: true, id, notification });
}

export async function fromRequest(kind, context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  let input;
  try { input = await context.request.json(); } catch { return json({ error: 'Send valid JSON.' }, 400); }
  return handleSubmission({ kind, input, env: context.env });
}
