CREATE TABLE `letter_dinas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`letter_number` varchar(100) NOT NULL,
	`letter_date` varchar(10) NOT NULL,
	`recipient` varchar(150),
	`recipient_address` varchar(255),
	`subject` varchar(200) NOT NULL,
	`content` text,
	`classification_id` int,
	`archive_file` varchar(255),
	`archive_location` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_dinas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `letter_dinas` ADD CONSTRAINT `letter_dinas_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_dinas` ADD CONSTRAINT `letter_dinas_classification_id_letter_classifications_id_fk` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `letter_dinas_village_date_idx` ON `letter_dinas` (`village_id`,`letter_date`);