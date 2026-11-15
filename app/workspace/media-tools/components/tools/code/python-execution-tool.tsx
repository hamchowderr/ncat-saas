"use client";

import { Code } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PythonExecutionTool() {
  return (
    <div className="relative">
      <Card className="cursor-not-allowed opacity-50 grayscale pointer-events-none">
        <CardHeader>
          <Badge variant="outline" className="absolute right-3 top-3 bg-muted text-muted-foreground">
            Coming Soon
          </Badge>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-sm">Execute Python</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Execute Python code in a secure sandbox environment
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
