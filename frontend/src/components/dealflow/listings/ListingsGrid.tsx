import { Listing, ViewMode } from './types'
import { ListingCard } from './ListingCard'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { Pagination } from './Pagination'
import { usePagination } from '../hooks/usePagination'

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
}: ListingsGridProps) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(listings, 1, pageSize)

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Listings */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      }`}>
        {paginatedItems.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            viewMode={viewMode}
            onSave={onSaveListing}
            onHide={onHideListing}
            isSaved={savedListings.has(listing.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
        />
      )}
    </div>
  )
} 