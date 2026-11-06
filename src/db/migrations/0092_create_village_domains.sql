CREATE TABLE `village_domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `village_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `village_domains_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
ALTER TABLE `villages` ADD `slug` varchar(60);--> statement-breakpoint
ALTER TABLE `villages` ADD CONSTRAINT `villages_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `village_domains` ADD CONSTRAINT `village_domains_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `village_domains_village_idx` ON `village_domains` (`village_id`);--> statement-breakpoint
INSERT INTO `village_domains` (`village_id`,`domain`,`is_primary`)
SELECT `id`, `domain`, true FROM `villages` WHERE `domain` IS NOT NULL;--> statement-breakpoint
UPDATE `villages` SET `slug` = CONCAT('desa-', `id`) WHERE `slug` IS NULL;
