ALTER TABLE "chirps" ALTER COLUMN "body" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_unique" UNIQUE("id");