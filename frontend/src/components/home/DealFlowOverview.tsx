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
    icon: ChartBarIcon,
  },
  {
    name: "E-commerce",
    newListings: "25-30",
    avgMultiple: "3.5x",
    dealSize: "$300K-2M",
    timeToClose: "30-45 days",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Content",
    newListings: "40-50",
    avgMultiple: "3.8x",
    dealSize: "$100K-1M",
    timeToClose: "20-30 days",
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

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {dealCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <category.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">
                  {category.name}
                </h3>
              </div>

              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Weekly New Listings</dt>
                  <dd className="text-sm font-medium text-gray-900">{category.newListings}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Average Multiple</dt>
                  <dd className="text-sm font-medium text-gray-900">{category.avgMultiple}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Typical Deal Size</dt>
                  <dd className="text-sm font-medium text-gray-900">{category.dealSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Time to Close</dt>
                  <dd className="text-sm font-medium text-gray-900">{category.timeToClose}</dd>
                </div>
              </dl>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
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
      </div>
    </section>
  );
} 