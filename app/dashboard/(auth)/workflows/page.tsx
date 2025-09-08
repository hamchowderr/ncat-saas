import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import WorkflowsContent from "./components/workflows-content";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Workflows",
    description: "Predefined automation workflows for content creation and media processing.",
    canonical: "/dashboard/workflows"
  });
}

export default function WorkflowsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <WorkflowsContent />
      </div>
    </div>
  );
}
