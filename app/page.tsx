import { generateMeta } from "@/lib/utils";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesShowcase } from "@/components/homepage/features-showcase";
import { WorkflowCarousel } from "@/components/homepage/workflow-carousel";
import { TargetAudience } from "@/components/homepage/target-audience";
import { PricingSection } from "@/components/homepage/pricing-section";
import { FinalCTA } from "@/components/homepage/final-cta";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return generateMeta({
    title: "NCAT - Professional Media Processing Platform",
    description:
      "Transform, transcribe, and optimize your content with powerful AI-driven workflows. Professional media processing made simple for creators, agencies, and businesses.",
    canonical: "/"
  });
}

export default async function HomePage() {
  // Server-side authentication check - redirect authenticated users
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, check their onboarding status
    try {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", user.id)
        .single();

      const isDefaultName =
        workspace?.name?.endsWith("'s Workspace") ||
        workspace?.name?.endsWith("-workspace") ||
        !workspace?.name;

      // Redirect to appropriate destination
      if (!user.email_confirmed_at) {
        redirect("/auth/sign-up-success");
      } else if (isDefaultName) {
        redirect("/auth/onboarding");
      } else {
        redirect("/workspace/file-manager");
      }
    } catch (error) {
      console.error("Error checking workspace:", error);
      // Fallback redirect to workspace
      redirect("/workspace/file-manager");
    }
  }

  // Only unauthenticated users reach here
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesShowcase />
      <WorkflowCarousel />
      <TargetAudience />
      <PricingSection />
      <FinalCTA />
    </main>
  );
}
