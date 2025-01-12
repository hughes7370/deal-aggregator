'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from "@heroicons/react/24/outline";
import NewsletterPreview from "./NewsletterPreview";

export default function SampleDeal() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  return (
    <section id="sample-analysis" className="py-24 gradient-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-100 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-indigo-100 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Sample Deal Analysis
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            See how we analyze digital businesses across different categories
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* SaaS Business */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-indigo-50 card-hover"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 gradient-primary rounded-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Featured</span>
            </div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              SaaS Business
            </h3>
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="text-gray-900 font-semibold">$50k</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-gray-600">Multiple</span>
                <span className="text-gray-900 font-semibold">4.1x</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-gray-600">Growth Rate</span>
                <span className="text-green-600 font-semibold">+15% MoM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-gray-600">Risk Score</span>
                <span className="text-blue-600 font-semibold">8.2/10</span>
              </div>
            </div>

            {/* Collapsible Key Metrics */}
            <div className="mt-8">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg hover:bg-gray-50 border border-indigo-100 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-900">Key Metrics</span>
                {showMetrics ? (
                  <ChevronUpIcon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-indigo-500" />
                )}
              </button>
              {showMetrics && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3 px-4"
                >
                  {[
                    { label: 'LTV', value: '$8,500' },
                    { label: 'CAC', value: '$1,200' },
                    { label: 'Churn', value: '2.3%' },
                    { label: 'Margin', value: '82%' },
                    { label: 'CAC Payback', value: '4.2 months' }
                  ].map((metric, index) => (
                    <div key={metric.label} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Tech Stack */}
            <div className="mt-8">
              <div className="px-4 py-3 bg-white rounded-lg border border-indigo-100">
                <span className="text-sm font-medium text-gray-900">Tech Stack</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['React', 'Node.js', 'AWS', 'MongoDB'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-xs font-medium text-indigo-600">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible Team Structure */}
            <div className="mt-8">
              <button
                onClick={() => setShowTeam(!showTeam)}
                className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg hover:bg-gray-50 border border-indigo-100 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-900">Team Structure</span>
                {showTeam ? (
                  <ChevronUpIcon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-indigo-500" />
                )}
              </button>
              {showTeam && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2 px-4"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-900 font-medium">Size: 8 FTE</p>
                    <p className="text-sm text-gray-600 mt-1">3 Dev, 2 Sales, 2 Support, 1 PM</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="mt-8">
              <div className="px-4 py-3 bg-white rounded-lg border border-indigo-100">
                <span className="text-sm font-medium text-gray-900">AI Analysis</span>
                <div className="mt-3 space-y-3">
                  {[
                    'Consistent 15% MoM growth with expanding margins. Customer acquisition channels are diversified and scalable.',
                    'Strong product-market fit in growing B2B segment. Limited direct competition with high barriers to entry.',
                    'Low customer concentration, strong team retention, and documented processes reduce operational risks.'
                  ].map((analysis, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <p className="text-sm text-gray-600">{analysis}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter Preview */}
          <div className="lg:sticky lg:top-8">
            <NewsletterPreview />
          </div>
        </div>
      </div>
    </section>
  );
} 