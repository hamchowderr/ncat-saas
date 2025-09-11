import { generateMeta } from "@/lib/utils";
import { WorkflowsContent } from "./components/workflows-content";

export async function generateMetadata() {
  return generateMeta({
    title: "Workflows - NCA Toolkit",
    description: "Execute NCA Toolkit API workflows with one-click automation for content creation.",
    canonical: "/dashboard/apps/files/workflows"
  });
}

export default function WorkflowsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
      </div>
      <WorkflowsContent />
    </div>
  );
}
