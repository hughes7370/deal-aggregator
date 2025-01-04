import { Listing } from './types'
import { formatPrice, formatMetric, formatPercentage } from '../utils/formatters'
import Image from 'next/image'

interface ListingPreviewModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
}

export function ListingPreviewModal({ listing, isOpen, onClose }: ListingPreviewModalProps) {
  if (!isOpen) return null

  const {
    title,
    description,
    price,
    monthlyRevenue,
    monthlyProfit,
    multiple,
    daysListed,
    businessType,
    source,
    profitMargin,
    growthRate,
    teamSize,
    location,
  } = listing

  // Helper function to hide "00" values
  const hideIfZeroZero = (value: any) => {
    if (value === "00") return null
    if (value === 0 && typeof value === 'number') return null
    return value
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6">{description}</p>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-4">Financial Metrics</h4>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Asking Price</dt>
                    <dd className="text-sm font-semibold text-gray-900">{formatPrice(price)}</dd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Monthly Revenue</dt>
                    <dd className="text-sm font-semibold text-gray-900">{formatMetric(monthlyRevenue)}</dd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Monthly Profit</dt>
                    <dd className="text-sm font-semibold text-gray-900">{formatMetric(monthlyProfit)}</dd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Multiple</dt>
                    <dd className="text-sm font-semibold text-gray-900">{multiple.toFixed(1)}x</dd>
                  </div>
                  {profitMargin && profitMargin > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-sm text-gray-600">Profit Margin</dt>
                      <dd className="text-sm font-semibold text-gray-900">{formatPercentage(profitMargin)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-4">Business Details</h4>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Business Type</dt>
                    <dd className="text-sm font-semibold text-gray-900 capitalize">{businessType}</dd>
                  </div>
                  {hideIfZeroZero(location) && (
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-sm text-gray-600">Location</dt>
                      <dd className="text-sm font-semibold text-gray-900">{location}</dd>
                    </div>
                  )}
                  {hideIfZeroZero(teamSize) && (
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-sm text-gray-600">Team Size</dt>
                      <dd className="text-sm font-semibold text-gray-900">{teamSize} people</dd>
                    </div>
                  )}
                  {hideIfZeroZero(growthRate) && (
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-sm text-gray-600">Growth Rate</dt>
                      <dd className="text-sm font-semibold text-gray-900">{formatPercentage(growthRate)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <dt className="text-sm text-gray-600">Days Listed</dt>
                    <dd className="text-sm font-semibold text-gray-900">{daysListed} days</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  View Full Listing
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  Save for Later
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Listed on <span className="font-medium capitalize">{source.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 