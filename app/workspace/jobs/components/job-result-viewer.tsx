"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { FileText, Music, Video, Code, Cloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface JobResultViewerProps {
  jobId: string;
  endpoint: string;
  status: string;
}

/**
 * Job Result Viewer Component
 *
 * Displays detailed results for completed NCAT processing jobs.
 * Uses React Query for data fetching with conditional execution based on job status.
 *
 * @param jobId - Unique identifier for the job
 * @param endpoint - NCAT API endpoint that was called
 * @param status - Current job status (only fetches when 'completed')
 */
export function JobResultViewer({ jobId, endpoint, status }: JobResultViewerProps) {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["jobResult", jobId, endpoint],
    queryFn: async () => {
      const supabase = createClient();
      const tableName = getTableName(endpoint);

      if (!tableName) {
        throw new Error("No detailed data available for this endpoint");
      }

      const { data: result, error: fetchError } = (await supabase
        .from(tableName as any)
        .select("*")
        .eq("job_id", jobId)
        .single()) as { data: any; error: any };

      if (fetchError) {
        console.error("Error fetching endpoint data:", fetchError);
        throw fetchError;
      }

      return result;
    },
    // Only fetch when job is completed
    enabled: status === "completed",
    retry: 1,
    // Keep result data cached for 2 minutes
    staleTime: 2 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load result data"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border-muted bg-muted/50 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">No detailed data available yet</p>
      </div>
    );
  }

  // Render endpoint-specific view
  return <div className="space-y-4">{renderEndpointSpecificView(endpoint, data)}</div>;
}

function getTableName(endpoint: string): string | null {
  const mapping: Record<string, string> = {
    "/v1/media/transcribe": "media_transcribe",
    "/v1/media/metadata": "media_metadata",
    "/v1/media/silence": "media_silence",
    "/v1/media/convert": "media_convert",
    "/v1/media/convert/mp3": "media_convert_mp3",
    "/v1/media/download": "media_download",
    "/v1/video/caption": "video_caption",
    "/v1/video/concatenate": "video_concatenate",
    "/v1/video/cut": "video_cut",
    "/v1/video/split": "video_split",
    "/v1/video/thumbnail": "video_thumbnail",
    "/v1/video/trim": "video_trim",
    "/v1/audio/concatenate": "audio_concatenate",
    "/v1/image/convert/video": "image_to_video",
    "/v1/code/execute/python": "code_execution",
    "/v1/ffmpeg/compose": "ffmpeg_compose",
    "/v1/s3/upload": "s3_upload"
  };

  return mapping[endpoint] || null;
}

function renderEndpointSpecificView(endpoint: string, data: any) {
  switch (endpoint) {
    case "/v1/media/transcribe":
      return <TranscribeResult data={data} />;
    case "/v1/media/metadata":
      return <MetadataResult data={data} />;
    case "/v1/media/silence":
      return <SilenceResult data={data} />;
    case "/v1/code/execute/python":
      return <CodeExecutionResult data={data} />;
    case "/v1/video/split":
      return <VideoSplitResult data={data} />;
    case "/v1/s3/upload":
      return <S3UploadResult data={data} />;
    default:
      return <GenericResult data={data} />;
  }
}

// Transcription Result Component
function TranscribeResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Transcription Result</CardTitle>
        </div>
        <CardDescription>
          Language: {data.language || "Unknown"} • Task: {data.task || "Transcribe"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="srt">SRT</TabsTrigger>
            {data.segments && <TabsTrigger value="segments">Segments</TabsTrigger>}
          </TabsList>
          <TabsContent value="text" className="space-y-2">
            {data.text_url && (
              <a
                href={data.text_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Text File →
              </a>
            )}
            {data.text && (
              <div className="bg-muted max-h-96 overflow-y-auto rounded-md border p-4">
                <p className="text-sm whitespace-pre-wrap">{data.text}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="srt" className="space-y-2">
            {data.srt_url && (
              <a
                href={data.srt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Download SRT File →
              </a>
            )}
            {data.srt && (
              <div className="bg-muted max-h-96 overflow-y-auto rounded-md border p-4">
                <pre className="font-mono text-xs">{data.srt}</pre>
              </div>
            )}
          </TabsContent>
          {data.segments && (
            <TabsContent value="segments">
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {JSON.parse(JSON.stringify(data.segments)).map((seg: any, i: number) => (
                  <div key={i} className="rounded-md border p-3 text-sm">
                    <div className="text-muted-foreground mb-2 flex justify-between text-xs">
                      <span>Segment {i + 1}</span>
                      <span>
                        {seg.start}s - {seg.end}s
                      </span>
                    </div>
                    <p>{seg.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Metadata Result Component
function MetadataResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <CardTitle>Media Metadata</CardTitle>
        </div>
        <CardDescription>
          Format: {data.format || "Unknown"} • Duration: {data.duration_formatted || "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Information */}
        <div>
          <h4 className="mb-3 text-sm font-semibold">File Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Filesize:</span>{" "}
              <span className="font-medium">{data.filesize_mb?.toFixed(2)} MB</span>
            </div>
            <div>
              <span className="text-muted-foreground">Format:</span>{" "}
              <span className="font-medium">{data.format}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Bitrate:</span>{" "}
              <span className="font-medium">{data.overall_bitrate_mbps?.toFixed(2)} Mbps</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>{" "}
              <span className="font-medium">{data.duration_formatted}</span>
            </div>
          </div>
        </div>

        {/* Video Information */}
        {data.has_video && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Video className="h-4 w-4" />
              Video
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Codec:</span>{" "}
                <span className="font-medium">{data.video_codec}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Resolution:</span>{" "}
                <span className="font-medium">{data.resolution}</span>
              </div>
              <div>
                <span className="text-muted-foreground">FPS:</span>{" "}
                <span className="font-medium">{data.fps}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bitrate:</span>{" "}
                <span className="font-medium">{data.video_bitrate_mbps?.toFixed(2)} Mbps</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio Information */}
        {data.has_audio && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Music className="h-4 w-4" />
              Audio
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Codec:</span>{" "}
                <span className="font-medium">{data.audio_codec}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Rate:</span>{" "}
                <span className="font-medium">{data.audio_sample_rate_khz} kHz</span>
              </div>
              <div>
                <span className="text-muted-foreground">Channels:</span>{" "}
                <span className="font-medium">{data.audio_channels}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bitrate:</span>{" "}
                <span className="font-medium">{data.audio_bitrate_kbps} kbps</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Silence Detection Result
function SilenceResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <CardTitle>Silence Detection</CardTitle>
        </div>
        <CardDescription>Detected silent segments in the audio</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Media URL:{" "}
          <a
            href={data.media_url}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.media_url}
          </a>
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Note: Segment details available via database query to silence_segments table
        </p>
      </CardContent>
    </Card>
  );
}

// Code Execution Result
function CodeExecutionResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <CardTitle>Python Code Execution</CardTitle>
        </div>
        <CardDescription>
          Exit Code: {data.exit_code ?? "N/A"} • Timeout: {data.timeout_seconds || "None"}s
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Snippet */}
        {data.code_snippet && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Code</h4>
            <div className="bg-muted rounded-md border p-3">
              <pre className="overflow-x-auto font-mono text-xs">{data.code_snippet}</pre>
            </div>
          </div>
        )}

        {/* Result */}
        {data.result && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Result</h4>
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <pre className="font-mono text-xs whitespace-pre-wrap">{data.result}</pre>
            </div>
          </div>
        )}

        {/* Stdout */}
        {data.stdout && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Standard Output</h4>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <pre className="font-mono text-xs whitespace-pre-wrap">{data.stdout}</pre>
            </div>
          </div>
        )}

        {/* Stderr */}
        {data.stderr && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Standard Error</h4>
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <pre className="font-mono text-xs whitespace-pre-wrap">{data.stderr}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Video Split Result
function VideoSplitResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <CardTitle>Video Split Results</CardTitle>
        </div>
        <CardDescription>{data.segment_count || 0} segments generated</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Video split into {data.segment_count || 0} segments with interval:{" "}
          {data.split_interval || "N/A"}s
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Note: Segment files available via database query to video_split_segments table
        </p>
      </CardContent>
    </Card>
  );
}

// S3 Upload Result
function S3UploadResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          <CardTitle>S3 Upload</CardTitle>
        </div>
        <CardDescription>File uploaded to {data.provider || "AWS"} S3</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Filename:</span>{" "}
            <span className="font-medium">{data.filename}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Bucket:</span>{" "}
            <span className="font-medium">{data.bucket}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Region:</span>{" "}
            <span className="font-medium">{data.region || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Public:</span>{" "}
            <Badge variant={data.public ? "default" : "secondary"}>
              {data.public ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
        {data.url && (
          <div className="pt-2">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all text-blue-600 hover:underline"
            >
              {data.url} →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Generic Result (for endpoints without specific rendering)
function GenericResult({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Result Data</CardTitle>
        <CardDescription>Structured response from NCAT API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-md border p-4">
          <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
