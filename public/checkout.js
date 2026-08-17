const formatMoney = (currency, amount) => new Intl.NumberFormat(
  currency === 'PHP' ? 'en-PH' : 'en-US',
  { style: 'currency', currency },
).format(amount);

const checkout = document.querySelector('[data-checkout]');
if (checkout) {
  const params = new URLSearchParams(location.search);
  const enrollmentId = params.get('enrollmentId');
  const status = checkout.querySelector('.form-status');
  const summary = checkout.querySelector('[data-checkout-summary]');
  const hoursInput = checkout.querySelector('[data-hours]');
  const paymentOption = checkout.querySelector('[data-payment-option]');

  const updateTotal = () => {
    const hours = Number(hoursInput.value);
    const multiplier = checkout.dataset.isHourly === 'true' ? hours : 1;
    const installment = paymentOption.value === 'deposit' ? 0.5 : 1;
    const total = Number(checkout.dataset.baseAmount) * multiplier * installment;
    checkout.querySelector('[data-amount]').textContent = Number.isInteger(hours) && hours >= 1
      ? formatMoney(checkout.dataset.currency, total)
      : 'Choose at least 1 whole hour';
    checkout.querySelector('[data-hours-calculation]').textContent =
      `${hours || 0} � ${formatMoney(checkout.dataset.currency, Number(checkout.dataset.baseAmount))}`;
  };

  fetch('/api/payments-status?enrollmentId=' + encodeURIComponent(enrollmentId || ''))
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Enrollment could not be loaded.');
      checkout.querySelector('[data-enrollment-id]').textContent = data.enrollmentId;
      checkout.querySelector('[data-plan]').textContent = data.plan;
      checkout.querySelector('[data-provider-note]').textContent = data.provider === 'paymongo'
        ? 'Continue to PayMongo for GCash, Maya, card, or online banking.'
        : 'Continue to PayPal for secure USD payment.';
      checkout.querySelector('[data-deposit-option]').hidden = !data.depositAllowed;
      checkout.querySelector('[data-hours-option]').hidden = !data.isHourly;
      checkout.dataset.currency = data.currency;
      checkout.dataset.baseAmount = data.baseAmount;
      checkout.dataset.isHourly = String(data.isHourly);
      status.hidden = true;
      summary.hidden = false;
      updateTotal();
    })
    .catch((error) => {
      status.textContent = error.message;
      status.classList.add('error');
    });

  hoursInput.addEventListener('input', updateTotal);
  paymentOption.addEventListener('change', updateTotal);
  checkout.querySelector('[data-pay]').addEventListener('click', async () => {
    const hours = Number(hoursInput.value);
    if (checkout.dataset.isHourly === 'true' && (!Number.isInteger(hours) || hours < 1)) {
      status.hidden = false;
      status.classList.add('error');
      status.textContent = 'Choose a whole number of hours starting from 1.';
      return;
    }
    const button = checkout.querySelector('[data-pay]');
    button.disabled = true;
    button.textContent = 'Opening secure checkout...';
    try {
      const response = await fetch('/api/payments-create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ enrollmentId, paymentOption: paymentOption.value, hours }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Checkout could not be started.');
      location.assign(result.checkoutUrl);
    } catch (error) {
      status.hidden = false;
      status.classList.add('error');
      status.textContent = error.message;
      button.disabled = false;
      button.textContent = 'Continue to secure payment';
    }
  });
}

const confirmation = document.querySelector('[data-payment-confirmation]');
if (confirmation) {
  const params = new URLSearchParams(location.search);
  const paymentId = params.get('payment');
  const finish = async () => {
    if (params.get('capture') === 'paypal') {
      const response = await fetch('/api/payments-paypal-capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'PayPal payment could not be confirmed.');
    }
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await fetch('/api/payments-status?payment=' + encodeURIComponent(paymentId || ''));
      const data = await response.json();
      if (data.status === 'paid') return data;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error('Your payment is still processing. We will email you after confirmation.');
  };
  finish()
    .then((data) => {
      confirmation.querySelector('[data-payment-heading]').textContent = 'Payment confirmed!';
      confirmation.querySelector('[data-payment-message]').textContent = 'Your enrollment payment was received successfully.';
      confirmation.querySelector('[data-payment-details]').textContent =
        `Enrollment ${data.enrollment_id} � ${formatMoney(data.currency, data.amount)}`;
      confirmation.querySelector('[data-payment-home]').hidden = false;
    })
    .catch((error) => {
      confirmation.querySelector('[data-payment-heading]').textContent = 'Payment pending';
      confirmation.querySelector('[data-payment-message]').textContent = error.message;
      confirmation.querySelector('[data-payment-home]').hidden = false;
    });
}
