CREATE TABLE IF NOT EXISTS "oauth_states" (
  "state" text PRIMARY KEY NOT NULL,
  "provider" "oauth_provider" NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "oauth_states_expires_at_idx" ON "oauth_states" ("expires_at");

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "target_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "details" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx" ON "admin_audit_log" ("created_at");
