"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PythonExecutionTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pythonCode, setPythonCode] = useState("");
  const [pythonTimeout, setPythonTimeout] = useState("30");
  const [pythonCustomId, setPythonCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePythonExecution = async () => {
    if (!pythonCode.trim()) {
      alert("Please enter Python code to execute");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the request payload
      const payload = {
        code: pythonCode.trim(),
        timeout: parseInt(pythonTimeout) || 30,
        id: pythonCustomId.trim() || undefined
      };

      // Log the payload for debugging
      console.log('Executing Python code:', payload);

      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      alert('Python code executed successfully!');

      // Reset form
      setPythonCode('');
      setPythonTimeout('30');
      setPythonCustomId('');

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error executing Python code:', error);
      alert('Failed to execute Python code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-sm">Execute Python</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Execute Python code in a secure sandbox environment
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-600" /> Python Code Execution
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Execute Python code in a secure sandbox environment
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="python-code" className="text-sm font-medium">
              Python Code <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="python-code"
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              placeholder="print('Hello, World!')"
              className="h-64 font-mono text-sm"
              spellCheck="false"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="python-timeout" className="text-sm font-medium">
              Timeout (seconds)
            </Label>
            <Input
              id="python-timeout"
              type="number"
              value={pythonTimeout}
              onChange={(e) => setPythonTimeout(e.target.value)}
              placeholder="30"
              className="h-10"
              min="1"
              max="300"
            />
            <p className="text-xs text-muted-foreground">
              Maximum execution time (1-300 seconds)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="python-custom-id" className="text-sm font-medium">
              Request ID
            </Label>
            <Input
              id="python-custom-id"
              value={pythonCustomId}
              onChange={(e) => setPythonCustomId(e.target.value)}
              placeholder="my-python-execution-1"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Optional - Unique identifier for this request
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePythonExecution}
            disabled={isLoading || !pythonCode.trim()}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Executing...
              </>
            ) : (
              'Execute Code'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
