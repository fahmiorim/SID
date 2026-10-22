CREATE TABLE `theme` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`slug` varchar(50) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`versi` varchar(20) NOT NULL DEFAULT '1.0.0',
	`sumber` varchar(20) NOT NULL DEFAULT 'bawaan',
	`aktif` boolean NOT NULL DEFAULT true,
	`opsi` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `theme_id` PRIMARY KEY(`id`),
	CONSTRAINT `theme_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `theme` ADD CONSTRAINT `theme_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;