'use client';

import { motion } from "framer-motion";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: 'Basic',
    price: 297,
    description: 'Perfect for individual buyers starting their acquisition journey',
    features: [
      'Daily deal alerts',
      'Basic deal analysis',
      'Market trends dashboard',
      'Email support',
      'Deal filtering',
      'Basic comparables',
      '1 saved search',
      'Basic export options',
      '1 team seat',
      'Simple deal tracking',
    ],
    cta: 'Start Basic Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 697,
    description: 'For serious buyers looking for competitive advantage',
    features: [
      '4-hour early access alerts',
      'Full AI-powered analysis',
      'Advanced market analytics',
      'Priority support',
      'Advanced filtering',
      'Detailed comparables',
      '10 saved searches',
      'Advanced exports',
      '3 team seats',
      'Full deal pipeline',
      'Due diligence checklist',
      'Deal negotiation insights',
    ],
    cta: 'Start Pro Trial',
    highlight: true,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For professional buyers and investment firms',
    features: [
      'Instant deal alerts',
      'Custom analysis framework',
      'API access',
      'Dedicated account manager',
      'White-label reports',
      'Team collaboration',
      'Unlimited saved searches',
      'Custom exports',
      'Unlimited team seats',
      'Custom pipeline',
      'Full due diligence suite',
      'M&A advisory services',
      'Deal flow automation',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Transparent Pricing</h2>
          <p className="mt-4 text-xl text-gray-500">
            Choose the plan that best fits your acquisition strategy
          </p>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                tier.highlight ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4">
                  <div className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                    <SparklesIcon className="mr-1.5 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  {typeof tier.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                      <span className="text-gray-500">/month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  )}
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href={tier.name === 'Enterprise' ? '/contact' : '/sign-up'}
                  className={`block w-full text-center px-6 py-3 rounded-md text-sm font-semibold ${
                    tier.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free Trial Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900">Start Your Free Trial Today</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">No Credit Card Required</h4>
              <p className="mt-2 text-gray-500">
                Start your trial without any commitment
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Full Pro Features</h4>
              <p className="mt-2 text-gray-500">
                Access all Pro features for 14 days
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Cancel Anytime</h4>
              <p className="mt-2 text-gray-500">
                No questions asked, easy cancellation
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Special Offer</h4>
              <p className="mt-2 text-gray-500">
                50% off first 3 months if you upgrade
              </p>
            </div>
          </div>
          <div className="mt-12">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Start Your Free Trial
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 