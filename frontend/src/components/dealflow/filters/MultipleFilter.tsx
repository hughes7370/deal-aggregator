import { RangeSlider } from './RangeSlider'

const MULTIPLE_THRESHOLD = 10 // 10.0x

const formatMultiple = (value: number) => {
  // Show ">" symbol for the threshold value
  if (value === MULTIPLE_THRESHOLD) {
    return `> ${value.toFixed(1)}x`
  }
  return `${value.toFixed(1)}x`
}

interface MultipleFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function MultipleFilter({ value, onChange }: MultipleFilterProps) {
  return (
    <div className="py-2">
      <RangeSlider
        label="Multiple Range"
        min={0}
        max={MULTIPLE_THRESHOLD}
        step={0.1}
        value={value}
        onChange={onChange}
        formatValue={formatMultiple}
      />
    </div>
  )
} 