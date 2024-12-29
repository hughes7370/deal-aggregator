'use client';

import { motion } from "framer-motion";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function SampleDeal() {
  return (
    <section className="py-16 bg-gray-50">
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
            See how we analyze and present digital business opportunities
          </p>
        </motion.div>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Deal Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <CubeIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-900">SaaS Business</span>
                <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Featured
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">$50k MRR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Multiple</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">4.1x</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Growth Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-green-600">+15% MoM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">8.2/10</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Key Metrics</h4>
                <dl className="mt-2 grid grid-cols-1 gap-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <dt className="text-sm text-gray-500">Customer Churn</dt>
                    <dd className="text-sm text-gray-900">2.3%</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <dt className="text-sm text-gray-500">Gross Margin</dt>
                    <dd className="text-sm text-gray-900">82%</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-sm text-gray-500">CAC Payback</dt>
                    <dd className="text-sm text-gray-900">4.2 months</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 lg:mt-0"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
                AI-Powered Analysis
              </h3>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-medium text-gray-900">
                    <ChartBarIcon className="h-5 w-5 text-green-500 mr-2" />
                    Growth Analysis
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Consistent 15% MoM growth with expanding margins. Customer acquisition channels are diversified and scalable.
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-medium text-gray-900">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Market Position
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Strong product-market fit in growing B2B segment. Limited direct competition with high barriers to entry.
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-medium text-gray-900">
                    <ShieldCheckIcon className="h-5 w-5 text-indigo-500 mr-2" />
                    Risk Assessment
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Low customer concentration, strong team retention, and documented processes reduce operational risks.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="/sign-up"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Access to Similar Deals
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 