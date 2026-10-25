CREATE TABLE `pendapat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int,
	`pengguna` varchar(100),
	`pilihan` tinyint NOT NULL,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pendapat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pendapat` ADD CONSTRAINT `pendapat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `pendapat` ADD CONSTRAINT `pendapat_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `pendapat_village_idx` ON `pendapat`(`village_id`);
--> statement-breakpoint
CREATE INDEX `pendapat_created_idx` ON `pendapat`(`created_at`);