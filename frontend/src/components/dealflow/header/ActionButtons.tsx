import { ViewMode } from '../listings/types'
import { ArrowPathIcon, TableCellsIcon, ListBulletIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export interface ActionButtonsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onSaveSearch: () => void
  onRefreshData: () => void
}

export function ActionButtons({
  viewMode,
  onViewModeChange,
  onSaveSearch,
  onRefreshData,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-6">
      {/* View mode toggle */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-600">View:</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <motion.button
            whileHover={{ backgroundColor: viewMode === 'grid' ? '#EEF2FF' : '#F9FAFB' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange('grid')}
            className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${
              viewMode === 'grid'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableCellsIcon className="mr-1.5 h-4 w-4" />
            Grid
            {viewMode === 'grid' && (
              <motion.div
                layoutId="viewModeHighlight"
                className="absolute inset-0 rounded-md border border-indigo-200 bg-indigo-50"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: viewMode === 'list' ? '#EEF2FF' : '#F9FAFB' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange('list')}
            className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${
              viewMode === 'list'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListBulletIcon className="mr-1.5 h-4 w-4" />
            List
            {viewMode === 'list' && (
              <motion.div
                layoutId="viewModeHighlight"
                className="absolute inset-0 rounded-md border border-indigo-200 bg-indigo-50"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#4F46E5' }}
          whileTap={{ scale: 0.98 }}
          onClick={onSaveSearch}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <BookmarkIcon className="mr-1.5 h-4 w-4" />
          Save Search
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#F9FAFB' }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefreshData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ArrowPathIcon className="mr-1.5 h-4 w-4" />
          Refresh Data
        </motion.button>
      </div>
    </div>
  )
} 