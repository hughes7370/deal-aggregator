import { RangeSlider } from './RangeSlider'
import { useState } from 'react'

// Threshold constants
const PROFIT_MARGIN_DISPLAY = 100 // Display up to 100%
const PROFIT_MARGIN_MAX = 200 // Include up to 200% in search for data errors
const GROWTH_RATE_THRESHOLD = 1000 // >1000%
const TEAM_SIZE_THRESHOLD = 1000 // >1000 people

const formatPercentage = (value: number, threshold?: number) => {
  // Only show ">" for growth rate at max threshold
  if (threshold && value === threshold) {
    return `> ${value}%`
  }
  // Regular percentage display for all other cases
  return `${value}%`
}

const formatTeamSize = (value: number) => {
  if (value === TEAM_SIZE_THRESHOLD) {
    return `> ${value} people`
  }
  return `${value} people`
}

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

  // Handler to ensure profit margin display matches our requirements
  const handleProfitMarginChange = (value: [number, number]) => {
    // If they try to set it above 100%, cap the display at 100%
    const displayValue: [number, number] = [
      value[0],
      Math.min(value[1], PROFIT_MARGIN_DISPLAY)
    ]
    onProfitMarginChange(displayValue)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
          <div className="relative group">
            <svg 
              className="w-4 h-4 text-gray-400 hover:text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
              We recommend not using advanced filters. It may hide relevant listings when brokers haven't included this specific information.
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-1">
                <div className="w-2 h-2 bg-gray-800 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <RangeSlider
            label="Profit Margin"
            min={-100}
            max={PROFIT_MARGIN_DISPLAY}
            step={5}
            value={profitMargin}
            onChange={handleProfitMarginChange}
            formatValue={(val) => formatPercentage(val)}
          />

          <RangeSlider
            label="Growth Rate"
            min={-100}
            max={GROWTH_RATE_THRESHOLD}
            step={10}
            value={growthRate}
            onChange={onGrowthRateChange}
            formatValue={(val) => formatPercentage(val, GROWTH_RATE_THRESHOLD)}
          />

          <RangeSlider
            label="Team Size"
            min={0}
            max={TEAM_SIZE_THRESHOLD}
            step={5}
            value={teamSize}
            onChange={onTeamSizeChange}
            formatValue={formatTeamSize}
          />

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 