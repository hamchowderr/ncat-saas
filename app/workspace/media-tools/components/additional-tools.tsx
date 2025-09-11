import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2 } from "lucide-react";

// FFmpeg Tools
export function FFmpegComposeTool({ executeTool, loading, results }: any) {
  const [command, setCommand] = useState("");

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="ffmpeg-command">FFmpeg Command</Label>
          <Textarea
            id="ffmpeg-command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter FFmpeg command parameters"
            rows={3}
          />
        </div>
        <Button
          onClick={() => executeTool("/v1/ffmpeg/compose", { command }, "ffmpeg-compose")}
          disabled={loading === "ffmpeg-compose" || !command.trim()}
          className="w-full"
        >
          {loading === "ffmpeg-compose" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Execute</>
          )}
        </Button>
      </div>
    </div>
  );
}

// Image Tools
export function ImageToVideoTool({ executeTool, loading, results }: any) {
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState("5");

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="5"
          />
        </div>
        <Button
          onClick={() => executeTool("/v1/image/convert/video", { image_url: imageUrl, duration: parseInt(duration) }, "image-to-video")}
          disabled={loading === "image-to-video" || !imageUrl}
          className="w-full"
        >
          {loading === "image-to-video" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Convert</>
          )}
        </Button>
      </div>
    </div>
  );
}

export function WebpageScreenshotTool({ executeTool, loading, results }: any) {
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="webpage-url">Webpage URL</Label>
          <Input
            id="webpage-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="1920"
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="1080"
            />
          </div>
        </div>
        <Button
          onClick={() => executeTool("/v1/image/screenshot/webpage", { 
            url, 
            viewport: { width: parseInt(width), height: parseInt(height) }
          }, "webpage-screenshot")}
          disabled={loading === "webpage-screenshot" || !url}
          className="w-full"
        >
          {loading === "webpage-screenshot" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Screenshot</>
          )}
        </Button>
      </div>
    </div>
  );
}

// Media Tools
export function MediaConvertTool({ executeTool, loading, results }: any) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [outputFormat, setOutputFormat] = useState("mp4");

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="media-url">Media URL</Label>
          <Input
            id="media-url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/video.mov"
          />
        </div>
        <div>
          <Label htmlFor="output-format">Output Format</Label>
          <Input
            id="output-format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            placeholder="mp4"
          />
        </div>
        <Button
          onClick={() => executeTool("/v1/media/convert", { media_url: mediaUrl, output_format: outputFormat }, "media-convert")}
          disabled={loading === "media-convert" || !mediaUrl}
          className="w-full"
        >
          {loading === "media-convert" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Convert</>
          )}
        </Button>
      </div>
    </div>
  );
}

export function MediaToMp3Tool({ executeTool, loading, results }: any) {
  const [mediaUrl, setMediaUrl] = useState("");

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="mp3-url">Media URL</Label>
          <Input
            id="mp3-url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
        </div>
        <Button
          onClick={() => executeTool("/v1/media/convert/mp3", { media_url: mediaUrl }, "media-to-mp3")}
          disabled={loading === "media-to-mp3" || !mediaUrl}
          className="w-full"
        >
          {loading === "media-to-mp3" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Convert to MP3</>
          )}
        </Button>
      </div>
    </div>
  );
}
