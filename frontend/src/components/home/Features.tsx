'use client'

import { 
  GlobeAltIcon,
  ListBulletIcon,
  TableCellsIcon,
  SparklesIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from 'next/image';

const liveFeatures = [
  {
    title: "Unified Deal Flow",
    description: "Never Miss Another Deal - First and only platform aggregating digital business listings across all major brokers in real-time.",
    icon: GlobeAltIcon,
    points: [
      "Instant access to 15+ specialized digital brokers",
      "Early notification of new SaaS, E-commerce, and Content listings",
      "Custom alerts with advanced filtering",
      "Save 30+ hours monthly on deal sourcing",
      "Comprehensive coverage of $100K-$10M deals"
    ],
    image: "/images/platform/Alerts.png"
  },
  {
    title: "Intelligent Deal Management",
    description: "Find Exactly What You're Looking For - Powerful filtering and organization tools built for serious buyers.",
    icon: ListBulletIcon,
    points: [
      "Advanced search across all listings",
      "Custom deal views and filtering",
      "Detailed metrics at a glance",
      "Quick-action deal cards",
      "Efficient deal organization"
    ],
    image: "/images/platform/Dashboard.png"
  },
  {
    title: "Deal Pipeline Tracking",
    description: "Track Your Opportunities - Professional-grade deal tracking system designed for digital acquisitions.",
    icon: TableCellsIcon,
    points: [
      "Streamlined deal management",
      "Status and progress tracking",
      "Key metrics dashboard",
      "Important dates monitoring",
      "Deal notes and export options"
    ],
    image: "/images/platform/DealTracker.png"
  }
];

const upcomingFeatures = [
  {
    title: "AI Deal Analysis",
    description: "Make Faster, Smarter Decisions - Let our AI analyze each deal across key metrics.",
    icon: SparklesIcon,
    points: [
      "Automated deal scoring",
      "Deal comparison tools",
      "Historical performance tracking",
      "Market trend analysis",
      "Due diligence assistance"
    ]
  }
];

export default function Features() {
  return (
    <section className="pt-24 pb-32 gradient-light relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-indigo-100 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-purple-100 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text" style={{ lineHeight: '1.6' }}>
              Find High-Quality Digital Businesses<br />
              <span className="inline-block py-3">Before Anyone Else</span>
            </h2>
          </div>
          <p className="mt-6 text-xl text-gray-600">
            Get exclusive 48-hour early access to verified listings from QuietLight, Empire Flippers,<br className="hidden sm:block" />
            and 15+ specialized brokers - all in one place
          </p>
        </motion.div>

        {/* Live Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 space-y-16"
        >
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              LIVE NOW
            </span>
          </div>

          <div className="grid grid-cols-1 gap-24">
            {liveFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={`${!feature.image ? 'lg:col-span-2' : 'order-2 lg:order-1'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center gradient-primary">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.points.map((point, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mr-2" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {feature.image && (
                    <div className="order-1 lg:order-2">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-contain bg-gray-50"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-24"
        >
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              COMING SOON
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-indigo-50"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center gradient-primary mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mr-2" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 