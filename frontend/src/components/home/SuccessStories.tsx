'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "TechVentures Inc",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "DealSight helped us find our first SaaS acquisition. The AI-powered insights saved us countless hours of research.",
    rating: 5
  },
  {
    name: "Michael Roberts",
    role: "Serial Entrepreneur",
    company: "Digital Assets Group",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "The platform's deal alerts are a game-changer. We were able to close a deal 20% below market value thanks to early access.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Investment Partner",
    company: "Growth Capital Partners",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "What impressed me most was the quality of analysis. The platform helps us make data-driven decisions with confidence.",
    rating: 5
  }
];

export default function SuccessStories() {
  return (
    <div className="py-24 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="lg:text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base text-[#0096FF] font-semibold tracking-wide uppercase font-inter">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-[#1A365D] sm:text-4xl font-inter">
            Trusted by Business Buyers
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto font-['Source_Sans_Pro']">
            Hear from entrepreneurs who found their perfect business match through our platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-[#0096FF]/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <h3 className="text-lg font-semibold text-[#1A365D]">
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

              <blockquote className="text-gray-600 font-['Source_Sans_Pro'] italic">
                "{testimonial.quote}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 