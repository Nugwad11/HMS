CREATE TABLE `email_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_codes_user_id_idx` ON `email_codes` (`user_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`gender` text NOT NULL,
	`city` text NOT NULL,
	`country` text DEFAULT 'Nigeria' NOT NULL,
	`occupation` text DEFAULT '' NOT NULL,
	`education` text DEFAULT '' NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`marital_status` text DEFAULT '' NOT NULL,
	`kids` text DEFAULT '' NOT NULL,
	`relocate` text DEFAULT '' NOT NULL,
	`alcohol` text DEFAULT '' NOT NULL,
	`smoking` text DEFAULT '' NOT NULL,
	`career_ambition` text DEFAULT '' NOT NULL,
	`family_involvement` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`verse` text DEFAULT '' NOT NULL,
	`intent` text DEFAULT '' NOT NULL,
	`denomination` text DEFAULT '' NOT NULL,
	`church_name` text DEFAULT '' NOT NULL,
	`church_city` text DEFAULT '' NOT NULL,
	`attendance` text DEFAULT '' NOT NULL,
	`born_again` text DEFAULT '' NOT NULL,
	`practices` text DEFAULT '[]' NOT NULL,
	`courtship_views` text DEFAULT '' NOT NULL,
	`denomination_importance` text DEFAULT '' NOT NULL,
	`hide_church` integer DEFAULT false NOT NULL,
	`hide_city` integer DEFAULT false NOT NULL,
	`hide_employer` integer DEFAULT false NOT NULL,
	`photo` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`email_verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);