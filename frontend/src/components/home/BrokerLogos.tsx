'use client';

import Image from 'next/image';

const brokers = [
  { name: 'QuietLight', logo: '/images/logos/logo1.png' },
  { name: 'Empire Flippers', logo: '/images/logos/logo2.png' },
  { name: 'Flippa', logo: '/images/logos/logo3.jpeg' },
  { name: 'Acquire.com', logo: '/images/logos/logo4.png' },
  { name: 'Website Closers', logo: '/images/logos/logo5.png' },
  // Add more brokers here
];

export default function BrokerLogos() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Broker Coverage
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Get instant alerts from 15+ specialized digital business brokers
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {brokers.map((broker) => (
            <div
              key={broker.name}
              className="flex justify-center items-center p-4"
            >
              <div className={`relative ${broker.name === 'Acquire.com' ? 'h-16 w-32' : 'h-20 w-40'}`}>
                <Image
                  src={broker.logo}
                  alt={`${broker.name} logo`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  style={{ objectFit: 'contain' }}
                  className="filter grayscale hover:grayscale-0 transition-all duration-200"
                  onLoadingComplete={(img) => {
                    console.log(`Loaded ${broker.name} logo:`, img.naturalWidth, 'x', img.naturalHeight);
                  }}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-center items-center p-4">
            <span className="text-gray-400 text-sm font-medium">
              Plus 10+ more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 