CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`village_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`hashed_key` varchar(255) NOT NULL,
	`prefix` varchar(16) NOT NULL,
	`rate_limit` int DEFAULT 100 NOT NULL,
	`active` boolean DEFAULT true NOT NULL,
	`expires_at` datetime,
	`last_used_at` timestamp,
	`created_at` timestamp DEFAULT (now()) NOT NULL,
	`updated_at` timestamp DEFAULT (now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
