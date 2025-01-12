'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { ChartBarIcon, TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";

const testimonials = [
  {
    title: "Acquired SaaS business at 3.2x multiple through early access alert",
    metrics: {
      arr: "$2.5M ARR",
      margins: "65% margins",
      timeline: "closed in 45 days"
    },
    author: {
      name: "Michael Chen",
      role: "Former PE Associate, now Digital Portfolio Owner",
      image: "/images/testimonials/Michael_Chen.jpeg"
    },
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Found content site before public listing, saved 22% on purchase price",
    metrics: {
      mrr: "$75K MRR",
      margins: "80% profit margins",
      timeline: "closed in 30 days"
    },
    author: {
      name: "Sarah Thompson",
      role: "Serial Digital Acquirer",
      image: "/images/testimonials/Sarah_Thompson.jpeg"
    },
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Secured FBA brand through exclusive early access window",
    metrics: {
      mrr: "$150K MRR",
      margins: "55% margins",
      timeline: "closed in 60 days"
    },
    author: {
      name: "David Rodriguez",
      role: "E-commerce Portfolio Manager",
      image: "/images/testimonials/David_Rodriguez.jpeg"
    },
    color: "text-violet-600",
    bgColor: "bg-violet-50"
  }
];

export default function SuccessStories() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-blue-600">
            Success Stories
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            See how buyers are finding and closing deals through our platform
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-8"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={testimonial.author.image}
                      alt={testimonial.author.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="64px"
                      priority={index === 0}
                    />
                  </div>
                  <h3 className={`text-lg font-medium ${testimonial.color}`}>
                    {testimonial.title}
                  </h3>
                </div>

                <div className={`${testimonial.bgColor} rounded-xl p-4 space-y-3`}>
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-600">{testimonial.metrics.arr || testimonial.metrics.mrr}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-600">{testimonial.metrics.margins}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-600">{testimonial.metrics.timeline}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-medium text-gray-900">{testimonial.author.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.author.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 