export const site = {
  name: 'Salak Tutorial Services',
  shortName: 'Salak',
  phone: process.env.PUBLIC_CONTACT_PHONE || '',
  email: process.env.PUBLIC_CONTACT_EMAIL || '',
  address: '3 Dover Street, J. Miranda Avenue, Naga City, Philippines',
  description: 'Parent-trusted academic support from pre-school to senior high school, available in Naga City and online worldwide.',
};

export const navigation = [
  ['Home', '/'],
  ['Who We Are', '/about/'],
  ['Tutorials', '/services/'],
  ['Online Tutoring', '/online-tutoring/'],
  ['Rates', '/rates/'],
  ['Our Tutors', '/tutors/'],
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
  ['Online Tutorials', 'Live, guided one-to-one or small-group learning for students in the Philippines and overseas.'],
  ['Monthly Academic Support', 'A steady learning partnership across every school subject throughout the month.'],
];

export const faqs = [
  ['Who can enroll?', 'We welcome learners from pre-school through senior high school, whether they need regular support or help with one focused subject.'],
  ['Do you accept students outside the Philippines?', 'Yes. Our online tutorial service welcomes international families and can support different school curricula using the learner\'s own materials and goals.'],
  ['What is included in the hourly rate?', 'Hourly tutorials focus on one subject and are ideal for lesson reinforcement, homework help, and quiz or exam review.'],
  ['What is included in a monthly plan?', 'Monthly plans cover assistance in every school subject, plus guidance for assignments, projects, performance tasks, quizzes, summative tests, and major examinations.'],
  ['How do online sessions work?', 'After enrollment, we confirm the learner\'s needs, schedule, tutor match, and preferred video platform before the first session.'],
  ['How do I pay?', 'Philippine families can submit their payment reference after using the confirmed local payment channel. International payment instructions are shared after schedule confirmation.'],
];
