ALTER TABLE "firms" ADD COLUMN "has_active_subscription" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "firms" ADD COLUMN "notification_email" text NOT NULL;