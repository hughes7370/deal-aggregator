export type Source =
  | 'quietlight'
  | 'empire_flippers'
  | 'flippa'
  | 'acquire'
  | 'viking_mergers'
  | 'latonas'
  | 'bizbuysell'
  | 'business_exits'
  | 'transworld'
  | 'sunbelt'

const SOURCES: { value: Source; label: string }[] = [
  { value: 'quietlight', label: 'QuietLight' },
  { value: 'empire_flippers', label: 'Empire Flippers' },
  { value: 'flippa', label: 'Flippa' },
  { value: 'acquire', label: 'Acquire' },
  { value: 'viking_mergers', label: 'Viking Mergers' },
  { value: 'latonas', label: 'Latonas' },
  { value: 'bizbuysell', label: 'BizBuySell' },
  { value: 'business_exits', label: 'BusinessExits' },
  { value: 'transworld', label: 'TransWorld' },
  { value: 'sunbelt', label: 'Sunbelt' }
]

interface SourceFilterProps {
  selected: Source[]
  onChange: (selected: Source[]) => void
}

export function SourceFilter({ selected, onChange }: SourceFilterProps) {
  const handleChange = (source: Source) => {
    if (selected.includes(source)) {
      onChange(selected.filter((s) => s !== source))
    } else {
      onChange([...selected, source])
    }
  }

  const handleSelectAll = () => {
    onChange(SOURCES.map((s) => s.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Source/Broker</h3>
        <div className="space-x-2 text-xs">
          <button
            onClick={handleSelectAll}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleClearAll}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {SOURCES.map((source) => (
          <label key={source.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(source.value)}
              onChange={() => handleChange(source.value)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">{source.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
} 