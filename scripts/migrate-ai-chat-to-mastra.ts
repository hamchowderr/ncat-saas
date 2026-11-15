/**
 * Migration Script: Old AI Chat to Mastra
 *
 * Migrates existing chat data from the legacy `chats` table to Mastra's thread-based schema.
 *
 * This script:
 * 1. Reads all existing chats from the old `chats` table
 * 2. Creates corresponding threads in `mastra_threads`
 * 3. Converts JSONB messages to Mastra's message format
 * 4. Preserves all metadata and timestamps
 *
 * Usage:
 *   npx ts-node --esm scripts/migrate-ai-chat-to-mastra.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

// Extract connection details from DATABASE_URL
const parsePostgresUrl = (url: string) => {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error("Invalid DATABASE_URL format");

  const [, user, password, host, port, database] = match;
  return { user, password, host, port, database };
};

const connDetails = parsePostgresUrl(DATABASE_URL);

// Create Supabase client (for easier querying)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OldChat {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string | null;
  messages: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{ type: string; text?: string; image?: string; [key: string]: any }>;
  [key: string]: any;
}

async function migrateChats() {
  console.log("🚀 Starting AI Chat to Mastra migration...\n");

  // Step 1: Fetch all existing chats
  console.log("📊 Fetching existing chats from 'chats' table...");
  const { data: oldChats, error: fetchError } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("❌ Error fetching chats:", fetchError);
    return;
  }

  if (!oldChats || oldChats.length === 0) {
    console.log("✅ No chats found to migrate. You're all set!");
    return;
  }

  console.log(`Found ${oldChats.length} chats to migrate\n`);

  let successCount = 0;
  let errorCount = 0;

  // Step 2: Migrate each chat
  for (const chat of oldChats as OldChat[]) {
    try {
      console.log(`\n📝 Migrating chat: ${chat.id}`);
      console.log(`   User: ${chat.user_id}`);
      console.log(`   Title: ${chat.title || "Untitled"}`);
      console.log(`   Messages: ${chat.messages?.length || 0}`);

      // Create thread in mastra_threads
      const threadData = {
        id: chat.id,
        resource_id: chat.user_id,
        title: chat.title,
        metadata: {
          ...chat.metadata,
          migrated_from_chats: true,
          original_created_at: chat.created_at,
          project_id: chat.project_id,
        },
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      };

      const { error: threadError } = await supabase
        .from("mastra_threads")
        .upsert(threadData, { onConflict: "id" });

      if (threadError) {
        console.error(`   ❌ Error creating thread:`, threadError);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Thread created`);

      // Convert and insert messages
      if (chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0) {
        const mastraMessages = chat.messages.map((msg: UIMessage, index: number) => {
          // Extract text content from parts
          const textContent = msg.parts
            ?.filter((part) => part.type === "text" && part.text)
            .map((part) => part.text)
            .join("\n") || "";

          // Create CoreMessage format
          const coreMessage = {
            role: msg.role,
            content: textContent,
            ...

(msg.parts?.some((p) => p.type === "image") && {
              experimental_attachments: msg.parts
                .filter((p) => p.type === "image")
                .map((p) => ({ url: p.image, contentType: "image/*" })),
            }),
          };

          return {
            id: msg.id || `msg-${chat.id}-${index}`,
            thread_id: chat.id,
            role: msg.role,
            content: coreMessage, // Store as JSONB
            metadata: {
              migrated: true,
              original_parts: msg.parts,
            },
            created_at: chat.created_at, // Use chat creation time (no individual timestamps in old format)
          };
        });

        const { error: messagesError } = await supabase
          .from("mastra_messages")
          .upsert(mastraMessages, { onConflict: "id" });

        if (messagesError) {
          console.error(`   ❌ Error inserting messages:`, messagesError);
          errorCount++;
          continue;
        }

        console.log(`   ✅ ${mastraMessages.length} messages migrated`);
      }

      // Create resource entry if not exists
      const { error: resourceError } = await supabase
        .from("mastra_resources")
        .upsert(
          {
            id: chat.user_id,
            metadata: {
              migrated_chats_count: 1,
            },
            created_at: chat.created_at,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id", ignoreDuplicates: true }
        );

      if (resourceError && resourceError.code !== "23505") {
        // Ignore duplicate key errors
        console.error(`   ⚠️  Warning creating resource:`, resourceError);
      }

      successCount++;
      console.log(`   ✅ Chat migrated successfully`);
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      errorCount++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Migration Complete!");
  console.log("=".repeat(60));
  console.log(`✅ Successfully migrated: ${successCount} chats`);
  console.log(`❌ Failed to migrate: ${errorCount} chats`);
  console.log(`📊 Total processed: ${oldChats.length} chats`);
  console.log("\n💡 Next steps:");
  console.log("   1. Verify data in mastra_threads and mastra_messages tables");
  console.log("   2. Test AI chat functionality with migrated data");
  console.log("   3. Once verified, you can archive/drop the old 'chats' table");
  console.log("\n⚠️  Note: The old 'chats' table was NOT deleted. Do this manually after verification.");
}

// Run migration
migrateChats()
  .then(() => {
    console.log("\n✅ Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  });
