CREATE TYPE "public"."field_type_enum" AS ENUM('TEXT', 'EMAIL', 'NUMBER', 'DATE', 'YES_NO', 'PASSWORD');--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(60) NOT NULL,
	"description" varchar(500),
	"created_by" uuid,
	"expiry_time" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "forms_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"field_display_text" varchar(255) NOT NULL,
	"field_key" varchar(255) NOT NULL,
	"placeholder" varchar(255),
	"is_required" boolean DEFAULT false NOT NULL,
	"type" "field_type_enum" NOT NULL,
	"index" numeric NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "forms_fields_form_id_index_unique" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;