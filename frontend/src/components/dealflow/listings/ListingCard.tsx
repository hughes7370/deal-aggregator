import { useState } from 'react'
import { Listing, ViewMode } from './types'
import { formatPrice, formatMetric } from '../utils/formatters'
import { ListingPreviewModal } from './ListingPreviewModal'
import {
  BuildingStorefrontIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  BriefcaseIcon,
  HeartIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

interface ListingCardProps {
  listing: Listing
  viewMode: ViewMode
  onSave: (id: string) => void
  onHide: (id: string) => void
  isSaved: boolean
  isSaving?: boolean
}

const getBusinessTypeIcon = (title: string, type: string): typeof QuestionMarkCircleIcon => {
  // First check the business type
  if (type === 'ecommerce') return BuildingStorefrontIcon
  if (type === 'software') return ComputerDesktopIcon
  if (type === 'service') return BriefcaseIcon

  // Then check the title for specific keywords
  const titleLower = title.toLowerCase()
  if (titleLower.includes('clinic') || titleLower.includes('medical') || titleLower.includes('health')) return HeartIcon
  if (titleLower.includes('engineering')) return WrenchScrewdriverIcon
  if (titleLower.includes('consulting')) return BuildingOfficeIcon
  if (titleLower.includes('legal') || titleLower.includes('law')) return ScaleIcon
  if (titleLower.includes('education') || titleLower.includes('training')) return AcademicCapIcon
  if (titleLower.includes('retail') || titleLower.includes('shop')) return ShoppingBagIcon
  if (titleLower.includes('beauty') || titleLower.includes('spa')) return SparklesIcon
  if (titleLower.includes('lab') || titleLower.includes('research')) return BeakerIcon

  return BUSINESS_TYPE_ICONS[type] || BriefcaseIcon
}

const BUSINESS_TYPE_ICONS = {
  'ecommerce': BuildingStorefrontIcon,
  'software': ComputerDesktopIcon,
  'service': BriefcaseIcon,
  'other': BriefcaseIcon
}

export function ListingCard({ listing, viewMode, onSave, onHide, isSaved, isSaving = false }: ListingCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const {
    id,
    title,
    description,
    price,
    monthlyRevenue,
    monthlyProfit,
    multiple,
    daysListed,
    hoursListed,
    businessType,
    source,
    location,
    listing_url
  } = listing

  const BusinessTypeIcon = getBusinessTypeIcon(title, businessType)
  const isNew = daysListed === 0 && hoursListed <= 48 // 48 hours or less

  return (
    <>
      <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 h-full relative group ${
          viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Actions Bar - Always visible on mobile, hidden on desktop until hover */}
        <div className={`${
          isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        } absolute top-0 right-0 p-2 z-10 flex items-center space-x-1 transition-opacity duration-200 sm:bg-white/80 backdrop-blur-sm`}>
          <button
            onClick={() => onSave(id)}
            disabled={isSaving}
            className={`p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors ${
              isSaved ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onHide(id)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`p-4 sm:p-5 flex flex-col h-full ${viewMode === 'list' ? 'sm:flex-row sm:items-center sm:space-x-6' : ''}`}>
          {/* Header with days/hours listed */}
          <div className={`flex items-start ${viewMode === 'list' ? 'sm:w-48 flex-shrink-0' : 'mb-4'}`}>
            <div className="flex flex-wrap items-center gap-2">
              {isNew && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  New
                </span>
              )}
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {daysListed > 0 ? `${daysListed}d` : `${hoursListed}h`}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'mb-4 flex-grow'}`}>
            <div className="flex items-start space-x-2 mb-2">
              <BusinessTypeIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">{title}</h3>
                {location && location !== '00' && location !== '' && (
                  <p className="text-sm text-gray-500 mt-1">{location}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 ml-7">{description}</p>
          </div>

          {/* Source Platform */}
          <div className="flex justify-end mb-2">
            <span className="text-xs text-gray-400 capitalize">
              {source.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Key Metrics */}
          <div className={`grid gap-3 pt-3 border-t border-gray-100 ${
            viewMode === 'list' 
              ? 'sm:w-96 grid-cols-2 sm:grid-cols-4 sm:pt-0 sm:border-0' 
              : 'grid-cols-2'
          }`}>
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <div className="text-xs font-medium text-blue-600 mb-1">Price</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{formatPrice(price)}</div>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <div className="text-xs font-medium text-green-600 mb-1">Revenue</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{formatMetric(monthlyRevenue)}/mo</div>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
              <div className="text-xs font-medium text-purple-600 mb-1">Profit</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{formatMetric(monthlyProfit)}/mo</div>
            </div>
            <div className="bg-indigo-50 p-2 sm:p-3 rounded-lg">
              <div className="text-xs font-medium text-indigo-600 mb-1">Multiple</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{multiple.toFixed(1)}x</div>
            </div>
          </div>

          {/* Quick Action Overlay - Show on hover for desktop, show as buttons for mobile */}
          <div className="mt-4 sm:mt-0">
            <div className="sm:hidden flex flex-col gap-2">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
              >
                <EyeIcon className="w-5 h-5 mr-1.5" />
                Quick View
              </button>
              {listing_url && (
                <a
                  href={listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-1.5" />
                  View Original
                </a>
              )}
            </div>
            <div 
              className={`hidden sm:flex absolute inset-x-0 bottom-0 top-16 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all duration-200 items-center justify-center space-x-4 ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
              >
                <EyeIcon className="w-5 h-5 mr-1.5" />
                Quick View
              </button>
              {listing_url && (
                <a
                  href={listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-1.5" />
                  View Original
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ListingPreviewModal
        listing={listing}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSave={() => onSave(id)}
        isSaved={isSaved}
        isSaving={isSaving}
      />
    </>
  )
} 