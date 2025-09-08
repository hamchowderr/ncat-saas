import { generateMeta } from "@/lib/utils";
import { FileManager } from "./components/file-manager";

export async function generateMetadata() {
  return generateMeta({
    title: "Files App",
    description:
      "A files app is an app template used to browse, organize and manage files and folders. Built with shadcn/ui, React, Next.js and Tailwind CSS.",
    canonical: "/apps/files"
  });
}

export default function Page() {
  return <FileManager />;
}
