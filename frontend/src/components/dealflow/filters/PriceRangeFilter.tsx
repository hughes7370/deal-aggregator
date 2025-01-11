import { RangeSlider } from './RangeSlider'

interface PriceRangeFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

const PRICE_THRESHOLD = 10000000 // $10M

const formatPrice = (value: number) => {
  // Show ">" symbol for the threshold value
  if (value === PRICE_THRESHOLD) {
    return `> $10M`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value}`
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  return (
    <div className="py-2">
      <RangeSlider
        label="Price Range"
        min={0}
        max={PRICE_THRESHOLD}
        step={50000} // $50K steps
        value={value}
        onChange={onChange}
        formatValue={formatPrice}
      />
    </div>
  )
} 