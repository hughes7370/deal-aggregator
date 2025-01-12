import { ChartBarIcon, DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getKeyMetrics } from '@/hooks/useKeyMetrics';

interface Metric {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

export default async function KeyMetrics({ userId }: { userId: string }) {
  const metrics = await getKeyMetrics(userId);

  const metricsData: Metric[] = [
    {
      label: 'New Listings',
      value: metrics.newListingsCount,
      icon: DocumentTextIcon,
      color: 'text-blue-500',
    },
    {
      label: 'Matching Your Criteria',
      value: metrics.matchingCriteriaCount,
      icon: FunnelIcon,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {metricsData.map((metric) => (
        <div
          key={metric.label}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${metric.color} bg-opacity-10`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{metric.label}</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
} 