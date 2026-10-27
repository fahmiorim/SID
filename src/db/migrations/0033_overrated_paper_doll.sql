CREATE TABLE `family_member_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`family_id` int,
	`resident_id` int,
	`resident_name` varchar(100) NOT NULL,
	`aksi` enum('added','removed','role_changed') NOT NULL,
	`relation_id` int,
	`relation_name` varchar(60),
	`actor_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_member_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `family_member_logs` ADD CONSTRAINT `family_member_logs_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_member_logs` ADD CONSTRAINT `family_member_logs_family_id_families_id_fk` FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_member_logs` ADD CONSTRAINT `family_member_logs_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_member_logs` ADD CONSTRAINT `family_member_logs_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `family_member_logs_family_idx` ON `family_member_logs` (`family_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_member_logs_village_idx` ON `family_member_logs` (`village_id`);--> statement-breakpoint
CREATE INDEX `family_member_logs_resident_idx` ON `family_member_logs` (`resident_id`);