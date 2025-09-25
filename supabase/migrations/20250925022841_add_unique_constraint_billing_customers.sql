-- Add unique constraint for workspace_id and gateway_name combination
-- This fixes the billing API upsert operation that was failing due to missing constraint

ALTER TABLE billing_customers
ADD CONSTRAINT unique_workspace_gateway UNIQUE (workspace_id, gateway_name);