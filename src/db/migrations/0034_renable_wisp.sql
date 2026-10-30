CREATE TABLE `rentang_umur` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(60) NOT NULL,
	`dari` int NOT NULL DEFAULT 0,
	`sampai` int,
	`status` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rentang_umur_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `rentang_umur` ADD CONSTRAINT `rentang_umur_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `rentang_umur_village_idx` ON `rentang_umur` (`village_id`);
