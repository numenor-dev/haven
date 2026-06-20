CREATE TABLE "attorneys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"neon_auth_user_id" text NOT NULL,
	"firm_id" uuid NOT NULL,
	"is_trial_exhausted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attorneys_neon_auth_user_id_unique" UNIQUE("neon_auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "chat_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"firm_id" uuid NOT NULL,
	"client_name" text,
	"transcript" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"structured_data" jsonb,
	"status" text DEFAULT 'new' NOT NULL,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "firms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"notification_email" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "firms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_record" ADD CONSTRAINT "chat_record_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_record" ADD CONSTRAINT "chat_record_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attorneys_firm_id_idx" ON "attorneys" USING btree ("firm_id");--> statement-breakpoint
CREATE INDEX "chat_record_firm_id_idx" ON "chat_record" USING btree ("firm_id");--> statement-breakpoint
CREATE INDEX "chat_record_session_id_idx" ON "chat_record" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_firm_id_idx" ON "chat_sessions" USING btree ("firm_id");