'use client';

import { motion } from "framer-motion";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ServerIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const deal = {
  type: "SaaS Business",
  icon: CubeIcon,
  tag: "Featured",
  metrics: {
    mrr: "$50k",
    multiple: "4.1x",
    growth: "+15% MoM",
    riskScore: "8.2/10",
  },
  keyMetrics: {
    ltv: "$8,500",
    cac: "$1,200",
    churn: "2.3%",
    margin: "82%",
    cacPayback: "4.2 months",
  },
  techStack: ["React", "Node.js", "AWS", "MongoDB"],
  team: {
    size: "8 FTE",
    structure: "3 Dev, 2 Sales, 2 Support, 1 PM",
  },
  analysis: {
    growth: "Consistent 15% MoM growth with expanding margins. Customer acquisition channels are diversified and scalable.",
    market: "Strong product-market fit in growing B2B segment. Limited direct competition with high barriers to entry.",
    risk: "Low customer concentration, strong team retention, and documented processes reduce operational risks.",
  },
};

export default function SampleDeal() {
  return (
    <section id="sample-analysis" className="py-24 bg-gray-50">
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
            See how we analyze digital businesses
          </p>
        </motion.div>

        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <deal.icon className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-900">{deal.type}</span>
                <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {deal.tag}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{deal.metrics.mrr}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Multiple</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{deal.metrics.multiple}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Growth Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-green-600">{deal.metrics.growth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">{deal.metrics.riskScore}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Key Metrics</h4>
                <dl className="mt-2 grid grid-cols-1 gap-4">
                  {Object.entries(deal.keyMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                      <dd className="text-sm text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6">
                <h4 className="flex items-center text-sm font-medium text-gray-900">
                  <ServerIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Tech Stack
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {deal.techStack.map((tech) => (
                    <span key={tech} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="flex items-center text-sm font-medium text-gray-900">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Team Structure
                </h4>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Size: {deal.team.size}</p>
                  <p className="mt-1">{deal.team.structure}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="flex items-center text-sm font-medium text-gray-900">
                    <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
                    AI Analysis
                  </h4>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-500">{deal.analysis.growth}</p>
                    <p className="text-sm text-gray-500">{deal.analysis.market}</p>
                    <p className="text-sm text-gray-500">{deal.analysis.risk}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/deal-analysis"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            View More Examples
          </a>
        </motion.div>
      </div>
    </section>
  );
} 