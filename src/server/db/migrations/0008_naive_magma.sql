CREATE TABLE "notification_settings" (
	"id" varchar(20) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"ping_all_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "telegram_username" varchar(100);--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "ping_enabled" boolean DEFAULT true NOT NULL;