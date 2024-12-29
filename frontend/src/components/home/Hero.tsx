'use client'

import { motion } from "framer-motion";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
        </div>
      </div>

      <div className="relative pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Never Miss Quality Digital
              <span className="text-blue-600 block mt-2">Acquisitions Again</span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get instant alerts from QuietLight, Empire Flippers, Flippa & 15+ specialized brokers
            </motion.p>

            <motion.div 
              className="mt-10 flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              >
                Get First Access to Digital Deals
                <ChartBarIcon className="ml-2 -mr-1 h-5 w-5" />
              </a>
              <a
                href="#sample-analysis"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                See Sample Deal Analysis
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[
                { label: 'Digital-Focused Brokers', value: '15+' },
                { label: 'New Digital Listings Weekly', value: '100+' },
                { label: 'Digital Assets Listed Monthly', value: '$500M+' },
                { label: 'Head Start on New Listings', value: '48h' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    {stat.label}
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-blue-600">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 