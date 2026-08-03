import test from "node:test";
import assert from "node:assert/strict";
import {
  MARKET,
  RATE_PLANS,
  validateBooking,
  validateEnrollment,
  validateInquiry,
  validatePaymentReference
} from "../src/index.mjs";

test("publishes the approved local and international rate plans", () => {
  assert.deepEqual(
    RATE_PLANS.map(({ id, php, usd }) => ({ id, php, usd })),
    [
      { id: "hourly", php: 400, usd: 8 },
      { id: "monthly-20", php: 4000, usd: 80 },
      { id: "monthly-30", php: 5000, usd: 100 },
      { id: "monthly-40", php: 6000, usd: 120 }
    ]
  );
});

test("hourly and monthly plans preserve their approved inclusions", () => {
  const hourly = RATE_PLANS.find((plan) => plan.id === "hourly");
  const monthly = RATE_PLANS.find((plan) => plan.id === "monthly-20");
  assert.match(hourly.inclusions.join(" "), /one focused subject/i);
  assert.match(monthly.inclusions.join(" "), /all subjects/i);
  assert.match(monthly.inclusions.join(" "), /performance tasks/i);
});

test("inquiry validation requires guardian contact and consent", () => {
  const result = validateInquiry({ message: "Math support" });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.fieldErrors).sort(), ["consent", "email", "guardianName"]);
});

test("booking validation requires a timezone-aware preferred slot", () => {
  const result = validateBooking({
    guardianName: "Maria Santos",
    email: "maria@example.com",
    consent: true,
    preferredSlots: [{ date: "2026-08-05", time: "17:00", timeZone: "" }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.fieldErrors.preferredSlots, "Add a time zone to every preferred schedule.");
});

test("enrollment validation always requires parent information", () => {
  const result = validateEnrollment({
    studentName: "Alex",
    market: MARKET.PHILIPPINES,
    ratePlanId: "hourly",
    consent: true
  });
  assert.equal(result.ok, false);
  assert.equal(result.fieldErrors.guardianName, "Parent or guardian name is required.");
});

test("local payment references accept PHP and reject receipt images", () => {
  const result = validatePaymentReference({
    enrollmentId: "enr_12345678",
    payerName: "Maria Santos",
    amount: 400,
    currency: "USD",
    transactionDate: "2026-08-03",
    referenceNumber: "GCASH-123456",
    receiptImage: "data:image/png;base64,abc"
  });
  assert.equal(result.ok, false);
  assert.equal(result.fieldErrors.currency, "Local payment references must use PHP.");
  assert.equal(
    result.fieldErrors.receiptImage,
    "Receipt uploads are not accepted; enter the transaction reference instead."
  );
});
