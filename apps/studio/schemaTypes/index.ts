import { defineField, defineType } from 'sanity';

const titledCopy = [defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'description', title: 'Description', type: 'text' })];

const siteSettings = defineType({ name: 'siteSettings', title: 'Site Settings', type: 'document', fields: [defineField({ name: 'businessName', title: 'Business name', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'email', title: 'Email', type: 'string' }), defineField({ name: 'phone', title: 'Phone', type: 'string' }), defineField({ name: 'address', title: 'Address', type: 'text' })] });
const service = defineType({ name: 'service', title: 'Service', type: 'document', fields: [...titledCopy, defineField({ name: 'order', title: 'Display order', type: 'number' })] });
const testimonial = defineType({ name: 'testimonial', title: 'Testimonial', type: 'document', fields: [defineField({ name: 'quote', title: 'Quote', type: 'text', validation: (rule) => rule.required() }), defineField({ name: 'attribution', title: 'Attribution', type: 'string' }), defineField({ name: 'consentConfirmed', title: 'Consent confirmed', type: 'boolean', initialValue: false })] });
const faq = defineType({ name: 'faq', title: 'FAQ', type: 'document', fields: [defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'answer', title: 'Answer', type: 'text', validation: (rule) => rule.required() }), defineField({ name: 'order', title: 'Display order', type: 'number' })] });
const ratePlan = defineType({ name: 'ratePlan', title: 'Rate Plan', type: 'document', fields: [defineField({ name: 'name', title: 'Plan name', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'hours', title: 'Hours', type: 'number' }), defineField({ name: 'php', title: 'PHP price', type: 'number' }), defineField({ name: 'usd', title: 'USD price', type: 'number' }), defineField({ name: 'inclusions', title: 'Inclusions', type: 'array', of: [{ type: 'string' }] })] });

export const schemaTypes = [siteSettings, service, testimonial, faq, ratePlan];
