CREATE TYPE "public"."messenger_type" AS ENUM('telegram', 'max');--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "messenger_type" "messenger_type" DEFAULT 'telegram' NOT NULL;