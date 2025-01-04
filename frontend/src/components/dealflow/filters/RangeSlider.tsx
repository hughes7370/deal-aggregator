import * as Slider from '@radix-ui/react-slider'

interface RangeSliderProps {
  label: string
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (val) => val.toString()
}: RangeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{formatValue(value[0])}</span>
          <span>{formatValue(value[1])}</span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={onChange}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
            <Slider.Range className="absolute bg-indigo-600 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            aria-label="Min value"
          />
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            aria-label="Max value"
          />
        </Slider.Root>
      </div>
    </div>
  )
} 