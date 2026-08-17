import { RATE_PLANS } from '../../packages/contracts/src/index.mjs';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const origin = (env) => (env.PUBLIC_SITE_URL || 'https://salak-tutorial-services.pages.dev').replace(/\/$/, '');

async function enrollment(DB, enrollmentId) {
  const row = await DB.prepare("SELECT enrollment_id, payload FROM submissions WHERE kind = 'enrollments' AND enrollment_id = ?").bind(enrollmentId).first();
  if (!row) return null;
  return { enrollmentId: row.enrollment_id, ...JSON.parse(row.payload) };
}

function quote(enrollmentData, paymentOption = 'full') {
  const plan = RATE_PLANS.find((item) => item.id === enrollmentData.ratePlanId);
  if (!plan) throw new Error('Enrollment plan is invalid.');
  const international = enrollmentData.market === 'international';
  const currency = international ? 'USD' : 'PHP';
  let amount = international ? plan.usd : plan.php;
  const depositAllowed = !international && plan.id.startsWith('monthly-');
  if (paymentOption === 'deposit' && depositAllowed) amount /= 2;
  else paymentOption = 'full';
  return { plan, currency, amount, paymentOption, provider: international ? 'paypal' : 'paymongo', depositAllowed };
}

async function insertPayment(env, enrollmentId, quoteData) {
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO payments (id, enrollment_id, provider, currency, amount, payment_option, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, enrollmentId, quoteData.provider, quoteData.currency, Math.round(quoteData.amount * 100), quoteData.paymentOption, 'pending', new Date().toISOString()).run();
  return id;
}

async function paymongoCheckout(env, enrollmentData, quoteData, paymentId, fetcher) {
  if (!env.PAYMONGO_SECRET_KEY) throw new Error('PayMongo is not configured.');
  const response = await fetcher('https://api.paymongo.com/v1/checkout_sessions', {
    method: 'POST',
    headers: { authorization: `Basic ${btoa(`${env.PAYMONGO_SECRET_KEY}:`)}`, 'content-type': 'application/json' },
    body: JSON.stringify({ data: { attributes: {
      billing: { name: enrollmentData.guardianName, email: enrollmentData.email, phone: enrollmentData.phone },
      description: `${quoteData.plan.label}+�u���T ${enrollmentData.enrollmentId}`,
      line_items: [{ currency: 'PHP', amount: Math.round(quoteData.amount * 100), name: quoteData.paymentOption === 'deposit' ? `${quoteData.plan.label}+�u���T 50% initial payment` : quoteData.plan.label, quantity: 1 }],
      payment_method_types: ['card', 'gcash', 'paymaya', 'dob'],
      reference_number: paymentId,
      send_email_receipt: true,
      success_url: `${origin(env)}/payment-confirmation/?payment=${paymentId}`,
      cancel_url: `${origin(env)}/checkout/?enrollmentId=${enrollmentData.enrollmentId}&cancelled=1`,
    } } }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.errors?.[0]?.detail || 'PayMongo checkout could not be created.');
  await env.DB.prepare('UPDATE payments SET provider_payment_id = ? WHERE id = ?').bind(result.data.id, paymentId).run();
  return result.data.attributes.checkout_url;
}

async function paypalToken(env, fetcher) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new Error('PayPal is not configured.');
  const base = env.PAYPAL_ENVIRONMENT === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const response = await fetcher(`${base}/v1/oauth2/token`, { method: 'POST', headers: { authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`, 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const result = await response.json();
  if (!response.ok) throw new Error('PayPal authentication failed.');
  return { base, accessToken: result.access_token };
}

async function paypalCheckout(env, enrollmentData, quoteData, paymentId, fetcher) {
  const { base, accessToken } = await paypalToken(env, fetcher);
  const response = await fetcher(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', 'PayPal-Request-Id': paymentId },
    body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: paymentId, custom_id: enrollmentData.enrollmentId, description: quoteData.plan.label, amount: { currency_code: 'USD', value: quoteData.amount.toFixed(2) } }], payment_source: { paypal: { experience_context: { user_action: 'PAY_NOW', return_url: `${origin(env)}/payment-confirmation/?payment=${paymentId}&capture=paypal`, cancel_url: `${origin(env)}/checkout/?enrollmentId=${enrollmentData.enrollmentId}&cancelled=1` } } } }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message || 'PayPal checkout could not be created.');
  await env.DB.prepare('UPDATE payments SET provider_payment_id = ? WHERE id = ?').bind(result.id, paymentId).run();
  return result.links.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href;
}

export async function paymentStatus(context) {
  if (!context.env.DB) return json({ error: 'Payments are not configured.' }, 503);
  const url = new URL(context.request.url);
  const enrollmentId = url.searchParams.get('enrollmentId');
  const paymentId = url.searchParams.get('payment');
  if (paymentId) {
    const row = await context.env.DB.prepare('SELECT id, enrollment_id, provider, currency, amount, payment_option, status, paid_at FROM payments WHERE id = ?').bind(paymentId).first();
    return row ? json({ ...row, amount: row.amount / 100 }) : json({ error: 'Payment not found.' }, 404);
  }
  const data = await enrollment(context.env.DB, enrollmentId);
  if (!data) return json({ error: 'Enrollment not found.' }, 404);
  const calculated = quote(data);
  return json({ enrollmentId, guardianName: data.guardianName, plan: calculated.plan.label, currency: calculated.currency, amount: calculated.amount, provider: calculated.provider, depositAllowed: calculated.depositAllowed });
}

export async function createPayment(context) {
  if (!context.env.DB) return json({ error: 'Payments are not configured.' }, 503);
  const input = await context.request.json().catch(() => ({}));
  const data = await enrollment(context.env.DB, input.enrollmentId);
  if (!data) return json({ error: 'Enrollment not found.' }, 404);
  const calculated = quote(data, input.paymentOption);
  const paymentId = await insertPayment(context.env, input.enrollmentId, calculated);
  try {
    const checkoutUrl = calculated.provider === 'paymongo'
      ? await paymongoCheckout(context.env, data, calculated, paymentId, fetch)
      : await paypalCheckout(context.env, data, calculated, paymentId, fetch);
    return json({ paymentId, checkoutUrl });
  } catch (error) {
    await context.env.DB.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").bind(paymentId).run();
    return json({ error: error.message }, 502);
  }
}

export async function capturePaypal(context) {
  const input = await context.request.json().catch(() => ({}));
  const row = await context.env.DB.prepare("SELECT id, provider_payment_id, status FROM payments WHERE id = ? AND provider = 'paypal'").bind(input.paymentId).first();
  if (!row) return json({ error: 'Payment not found.' }, 404);
  if (row.status === 'paid') return json({ ok: true, status: 'paid' });
  const { base, accessToken } = await paypalToken(context.env, fetch);
  const response = await fetch(`${base}/v2/checkout/orders/${row.provider_payment_id}/capture`, { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', 'PayPal-Request-Id': `capture-${row.id}` } });
  const result = await response.json();
  if (!response.ok || result.status !== 'COMPLETED') return json({ error: result.message || 'PayPal payment was not completed.' }, 400);
  await context.env.DB.prepare("UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ?").bind(new Date().toISOString(), row.id).run();
  return json({ ok: true, status: 'paid' });
}

export async function paymongoWebhook(context) {
  const raw = await context.request.text();
  const signature = context.request.headers.get('Paymongo-Signature') || '';
  if (!context.env.PAYMONGO_WEBHOOK_SECRET) return json({ error: 'Webhook is not configured.' }, 503);
  const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
  const expectedBytes = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode(context.env.PAYMONGO_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(`${parts.t}.${raw}`));
  const expected = [...new Uint8Array(expectedBytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const actual = context.env.PAYMONGO_SECRET_KEY?.startsWith('sk_live_') ? parts.li : parts.te;
  if (!actual || actual !== expected) return json({ error: 'Invalid signature.' }, 401);
  const event = JSON.parse(raw);
  if (event.data?.attributes?.type === 'checkout_session.payment.paid') {
    const sessionId = event.data.attributes.data.id;
    await context.env.DB.prepare("UPDATE payments SET status = 'paid', paid_at = ? WHERE provider_payment_id = ?").bind(new Date().toISOString(), sessionId).run();
  }
  return json({ received: true });
}
