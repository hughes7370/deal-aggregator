interface ResultsCountProps {
  showing: number
  total: number
}

export function ResultsCount({ showing, total }: ResultsCountProps) {
  return (
    <div className="text-sm text-gray-600">
      Showing <span className="font-medium">{showing}</span> of{' '}
      <span className="font-medium">{total}</span> listings
    </div>
  )
} 