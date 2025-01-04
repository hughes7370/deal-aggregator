export type SortOption = 'newest' | 'price_high_low' | 'price_low_high' | 'revenue_high_low' | 'revenue_low_high'

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="block w-[180px] rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="newest">Newest</option>
        <option value="price_high_low">Price: High to Low</option>
        <option value="price_low_high">Price: Low to High</option>
        <option value="revenue_high_low">Revenue: High to Low</option>
        <option value="revenue_low_high">Revenue: Low to High</option>
      </select>
    </div>
  )
} 