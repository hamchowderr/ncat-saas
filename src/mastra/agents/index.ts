/**
 * Mastra Agents Index
 *
 * Central export for all Mastra agents in the NCAT platform.
 *
 * Agent Categories:
 * - NCAT Agents: Production agents with full NCAT API integration
 * - Faceless Video Agents: Specialized agents for automated video generation
 * - General Chat Agent: Default conversational AI with image generation
 */

// Export NCAT agents (production-ready with full API integration)
export { ncatMediaExpertAgent, videoProductionAgent, jobMonitorAgent } from "./ncat-agents";

// Export Faceless Video agents (automated video generation system)
export {
  storyArchitectAgent,
  mediaGenerationAgent,
  videoAssemblyAgent,
  storyTypeAgent
} from "./faceless-agents";

// Export General Chat Agent (for ai-chat page)
export { generalChatAgent } from "./general-chat-agent";
