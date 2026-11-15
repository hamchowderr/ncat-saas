-- Migration 1: Supabase Settings & Extensions
-- Enables core PostgreSQL and Supabase extensions

-- Enable core PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Enable Supabase specific extensions
CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema" WITH SCHEMA "extensions";

-- Enable pgvector for AI embeddings and semantic search (Mastra AI integration)
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- ============================================================================
-- PGVECTOR TABLES FOR SEMANTIC RECALL
-- ============================================================================
-- Create the memory_messages vector table for Mastra's semantic recall feature
-- This table stores embeddings of chat messages for semantic search
-- PgVector can auto-create tables on first access, but we create it here to ensure
-- it exists before agents try to use it, preventing runtime errors.

CREATE TABLE IF NOT EXISTS "public"."memory_messages" (
  "id" SERIAL PRIMARY KEY,
  "vector_id" TEXT UNIQUE NOT NULL,
  "embedding" extensions.vector(1536), -- text-embedding-3-small uses 1536 dimensions
  "metadata" JSONB DEFAULT '{}'::jsonb
);

-- Create HNSW index for fast semantic search
-- HNSW (Hierarchical Navigable Small World) provides better performance than IVFFlat
-- Uses vector_ip_ops (inner product) instead of vector_cosine_ops for optimal performance
-- with OpenAI embeddings (which are normalized). For normalized vectors: cosine = dot_product,
-- but dot_product is faster as it skips normalization.
-- Reference: https://mastra.ai/reference/vectors/pg
CREATE INDEX IF NOT EXISTS "idx_memory_messages_embedding_hnsw"
ON "public"."memory_messages"
USING hnsw (embedding extensions.vector_ip_ops)
WITH (m = 16, ef_construction = 64);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."memory_messages" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "public"."memory_messages_id_seq" TO authenticated;

-- Add comments explaining the table and index
COMMENT ON TABLE "public"."memory_messages" IS
'Vector embeddings of chat messages for Mastra semantic recall.
Used by PgVector to enable semantic search across conversation history.
Embeddings are generated using OpenAI text-embedding-3-small (1536 dimensions).';

COMMENT ON INDEX "idx_memory_messages_embedding_hnsw" IS
'HNSW index using inner product operator (vector_ip_ops) for fast semantic search.
Optimized for OpenAI normalized embeddings where cosine similarity equals dot product.
Parameters: m=16 (connections per layer), ef_construction=64 (build quality).
For higher accuracy with more memory, consider m=24-32 and ef_construction=96-128.';

-- Create Stripe Foreign Data Wrapper (commented out - not available in all environments)
-- CREATE FOREIGN DATA WRAPPER stripe_wrapper
--   HANDLER stripe_fdw_handler
--   VALIDATOR stripe_fdw_validator;

-- Database configuration is handled by Supabase config.toml

-- Grant necessary permissions
GRANT USAGE ON SCHEMA "public" TO "postgres", "anon", "authenticated", "service_role";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "postgres", "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "postgres", "service_role";
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO "postgres", "service_role";
