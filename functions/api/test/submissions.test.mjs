import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSubmission } from '../_submission.js';

function mockDatabase() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return { bind(...values) { return { async run() { calls.push({ sql, values }); return { success: true }; } }; } };
    },
  };
}

test('stores a valid inquiry before sending an email notification', async () => {
  const DB = mockDatabase();
  const emails = [];
  const response = await handleSubmission({
    kind: 'inquiries',
    input: { name: 'Maria Parent', email: 'MARIA@example.com', message: 'Math support', consent: true },
    env: { DB, RESEND_API_KEY: 'test-key', NOTIFICATION_EMAIL: 'owner@example.com', FROM_EMAIL: 'Salak <forms@example.com>' },
    fetcher: async (url, options) => { emails.push({ url, options }); return new Response('{}', { status: 200 }); },
  });
  assert.equal(response.status, 200);
  assert.equal(DB.calls.length, 1);
  assert.match(DB.calls[0].sql, /INSERT INTO submissions/);
  assert.equal(emails.length, 1);
  assert.match(emails[0].url, /resend\.com/);
});

test('rejects an invalid submission without writing or emailing', async () => {
  const DB = mockDatabase();
  let emailed = false;
  const response = await handleSubmission({ kind: 'inquiries', input: { email: 'bad' }, env: { DB }, fetcher: async () => { emailed = true; } });
  assert.equal(response.status, 400);
  assert.equal(DB.calls.length, 0);
  assert.equal(emailed, false);
});

test('rejects the retired public payment reference endpoint', async () => {
  const DB = mockDatabase();
  const response = await handleSubmission({
    kind: 'payment-references',
    input: { enrollmentId: 'STS-001', payerName: 'Maria Parent', amount: '4000', currency: 'PHP', transactionDate: '2026-08-03', referenceNumber: 'ABC123' },
    env: { DB },
    fetcher: async () => new Response('{}', { status: 200 }),
  });
  assert.equal(response.status, 404);
  assert.equal(DB.calls.length, 0);
});


test('silently rejects honeypot spam without writing or emailing', async () => {
  const DB = mockDatabase();
  const response = await handleSubmission({
    kind: 'inquiries',
    input: { name: 'Bot', email: 'bot@example.com', message: 'spam', consent: true, website: 'https://spam.invalid' },
    env: { DB },
  });
  assert.equal(response.status, 200);
  assert.equal(DB.calls.length, 0);
});
