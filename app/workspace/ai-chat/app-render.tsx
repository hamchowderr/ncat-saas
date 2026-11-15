"use client";

import React, { useRef, useState } from "react";
import {
  Input,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea
} from "@/components/ui/custom/prompt/input";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Paperclip, X } from "lucide-react";
import { Suggestion } from "@/components/ui/custom/prompt/suggestion";
import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import { Message, MessageContent } from "@/components/ui/custom/prompt/message";
import { Markdown } from "@/components/ui/custom/prompt/markdown";
import { cn } from "@/lib/utils";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { PromptScrollButton } from "@/components/ui/custom/prompt/scroll-button";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";

const chatSuggestions = [
  "What's the latest tech trend?",
  "How does this work?",
  "Generate an image of a cat",
  "Generate a REST API with Express.js",
  "What's the best UX for onboarding?"
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: string; text?: string }>;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
};

export default function AppRender() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFirstResponse = messages.length > 0;
  React.useEffect(() => {
    if (messages.length > 0 && bottomRef.current && isFirstResponse) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  // Create new chat session when user sends first message
  const createChatSession = async (initialMessages: any[]) => {
    if (currentChatId) return; // Already have a session

    try {
      setIsSavingChat(true);
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: initialMessages,
          metadata: {
            messageCount: initialMessages.length
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentChatId(data.id);
      }
    } catch (error) {
      console.error("Failed to create chat session:", error);
    } finally {
      setIsSavingChat(false);
    }
  };

  // Load an existing chat session
  const loadChatSession = async (chatId: string) => {
    try {
      setIsLoadingChat(true);
      const response = await fetch(`/api/chat/sessions/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentChatId(data.id);
        setMessages(data.messages || []);
        console.log(`Loaded ${data.messages?.length || 0} messages from chat ${chatId}`);
      } else {
        console.error("Failed to load chat: HTTP", response.status);
        alert("Failed to load chat. Please try again.");
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
      alert("Failed to load chat. Please try again.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Start a new chat (clear current session)
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputValue("");
    setFiles([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  const FileListItem = ({
    file,
    dismiss = true,
    index
  }: {
    file: File;
    dismiss?: boolean;
    index: number;
  }) => (
    <div className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
      <Paperclip className="size-4" />
      <span className="max-w-[120px] truncate">{file.name}</span>
      {dismiss && (
        <button
          onClick={() => handleRemoveFile(index)}
          className="hover:bg-secondary/50 rounded-full p-1"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );

  // Convert file to data URL for AI SDK attachments
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      // Get auth token
      const supabase = (await import("@/lib/client")).createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/file-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Get public URL from Supabase storage
        const {
          data: { publicUrl }
        } = supabase.storage.from("files").getPublicUrl(data.filePath);
        return publicUrl;
      } else {
        console.error("File upload failed:", data.error);
        return null;
      }
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };

  const handleFormSubmit = async () => {
    if (inputValue?.trim() || files.length > 0) {
      // Create chat session on first message if it doesn't exist
      if (!currentChatId && messages.length === 0) {
        const userMessage = {
          id: Date.now().toString(),
          role: "user" as const,
          parts: [{ type: "text", text: inputValue }]
        };
        await createChatSession([userMessage]);
      }

      // Upload files to Supabase storage first
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedUrl = await handleFileUpload(file);
          return uploadedUrl
            ? {
                name: file.name,
                contentType: file.type,
                url: uploadedUrl // Use Supabase storage URL
              }
            : null;
        })
      );

      // Filter out failed uploads
      const attachments = uploadedFiles.filter((file) => file !== null);

      // Add user message immediately for instant feedback
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        parts: [
          { type: "text", text: inputValue },
          ...attachments.map((att: any) => ({ type: "file", url: att.url, name: att.name }))
        ]
      };
      setMessages(prev => [...prev, userMessage] as any);

      // Clear input and files immediately
      const messageContent = inputValue;
      setInputValue("");
      setFiles([]);

      // Send to API manually
      try {
        // Use Next.js API route with Mastra agent
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            chatId: currentChatId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
        }

        // Read the streaming response (AI SDK data stream format)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aiResponseText = "";
        let imageUrl: string | undefined;
        let imagePrompt: string | undefined;
        let isGeneratingImage = false;
        const assistantMessageId = (Date.now() + 1).toString();

        console.log("Starting to read stream...");

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Stream complete. Final text:", aiResponseText);
              break;
            }

            const chunk = decoder.decode(value);
            console.log("Raw chunk:", chunk);

            const lines = chunk.split("\n").filter(line => line.trim());

            for (const line of lines) {
              console.log("Processing line:", line);

              // AI SDK uses Server-Sent Events format: "data: {...}"
              if (line.startsWith("data:")) {
                try {
                  const jsonStr = line.substring(5).trim(); // Remove "data:" prefix

                  // Skip [DONE] marker
                  if (jsonStr === "[DONE]") {
                    console.log("Stream finished");
                    continue;
                  }

                  const parsed = JSON.parse(jsonStr);
                  console.log("Parsed data:", parsed);

                  // Handle text delta from AI SDK stream
                  if (parsed.type === "text-delta" && parsed.delta) {
                    aiResponseText += parsed.delta;
                    console.log("Updated text:", aiResponseText);

                    // Update AI message in real-time using functional state update
                    setMessages(prev => {
                      // Remove any previous assistant message with this ID
                      const withoutLastAssistant = prev.filter(m => m.id !== assistantMessageId);
                      // Add the updated assistant message
                      return [...withoutLastAssistant, {
                        id: assistantMessageId,
                        role: "assistant" as const,
                        parts: [{ type: "text", text: aiResponseText }],
                        imageUrl,
                        imagePrompt,
                        isGeneratingImage
                      }] as any;
                    });
                  }

                  // Handle tool call start (image generation begins)
                  if (parsed.type === "tool-call" && parsed.toolName === "generate-image") {
                    console.log("Image generation started");
                    isGeneratingImage = true;

                    // Update message to show loading state
                    setMessages(prev => {
                      const withoutLastAssistant = prev.filter(m => m.id !== assistantMessageId);
                      return [...withoutLastAssistant, {
                        id: assistantMessageId,
                        role: "assistant" as const,
                        parts: [{ type: "text", text: aiResponseText }],
                        imageUrl,
                        imagePrompt,
                        isGeneratingImage: true
                      }] as any;
                    });
                  }

                  // Handle tool result (image generation complete)
                  if (parsed.type === "tool-result" && parsed.toolName === "generate-image") {
                    console.log("Tool result received:", parsed.result);
                    isGeneratingImage = false; // Clear loading state

                    if (parsed.result?.success && parsed.result?.imageUrl) {
                      imageUrl = parsed.result.imageUrl;
                      imagePrompt = parsed.result.prompt;

                      // Update message with image
                      setMessages(prev => {
                        const withoutLastAssistant = prev.filter(m => m.id !== assistantMessageId);
                        return [...withoutLastAssistant, {
                          id: assistantMessageId,
                          role: "assistant" as const,
                          parts: [{ type: "text", text: aiResponseText }],
                          imageUrl,
                          imagePrompt,
                          isGeneratingImage: false
                        }] as any;
                      });
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  console.debug("Skipping non-JSON line:", line, "Error:", e);
                }
              }
            }
          }
        }

        // Sync messages from database after stream completes
        // This ensures UI reflects what was actually saved by Mastra (including tool results)
        if (currentChatId) {
          try {
            const response = await fetch(`/api/chat/sessions/${currentChatId}`);
            if (response.ok) {
              const data = await response.json();
              setMessages(data.messages || []);
              console.log(`Synced ${data.messages?.length || 0} messages from database after stream`);
            }
          } catch (syncError) {
            console.error("Failed to sync messages from database:", syncError);
            // Don't alert - messages are still visible from streaming
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleFormSubmit();
  };

  return (
    <div className="flex h-full w-full">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        onLoadChat={loadChatSession}
        onNewChat={startNewChat}
        currentChatId={currentChatId}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-4">
        {isLoadingChat && (
          <div className="flex h-32 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <PromptLoader variant="pulse-dot" />
              <p className="text-muted-foreground text-sm">Loading conversation...</p>
            </div>
          </div>
        )}
        <ChatContainer
          className={cn("relative w-full flex-1 space-y-4 pe-2", {
            hidden: !isFirstResponse || isLoadingChat
          })}
          ref={containerRef}
          scrollToRef={bottomRef}
        >
          {messages.map((message: any) => {
            const isAssistant = message.role === "assistant";
            // Extract text content from message parts
            const textContent = message.parts
              .filter((part: any) => part.type === "text")
              .map((part: any) => part.text)
              .join("");

            // Extract image parts
            const imageParts = message.parts.filter((part: any) => part.type === "image");

            return (
              <Message
                key={message.id}
                className={message.role === "user" ? "justify-end" : "justify-start"}
              >
                <div
                  className={cn("w-fit max-w-[90%] sm:max-w-[80%] md:max-w-[75%]", {
                    "ml-auto": !isAssistant
                  })}
                >
                  {isAssistant ? (
                    <div className="bg-muted text-foreground rounded-lg border overflow-hidden shadow-sm">
                      <div className="prose prose-sm dark:prose-invert max-w-none px-4 py-3">
                        <Markdown>{textContent}</Markdown>
                      </div>
                      {message.isGeneratingImage && !message.imageUrl && (
                        <div className="mt-2 border-t px-3 py-6 flex flex-col items-center gap-2 bg-muted/50">
                          <PromptLoader variant="pulse-dot" />
                          <p className="text-xs text-muted-foreground">Generating image...</p>
                        </div>
                      )}
                      {message.imageUrl && (
                        <div className="mt-2 border-t">
                          <img
                            src={message.imageUrl}
                            alt={message.imagePrompt || "Generated image"}
                            className="w-full h-auto object-contain max-h-[400px] bg-black/5"
                          />
                          {message.imagePrompt && (
                            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-t">
                              <span className="font-medium">Prompt:</span> {message.imagePrompt}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-primary text-primary-foreground inline-flex flex-col gap-2 rounded-lg px-4 py-3 shadow-sm">
                      {textContent && <div className="whitespace-pre-wrap break-words">{textContent}</div>}
                      {imageParts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {imageParts.map((part: any, idx: number) => (
                            <img
                              key={idx}
                              src={part.image}
                              alt={`Uploaded image ${idx + 1}`}
                              className="h-auto max-w-[200px] rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Message>
            );
          })}

          {isLoading && (
            <div className="ps-2">
              <PromptLoader variant="pulse-dot" />
            </div>
          )}
        </ChatContainer>

        <div className="fixed right-4 bottom-4">
          <PromptScrollButton
            containerRef={containerRef}
            scrollRef={bottomRef}
            className="shadow-sm"
          />
        </div>

        <form onSubmit={onSubmit} className="w-full max-w-(--breakpoint-md)">
          <Input
            value={inputValue}
            onValueChange={setInputValue}
            onSubmit={handleFormSubmit}
            className="w-full"
          >
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {files.map((file, index) => (
                  <FileListItem key={index} index={index} file={file} />
                ))}
              </div>
            )}

            <PromptInputTextarea placeholder="Ask me anything..." />

            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <PromptInputAction tooltip="Attach files">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-8 w-8 rounded-full"
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    <Paperclip className="size-5" />
                  </Button>
                </PromptInputAction>
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
              </div>

              <PromptInputAction tooltip="Send message">
                <Button
                  variant="default"
                  size="icon"
                  type="submit"
                  className="h-8 w-8 rounded-full"
                >
                  <ArrowUpIcon />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </Input>
        </form>

        {/*Chat suggestions*/}
        {!isFirstResponse && (
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.map((suggestion: string, key: number) => (
              <Suggestion
                key={key}
                onClick={() => {
                  setInputValue(suggestion);
                }}
              >
                {suggestion}
              </Suggestion>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
