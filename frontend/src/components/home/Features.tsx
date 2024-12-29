'use client'

import { 
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Powered Deal Analysis",
    description: "Get instant insights on business health, growth trajectory, and risk factors using our advanced AI algorithms.",
    icon: SparklesIcon,
    example: {
      title: "Sample Analysis Report",
      items: [
        "Customer Cohort Analysis",
        "Revenue Quality Score: 8.5/10",
        "Growth Sustainability Index",
        "Risk Factor Breakdown"
      ]
    }
  },
  {
    title: "Smart Deal Filtering",
    description: "Save time with automated spam removal and intelligent ranking of high-potential opportunities based on your criteria.",
    icon: DocumentMagnifyingGlassIcon,
    example: {
      title: "Filter Interface",
      items: [
        "Revenue Range: $100K-$5M",
        "Industry: SaaS, Content, FBA",
        "Growth Rate: >15% YoY",
        "Profit Margins: >40%"
      ]
    }
  },
  {
    title: "Market Comparables",
    description: "Compare deals against our database of verified transactions to ensure you're getting the best value.",
    icon: ChartBarIcon,
    example: {
      title: "Comparison Dashboard",
      items: [
        "Similar Deals Analysis",
        "Industry Multiple Range",
        "Valuation Benchmarks",
        "Growth vs. Multiple Chart"
      ]
    }
  },
  {
    title: "Priority Access",
    description: "Get notified about matching deals before they're publicly listed, giving you a competitive edge.",
    icon: BoltIcon,
    example: {
      title: "Alert System",
      items: [
        "48-Hour Early Access",
        "Instant SMS/Email Alerts",
        "One-Click Deal Review",
        "Direct Broker Contact"
      ]
    }
  },
  {
    title: "Risk Assessment",
    description: "Comprehensive evaluation of customer concentration, churn rates, and other critical risk factors.",
    icon: ShieldCheckIcon,
    example: {
      title: "Risk Dashboard",
      items: [
        "Customer Concentration",
        "Platform Dependencies",
        "Traffic Diversity Score",
        "Competitive Analysis"
      ]
    }
  },
  {
    title: "Performance Tracking",
    description: "Track key performance metrics and identify growth opportunities in your target deals.",
    icon: ArrowTrendingUpIcon,
    example: {
      title: "Metrics Dashboard",
      items: [
        "MRR/ARR Growth Trends",
        "Customer Acquisition Cost",
        "Lifetime Value Analysis",
        "Margin Evolution"
      ]
    }
  },
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
          <h2 className="text-3xl font-bold text-gray-900">Powerful Features</h2>
          <p className="mt-4 text-xl text-gray-500">
            Everything you need to find and evaluate the perfect acquisition opportunity
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {feature.example.title}
                </h4>
                <ul className="space-y-2">
                  {feature.example.items.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 