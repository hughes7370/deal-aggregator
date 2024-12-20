'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div className="bg-[#1A365D]">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to find your next business?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join successful entrepreneurs who use DealSight to find and acquire profitable businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/sign-up"
              className="rounded-md bg-[#0096FF] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0096FF]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0096FF] transition-all duration-200"
            >
              Start Free Trial
            </a>
            <a href="#how-it-works" className="text-sm font-semibold leading-6 text-white flex items-center gap-1 hover:text-gray-300 transition-colors">
              Learn more <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 