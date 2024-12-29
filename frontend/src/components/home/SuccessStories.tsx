'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ArrowTrendingUpIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "TechVentures Inc",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "The AI analysis helped us spot a SaaS business with hidden potential. Post-acquisition, we've grown revenue by 156% in 12 months.",
    rating: 5,
    stats: {
      icon: ArrowTrendingUpIcon,
      label: "Growth",
      value: "+156%"
    }
  },
  {
    name: "Michael Roberts",
    role: "Serial Acquirer",
    company: "Digital Assets Group",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "Thanks to early deal alerts, we acquired a profitable e-commerce brand at 3.2x multiple, well below market average.",
    rating: 5,
    stats: {
      icon: BanknotesIcon,
      label: "Multiple",
      value: "3.2x"
    }
  },
  {
    name: "Lisa Thompson",
    role: "Investment Partner",
    company: "Growth Capital Partners",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "From deal discovery to due diligence, we closed our latest acquisition in just 45 days. The platform's analysis tools are exceptional.",
    rating: 5,
    stats: {
      icon: ClockIcon,
      label: "Time to Close",
      value: "45 days"
    }
  }
];

export default function SuccessStories() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
            Success Stories
          </h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Real Results from Real Buyers
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Join hundreds of entrepreneurs who found their perfect acquisition through our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              <blockquote className="text-gray-600 text-lg mb-6">
                "{testimonial.quote}"
              </blockquote>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <testimonial.stats.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{testimonial.stats.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{testimonial.stats.value}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 