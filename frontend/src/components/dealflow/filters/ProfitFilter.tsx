import { RangeSlider } from './RangeSlider'
import { useState } from 'react'

const PROFIT_THRESHOLD = 5000000 // $5M

const formatProfit = (value: number, isAnnual: boolean) => {
  // Show ">" symbol for the threshold value
  if (value === PROFIT_THRESHOLD) {
    return `> $5M${isAnnual ? '/yr' : '/mo'}`
  }
  
  const displayValue = value >= 1000000
    ? `$${(value / 1000000).toFixed(1)}M`
    : value >= 1000
    ? `$${(value / 1000).toFixed(0)}K`
    : `$${value}`

  return `${displayValue}${isAnnual ? '/yr' : '/mo'}`
}

interface ProfitFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  isAnnual: boolean
  onIsAnnualChange: (isAnnual: boolean) => void
}

export function ProfitFilter({ value, onChange, isAnnual, onIsAnnualChange }: ProfitFilterProps) {
  return (
    <div className="py-2 space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Profit Range</label>
        <button
          onClick={() => onIsAnnualChange(!isAnnual)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Show {isAnnual ? 'Monthly' : 'Annual'}
        </button>
      </div>
      <RangeSlider
        label=""
        min={0}
        max={PROFIT_THRESHOLD}
        step={50000}
        value={value}
        onChange={onChange}
        formatValue={(val) => formatProfit(val, isAnnual)}
      />
    </div>
  )
} 