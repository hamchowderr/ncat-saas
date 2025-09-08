"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Play, Loader2, CheckCircle, XCircle, Mic, Video, Scissors, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
}

const WorkflowCard = ({ 
  title, 
  description, 
  icon: Icon,
  category, 
  workflowId, 
  children,
  results,
  loading
}: {
  title: string;
  description: string;
  icon: any;
  category: string;
  workflowId: string;
  children: React.ReactNode;
  results: Record<string, WorkflowResult>;
  loading: string | null;
}) => {
  const result = results[workflowId];
  const isLoading = loading === workflowId;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
        <Badge variant="secondary" className="w-fit">
          {category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        {/* Result Display */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="text-sm">
                {result.success ? "Workflow completed successfully!" : `Error: ${result.error}`}
              </AlertDescription>
            </div>
            {result.data && (
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default function WorkflowsContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, WorkflowResult>>({});
  const [apiBaseUrl, setApiBaseUrl] = useState("https://your-nca-toolkit-api.com");

  const executeWorkflow = async (workflowId: string, steps: Array<{endpoint: string, data: any}>) => {
    setLoading(workflowId);
    setResults(prev => ({ ...prev, [workflowId]: { success: false } }));

    try {
      const workflowResults = [];
      
      for (const step of steps) {
        const response = await fetch(`${apiBaseUrl}${step.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(step.data),
        });

        const result = await response.json();
        workflowResults.push(result);

        if (!response.ok) {
          throw new Error(`Step failed: ${result.error || 'Unknown error'}`);
        }
      }

      setResults(prev => ({
        ...prev,
        [workflowId]: {
          success: true,
          data: workflowResults
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [workflowId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <p className="text-muted-foreground">
          Predefined automation workflows for content creation and media processing. These workflows combine multiple NCA Toolkit API endpoints to accomplish complex tasks.
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure your NCA Toolkit API base URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="api-url">API Base URL</Label>
            <Input
              id="api-url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://your-nca-toolkit-api.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* AI Podcast Workflow */}
        <WorkflowCard
          title="Create AI Podcast"
          description="Generate a complete podcast episode from a topic or script, including voice synthesis and audio processing."
          icon={Mic}
          category="Audio Production"
          workflowId="ai-podcast"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "topic", label: "Podcast Topic", type: "input"},
              {name: "duration", label: "Target Duration (minutes)", type: "number"},
              {name: "voice_style", label: "Voice Style", type: "input"}
            ]}
            onExecute={(data) => executeWorkflow("ai-podcast", [
              {endpoint: "/v1/code/execute/python", data: {code: `# Generate podcast script for topic: ${data.topic}`}},
              {endpoint: "/v1/audio/concatenate", data: {audio_urls: ["generated_intro.mp3", "generated_content.mp3", "generated_outro.mp3"]}}
            ])}
            loading={loading === "ai-podcast"}
          />
        </WorkflowCard>

        {/* YouTube ChapterBot Workflow */}
        <WorkflowCard
          title="YouTube AI ChapterBot"
          description="Automatically generate chapters and timestamps for YouTube videos using AI transcription and analysis."
          icon={Video}
          category="Video Processing"
          workflowId="youtube-chapters"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "video_url", label: "YouTube Video URL", type: "input"},
              {name: "language", label: "Language Code (optional)", type: "input"}
            ]}
            onExecute={(data) => executeWorkflow("youtube-chapters", [
              {endpoint: "/v1/BETA/media/download", data: {url: data.video_url}},
              {endpoint: "/v1/media/transcribe", data: {media_url: "downloaded_video.mp4", language: data.language || "en"}},
              {endpoint: "/v1/code/execute/python", data: {code: "# AI chapter generation from transcription"}}
            ])}
            loading={loading === "youtube-chapters"}
          />
        </WorkflowCard>

        {/* Viral Clips Workflow */}
        <WorkflowCard
          title="Viral Clips from Podcast"
          description="Extract and create viral-ready short clips from long-form podcast content with automatic highlights detection."
          icon={Scissors}
          category="Content Creation"
          workflowId="viral-clips"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "podcast_url", label: "Podcast Audio/Video URL", type: "input"},
              {name: "clip_duration", label: "Clip Duration (seconds)", type: "number"},
              {name: "num_clips", label: "Number of Clips", type: "number"}
            ]}
            onExecute={(data) => executeWorkflow("viral-clips", [
              {endpoint: "/v1/media/transcribe", data: {media_url: data.podcast_url}},
              {endpoint: "/v1/media/silence", data: {media_url: data.podcast_url}},
              {endpoint: "/v1/code/execute/python", data: {code: "# AI highlight detection and clip extraction"}},
              {endpoint: "/v1/video/cut", data: {video_url: data.podcast_url, start_time: 0, end_time: parseInt(data.clip_duration)}}
            ])}
            loading={loading === "viral-clips"}
          />
        </WorkflowCard>

        {/* Reaction Video Workflow */}
        <WorkflowCard
          title="Create Reaction Video"
          description="Generate reaction videos by combining source content with reaction overlays and synchronized audio."
          icon={Video}
          category="Video Production"
          workflowId="reaction-video"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "source_video", label: "Source Video URL", type: "input"},
              {name: "reaction_video", label: "Reaction Video URL", type: "input"},
              {name: "layout", label: "Layout Style", type: "input"}
            ]}
            onExecute={(data) => executeWorkflow("reaction-video", [
              {endpoint: "/v1/video/thumbnail", data: {video_url: data.source_video, timestamp: 0}},
              {endpoint: "/v1/ffmpeg/compose", data: {command: `# Compose reaction video layout: ${data.layout}`}},
              {endpoint: "/v1/video/concatenate", data: {video_urls: [data.source_video, data.reaction_video]}}
            ])}
            loading={loading === "reaction-video"}
          />
        </WorkflowCard>

        {/* Content Repurposing Workflow */}
        <WorkflowCard
          title="Content Repurposing Suite"
          description="Transform long-form content into multiple formats: social media posts, blog articles, and short videos."
          icon={Zap}
          category="Content Strategy"
          workflowId="content-repurpose"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "source_content", label: "Source Content URL", type: "input"},
              {name: "target_formats", label: "Target Formats (comma separated)", type: "textarea"},
              {name: "brand_voice", label: "Brand Voice/Style", type: "input"}
            ]}
            onExecute={(data) => executeWorkflow("content-repurpose", [
              {endpoint: "/v1/media/transcribe", data: {media_url: data.source_content}},
              {endpoint: "/v1/code/execute/python", data: {code: `# Content repurposing for formats: ${data.target_formats}`}},
              {endpoint: "/v1/media/convert", data: {media_url: data.source_content, output_format: "mp4"}}
            ])}
            loading={loading === "content-repurpose"}
          />
        </WorkflowCard>

        {/* Automated Subtitles Workflow */}
        <WorkflowCard
          title="Automated Subtitles & Captions"
          description="Generate accurate subtitles and captions for videos with multiple language support and styling options."
          icon={Video}
          category="Accessibility"
          workflowId="auto-subtitles"
          results={results}
          loading={loading}
        >
          <AIWorkflowForm 
            fields={[
              {name: "video_url", label: "Video URL", type: "input"},
              {name: "languages", label: "Languages (comma separated)", type: "input"},
              {name: "style", label: "Caption Style", type: "input"}
            ]}
            onExecute={(data) => executeWorkflow("auto-subtitles", [
              {endpoint: "/v1/media/transcribe", data: {media_url: data.video_url, language: "auto"}},
              {endpoint: "/v1/video/caption", data: {video_url: data.video_url, captions: "Generated from transcription"}},
              {endpoint: "/v1/code/execute/python", data: {code: `# Multi-language subtitle generation: ${data.languages}`}}
            ])}
            loading={loading === "auto-subtitles"}
          />
        </WorkflowCard>

      </div>
    </div>
  );
}

// AI Workflow Form Component
interface WorkflowField {
  name: string;
  label: string;
  type: "input" | "textarea" | "number";
}

interface AIWorkflowFormProps {
  fields: WorkflowField[];
  onExecute: (data: Record<string, any>) => void;
  loading: boolean;
}

function AIWorkflowForm({ fields, onExecute, loading }: AIWorkflowFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(formData);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
            />
          ) : (
            <Input
              id={field.name}
              type={field.type === "number" ? "number" : "text"}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Workflow...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Workflow
          </>
        )}
      </Button>
    </form>
  );
}
