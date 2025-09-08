"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Scissors, Youtube, Sparkles, Camera } from "lucide-react";

export function WorkflowsContent() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">AI Podcast Creation</CardTitle>
            </div>
            <CardDescription className="text-xs">Transform text content into professional podcasts with AI narration</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-600" />
              <CardTitle className="text-sm">YouTube ChapterBot</CardTitle>
            </div>
            <CardDescription className="text-xs">Automatically generate chapters and timestamps for YouTube videos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Viral Clips from Podcast</CardTitle>
            </div>
            <CardDescription className="text-xs">Extract engaging short clips from long-form podcast content</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm">Reaction Video Creator</CardTitle>
            </div>
            <CardDescription className="text-xs">Create reaction videos with picture-in-picture layout</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-600" />
              <CardTitle className="text-sm">Content Repurposing Suite</CardTitle>
            </div>
            <CardDescription className="text-xs">Transform one piece of content into multiple formats</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
