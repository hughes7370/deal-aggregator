'use client';

import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function CTASection() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold leading-6 text-white ring-1 ring-inset ring-white/20">
              Limited Time Offer
            </span>
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to find your next business?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
            Join successful entrepreneurs who use DealSight to find and acquire profitable businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <motion.a
              href="/sign-up"
              className="group relative inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-indigo-600 shadow-md hover:bg-indigo-50 transition-all duration-200 hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SparklesIcon className="mr-2 h-5 w-5" />
              Start Free Trial
              <span className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#fff] to-[#fff]/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 