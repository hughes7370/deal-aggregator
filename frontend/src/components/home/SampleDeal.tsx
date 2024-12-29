'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function SampleDeal() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Sample Deal Analysis</h2>
          <p className="mt-4 text-xl text-gray-500">
            See how we analyze digital businesses across different categories
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* SaaS Business */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h16v12H4z" />
                </svg>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Featured</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">SaaS Business</h3>
            
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="text-gray-900 font-medium">$50k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Multiple</span>
                <span className="text-gray-900 font-medium">4.1x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Growth Rate</span>
                <span className="text-green-600 font-medium">+15% MoM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Score</span>
                <span className="text-blue-600 font-medium">8.2/10</span>
              </div>
            </div>

            {/* Collapsible Key Metrics */}
            <div className="mt-6">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-900">Key Metrics</span>
                {showMetrics ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {showMetrics && (
                <div className="mt-4 space-y-2 px-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">LTV</span>
                    <span className="text-sm text-gray-900">$8,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CAC</span>
                    <span className="text-sm text-gray-900">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Churn</span>
                    <span className="text-sm text-gray-900">2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Margin</span>
                    <span className="text-sm text-gray-900">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CAC Payback</span>
                    <span className="text-sm text-gray-900">4.2 months</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack */}
            <div className="mt-6">
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Tech Stack</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">React</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Node.js</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">AWS</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">MongoDB</span>
                </div>
              </div>
            </div>

            {/* Collapsible Team Structure */}
            <div className="mt-6">
              <button
                onClick={() => setShowTeam(!showTeam)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-900">Team Structure</span>
                {showTeam ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {showTeam && (
                <div className="mt-4 space-y-2 px-4">
                  <p className="text-sm text-gray-600">Size: 8 FTE</p>
                  <p className="text-sm text-gray-600">3 Dev, 2 Sales, 2 Support, 1 PM</p>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="mt-6">
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">AI Analysis</span>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p>Consistent 15% MoM growth with expanding margins. Customer acquisition channels are diversified and scalable.</p>
                  <p>Strong product-market fit in growing B2B segment. Limited direct competition with high barriers to entry.</p>
                  <p>Low customer concentration, strong team retention, and documented processes reduce operational risks.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Similar cards for FBA and Content Site */}
          {/* ... Copy the same structure for other business types ... */}
        </div>
      </div>
    </section>
  );
} 