'use client'

import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  DocumentMagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

const features = [
  {
    title: "Smart Deal Filtering",
    description: "Automatically remove spam and low-quality listings while assessing platform risk and growth potential.",
    icon: ChartBarIcon,
  },
  {
    title: "Deep Analysis",
    description: "Comprehensive evaluation of revenue stability, market position, and risk factors with comparable deal data.",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    title: "Priority Alerts",
    description: "Customizable notification timing with mobile & email delivery, including detailed PDF reports.",
    icon: ShieldCheckIcon,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 