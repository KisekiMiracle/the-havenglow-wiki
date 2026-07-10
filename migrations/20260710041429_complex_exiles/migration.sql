CREATE TABLE `users` (
	`id` text PRIMARY KEY,
	`username` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`magic_token` text,
	`magic_token_expires_at` text,
	`magic_token_used` integer DEFAULT 0
);
