import { useState } from 'react'
import { RangeSlider } from './RangeSlider'

interface AdvancedFiltersProps {
  profitMargin: [number, number]
  onProfitMarginChange: (value: [number, number]) => void
  growthRate: [number, number]
  onGrowthRateChange: (value: [number, number]) => void
  teamSize: [number, number]
  onTeamSizeChange: (value: [number, number]) => void
  location: string
  onLocationChange: (value: string) => void
}

const formatPercentage = (value: number) => `${value}%`

export function AdvancedFilters({
  profitMargin,
  onProfitMarginChange,
  growthRate,
  onGrowthRateChange,
  teamSize,
  onTeamSizeChange,
  location,
  onLocationChange,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show More</span>
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          <RangeSlider
            label="Profit Margin"
            min={0}
            max={100}
            step={1}
            value={profitMargin}
            onChange={onProfitMarginChange}
            formatValue={formatPercentage}
          />

          <RangeSlider
            label="Growth Rate"
            min={-50}
            max={200}
            step={5}
            value={growthRate}
            onChange={onGrowthRateChange}
            formatValue={formatPercentage}
          />

          <RangeSlider
            label="Team Size"
            min={0}
            max={100}
            step={1}
            value={teamSize}
            onChange={onTeamSizeChange}
            formatValue={(val) => `${val} people`}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Enter location..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
} 