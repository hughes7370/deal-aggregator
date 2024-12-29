'use client';

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";

const tiers = [
  {
    name: "Basic",
    price: "$299",
    description: "Perfect for individual buyers and small teams.",
    features: [
      "Daily deal alerts",
      "Basic AI analysis",
      "Standard deal filtering",
      "Email notifications",
      "Historical deal database",
      "Basic market comps",
      "Standard support"
    ],
    cta: "Start Basic Trial",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$699",
    description: "For serious buyers who need comprehensive analysis.",
    features: [
      "4-hour early access alerts",
      "Full AI-powered analysis",
      "Advanced deal filtering",
      "Email + SMS notifications",
      "Full historical database",
      "Detailed market comps",
      "Priority support",
      "Custom deal scoring",
      "Team collaboration"
    ],
    cta: "Start Pro Trial",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "$1,499",
    description: "For professional buyers and investment firms.",
    features: [
      "Instant deal alerts",
      "Custom AI analysis",
      "Advanced filtering + API",
      "Multi-channel alerts",
      "Full data access + API",
      "Custom market analysis",
      "24/7 dedicated support",
      "Custom integrations",
      "Team + portfolio management",
      "M&A advisory services"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
];

const calculatorMetrics = [
  {
    label: "Time Saved vs Manual Search",
    value: "80%",
    detail: "~32 hours/month"
  },
  {
    label: "Average Deal Savings",
    value: "15-20%",
    detail: "Through early access"
  },
  {
    label: "ROI on Subscription",
    value: "10x+",
    detail: "Based on avg. deal size"
  }
];

const trialFeatures = [
  "Complete sample deal analysis",
  "Limited alert access (2/day)",
  "Basic historical deal database",
  "Standard filtering tools",
  "Email support"
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
            Choose the plan that fits your acquisition strategy
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
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                tier.highlighted ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 left-0 bg-blue-600 text-white text-sm font-medium text-center py-2">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500">/month</span>
                </p>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href="/sign-up"
                    className={`block w-full py-3 px-6 text-center rounded-lg font-medium ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center">ROI Calculator</h3>
          <p className="mt-4 text-gray-500 text-center">
            See the potential return on your subscription investment
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {calculatorMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <dt className="text-lg font-medium text-gray-900">{metric.label}</dt>
                <dd className="mt-2">
                  <span className="text-4xl font-bold text-blue-600">{metric.value}</span>
                  <p className="mt-1 text-sm text-gray-500">{metric.detail}</p>
                </dd>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Free Trial Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center">14-Day Free Trial</h3>
          <p className="mt-4 text-gray-500 text-center">
            Test drive our platform with these features
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <ul className="grid gap-4 md:grid-cols-2">
              {trialFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 text-center">
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