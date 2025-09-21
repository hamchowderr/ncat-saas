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

-- Database configuration is handled by Supabase config.toml

-- Grant necessary permissions
GRANT USAGE ON SCHEMA "public" TO "postgres", "anon", "authenticated", "service_role";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "postgres", "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "postgres", "service_role";
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO "postgres", "service_role";
