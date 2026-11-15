"use client";

import { MediaToolsContent } from "./components/media-tools-content";

export default function MediaToolsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Media Tools</h2>
      </div>
      <MediaToolsContent />
    </div>
  );
}
