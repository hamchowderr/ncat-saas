import { cn } from "@/lib/utils";
import { Ellipsis, FileIcon, PlayIcon, Video } from "lucide-react";
import { WorkspaceMessage } from "@/hooks/use-workspace-messages";
import { format } from "date-fns";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { MessageStatusIcon } from "./index";
import Image from "next/image";

interface MessageBubbleProps {
  message: WorkspaceMessage & { own_message?: boolean };
}

function TextChatBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn("max-w-(--breakpoint-sm) space-y-1", {
        "self-end": message.own_message
      })}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn("bg-muted inline-flex rounded-md border p-4", {
            "order-1": message.own_message
          })}
        >
          {message.content}
        </div>
        <div className={cn({ "order-2": !message.own_message })}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={message.own_message ? "start" : "end"}>
              <DropdownMenuGroup>
                <DropdownMenuItem>Forward</DropdownMenuItem>
                <DropdownMenuItem>Star</DropdownMenuItem>
                {message.own_message && <DropdownMenuItem>Edit</DropdownMenuItem>}
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className={cn("flex items-center gap-2", {
          "justify-end": message.own_message
        })}
      >
        <time
          className={cn("text-muted-foreground mt-1 flex items-center text-xs", {
            "justify-end": message.own_message
          })}
        >
          {format(new Date(message.created_at), "p")}
        </time>
        {message.own_message && <MessageStatusIcon status={message.read_by_other ? "read" : "sent"} />}
      </div>
    </div>
  );
}

function FileChatBubble({ message }: MessageBubbleProps) {
  const [showPreview, setShowPreview] = useState(false);
  const isPdf = message.attachment_metadata?.file_type === "application/pdf";

  return (
    <>
      <div
        className={cn("max-w-(--breakpoint-sm) space-y-1", {
          "self-end": message.own_message
        })}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn("bg-muted inline-flex items-start rounded-md border p-4", {
              "order-1": message.own_message
            })}
          >
            <FileIcon className="me-4 mt-1 size-8 opacity-50" strokeWidth={1.5} />
            <div className="flex flex-col gap-2">
              <div className="text-sm">
                {message.attachment_metadata?.file_name}
                <span className="text-muted-foreground ms-2 text-sm">({message.attachment_metadata?.size})</span>
              </div>
              <div className="flex gap-2">
                {isPdf && (
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    Preview
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href={message.attachment_url || "#"} download target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className={cn({ "order-2": !message.own_message })}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={message.own_message ? "start" : "end"}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Forward</DropdownMenuItem>
                  <DropdownMenuItem>Star</DropdownMenuItem>
                  {message.own_message && <DropdownMenuItem>Edit</DropdownMenuItem>}
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={cn("flex items-center gap-2", {
            "justify-end": message.own_message
          })}
        >
          <time
            className={cn("text-muted-foreground mt-1 flex items-center text-xs", {
              "justify-end": message.own_message
            })}
          >
            {format(new Date(message.created_at), "p")}
          </time>
          {message.own_message && <MessageStatusIcon status={message.read_by_other ? "read" : "sent"} />}
        </div>
      </div>

      {/* PDF Preview Dialog */}
      {isPdf && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl h-[80vh]">
            <VisuallyHidden>
              <DialogTitle>{message.attachment_metadata?.file_name}</DialogTitle>
            </VisuallyHidden>
            <iframe
              src={message.attachment_url || ""}
              className="w-full h-full rounded"
              title={message.attachment_metadata?.file_name}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function VideoChatBubble({ message }: MessageBubbleProps) {
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  return (
    <>
      <div
        className={cn("max-w-(--breakpoint-sm) space-y-1", {
          "self-end": message.own_message
        })}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn("bg-muted inline-flex flex-col gap-3 rounded-md border p-4", {
              "order-1": message.own_message
            })}
          >
            {/* File Info Header */}
            <div className="flex items-start gap-3">
              <Video className="size-8 opacity-50 flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {message.attachment_metadata?.file_name || "Video"}
                </div>
                <div className="text-muted-foreground text-xs flex items-center gap-2">
                  <span>{message.attachment_metadata?.size}</span>
                  {message.attachment_metadata?.duration && (
                    <>
                      <span>•</span>
                      <span>{message.attachment_metadata.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <video
              src={message.attachment_url || ""}
              className="w-full rounded aspect-video object-cover cursor-pointer"
              preload="metadata"
              onClick={() => setShowVideoPreview(true)}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowVideoPreview(true)}>
                <PlayIcon className="size-4 mr-1" />
                Play
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={message.attachment_url || "#"} download target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          </div>
          <div className={cn({ "order-2": !message.own_message })}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={message.own_message ? "start" : "end"}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Forward</DropdownMenuItem>
                  <DropdownMenuItem>Star</DropdownMenuItem>
                  {message.own_message && <DropdownMenuItem>Edit</DropdownMenuItem>}
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={cn("flex items-center gap-2", {
            "justify-end": message.own_message
          })}
        >
          <time
            className={cn("text-muted-foreground mt-1 flex items-center text-xs", {
              "justify-end": message.own_message
            })}
          >
            {format(new Date(message.created_at), "p")}
          </time>
          {message.own_message && <MessageStatusIcon status={message.read_by_other ? "read" : "sent"} />}
        </div>
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={showVideoPreview} onOpenChange={setShowVideoPreview}>
        <DialogContent className="max-w-5xl">
          <VisuallyHidden>
            <DialogTitle>{message.attachment_metadata?.file_name || "Video"}</DialogTitle>
          </VisuallyHidden>
          <div className="relative flex items-center justify-center w-full" style={{ maxHeight: "80vh" }}>
            <video
              src={message.attachment_url || ""}
              controls
              className="max-w-full max-h-[80vh] rounded"
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SoundChatBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn("max-w-(--breakpoint-sm)", {
        "self-end": message.own_message
      })}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn("bg-muted inline-flex flex-col gap-4 rounded-md p-4", {
            "relative order-1": message.own_message
          })}
        >
          {message.content}
          <audio id="song" className="block w-80" controls>
            <source src={message?.attachment_url || ""} type="audio/mpeg" />
          </audio>
          <div>
            <Button variant="outline" size="sm" asChild>
              <a href={message.attachment_url || "#"} download target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          </div>
        </div>
        <div className={cn({ "order-2": !message.own_message })}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={message.own_message ? "start" : "end"}>
              <DropdownMenuGroup>
                <DropdownMenuItem>Forward</DropdownMenuItem>
                <DropdownMenuItem>Star</DropdownMenuItem>
                {message.own_message && <DropdownMenuItem>Edit</DropdownMenuItem>}
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className={cn("flex items-center gap-2", {
          "justify-end": message.own_message
        })}
      >
        <time
          className={cn("text-muted-foreground mt-1 flex items-center text-sm", {
            "justify-end": message.own_message
          })}
        >
          {format(new Date(message.created_at), "p")}
        </time>
        {message.own_message && <MessageStatusIcon status={message.read_by_other ? "read" : "sent"} />}
      </div>
    </div>
  );
}

function ImageChatBubble({ message }: MessageBubbleProps) {
  const images_limit = 4;
  const images = message?.attachment_metadata?.images ?? [];
  const images_with_limit = images.slice(0, images_limit);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div
        className={cn("max-w-(--breakpoint-sm)", {
          "self-end": message.own_message
        })}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn("bg-muted inline-flex gap-4 rounded-md border p-4", {
              "relative order-1 flex items-center justify-center": message.own_message
            })}
          >
            {message.content}
            {images.length && (
              <div
                className={cn("grid gap-2", {
                  "grid-cols-1": images.length === 1,
                  "grid-cols-2": images.length > 1
                })}
              >
                {images_with_limit.map((image: string, key: number) => (
                  <figure
                    className="relative cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90"
                    key={key}
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image}
                      className="aspect-4/3 object-cover"
                      width={100}
                      height={100}
                      alt="Chat image"
                      unoptimized
                    />
                    {key + 1 === images_limit && images.length > images_limit && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl font-semibold text-white">
                        +{images.length - images_with_limit.length}
                      </div>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
          <div className={cn({ "order-2": !message.own_message })}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={message.own_message ? "start" : "end"}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Forward</DropdownMenuItem>
                  <DropdownMenuItem>Star</DropdownMenuItem>
                  {message.own_message && <DropdownMenuItem>Edit</DropdownMenuItem>}
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={cn("mt-1 flex items-center gap-2", {
            "justify-end": message.own_message
          })}
        >
          <time
            className={cn("text-muted-foreground mt-1 flex items-center text-xs", {
              "justify-end": message.own_message
            })}
          >
            {format(new Date(message.created_at), "p")}
          </time>
          {message.own_message && <MessageStatusIcon status={message.read_by_other ? "read" : "sent"} />}
        </div>
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl">
          <VisuallyHidden>
            <DialogTitle>Image preview</DialogTitle>
          </VisuallyHidden>
          {selectedImage && (
            <div className="relative flex items-center justify-center w-full" style={{ maxHeight: "80vh" }}>
              <Image
                src={selectedImage}
                alt="Full size preview"
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded mx-auto"
                loading="lazy"
                quality={90}
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChatBubble({
  message,
  type,
  own_message,
  isGroup,
  showSenderName
}: {
  message: WorkspaceMessage;
  type?: string;
  own_message?: boolean;
  isGroup?: boolean;
  showSenderName?: boolean;
}) {
  const messageWithOwnership = { ...message, own_message };

  // Render sender name chip for group messages (from other users)
  const senderNameChip = showSenderName && message.sender ? (
    <div className="text-muted-foreground mb-1 ml-1 text-xs font-medium">
      {message.sender.full_name || "Unknown"}
    </div>
  ) : null;

  let bubbleComponent;
  switch (type) {
    case "text":
      bubbleComponent = <TextChatBubble message={messageWithOwnership} />;
      break;
    case "video":
      bubbleComponent = <VideoChatBubble message={messageWithOwnership} />;
      break;
    case "audio":
      bubbleComponent = <SoundChatBubble message={messageWithOwnership} />;
      break;
    case "image":
      bubbleComponent = <ImageChatBubble message={messageWithOwnership} />;
      break;
    case "file":
      bubbleComponent = <FileChatBubble message={messageWithOwnership} />;
      break;
    default:
      bubbleComponent = <TextChatBubble message={messageWithOwnership} />;
  }

  return (
    <>
      {senderNameChip}
      {bubbleComponent}
    </>
  );
}
