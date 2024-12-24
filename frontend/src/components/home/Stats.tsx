'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '20+', label: 'Broker Sites Monitored' },
  { value: '$250M+', label: 'Deal Value Analyzed' },
  { value: '45%', label: 'Average Time Saved' },
  { value: '2.5x', label: 'Better Deal Terms' }
];

export default function Stats() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#1A365D] sm:text-4xl">
              Trusted by buyers worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Our platform helps entrepreneurs find and analyze the best business opportunities
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="flex flex-col bg-[#F7F9FC] p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-[#0096FF]">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 