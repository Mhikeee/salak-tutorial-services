export const MARKET = Object.freeze({
  PHILIPPINES: "philippines",
  INTERNATIONAL: "international"
});

const hourlyInclusions = Object.freeze([
  "Assistance in one focused subject only",
  "Ideal for lesson reinforcement, homework assistance, and exam or quiz reviews"
]);

const monthlyInclusions = Object.freeze([
  "Assistance in all subjects",
  "Guidance on performance tasks, assignments, projects, summative tests, quizzes, and major examinations",
  "Comprehensive academic support throughout the month"
]);

export const RATE_PLANS = Object.freeze([
  { id: "hourly", label: "Hourly rate", hours: 1, php: 400, usd: 8, inclusions: hourlyInclusions },
  { id: "monthly-20", label: "20-hour monthly plan", hours: 20, php: 4000, usd: 80, inclusions: monthlyInclusions },
  { id: "monthly-30", label: "30-hour monthly plan", hours: 30, php: 5000, usd: 100, inclusions: monthlyInclusions },
  { id: "monthly-40", label: "40-hour monthly plan", hours: 40, php: 6000, usd: 120, inclusions: monthlyInclusions }
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function required(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function contactErrors(input) {
  const fieldErrors = {};
  if (!required(input.guardianName)) fieldErrors.guardianName = "Parent or guardian name is required.";
  if (!required(input.email) || !emailPattern.test(input.email)) fieldErrors.email = "Enter a valid email address.";
  if (input.consent !== true) fieldErrors.consent = "Parent or guardian consent is required.";
  return fieldErrors;
}

function outcome(fieldErrors, data) {
  return Object.keys(fieldErrors).length
    ? { ok: false, fieldErrors }
    : { ok: true, data: { ...data, email: data.email?.trim().toLowerCase() } };
}

export function validateInquiry(input = {}) {
  return outcome(contactErrors(input), input);
}

export function validateBooking(input = {}) {
  const fieldErrors = contactErrors(input);
  if (!Array.isArray(input.preferredSlots) || input.preferredSlots.length === 0) {
    fieldErrors.preferredSlots = "Add at least one preferred schedule.";
  } else if (input.preferredSlots.some((slot) => !required(slot.date) || !required(slot.time) || !required(slot.timeZone))) {
    fieldErrors.preferredSlots = "Add a time zone to every preferred schedule.";
  }
  return outcome(fieldErrors, input);
}

export function validateEnrollment(input = {}) {
  const fieldErrors = contactErrors(input);
  if (!required(input.studentName)) fieldErrors.studentName = "Student name is required.";
  if (![MARKET.PHILIPPINES, MARKET.INTERNATIONAL].includes(input.market)) {
    fieldErrors.market = "Choose Philippine or international enrollment.";
  }
  if (!RATE_PLANS.some((plan) => plan.id === input.ratePlanId)) {
    fieldErrors.ratePlanId = "Choose an available rate plan.";
  }
  return outcome(fieldErrors, input);
}

export function validatePaymentReference(input = {}) {
  const fieldErrors = {};
  if (!required(input.enrollmentId)) fieldErrors.enrollmentId = "Enrollment ID is required.";
  if (!required(input.payerName)) fieldErrors.payerName = "Payer name is required.";
  if (!(Number(input.amount) > 0)) fieldErrors.amount = "Enter the amount paid.";
  if (input.currency !== "PHP") fieldErrors.currency = "Local payment references must use PHP.";
  if (!required(input.transactionDate)) fieldErrors.transactionDate = "Transaction date is required.";
  if (!required(input.referenceNumber)) fieldErrors.referenceNumber = "Transaction reference is required.";
  if ("receiptImage" in input) {
    fieldErrors.receiptImage = "Receipt uploads are not accepted; enter the transaction reference instead.";
  }
  return outcome(fieldErrors, input);
}
