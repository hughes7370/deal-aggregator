'use client';

import { motion } from "framer-motion";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function NewsletterPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-indigo-50 card-hover"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 gradient-accent rounded-xl">
            <EnvelopeIcon className="w-6 h-6 text-white" />
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">New Alert</span>
        </div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          My First Alert - Deal Alert
        </h3>
        <p className="mt-2 text-gray-600">Here are new listings matching your criteria:</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Alert Criteria: My First Alert</h4>
        <div className="space-y-2">
          <p className="text-gray-700">Basic Criteria:</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-indigo-600 border border-indigo-100">
              $1,000 - $100,000,000
            </span>
            <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-purple-600 border border-purple-100">
              SaaS
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-indigo-100 rounded-xl p-6">
        <h4 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          SaaS Marketplace | Entertainment Venue Tickets | In-House Tech Stack
        </h4>
        
        <div className="space-y-3">
          {[
            { label: 'Asking Price', value: '$8,500,000' },
            { label: 'Revenue', value: '$12,500,000' },
            { label: 'EBITDA', value: '$1,736,665' },
            { label: 'Industry', value: 'Software/SaaS' },
            { label: 'Listing Broker', value: 'BizBuySell' },
            { label: 'Profit Margin', value: '13.9%' },
            { label: 'Selling Multiple', value: '4.9x' },
          ].map((item, index) => (
            <div key={index} className="flex items-center p-2 hover:bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg transition-colors duration-200">
              <span className="text-gray-600 w-32">{item.label}:</span>
              <span className="text-gray-900 font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-gray-600 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          WebsiteClosers® presents a top-tier SaaS-based ecosystem in the Ticket Reseller Market focused on the entertainment industry, including Concert, Theater & Sports Ticket Sales. The company stands out a...
        </p>

        <motion.button 
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white gradient-accent shadow-md hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Listing Details
        </motion.button>
      </div>
    </motion.div>
  );
} 