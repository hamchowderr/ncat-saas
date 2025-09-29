import { generateMeta } from "@/lib/utils";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesShowcase } from "@/components/homepage/features-showcase";
import { WorkflowCarousel } from "@/components/homepage/workflow-carousel";
import { TargetAudience } from "@/components/homepage/target-audience";
import { SocialProof } from "@/components/homepage/social-proof";
import { PricingSection } from "@/components/homepage/pricing-section";
import { FinalCTA } from "@/components/homepage/final-cta";

export async function generateMetadata() {
  return generateMeta({
    title: "NCAT - Professional Media Processing Platform",
    description:
      "Transform, transcribe, and optimize your content with powerful AI-driven workflows. Professional media processing made simple for creators, agencies, and businesses.",
    canonical: "/"
  });
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesShowcase />
      <WorkflowCarousel />
      <TargetAudience />
      <SocialProof />
      <PricingSection />
      <FinalCTA />
    </main>
  );
}
