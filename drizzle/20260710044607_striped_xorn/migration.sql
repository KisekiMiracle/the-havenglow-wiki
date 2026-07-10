CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"magic_token" text,
	"magic_token_expires_at" timestamp,
	"magic_token_used" integer DEFAULT 0
);
