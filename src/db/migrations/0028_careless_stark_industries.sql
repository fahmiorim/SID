CREATE TABLE `resident_mutations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int,
	`type` enum('birth','death','move_out','move_in','change') NOT NULL,
	`event_date` date NOT NULL,
	`reported_at` timestamp NOT NULL DEFAULT (now()),
	`actor_id` varchar(36),
	`reason` varchar(255),
	`notes` text,
	`reference_no` varchar(100),
	`from_region_id` int,
	`to_region_id` int,
	`from_address` varchar(255),
	`to_address` varchar(255),
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resident_mutations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resident_mutations` ADD CONSTRAINT `resident_mutations_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resident_mutations` ADD CONSTRAINT `resident_mutations_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resident_mutations` ADD CONSTRAINT `resident_mutations_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resident_mutations` ADD CONSTRAINT `resident_mutations_from_region_id_regions_id_fk` FOREIGN KEY (`from_region_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resident_mutations` ADD CONSTRAINT `resident_mutations_to_region_id_regions_id_fk` FOREIGN KEY (`to_region_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `resident_mutations_village_type_idx` ON `resident_mutations` (`village_id`,`type`);--> statement-breakpoint
CREATE INDEX `resident_mutations_village_date_idx` ON `resident_mutations` (`village_id`,`event_date`);--> statement-breakpoint
CREATE INDEX `resident_mutations_resident_idx` ON `resident_mutations` (`resident_id`);--> statement-breakpoint
CREATE INDEX `resident_mutations_reported_at_idx` ON `resident_mutations` (`reported_at`);