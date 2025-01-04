import { useMemo, useEffect, useCallback, useState } from 'react'

interface PaginationResult<T> {
  currentPage: number
  totalPages: number
  pageSize: number
  paginatedItems: T[]
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToNextPage: () => void
  goToPreviousPage: () => void
}

export function usePagination<T>(
  items: T[],
  initialPage = 1,
  initialPageSize = 9
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items])

  const paginationDetails = useMemo(() => {
    const totalPages = Math.ceil(items.length / pageSize)
    
    // Ensure current page is within bounds
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages))
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage)
    }

    const startIndex = (validCurrentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, items.length)
    const paginatedItems = items.slice(startIndex, endIndex)

    return {
      totalPages,
      paginatedItems,
      hasNextPage: validCurrentPage < totalPages,
      hasPreviousPage: validCurrentPage > 1,
    }
  }, [items, currentPage, pageSize])

  const goToNextPage = useCallback(() => {
    if (paginationDetails.hasNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [paginationDetails.hasNextPage])

  const goToPreviousPage = useCallback(() => {
    if (paginationDetails.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [paginationDetails.hasPreviousPage])

  return {
    currentPage,
    totalPages: paginationDetails.totalPages,
    pageSize,
    paginatedItems: paginationDetails.paginatedItems,
    setCurrentPage,
    setPageSize,
    hasNextPage: paginationDetails.hasNextPage,
    hasPreviousPage: paginationDetails.hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  }
} 