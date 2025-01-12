'use client';

import { motion } from "framer-motion";
import { CheckIcon, SparklesIcon, StarIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: 'Explorer',
    price: 'Free',
    description: "Try DealSight's core features",
    features: [
      'Basic listing aggregation across platforms',
      '5 saved searches',
      'Daily digest alerts',
      'Basic deal tracker (up to 10 deals)',
      'AI basic scoring (Pending)',
    ],
    cta: 'Get Started Free',
    highlight: false,
    gradient: 'from-brand-primary/80 to-brand-secondary/80',
    bgGradient: 'from-brand-primary/5 to-brand-secondary/5'
  },
  {
    name: 'Professional',
    price: 79,
    description: 'For serious individual buyers',
    features: [
      'All Explorer features',
      'Unlimited saved searches',
      'Instant or custom schedule alerts',
      'Advanced filtering options',
      'Advanced deal tracker (unlimited)',
      'Access to broker-direct listings',
      'AI basic scoring (Pending)',
      'Deep AI analysis (Pending)',
      'Export capabilities',
    ],
    cta: 'Start Pro Trial',
    highlight: true,
    popular: true,
    gradient: 'from-brand-primary to-brand-secondary',
    bgGradient: 'from-brand-primary/10 to-brand-secondary/10'
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For brokers & acquisition teams',
    features: [
      'All Professional features',
      'Priority alert processing',
      'Custom alert rules and filtering',
      'Unlimited AI basic scoring (Pending)',
      'Premium Deep AI analysis (Pending)',
      'Premium support',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    highlight: false,
    gradient: 'from-brand-secondary to-brand-accent',
    bgGradient: 'from-brand-secondary/10 to-brand-accent/10'
  },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-brand-primary/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-secondary/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gradient-primary">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
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
              className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-brand-primary/10 hover:border-brand-primary/20 transition-all duration-300 ${
                tier.highlight ? 'ring-2 ring-brand-primary' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 inset-x-0 flex justify-center">
                  <div className="inline-flex items-center rounded-full gradient-primary px-4 py-1 text-sm font-medium text-white shadow-lg">
                    <StarIcon className="mr-1.5 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${tier.gradient}`}>
                  {tier.name}
                </h3>
                <p className="mt-4 text-gray-600 min-h-[48px]">{tier.description}</p>
                <div className={`mt-8 p-4 rounded-xl bg-gradient-to-r ${tier.bgGradient}`}>
                  {typeof tier.price === 'number' ? (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  )}
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r ${tier.gradient} p-1`}>
                      <CheckIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <motion.a
                  href={tier.name === 'Enterprise' ? '/contact' : '/sign-up'}
                  className={`block w-full text-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tier.highlight
                      ? 'gradient-primary text-white shadow-lg hover:shadow-xl'
                      : `bg-gradient-to-r ${tier.gradient} text-white shadow hover:shadow-md`
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tier.cta}
                </motion.a>
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
          className="mt-24 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center border border-brand-primary/10"
        >
          <h3 className="text-2xl font-bold text-gradient-primary">
            Start With Explorer Today
          </h3>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {[
              {
                title: 'No Credit Card Required',
                description: 'Start exploring without any commitment'
              },
              {
                title: 'Upgrade Anytime',
                description: 'Scale up as your needs grow'
              },
              {
                title: 'Easy to Use',
                description: 'Intuitive interface, no learning curve'
              },
              {
                title: 'Premium Support',
                description: 'Help when you need it'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="p-4 rounded-xl bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5"
              >
                <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.a
            href="/sign-up"
            className="mt-12 inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white gradient-primary shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RocketLaunchIcon className="mr-2 h-5 w-5" />
            Get Started Free
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
} 