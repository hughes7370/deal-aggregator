import { RangeSlider } from './RangeSlider'

interface MultipleFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

const formatMultiple = (value: number) => {
  return `${value.toFixed(1)}x`
}

export function MultipleFilter({ value, onChange }: MultipleFilterProps) {
  return (
    <div className="py-2">
      <RangeSlider
        label="Multiple Range"
        min={1}
        max={10}
        step={0.1}
        value={value}
        onChange={onChange}
        formatValue={formatMultiple}
      />
    </div>
  )
} 