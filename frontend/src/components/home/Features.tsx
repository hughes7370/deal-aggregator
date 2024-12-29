'use client'

import { 
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  BellAlertIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Powered Deal Analysis",
    description: "Get instant insights on business health, growth trajectory, and risk factors using our advanced AI algorithms.",
    icon: SparklesIcon,
  },
  {
    title: "Smart Deal Filtering",
    description: "Save time with automated spam removal and intelligent ranking of high-potential opportunities based on your criteria.",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    title: "Real-time Market Comps",
    description: "Compare deals against our database of verified transactions to ensure you're getting the best value.",
    icon: ChartBarIcon,
  },
  {
    title: "Priority Access",
    description: "Get notified about matching deals before they're publicly listed, giving you a competitive edge.",
    icon: BoltIcon,
  },
  {
    title: "Risk Assessment",
    description: "Comprehensive evaluation of customer concentration, churn rates, and other critical risk factors.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Smart Alerts",
    description: "Customizable notifications via email and mobile, with detailed PDF reports and key metrics.",
    icon: BellAlertIcon,
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
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 