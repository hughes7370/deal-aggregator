'use client';

import { motion } from "framer-motion";

export default function NewsletterPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">My First Alert - Deal Alert</h3>
        <p className="mt-2 text-gray-600">Here are new listings matching your criteria:</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Alert Criteria: My First Alert</h4>
        <div className="space-y-2">
          <p className="text-gray-700">Basic Criteria:</p>
          <p className="text-gray-600">Price Range: $1,000 - $100,000,000</p>
          <p className="text-gray-600">Industries: SaaS</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">
          SaaS Marketplace | Entertainment Venue Tickets | In-House Tech Stack
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Asking Price:</span>
            <span className="text-gray-900 font-medium">$8,500,000</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Revenue:</span>
            <span className="text-gray-900 font-medium">$12,500,000</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">EBITDA:</span>
            <span className="text-gray-900 font-medium">$1,736,665</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Industry:</span>
            <span className="text-gray-900 font-medium">Software/SaaS</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Listing Broker:</span>
            <span className="text-gray-900 font-medium">BizBuySell</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Profit Margin:</span>
            <span className="text-gray-900 font-medium">13.9%</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-32">Selling Multiple:</span>
            <span className="text-gray-900 font-medium">4.9x</span>
          </div>
        </div>

        <p className="mt-6 text-gray-600">
          WebsiteClosers® presents a top-tier SaaS-based ecosystem in the Ticket Reseller Market focused on the entertainment industry, including Concert, Theater & Sports Ticket Sales. The company stands out a...
        </p>

        <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          View Listing Details
        </button>
      </div>
    </motion.div>
  );
} 