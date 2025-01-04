export type BusinessType = 'service' | 'software' | 'ecommerce' | 'other'

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'software', label: 'Software/SaaS' },
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'other', label: 'Other' },
]

interface BusinessTypeFilterProps {
  selected: BusinessType[]
  onChange: (selected: BusinessType[]) => void
}

export function BusinessTypeFilter({ selected, onChange }: BusinessTypeFilterProps) {
  const handleChange = (type: BusinessType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div className="py-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Business Type</h3>
      <div className="space-y-2">
        {BUSINESS_TYPES.map((type) => (
          <label key={type.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(type.value)}
              onChange={() => handleChange(type.value)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">{type.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
} 