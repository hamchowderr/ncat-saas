"use client";

import { Upload } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function S3UploadTool() {
  return (
    <div className="relative">
      <Card className="cursor-not-allowed opacity-50 grayscale pointer-events-none">
        <CardHeader>
          <Badge variant="outline" className="absolute right-3 top-3 bg-muted text-muted-foreground">
            Coming Soon
          </Badge>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-gray-600" />
            <CardTitle className="text-sm">S3 Upload</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Upload files directly to AWS S3 storage from any URL
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
