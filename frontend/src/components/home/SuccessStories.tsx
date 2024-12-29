'use client';

import { motion } from "framer-motion";
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const stories = [
  {
    title: "Acquired SaaS business at 3.2x multiple through early access alert",
    details: {
      revenue: "$2.5M ARR",
      margins: "65% margins",
      timeline: "closed in 45 days"
    },
    background: "Former PE Associate, now Digital Portfolio Owner",
    icon: ChartBarIcon,
    color: "blue",
  },
  {
    title: "Found content site before public listing, saved 22% on purchase price",
    details: {
      revenue: "$75K MRR",
      margins: "80% profit margins",
      timeline: "closed in 30 days"
    },
    background: "Serial Digital Acquirer",
    icon: ArrowTrendingUpIcon,
    color: "green",
  },
  {
    title: "Secured FBA brand through exclusive early access window",
    details: {
      revenue: "$150K MRR",
      margins: "55% margins",
      timeline: "closed in 60 days"
    },
    background: "E-commerce Portfolio Manager",
    icon: CurrencyDollarIcon,
    color: "indigo",
  },
];

export default function SuccessStories() {
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
          <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="mt-4 text-xl text-gray-500">
            Real results from our early access community
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {stories.map((story, index) => (
            <motion.div
              key={story.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-${story.color}-100 rounded-full opacity-50`} />
              
              <div className="relative">
                <div className={`inline-flex p-3 rounded-lg bg-${story.color}-100 text-${story.color}-600`}>
                  <story.icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {story.title}
                </h3>

                <dl className="mt-4 space-y-2">
                  {Object.entries(story.details).map(([key, value]) => (
                    <div key={key} className="flex items-center text-gray-500">
                      <dt className="sr-only">{key}</dt>
                      <dd className="text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {story.background}
                  </p>
                </div>
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
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Join Our Success Stories
          </a>
        </motion.div>
      </div>
    </section>
  );
} 