CREATE TABLE `letter_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_requirements_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_requirements_village_name_unique` UNIQUE(`village_id`,`name`)
);
--> statement-breakpoint
ALTER TABLE `letter_types` ADD `syarat_surat` text;--> statement-breakpoint
ALTER TABLE `letters` ADD `nilai_isian` text;--> statement-breakpoint
ALTER TABLE `letter_requirements` ADD CONSTRAINT `letter_requirements_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `letter_requirements_village_idx` ON `letter_requirements` (`village_id`);