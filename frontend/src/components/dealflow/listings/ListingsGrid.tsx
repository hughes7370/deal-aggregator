import { Listing, ViewMode } from './types'
import { ListingCard } from './ListingCard'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { Pagination } from './Pagination'
import { usePagination } from '../hooks/usePagination'
import { useEffect, useState } from 'react'

interface ListingsGridProps {
  listings: Listing[]
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  onSaveListing: (id: string) => void
  onHideListing: (id: string) => void
  viewMode: ViewMode
  pageSize: number
  savedListings: Set<string>
  savingListings: Set<string>
}

export function ListingsGrid({
  listings,
  isLoading = false,
  error,
  onRetry = () => {},
  onSaveListing,
  onHideListing,
  viewMode,
  pageSize,
  savedListings,
  savingListings,
}: ListingsGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(listings.length / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = listings.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-sm text-gray-500">Loading listings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-3">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-gray-500">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Try again
        </button>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-gray-100 p-3">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-gray-500">No listings found matching your criteria.</p>
        <p className="mt-2 text-sm text-gray-400">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Listings */}
      <div className={`grid gap-4 sm:gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {paginatedItems.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            viewMode={viewMode}
            onSave={onSaveListing}
            onHide={onHideListing}
            isSaved={savedListings.has(listing.id)}
            isSaving={savingListings.has(listing.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, listings.length)}</span> of{' '}
              <span className="font-medium">{listings.length}</span> results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                hasPreviousPage
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[300px] sm:max-w-none px-1">
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile

                if (totalPages <= maxVisiblePages) {
                  return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center min-w-[40px] justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ));
                }

                // Always show first page
                pages.push(1);

                // Calculate visible page range
                let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
                let end = Math.min(totalPages - 1, start + maxVisiblePages - 2);

                // Adjust start if we're near the end
                if (end === totalPages - 1) {
                  start = Math.max(2, end - (maxVisiblePages - 2));
                }

                // Add ellipsis after first page if needed
                if (start > 2) {
                  pages.push('...');
                }

                // Add middle pages
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                // Add ellipsis before last page if needed
                if (end < totalPages - 1) {
                  pages.push('...');
                }

                // Always show last page
                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                return pages.map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center min-w-[40px] justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="px-2 py-2 text-gray-500"
                    >
                      {page}
                    </span>
                  )
                ));
              })()}
            </div>
            <button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                hasNextPage
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 