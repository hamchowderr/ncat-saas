import { generateMeta } from "@/lib/utils";
import { MediaToolsContent } from "./components/media-tools-content";

export async function generateMetadata() {
  return generateMeta({
    title: "Media Tools",
    description: "NCA Toolkit API endpoints for media processing and content creation.",
    canonical: "/dashboard/apps/files/media-tools"
  });
}

export default function MediaToolsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Media Tools</h2>
      </div>
      <MediaToolsContent />
    </div>
  );
}
