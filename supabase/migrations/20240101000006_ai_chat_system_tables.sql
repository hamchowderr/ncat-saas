-- Migration 6: AI Chat System Tables (Mastra Integration)
-- Mastra AI agent chat system with memory, semantic recall, and vector embeddings
--
-- IMPORTANT: Mastra uses camelCase column names (resourceId, createdAt, etc.)
-- These tables must match EXACTLY what PostgresStore expects.

-- ============================================================================
-- MASTRA THREADS TABLE
-- ============================================================================
-- Stores conversation threads between users and AI agents
CREATE TABLE IF NOT EXISTS "public"."mastra_threads" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "resourceId" TEXT NOT NULL, -- camelCase! Maps to user_id for resource-scoped memory
  "title" TEXT NOT NULL,
  "metadata" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_threads_resourceid" ON "public"."mastra_threads" ("resourceId");
CREATE INDEX IF NOT EXISTS "idx_mastra_threads_createdat" ON "public"."mastra_threads" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_threads_updatedat" ON "public"."mastra_threads" ("updatedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_threads_resource_updated" ON "public"."mastra_threads" ("resourceId", "updatedAt" DESC);

COMMENT ON TABLE "public"."mastra_threads" IS 'Mastra AI conversation threads with agents';
COMMENT ON COLUMN "public"."mastra_threads"."resourceId" IS 'User ID or entity that owns this thread (for resource-scoped memory)';
COMMENT ON COLUMN "public"."mastra_threads"."metadata" IS 'Thread metadata including workspace context, agent info, etc.';

-- ============================================================================
-- MASTRA MESSAGES TABLE
-- ============================================================================
-- Stores all messages in conversations with vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS "public"."mastra_messages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "thread_id" TEXT NOT NULL, -- snake_case! (Mastra's exception)
  "content" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- CRITICAL: This was missing in original migration!
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "resourceId" TEXT -- camelCase!
);

-- Foreign key constraint to mastra_threads (required for Mastra's savePerStep)
ALTER TABLE "public"."mastra_messages"
ADD CONSTRAINT "fk_mastra_messages_thread"
FOREIGN KEY ("thread_id")
REFERENCES "public"."mastra_threads"("id")
ON DELETE CASCADE;

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_messages_thread_id" ON "public"."mastra_messages" ("thread_id");
CREATE INDEX IF NOT EXISTS "idx_mastra_messages_createdat" ON "public"."mastra_messages" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_messages_thread_created" ON "public"."mastra_messages" ("thread_id", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_messages_role" ON "public"."mastra_messages" ("role");
CREATE INDEX IF NOT EXISTS "idx_mastra_messages_type" ON "public"."mastra_messages" ("type");

COMMENT ON TABLE "public"."mastra_messages" IS 'All AI chat messages with embeddings for semantic recall';
COMMENT ON COLUMN "public"."mastra_messages"."content" IS 'CoreMessage format from AI SDK (role, content, tool calls, etc.)';
COMMENT ON COLUMN "public"."mastra_messages"."type" IS 'Message type for filtering (e.g., tool calls vs regular messages)';
COMMENT ON CONSTRAINT "fk_mastra_messages_thread" ON "public"."mastra_messages" IS 'Ensures messages belong to valid threads and cascade delete when thread is removed. Required for Mastra PostgresStore message persistence.';

-- ============================================================================
-- MASTRA RESOURCES TABLE
-- ============================================================================
-- Stores resource-level metadata (user-level persistent context)
CREATE TABLE IF NOT EXISTS "public"."mastra_resources" (
  "id" TEXT PRIMARY KEY NOT NULL, -- Maps to user_id
  "workingMemory" TEXT, -- camelCase!
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_mastra_resources_updatedat" ON "public"."mastra_resources" ("updatedAt" DESC);

COMMENT ON TABLE "public"."mastra_resources" IS 'Resource-level data for users (for resource-scoped memory)';
COMMENT ON COLUMN "public"."mastra_resources"."id" IS 'User ID or entity identifier';
COMMENT ON COLUMN "public"."mastra_resources"."workingMemory" IS 'Persistent working memory content for this resource';

-- ============================================================================
-- MASTRA WORKING MEMORY TABLE
-- ============================================================================
-- Stores persistent user context (preferences, user info, etc.)
-- This is a custom table (not auto-created by Mastra)
CREATE TABLE IF NOT EXISTS "public"."mastra_working_memory" (
  "id" "uuid" DEFAULT gen_random_uuid() PRIMARY KEY,
  "thread_id" "text" REFERENCES "public"."mastra_threads"("id") ON DELETE CASCADE,
  "resource_id" "text" REFERENCES "public"."mastra_resources"("id") ON DELETE CASCADE,
  "scope" "text" NOT NULL DEFAULT 'thread', -- 'thread' or 'resource'
  "content" "text", -- Markdown template or structured data
  "metadata" "jsonb" DEFAULT '{}'::jsonb,
  "created_at" timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT "working_memory_scope_check" CHECK (scope IN ('thread', 'resource'))
);

-- Ensure only one working memory per thread or resource
CREATE UNIQUE INDEX IF NOT EXISTS "idx_mastra_working_memory_thread_unique"
  ON "public"."mastra_working_memory" ("thread_id")
  WHERE thread_id IS NOT NULL AND scope = 'thread';

CREATE UNIQUE INDEX IF NOT EXISTS "idx_mastra_working_memory_resource_unique"
  ON "public"."mastra_working_memory" ("resource_id")
  WHERE resource_id IS NOT NULL AND scope = 'resource';

CREATE INDEX IF NOT EXISTS "idx_mastra_working_memory_scope" ON "public"."mastra_working_memory" ("scope");

COMMENT ON TABLE "public"."mastra_working_memory" IS 'Persistent user context and preferences for AI agents';
COMMENT ON COLUMN "public"."mastra_working_memory"."scope" IS 'Memory scope: thread-scoped or resource-scoped (across all threads)';
COMMENT ON COLUMN "public"."mastra_working_memory"."content" IS 'Working memory content (Markdown template or structured data)';

-- ============================================================================
-- MASTRA WORKFLOW SNAPSHOT TABLE
-- ============================================================================
-- Stores workflow state and execution data for Mastra's internal workflows
-- (including the "agentic-loop" workflow used by agents for tool calls)
CREATE TABLE IF NOT EXISTS "public"."mastra_workflow_snapshot" (
  "workflow_name" TEXT NOT NULL,
  "run_id" TEXT NOT NULL,
  "resourceId" TEXT, -- camelCase! Maps to user_id
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAtZ" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("workflow_name", "run_id")
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_workflow_snapshot_resourceid" ON "public"."mastra_workflow_snapshot" ("resourceId");
CREATE INDEX IF NOT EXISTS "idx_mastra_workflow_snapshot_createdat" ON "public"."mastra_workflow_snapshot" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_workflow_snapshot_resource_workflow" ON "public"."mastra_workflow_snapshot" ("resourceId", "workflow_name");

COMMENT ON TABLE "public"."mastra_workflow_snapshot" IS 'Workflow execution state snapshots (required by PostgresStore for agentic-loop and custom workflows)';
COMMENT ON COLUMN "public"."mastra_workflow_snapshot"."workflow_name" IS 'Workflow identifier (e.g., "agentic-loop" for agent tool execution)';
COMMENT ON COLUMN "public"."mastra_workflow_snapshot"."snapshot" IS 'Workflow state data as JSON';

-- ============================================================================
-- MASTRA EVALS TABLE
-- ============================================================================
-- Stores evaluation results and metadata (required by PostgresStore)
CREATE TABLE IF NOT EXISTS "public"."mastra_evals" (
  "id" "text" PRIMARY KEY NOT NULL,
  "agent_name" "text" NOT NULL,
  "eval_data" "jsonb" NOT NULL,
  "metadata" "jsonb" DEFAULT '{}'::jsonb,
  "created_at" timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_evals_agent_name" ON "public"."mastra_evals" ("agent_name");
CREATE INDEX IF NOT EXISTS "idx_mastra_evals_created_at" ON "public"."mastra_evals" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_evals_agent_created" ON "public"."mastra_evals" ("agent_name", "created_at" DESC);

COMMENT ON TABLE "public"."mastra_evals" IS 'Evaluation results and metadata';
COMMENT ON COLUMN "public"."mastra_evals"."eval_data" IS 'Evaluation result data as JSON';

-- ============================================================================
-- MASTRA TRACES TABLE
-- ============================================================================
-- Stores telemetry and tracing data for AI operations (required for AI Tracing)
CREATE TABLE IF NOT EXISTS "public"."mastra_traces" (
  "id" "text" PRIMARY KEY NOT NULL,
  "name" "text" NOT NULL,
  "start_time" timestamp WITH time zone NOT NULL,
  "end_time" timestamp WITH time zone,
  "attributes" "jsonb" DEFAULT '{}'::jsonb,
  "metadata" "jsonb" DEFAULT '{}'::jsonb,
  "created_at" timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_traces_name" ON "public"."mastra_traces" ("name");
CREATE INDEX IF NOT EXISTS "idx_mastra_traces_start_time" ON "public"."mastra_traces" ("start_time" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_traces_name_start" ON "public"."mastra_traces" ("name", "start_time" DESC);

-- GIN index for JSONB attributes column for fast queries
CREATE INDEX IF NOT EXISTS "idx_mastra_traces_attributes" ON "public"."mastra_traces" USING gin ("attributes");

COMMENT ON TABLE "public"."mastra_traces" IS 'Telemetry and tracing data for AI operations';
COMMENT ON COLUMN "public"."mastra_traces"."attributes" IS 'Trace attributes and context data';

-- ============================================================================
-- MASTRA SCORERS TABLE
-- ============================================================================
-- Stores scoring and evaluation data (required by PostgresStore)
CREATE TABLE IF NOT EXISTS "public"."mastra_scorers" (
  "id" "text" PRIMARY KEY NOT NULL,
  "scorer_name" "text" NOT NULL,
  "score_data" "jsonb" NOT NULL,
  "metadata" "jsonb" DEFAULT '{}'::jsonb,
  "created_at" timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_mastra_scorers_scorer_name" ON "public"."mastra_scorers" ("scorer_name");
CREATE INDEX IF NOT EXISTS "idx_mastra_scorers_created_at" ON "public"."mastra_scorers" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_mastra_scorers_name_created" ON "public"."mastra_scorers" ("scorer_name", "created_at" DESC);

COMMENT ON TABLE "public"."mastra_scorers" IS 'Scoring and evaluation data';
COMMENT ON COLUMN "public"."mastra_scorers"."score_data" IS 'Scorer result data as JSON';

-- ============================================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================================
-- Automatically update updated_at timestamp on UPDATE

CREATE OR REPLACE FUNCTION "public"."update_mastra_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Working Memory trigger (custom table)
CREATE TRIGGER "trigger_update_mastra_working_memory_updated_at"
  BEFORE UPDATE ON "public"."mastra_working_memory"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_mastra_updated_at"();

-- Triggers for auto-created tables (threads, resources) will be added
-- by Mastra's PostgresStore automatically

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all Mastra tables
ALTER TABLE "public"."mastra_threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_resources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_working_memory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_workflow_snapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_evals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_traces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mastra_scorers" ENABLE ROW LEVEL SECURITY;

-- Threads: Users can only access their own threads (using camelCase column names!)
CREATE POLICY "Users can view their own threads"
  ON "public"."mastra_threads"
  FOR SELECT
  TO authenticated
  USING ("resourceId" = auth.uid()::text);

CREATE POLICY "Users can insert their own threads"
  ON "public"."mastra_threads"
  FOR INSERT
  TO authenticated
  WITH CHECK ("resourceId" = auth.uid()::text);

CREATE POLICY "Users can update their own threads"
  ON "public"."mastra_threads"
  FOR UPDATE
  TO authenticated
  USING ("resourceId" = auth.uid()::text)
  WITH CHECK ("resourceId" = auth.uid()::text);

CREATE POLICY "Users can delete their own threads"
  ON "public"."mastra_threads"
  FOR DELETE
  TO authenticated
  USING ("resourceId" = auth.uid()::text);

-- Messages: Users can only access messages in their own threads
CREATE POLICY "Users can view messages in their threads"
  ON "public"."mastra_messages"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_messages"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages in their threads"
  ON "public"."mastra_messages"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_messages"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete messages in their threads"
  ON "public"."mastra_messages"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_messages"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    )
  );

-- Resources: Users can only access their own resource
CREATE POLICY "Users can view their own resource"
  ON "public"."mastra_resources"
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

CREATE POLICY "Users can insert their own resource"
  ON "public"."mastra_resources"
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own resource"
  ON "public"."mastra_resources"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Working Memory: Users can only access their own working memory
CREATE POLICY "Users can view their own working memory"
  ON "public"."mastra_working_memory"
  FOR SELECT
  TO authenticated
  USING (
    (thread_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_working_memory"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    ))
    OR
    (resource_id IS NOT NULL AND resource_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert their own working memory"
  ON "public"."mastra_working_memory"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (thread_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_working_memory"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    ))
    OR
    (resource_id IS NOT NULL AND resource_id = auth.uid()::text)
  );

CREATE POLICY "Users can update their own working memory"
  ON "public"."mastra_working_memory"
  FOR UPDATE
  TO authenticated
  USING (
    (thread_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_working_memory"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    ))
    OR
    (resource_id IS NOT NULL AND resource_id = auth.uid()::text)
  )
  WITH CHECK (
    (thread_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_working_memory"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    ))
    OR
    (resource_id IS NOT NULL AND resource_id = auth.uid()::text)
  );

CREATE POLICY "Users can delete their own working memory"
  ON "public"."mastra_working_memory"
  FOR DELETE
  TO authenticated
  USING (
    (thread_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM "public"."mastra_threads"
      WHERE "mastra_threads"."id" = "mastra_working_memory"."thread_id"
      AND "mastra_threads"."resourceId" = auth.uid()::text
    ))
    OR
    (resource_id IS NOT NULL AND resource_id = auth.uid()::text)
  );

-- Service role has full access to all tables (for backend operations)
CREATE POLICY "Service role has full access to threads"
  ON "public"."mastra_threads"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to messages"
  ON "public"."mastra_messages"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to resources"
  ON "public"."mastra_resources"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to working memory"
  ON "public"."mastra_working_memory"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Evals: Service role full access (evals are backend-only)
CREATE POLICY "Service role has full access to evals"
  ON "public"."mastra_evals"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Traces: Service role full access (traces are backend-only)
CREATE POLICY "Service role has full access to traces"
  ON "public"."mastra_traces"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Scorers: Service role full access (scorers are backend-only)
CREATE POLICY "Service role has full access to scorers"
  ON "public"."mastra_scorers"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Workflow Snapshots: Service role full access (workflow snapshots are backend-only)
CREATE POLICY "Service role has full access to workflow snapshots"
  ON "public"."mastra_workflow_snapshot"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
