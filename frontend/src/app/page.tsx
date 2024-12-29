import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import CTASection from "@/components/home/CTASection";
import SuccessStories from "@/components/home/SuccessStories";
import HowItWorks from "@/components/home/HowItWorks";
import BrokerLogos from "@/components/home/BrokerLogos";
import DealsWeTrack from "@/components/home/DealsWeTrack";
import SampleDeal from "@/components/home/SampleDeal";
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
      <BrokerLogos />
      <DealsWeTrack />
      <SampleDeal />
      <Features />
      <HowItWorks />
      <SuccessStories />
      <CTASection />
    </main>
  );
} 