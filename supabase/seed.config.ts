/**
 * Snaplet Seed Configuration
 *
 * This file configures Snaplet's AI-enhanced data generation.
 * It uses OpenAI to generate realistic test data for the NCAT SaaS database.
 *
 * Environment:
 * - OPENAI_API_KEY: Must be set in root .env.local file
 * - Database: Connects to local Supabase instance
 */

import { defineConfig } from "@snaplet/seed/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from root .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

export default defineConfig({
  adapter: {
    // Connect to local Supabase database
    type: "postgres",
    url:
      process.env.SNAPLET_DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  },

  // Use OpenAI for AI-enhanced generation
  ai: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o-mini" // Cost-effective model for data generation
  },

  // Specify which schemas and tables to seed
  select: {
    public: {
      // Core tables to generate data for
      user_profiles: true,
      workspaces: true,
      workspace_members: true,
      files: true,
      jobs: true,
      chats: true,

      // Video generation tables
      story_types: true,
      stories: true,
      scenes: true,
      shots: true,

      // Billing tables
      billing_products: false, // Handled by manual SQL seeds
      billing_prices: false,
      billing_customers: false,
      billing_subscriptions: false,

      // Auth tables (handled by auth system)
      // Skip auth.users and auth.identities - use manual SQL seeds
    }
  },

  // Number of records to generate per table
  seed: {
    userProfiles: 10,
    workspaces: 5,
    workspaceMembers: 15,
    files: 30,
    jobs: 40,
    chats: 10,
    stories: 8,
    scenes: 20,
    shots: 50
  }
});
