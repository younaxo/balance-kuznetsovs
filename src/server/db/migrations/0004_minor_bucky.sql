CREATE TABLE "site_banner" (
	"id" varchar(20) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"text" text,
	"button_label" varchar(100),
	"button_href" text,
	"image_filename" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
