import Link from 'next/link';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface QuickFilter {
  label: string;
  href: string;
  color: string;
}

export function QuickFilters() {
  const filters: QuickFilter[] = [
    {
      label: 'SaaS Under $1M',
      href: '/dealflow?type=saas&maxPrice=1000000',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: 'E-commerce $1M-$5M',
      href: '/dealflow?type=ecommerce&minPrice=1000000&maxPrice=5000000',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
    {
      label: 'Content Sites',
      href: '/dealflow?type=content',
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
      label: 'High Growth (>50%)',
      href: '/dealflow?minGrowth=50',
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Common Searches</h3>
        <Link
          href="/alert-management"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
          Manage Alerts
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.href}
            className={`${filter.color} rounded-lg px-4 py-3 text-center font-medium transition-colors duration-200`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
    </div>
  );
} 