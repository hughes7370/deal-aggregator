export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Loading Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>

              {/* Footer */}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 