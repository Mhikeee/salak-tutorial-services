import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaymentQuote } from '../_payments.js';

test('multiplies a local hourly enrollment by the requested whole hours', () => {
  const result = calculatePaymentQuote(
    { ratePlanId: 'hourly', market: 'local' },
    { paymentOption: 'full', hours: 3 },
  );

  assert.equal(result.currency, 'PHP');
  assert.equal(result.baseAmount, 400);
  assert.equal(result.hours, 3);
  assert.equal(result.amount, 1200);
});

test('multiplies an international hourly enrollment by the requested whole hours', () => {
  const result = calculatePaymentQuote(
    { ratePlanId: 'hourly', market: 'international' },
    { paymentOption: 'full', hours: 4 },
  );

  assert.equal(result.currency, 'USD');
  assert.equal(result.baseAmount, 8);
  assert.equal(result.hours, 4);
  assert.equal(result.amount, 32);
});

test('rejects invalid hourly quantities instead of calculating a payment', () => {
  for (const hours of [0, -1, 1.5, 'three', Number.NaN]) {
    assert.throws(
      () => calculatePaymentQuote(
        { ratePlanId: 'hourly', market: 'local' },
        { paymentOption: 'full', hours },
      ),
      /whole number of hours/i,
    );
  }
});

test('does not apply an hourly quantity to a monthly package', () => {
  const result = calculatePaymentQuote(
    { ratePlanId: 'monthly-20', market: 'local' },
    { paymentOption: 'deposit', hours: 3 },
  );

  assert.equal(result.hours, 20);
  assert.equal(result.amount, 2000);
  assert.equal(result.paymentOption, 'deposit');
});
