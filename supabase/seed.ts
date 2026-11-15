/**
 * Snaplet Seed Generation Script
 *
 * This script uses Snaplet + OpenAI to generate realistic test data.
 * Run this to create AI-enhanced SQL seed file:
 *
 * ```bash
 * cd supabase
 * npx tsx seed.ts > seeds/09_snaplet_generated.sql
 * ```
 *
 * Requirements:
 * - OPENAI_API_KEY in root .env.local file
 * - Snaplet installed: npm install
 */

import { createSeedClient } from "@snaplet/seed";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from root .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in .env.local");
  console.error("Please set OPENAI_API_KEY in your root .env.local file");
  process.exit(1);
}

async function main() {
  console.error("🌱 Generating AI-enhanced seed data with OpenAI...\n");

  const seed = await createSeedClient();

  console.error("📝 Generating realistic test data:");
  console.error("   - User profiles with realistic names");
  console.error("   - Workspaces with professional descriptions");
  console.error("   - Mastra AI chat threads and messages");
  console.error("   - Story content with AI-generated narratives");
  console.error("   - Files with realistic metadata");
  console.error("   - Jobs with processing details\n");

  // Reset database to initial state (from migrations only)
  await seed.$resetDatabase();

  console.error("✨ Seeding database with AI-generated data...\n");

  // Generate data using Snaplet's AI capabilities
  await seed.user_profiles((x) =>
    x(10, {
      // Let AI generate realistic names
      full_name: (ctx) => ctx.seed.aiGenerate("A realistic full name")
    })
  );

  await seed.workspaces((x) =>
    x(5, {
      // Let AI generate professional workspace names and descriptions
      name: (ctx) =>
        ctx.seed.aiGenerate("A professional workspace or company name"),
      slug: (ctx) => ctx.seed.aiGenerate("A URL-safe slug based on the name")
    })
  );

  // Mastra AI chat threads with messages
  await seed.mastra_threads((x) =>
    x(10, {
      title: (ctx) =>
        ctx.seed.aiGenerate("A short title summarizing the chat topic"),
      metadata: (ctx) => ({
        created_via: "seed",
        model: "gpt-4o-mini"
      })
    })
  );

  await seed.mastra_messages((x) =>
    x(40, {
      role: (ctx) => {
        const roles = ["user", "assistant"];
        return roles[Math.floor(Math.random() * roles.length)];
      },
      content: (ctx) =>
        ctx.seed.aiGenerate(
          "A realistic chat message about video editing or media processing (as JSON with role and content fields)"
        )
    })
  );

  await seed.stories((x) =>
    x(8, {
      title: (ctx) =>
        ctx.seed.aiGenerate(
          "An engaging video story title (e.g., 'The Future of AI', 'Breaking News', etc.)"
        ),
      description: (ctx) =>
        ctx.seed.aiGenerate("A 2-3 sentence description of the video story")
    })
  );

  await seed.scenes((x) =>
    x(20, {
      title: (ctx) => ctx.seed.aiGenerate("A scene title for a video sequence"),
      description: (ctx) =>
        ctx.seed.aiGenerate("A description of what happens in this scene"),
      scene_script: (ctx) =>
        ctx.seed.aiGenerate(
          "A realistic narration script for this scene (2-3 sentences)"
        )
    })
  );

  await seed.shots((x) =>
    x(50, {
      title: (ctx) => ctx.seed.aiGenerate("A short shot title"),
      shot_script: (ctx) =>
        ctx.seed.aiGenerate(
          "A realistic voiceover narration for this shot (1-2 sentences)"
        ),
      image_prompt: (ctx) =>
        ctx.seed.aiGenerate(
          "A DALL-E image generation prompt with cinematic details"
        ),
      video_prompt: (ctx) =>
        ctx.seed.aiGenerate(
          "Video animation instructions (e.g., 'slow zoom in, 3 seconds')"
        )
    })
  );

  await seed.files((x) =>
    x(30, {
      file_name: (ctx) =>
        ctx.seed.aiGenerate("A realistic media filename with extension"),
      file_type: (ctx) => {
        const types = [
          "video/mp4",
          "audio/mp3",
          "audio/mpeg",
          "image/png",
          "image/jpeg"
        ];
        return types[Math.floor(Math.random() * types.length)];
      },
      file_size: (ctx) => {
        // Random realistic file sizes
        const minSize = 1024 * 1024; // 1 MB
        const maxSize = 1024 * 1024 * 1024; // 1 GB
        return (
          Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
        );
      }
    })
  );

  await seed.jobs((x) =>
    x(40, {
      nca_endpoint: (ctx) => {
        const endpoints = [
          "/v1/toolkit/video/cut",
          "/v1/toolkit/video/trim",
          "/v1/toolkit/media/transcribe",
          "/v1/toolkit/video/caption",
          "/v1/toolkit/audio/concatenate"
        ];
        return endpoints[Math.floor(Math.random() * endpoints.length)];
      },
      processing_status: (ctx) => {
        const statuses = ["pending", "processing", "completed", "failed"];
        // Weight towards completed for more realistic data
        const weights = [0.2, 0.1, 0.6, 0.1];
        const random = Math.random();
        let sum = 0;
        for (let i = 0; i < statuses.length; i++) {
          sum += weights[i];
          if (random <= sum) return statuses[i];
        }
        return "completed";
      }
    })
  );

  console.error("\n✅ Seed data generated successfully!");
  console.error("📊 Summary:");
  console.error("   - 10 user profiles");
  console.error("   - 5 workspaces");
  console.error("   - 10 Mastra AI chat threads with 40 messages");
  console.error("   - 8 stories with 20 scenes and 50 shots");
  console.error("   - 30 files");
  console.error("   - 40 jobs\n");
  console.error("💡 Output SQL written to stdout");
  console.error("   Redirect to file: npx tsx seed.ts > seeds/09_snaplet_generated.sql\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error generating seed data:", error);
    process.exit(1);
  });
