ALTER TABLE "firms" ADD COLUMN "trial_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attorneys" DROP COLUMN "is_trial_exhausted";--> statement-breakpoint
ALTER TABLE "firms" DROP COLUMN "notification_email";