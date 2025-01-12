interface ResultsCountProps {
  count: number
}

export function ResultsCount({ count }: ResultsCountProps) {
  return (
    <div className="text-sm text-gray-600">
      {count} {count === 1 ? 'listing' : 'listings'}
    </div>
  )
} 