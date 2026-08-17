const defaultOrigin = 'https://salak-tutorial-services.pages.dev';

export const site = {
  name: 'SALAK TUTORIAL SERVICES',
  shortName: 'SALAK',
  phone: '+63 969 628 3385',
  phoneCompact: '+639696283385',
  email: 'salaktutorialservices@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=100086394308897',
  address: '3 Dover Street, J. Miranda Avenue, Naga City, Philippines',
  maps: 'https://www.google.com/maps/search/?api=1&query=Salak%20Tutorial%20Services%20(Main)',
  hours: 'Monday-Saturday, 9:00 AM-7:00 PM',
  responseTime: 'within 24 hours',
  origin: (process.env.PUBLIC_SITE_URL || defaultOrigin).replace(/\/$/, ''),
  turnstileSiteKey: process.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAESrfsNSPPooRhcG',
  description: 'Parent-trusted academic support from pre-school to senior high school, available in Naga City and online worldwide.',
};

export const navigation = [
  ['Home', '/'],
  ['Who We Are', '/about/'],
  ['Tutorials', '/services/'],
  ['Online Tutoring', '/online-tutoring/'],
  ['Rates', '/rates/'],
  ['FAQs', '/faq/'],
];

export const rates = {
  local: {
    label: 'Philippines',
    currency: 'PHP',
    hourly: 'PHP 400',
    monthly: [
      ['20 hours', 'PHP 4,000'],
      ['30 hours', 'PHP 5,000'],
      ['40 hours', 'PHP 6,000'],
    ],
  },
  international: {
    label: 'International',
    currency: 'USD',
    hourly: 'USD 8',
    monthly: [
      ['20 hours', 'USD 80'],
      ['30 hours', 'USD 100'],
      ['40 hours', 'USD 120'],
    ],
  },
};

export const levels = ['Pre-school', 'Elementary', 'Junior High', 'Senior High'];

export const services = [
  ['Early Learning', 'Warm, patient sessions that build foundational literacy, numeracy, confidence, and learning routines.'],
  ['Subject Tutorials', 'Focused guidance across school subjects, paced around the learner and aligned with current classroom lessons.'],
  ['Homework & Tasks', 'Clear support for assignments, projects, performance tasks, and responsible independent work habits.'],
  ['Assessment Preparation', 'Structured review for quizzes, summative tests, and major examinations without last-minute panic.'],
  ['Online Tutorials', 'Live one-to-one or group learning for students in the Philippines and overseas.'],
  ['Monthly Academic Support', 'A steady learning partnership across every school subject throughout the month.'],
];

export const faqs = [
  ['Who can enroll?', 'We welcome learners from pre-school through senior high school. Services are available one-to-one or in groups, subject to tutor availability.'],
  ['Do you accept students outside the Philippines?', 'Yes. International families can book online tutorials through Google Meet or Zoom. Curriculum and specialized senior high subjects are subject to tutor availability.'],
  ['What is included in the hourly rate?', 'Hourly tutorials focus on one subject and are ideal for lesson reinforcement, homework help, and quiz or exam review.'],
  ['What is included in a monthly plan?', 'Monthly plans cover assistance in every school subject, plus guidance for assignments, projects, performance tasks, quizzes, summative tests, and major examinations.'],
  ['What does the family provide for online sessions?', 'The family provides a reliable internet connection, a suitable device, and relevant school materials. Salak provides practice tests and exercises.'],
  ['How do I pay?', 'After enrollment, Philippine families continue to PayMongo for GCash, Maya, card, or supported online banking. International families continue to PayPal for USD payment. Confirmation is automatic after verified payment.'],
];
