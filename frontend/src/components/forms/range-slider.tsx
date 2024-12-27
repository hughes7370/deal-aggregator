import * as Slider from '@radix-ui/react-slider';

interface RangeSliderProps {
  label: string;
  minName: string;
  maxName: string;
  minValue: number;
  maxValue: number;
  step?: number;
  formatValue?: (value: number) => string;
  suffix?: string;
  register: any;
  setValue: any;
  watch: any;
}

export function RangeSlider({ 
  label, 
  minName, 
  maxName, 
  minValue,
  maxValue,
  step = 1,
  formatValue = (value: number) => value.toString(),
  suffix = "",
  register,
  setValue,
  watch
}: RangeSliderProps) {
  const minWatch = watch(minName) ?? minValue;
  const maxWatch = watch(maxName) ?? maxValue;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-base font-medium text-gray-900">
          {label}
          <span className="text-sm font-normal text-gray-500 ml-2">(Drag to adjust)</span>
        </label>
        <div className="text-sm text-gray-600">
          {formatValue(minWatch)}{suffix} - {formatValue(maxWatch)}{suffix}
        </div>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[minWatch, maxWatch]}
        min={minValue}
        max={maxValue}
        step={step}
        onValueChange={([min, max]) => {
          setValue(minName, min);
          setValue(maxName, max);
        }}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Min value"
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Max value"
        />
      </Slider.Root>
    </div>
  );
} 