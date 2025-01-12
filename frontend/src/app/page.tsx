import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import CTASection from "@/components/home/CTASection";
// import SuccessStories from "@/components/home/SuccessStories";
import BrokerLogos from "@/components/home/BrokerLogos";
import SampleDeal from "@/components/home/SampleDeal";
import DealFlowOverview from "@/components/home/DealFlowOverview";
import Pricing from "@/components/home/Pricing";

export default async function Home() {
  const session = await auth();

  if (session?.userId) {
    redirect("/alert-management");
  }

  return (
    <main className="min-h-screen">
      <Hero />
      <BrokerLogos />
      <Features />
      <Pricing />
      <DealFlowOverview />
      <SampleDeal />
      {/* <SuccessStories /> */}
      <CTASection />
    </main>
  );
} 