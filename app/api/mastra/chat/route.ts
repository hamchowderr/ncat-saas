import { mastra } from "@/src/mastra";
import { NextRequest, NextResponse } from "next/server";

/**
 * Mastra Chat API Route
 *
 * This endpoint demonstrates how to use Mastra agents in your Next.js application.
 * It provides a simple chat interface for interacting with Mastra agents.
 *
 * Usage:
 * POST /api/mastra/chat
 * Body: {
 *   message: string,
 *   agentName: "generalChatAgent" | "ncatMediaExpertAgent" | "videoProductionAgent" | "jobMonitorAgent"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { message, agentName = "generalChatAgent" } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get the specified agent
    const agent = mastra.getAgent(agentName);

    if (!agent) {
      return NextResponse.json({ error: `Agent '${agentName}' not found` }, { status: 404 });
    }

    // Generate a response using the agent
    const result = await agent.generate(message);

    return NextResponse.json({
      success: true,
      response: result.text,
      agent: agentName
    });
  } catch (error) {
    console.error("Mastra chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Get available agents
 *
 * GET /api/mastra/chat
 */
export async function GET() {
  try {
    // List available production agents
    const agents = [
      {
        name: "generalChatAgent",
        description: "General Chat Agent - conversational AI with DALL-E image generation",
        tools: ["generateImage"]
      },
      {
        name: "ncatMediaExpertAgent",
        description: "NCAT Media Expert - comprehensive media processing with full NCAT API integration",
        tools: ["17 NCAT production tools"]
      },
      {
        name: "videoProductionAgent",
        description: "Video Production Assistant - specialized in video editing workflows",
        tools: ["Video processing tools"]
      },
      {
        name: "jobMonitorAgent",
        description: "Job Monitor - tracks and monitors NCAT processing jobs",
        tools: ["Job status tracking"]
      },
      {
        name: "storyArchitectAgent",
        description: "Story Architect - transforms stories into scene/shot breakdowns",
        tools: ["Faceless video generation"]
      },
      {
        name: "mediaGenerationAgent",
        description: "Media Generation - orchestrates AI generation (images, audio, video)",
        tools: ["AI media generation"]
      },
      {
        name: "videoAssemblyAgent",
        description: "Video Assembly - assembles assets into final video with captions",
        tools: ["Video assembly"]
      },
      {
        name: "storyTypeAgent",
        description: "Story Type - manages story type configurations and templates",
        tools: ["Story templates"]
      }
    ];

    return NextResponse.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch agents",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
