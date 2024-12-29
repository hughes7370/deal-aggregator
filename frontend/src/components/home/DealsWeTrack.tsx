'use client';

import { motion } from "framer-motion";
import {
  CubeIcon,
  ShoppingCartIcon,
  NewspaperIcon,
  WrenchIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const dealTypes = [
  {
    name: 'SaaS & Subscription',
    description: 'Software platforms and recurring revenue businesses',
    icon: CubeIcon,
  },
  {
    name: 'FBA & E-commerce',
    description: 'Amazon FBA, DTC brands, and online retail',
    icon: ShoppingCartIcon,
  },
  {
    name: 'Content & Affiliate',
    description: 'Content sites, blogs, and affiliate businesses',
    icon: NewspaperIcon,
  },
  {
    name: 'Digital Services',
    description: 'Digital agencies, consulting, and online services',
    icon: WrenchIcon,
  },
  {
    name: 'Tech-Enabled Businesses',
    description: 'Traditional businesses with tech advantages',
    icon: ComputerDesktopIcon,
  },
];

export default function DealsWeTrack() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Deals We Track</h2>
          <p className="mt-4 text-xl text-gray-500">
            Specialized coverage across all digital business models
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {dealTypes.map((dealType, index) => (
            <motion.div
              key={dealType.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white group-hover:bg-blue-100 transition-colors duration-200">
                  <dealType.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  {dealType.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {dealType.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 