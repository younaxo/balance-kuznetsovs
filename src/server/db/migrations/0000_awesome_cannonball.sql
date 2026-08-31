CREATE TYPE "public"."admin_role" AS ENUM('owner', 'editor');--> statement-breakpoint
CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'nav_click', 'footer_click', 'cta_click', 'service_cta_click', 'external_link_click', 'telegram_click', 'max_click', 'email_click', 'phone_click', 'quiz_open', 'quiz_step', 'quiz_complete', 'application_open', 'application_submit', 'tracked_redirect');--> statement-breakpoint
CREATE TYPE "public"."application_source" AS ENUM('form', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('new', 'in_progress', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."consent_category" AS ENUM('necessary', 'analytics');--> statement-breakpoint
CREATE TYPE "public"."device_category" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."review_source" AS ENUM('avito', 'manual');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"pathname" text NOT NULL,
	"source_element" varchar(200),
	"destination" text,
	"is_conversion" boolean DEFAULT false NOT NULL,
	"application_id" uuid,
	"utm_source" varchar(200),
	"utm_medium" varchar(200),
	"utm_campaign" varchar(200),
	"utm_content" varchar(200),
	"utm_term" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device_category" "device_category" DEFAULT 'unknown' NOT NULL,
	"landing_path" text,
	"referrer" text,
	"utm_source" varchar(200),
	"utm_medium" varchar(200),
	"utm_campaign" varchar(200),
	"utm_content" varchar(200),
	"utm_term" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"phone" varchar(40),
	"telegram" varchar(100),
	"email" varchar(255),
	"service_slug" varchar(100),
	"message" text,
	"quiz_answers" jsonb,
	"source" "application_source" DEFAULT 'form' NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"consent_given" boolean NOT NULL,
	"consent_given_at" timestamp with time zone,
	"honeypot_triggered" boolean DEFAULT false NOT NULL,
	"turnstile_verified" boolean,
	"ip_hash" text,
	"telegram_notified_at" timestamp with time zone,
	"email_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"session_id" uuid,
	"first_touch_utm_source" varchar(200),
	"first_touch_utm_medium" varchar(200),
	"first_touch_utm_campaign" varchar(200),
	"first_touch_landing_path" text,
	"last_touch_utm_source" varchar(200),
	"last_touch_utm_medium" varchar(200),
	"last_touch_utm_campaign" varchar(200),
	"last_touch_path" text,
	"cta_source" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"analytics_accepted" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_settings" (
	"id" varchar(20) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"phone" varchar(40),
	"email" varchar(255),
	"telegram" varchar(150),
	"max_messenger" varchar(150),
	"address" text,
	"working_hours" varchar(255),
	"operator_full_name" text,
	"operator_inn" varchar(20),
	"operator_ogrn" varchar(20),
	"operator_address" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(150) NOT NULL,
	"title" text,
	"body" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"succeeded" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_slug" varchar(100),
	"title" varchar(300) NOT NULL,
	"description" text,
	"price_from_kopecks" integer,
	"unit" varchar(100),
	"order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" varchar(200) NOT NULL,
	"text" text NOT NULL,
	"rating" integer,
	"source" "review_source" DEFAULT 'manual' NOT NULL,
	"source_url" text,
	"reviewed_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"title" varchar(300) NOT NULL,
	"summary" text NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracked_destinations" (
	"slug" varchar(100) PRIMARY KEY NOT NULL,
	"label" varchar(200) NOT NULL,
	"url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions" ADD CONSTRAINT "attributions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions" ADD CONSTRAINT "attributions_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_user_id_idx" ON "admin_sessions" USING btree ("admin_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "attributions_application_id_unique" ON "attributions" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_blocks_key_unique" ON "content_blocks" USING btree ("key");--> statement-breakpoint
CREATE INDEX "login_attempts_identifier_created_idx" ON "login_attempts" USING btree ("identifier","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_unique" ON "services" USING btree ("slug");