'use client';

import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const dealCategories = [
  {
    name: "SaaS",
    newListings: "15-20",
    avgMultiple: "4.2x",
    dealSize: "$500K-3M",
    timeToClose: "45-60 days",
    buyerCompetition: "Medium",
    negotiationLeverage: "High",
    financingAvailable: "75%",
    icon: ChartBarIcon,
  },
  {
    name: "E-commerce",
    newListings: "25-30",
    avgMultiple: "3.5x",
    dealSize: "$300K-2M",
    timeToClose: "30-45 days",
    buyerCompetition: "High",
    negotiationLeverage: "Medium",
    financingAvailable: "65%",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Content",
    newListings: "40-50",
    avgMultiple: "3.8x",
    dealSize: "$100K-1M",
    timeToClose: "20-30 days",
    buyerCompetition: "Low",
    negotiationLeverage: "High",
    financingAvailable: "50%",
    icon: ArrowTrendingUpIcon,
  },
];

const stats = [
  {
    name: "Total Deal Value",
    value: "$250M+",
    description: "In facilitated acquisitions",
  },
  {
    name: "Successful Exits",
    value: "150+",
    description: "Completed acquisitions",
  },
  {
    name: "Time Saved",
    value: "80%",
    description: "Average deal analysis time",
  },
  {
    name: "Multiple Savings",
    value: "15-20%",
    description: "Through early access",
  },
];

export default function DealFlowOverview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">Deal Flow Overview</h2>
          <p className="mt-4 text-xl text-gray-500">
            Real-time insights into digital acquisition opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <dt className="text-base font-medium text-gray-500">{stat.name}</dt>
              <dd className="mt-2 text-3xl font-bold text-blue-600">{stat.value}</dd>
              <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/market-intelligence"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            View Full Market Data
          </a>
        </motion.div>
      </div>
    </section>
  );
} 