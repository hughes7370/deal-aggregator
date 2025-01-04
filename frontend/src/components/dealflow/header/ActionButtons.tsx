interface ActionButtonsProps {
  onSaveSearch: () => void
  onRefreshData: () => void
}

export function ActionButtons({ onSaveSearch, onRefreshData }: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onSaveSearch}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save Search
      </button>
      <button
        onClick={onRefreshData}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Refresh Data
      </button>
    </div>
  )
} 