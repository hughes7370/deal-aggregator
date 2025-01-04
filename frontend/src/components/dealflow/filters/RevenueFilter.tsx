import { RangeSlider } from './RangeSlider'
import { useState } from 'react'

interface RevenueFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  isAnnual: boolean
  onIsAnnualChange: (isAnnual: boolean) => void
}

const formatRevenue = (value: number, isAnnual: boolean) => {
  const displayValue = isAnnual ? value : value / 12
  if (displayValue >= 1000000) {
    return `$${(displayValue / 1000000).toFixed(1)}M`
  }
  if (displayValue >= 1000) {
    return `$${(displayValue / 1000).toFixed(0)}K`
  }
  return `$${displayValue}`
}

export function RevenueFilter({ value, onChange, isAnnual, onIsAnnualChange }: RevenueFilterProps) {
  const handleToggle = () => {
    onIsAnnualChange(!isAnnual)
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">Revenue Range</span>
        <button
          onClick={handleToggle}
          className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Show {isAnnual ? 'Monthly' : 'Annual'}
        </button>
      </div>
      <RangeSlider
        label=""
        min={0}
        max={isAnnual ? 12000000 : 1000000} // $12M annual or $1M monthly
        step={isAnnual ? 100000 : 10000} // $100K or $10K steps
        value={value}
        onChange={onChange}
        formatValue={(val) => formatRevenue(val, isAnnual)}
      />
    </div>
  )
} 