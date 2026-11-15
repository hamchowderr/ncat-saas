import { generateMeta } from "@/lib/utils";
import AppRender from "./app-render";

export async function generateMetadata() {
  return generateMeta({
    title: "K.E.D.B AI Chat",
    description:
      "AI-powered chat interface for K.E.D.B knowledge management. Built with shadcn/ui, Next.js and Tailwind CSS.",
    canonical: "/workspace/kedb/ai-chat"
  });
}

export default function Page() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
      <AppRender />
    </div>
  );
}
