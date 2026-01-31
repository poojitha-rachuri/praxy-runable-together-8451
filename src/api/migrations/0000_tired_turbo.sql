CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`simulator_type` text DEFAULT 'balance-sheet',
	`current_level` integer DEFAULT 1,
	`completed_levels` text DEFAULT '[]',
	`badges` text DEFAULT '[]',
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`simulator_type` text DEFAULT 'balance-sheet',
	`level` integer NOT NULL,
	`score` integer NOT NULL,
	`total_questions` integer DEFAULT 5,
	`xp_earned` integer DEFAULT 0,
	`time_seconds` integer,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text DEFAULT 'Learner',
	`total_xp` integer DEFAULT 0,
	`streak_days` integer DEFAULT 0,
	`last_active_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
