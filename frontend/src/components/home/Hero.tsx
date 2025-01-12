'use client'

import { motion } from "framer-motion";
import { ChartBarIcon, CurrencyDollarIcon, ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  const scrollToAnalysis = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('sample-analysis');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative gradient-light overflow-hidden">
      {/* Background decoration */}
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2 opacity-20"
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
                <rect x="0" y="0" width="4" height="4" className="text-indigo-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 lg:-translate-x-1/2 opacity-20"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" className="text-purple-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
          </svg>
        </div>
      </div>

      <div className="relative pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Never Miss Quality Digital
              </span>
              <span className="block mt-2 mb-4 py-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Acquisitions Again
              </span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get 48-hour early access to digital acquisitions from specialized brokers like QuietLight, Empire Flippers & more
            </motion.p>

            <motion.div 
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Get First Access to Digital Deals
                <ChartBarIcon className="ml-2 -mr-1 h-5 w-5" />
              </a>
              <a
                href="#sample-analysis"
                onClick={scrollToAnalysis}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-lg font-medium rounded-lg text-indigo-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-indigo-300 transition-all duration-200 card-hover"
              >
                See Sample Deal Analysis
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[
                { 
                  label: 'Digital Listings Analyzed Monthly', 
                  value: '2,500+',
                  icon: ChartBarIcon,
                  color: 'from-blue-600 to-indigo-600'
                },
                { 
                  label: 'Average Deal Size', 
                  value: '$500K-5M',
                  icon: CurrencyDollarIcon,
                  color: 'from-indigo-600 to-purple-600'
                },
                { 
                  label: 'Exclusive Access Window', 
                  value: '48h',
                  icon: ClockIcon,
                  color: 'from-purple-600 to-blue-600'
                },
                { 
                  label: 'Digital-Focused Brokers', 
                  value: '15+',
                  icon: UserGroupIcon,
                  color: 'from-blue-600 to-indigo-600'
                },
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2.5 bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <dt className="text-sm font-medium text-gray-600 leading-6">
                      {stat.label}
                    </dt>
                  </div>
                  <dd className="mt-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 