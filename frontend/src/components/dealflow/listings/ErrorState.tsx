interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export function ErrorState({ 
  message = 'Something went wrong while loading the listings.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 48 48"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M24 4v4m0 32v4M4 24h4m32 0h4m-4.343-13.657l-2.828 2.828m-20.142 20.142l-2.828 2.828m25.798 0l-2.828-2.828M7.172 10.343l-2.828-2.828M24 12a12 12 0 110 24 12 12 0 010-24zm0 8v4m0 4h.01"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      <div className="mt-6">
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 