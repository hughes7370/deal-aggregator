'use client'

import { motion } from "framer-motion";
import {
  SparklesIcon,
  FunnelIcon,
  ChartBarIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "AI-Powered Analysis",
    description: "Get instant insights on any digital business with our advanced AI analysis engine.",
    icon: SparklesIcon,
    link: "/features#ai-analysis"
  },
  {
    name: "Smart Deal Filtering",
    description: "Find the perfect acquisition target with customizable filters and alerts.",
    icon: FunnelIcon,
    link: "/features#deal-filtering"
  },
  {
    name: "Market Comparables",
    description: "Compare deals against similar businesses to ensure fair pricing.",
    icon: ChartBarIcon,
    link: "/features#market-comps"
  },
  {
    name: "Priority Access",
    description: "Get early access to new listings before they go public.",
    icon: BoltIcon,
    link: "/features#priority-access"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Core Features</h2>
          <p className="mt-4 text-xl text-gray-500">
            Everything you need to find and analyze digital acquisitions
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div>
                <feature.icon className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                <a
                  href={feature.link}
                  className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Learn More
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/features"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Explore All Features
          </a>
        </motion.div>
      </div>
    </section>
  );
} 