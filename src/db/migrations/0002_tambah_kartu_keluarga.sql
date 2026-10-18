CREATE TABLE `families` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`number` varchar(16) NOT NULL,
	`address` varchar(255),
	`region_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `families_id` PRIMARY KEY(`id`),
	CONSTRAINT `families_village_number_uq` UNIQUE(`village_id`,`number`)
);
--> statement-breakpoint
ALTER TABLE `residents` ADD `family_id` int;--> statement-breakpoint
ALTER TABLE `families` ADD CONSTRAINT `families_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `families` ADD CONSTRAINT `families_region_id_regions_id_fk` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `families_region_idx` ON `families` (`region_id`);--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_family_id_families_id_fk` FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `residents_village_family_idx` ON `residents` (`village_id`,`family_id`);--> statement-breakpoint
DROP INDEX `residents_village_family_card_idx` ON `residents`;--> statement-breakpoint
ALTER TABLE `residents` DROP COLUMN `family_card_number`;
