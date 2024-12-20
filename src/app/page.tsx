import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import CTASection from "@/components/home/CTASection";
import SuccessStories from "@/components/home/SuccessStories";
import { features, howItWorks } from "@/constants/home";
import { ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const examples = [
  {
    title: "SaaS Business Acquisition",
    metrics: {
      price: "$2.4M",
      revenue: "$82K/mo",
      growth: "+24% YoY"
    },
    description: "B2B software platform acquired below market rate due to early notification. Deal completed within 45 days.",
    icon: ChartBarIcon,
    tags: ["Technology", "B2B", "High Growth"]
  },
  {
    title: "E-commerce Success Story",
    metrics: {
      price: "$1.8M",
      revenue: "$65K/mo",
      growth: "+18% YoY"
    },
    description: "D2C brand identified and acquired before public listing. Negotiated 15% below asking price.",
    icon: CurrencyDollarIcon,
    tags: ["E-commerce", "D2C", "Brand Value"]
  },
  {
    title: "Content Site Portfolio",
    metrics: {
      price: "$950K",
      revenue: "$28K/mo",
      growth: "+32% YoY"
    },
    description: "Portfolio of affiliate sites acquired through early access. Combined revenue grew 32% post-acquisition.",
    icon: ArrowTrendingUpIcon,
    tags: ["Content", "Affiliate", "Passive Income"]
  }
];

export default async function Home() {
  const session = await auth();

  if (session?.userId) {
    redirect("/dashboard/preferences");
  }

  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      
      {/* How It Works */}
      <div id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Get started in minutes and let our platform do the heavy lifting.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div
                key={step.title}
                className="relative p-6 bg-white rounded-2xl shadow-sm"
              >
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="absolute -top-4 -left-4 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SuccessStories />
      <CTASection />
    </main>
  );
} 