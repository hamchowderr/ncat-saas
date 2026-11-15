"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import { Mic, Paperclip, PlusCircleIcon, SendIcon, SmileIcon, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/client";
import { MediaFilePicker } from "@/app/workspace/media-tools/components/media-file-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { AttachmentMetadata } from "@/hooks/use-workspace-messages";

interface ChatFooterProps {
  sendMessage: (content: string, messageType?: string, attachmentUrl?: string, attachmentMetadata?: AttachmentMetadata) => Promise<void>;
  sending: boolean;
}

export function ChatFooter({ sendMessage, sending }: ChatFooterProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const messageRef = useRef(message); // Ref to hold latest message without causing re-renders
  const { data: user } = useUser();
  const supabase = createClient();

  // Debug logging
  useEffect(() => {
    console.log("[ChatFooter] Props:", {
      hasSendMessage: !!sendMessage,
      sendMessageType: typeof sendMessage,
      sending,
      uploading,
      inputDisabled: sending || uploading
    });
  }, [sendMessage, sending, uploading]);

  // Update ref whenever message changes (doesn't cause re-renders in callbacks)
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    const messageToSend = message.trim();

    try {
      console.log("[ChatFooter] Submitting message:", messageToSend.substring(0, 50));
      await sendMessage(messageToSend);
      console.log("[ChatFooter] Message sent successfully, clearing input");
      setMessage(""); // Clear input only after successful send
    } catch (error: any) {
      console.error("[ChatFooter] Failed to send message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      // Keep the message in the input field so user can retry
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.substring(file.name.lastIndexOf("."));
      const uniqueFileName = `${file.name.replace(/\.[^/.]+$/, "")}_${timestamp}${fileExt}`;
      const filePath = `${user.id}/${uniqueFileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);

      // Determine message type based on file MIME type
      let messageType = "file";
      let metadata: AttachmentMetadata = {
        file_name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        file_type: file.type
      };

      if (file.type.startsWith("image/")) {
        messageType = "image";
        metadata = {
          ...metadata,
          images: [publicUrl] // ImageChatBubble expects images array
        };
      } else if (file.type.startsWith("video/")) {
        messageType = "video";
      } else if (file.type.startsWith("audio/")) {
        messageType = "audio";
      }

      // Send message with attachment
      await sendMessage(
        message || `Sent ${messageType === "image" ? "an image" : messageType === "video" ? "a video" : messageType === "audio" ? "an audio file" : "a file"}: ${file.name}`,
        messageType,
        publicUrl,
        metadata
      );

      setMessage("");

      toast({
        title: "File sent!",
        description: `${file.name} has been uploaded and sent.`
      });
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Setup speech recognition on component mount
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until stopped
    recognition.interimResults = true; // Get results as user speaks
    recognition.lang = "en-US"; // Set language

    // Handle speech recognition results
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Update message with final transcript (append to existing message)
      if (finalTranscript) {
        setMessage((prev) => (prev + " " + finalTranscript).trim());
      }
    };

    // Handle recognition errors
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input",
          variant: "destructive"
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
      }

      setIsRecording(false);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Toggle voice recording
  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please use Chrome, Edge, or Safari.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({
          title: "Listening...",
          description: "Speak now. Click the microphone again to stop."
        });
      } catch (error: any) {
        console.error("Failed to start recognition:", error);
        toast({
          title: "Failed to Start Recording",
          description: error.message || "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  // Helper function to get media duration (memoized to prevent recreation)
  const getMediaDuration = useCallback(async (url: string, isVideo: boolean): Promise<string | null> => {
    return new Promise((resolve) => {
      const element = isVideo
        ? document.createElement("video")
        : document.createElement("audio");

      const timeout = setTimeout(() => {
        element.src = "";
        resolve(null);
      }, 3000); // 3 second timeout

      element.addEventListener("loadedmetadata", () => {
        clearTimeout(timeout);
        const duration = element.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        element.src = "";
        resolve(formatted);
      });

      element.addEventListener("error", () => {
        clearTimeout(timeout);
        element.src = "";
        resolve(null);
      });

      element.src = url;
    });
  }, []);

  // Handle file selection from MediaFilePicker (memoized to prevent MediaFilePicker re-renders)
  const handleFileSelect = useCallback(async (url: string, fileId: string) => {
    try {
      // Fetch file metadata from database
      const { data: file, error: fetchError } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (fetchError || !file) {
        throw new Error("Failed to fetch file metadata");
      }

      // Determine message type based on file MIME type
      let messageType = "file";
      let metadata: AttachmentMetadata = {
        file_name: file.original_name,
        size: `${(file.file_size ? file.file_size / 1024 : 0).toFixed(2)} KB`,
        file_type: file.mime_type || "application/octet-stream"
      };

      if (file.mime_type?.startsWith("image/")) {
        messageType = "image";
        metadata = {
          ...metadata,
          images: [url] // ImageChatBubble expects images array
        };
      } else if (file.mime_type?.startsWith("video/")) {
        messageType = "video";
        // Try to get duration
        const duration = await getMediaDuration(url, true);
        if (duration) {
          metadata.duration = duration;
        }
      } else if (file.mime_type?.startsWith("audio/")) {
        messageType = "audio";
        // Try to get duration
        const duration = await getMediaDuration(url, false);
        if (duration) {
          metadata.duration = duration;
        }
      }

      // Use messageRef.current to get latest message without causing re-renders
      const currentMessage = messageRef.current;

      // Send message with selected file
      await sendMessage(
        currentMessage || `Sent ${messageType === "image" ? "an image" : messageType === "video" ? "a video" : messageType === "audio" ? "an audio file" : "a file"}: ${file.original_name}`,
        messageType,
        url,
        metadata
      );

      setMessage("");

      toast({
        title: "File sent!",
        description: `${file.original_name} has been shared in the chat.`
      });
    } catch (error: any) {
      console.error("File selection error:", error);
      toast({
        title: "Failed to send file",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  }, [supabase, getMediaDuration, sendMessage, toast]); // Removed 'message' from dependencies

  return (
    <form onSubmit={handleSubmit} className="lg:px-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*,application/pdf,text/plain"
        disabled={sending || uploading}
      />
      <div className="bg-muted relative flex items-center rounded-md border">
        <Input
          type="text"
          value={message}
          onChange={(e) => {
            console.log("[ChatFooter] Input changed:", e.target.value);
            setMessage(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={sending || uploading}
          className="h-14 border-transparent bg-white pe-32 text-base! shadow-transparent! ring-transparent! lg:pe-56"
          placeholder="Enter message..."
        />
        <div className="absolute end-4 flex items-center">
          <div className="block lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-11 rounded-full p-0">
                  <PlusCircleIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Emoji</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || uploading}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={toggleVoiceRecording}
                  disabled={sending || uploading}
                >
                  {isRecording ? "Stop Recording" : "Voice Input"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden lg:flex lg:items-center">
            <TooltipProvider>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <SmileIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Emoji</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending || uploading}
                    >
                      <Paperclip />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {uploading ? "Uploading..." : "Upload File"}
                  </TooltipContent>
                </Tooltip>
                <MediaFilePicker
                  accept={MEDIA_TYPES.ALL_MEDIA}
                  onSelect={handleFileSelect}
                  currentValue=""
                  disabled={sending || uploading}
                  buttonVariant="ghost"
                  buttonClassName="rounded-full"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isRecording ? "destructive" : "ghost"}
                      size="icon"
                      className="rounded-full"
                      type="button"
                      onClick={toggleVoiceRecording}
                      disabled={sending || uploading}
                    >
                      <Mic className={isRecording ? "animate-pulse" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="ms-3"
            disabled={!message.trim() || sending || uploading}
          >
            <span className="hidden lg:inline">
              {uploading ? "Uploading..." : sending ? "Sending..." : "Send"}
            </span>
            <SendIcon className="inline lg:hidden" />
          </Button>
        </div>
      </div>
    </form>
  );
}
