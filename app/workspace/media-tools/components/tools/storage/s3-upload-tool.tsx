"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function S3UploadTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fileUrl.trim()) {
      alert("Please provide a file URL");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        file_url: fileUrl.trim(),
        filename: filename.trim() || undefined,
        public: isPublic
      };

      console.log("Submitting S3 Upload:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("S3 upload request submitted successfully!");
      setIsDialogOpen(false);
      setFileUrl("");
      setFilename("");
      setIsPublic(false);
    } catch (error) {
      alert("Error submitting request: " + error);
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
              <Upload className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-sm">S3 Upload</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Upload files directly to AWS S3 storage from any URL
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            S3 Upload
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Upload files to AWS S3 directly from a URL
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-url" className="text-sm font-medium">
              File URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file-url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/file.mp4"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium">
              Custom Filename <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="my-file.mp4"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              If not provided, filename will be extracted from URL
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
            />
            <label htmlFor="public" className="text-sm cursor-pointer">
              Make file publicly accessible
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-11"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Upload to S3"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-11 px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
