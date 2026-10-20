CREATE TABLE `incoming_letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`agenda_number` int NOT NULL DEFAULT 0,
	`received_date` varchar(10) NOT NULL,
	`letter_number` varchar(50) NOT NULL,
	`letter_date` varchar(10),
	`sender` varchar(150),
	`classification_id` int,
	`summary` varchar(255),
	`disposition` varchar(255),
	`archive_location` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incoming_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `letter_classifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_classifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_classifications_village_code_unique` UNIQUE(`village_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `letter_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(150) NOT NULL,
	`classification_id` int,
	`template_body` text NOT NULL,
	`requires_resident` boolean NOT NULL DEFAULT true,
	`is_active` boolean NOT NULL DEFAULT true,
	`number_format` varchar(100) NOT NULL DEFAULT '[kode_surat]/[nomor]/[kode_desa]/[tahun]',
	`validity_months` int NOT NULL DEFAULT 1,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_types_village_code_unique` UNIQUE(`village_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`type_id` int NOT NULL,
	`resident_id` int,
	`type_name` varchar(150) NOT NULL,
	`number` varchar(50),
	`sequence` int NOT NULL DEFAULT 0,
	`status` enum('draft','issued','cancelled') NOT NULL DEFAULT 'draft',
	`letter_date` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`purpose` varchar(255),
	`content` text,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`issued_at` timestamp,
	CONSTRAINT `letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outgoing_letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`agenda_number` int NOT NULL DEFAULT 0,
	`letter_number` varchar(50) NOT NULL,
	`letter_date` varchar(10) NOT NULL,
	`recipient` varchar(150),
	`classification_id` int,
	`summary` varchar(255),
	`sent_date` varchar(10),
	`archive_location` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outgoing_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `villages` ADD `head_name` varchar(100);--> statement-breakpoint
ALTER TABLE `villages` ADD `head_nip` varchar(25);--> statement-breakpoint
ALTER TABLE `incoming_letters` ADD CONSTRAINT `incoming_letters_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incoming_letters` ADD CONSTRAINT `incoming_letters_classification_id_letter_classifications_id_fk` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_classifications` ADD CONSTRAINT `letter_classifications_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_types` ADD CONSTRAINT `letter_types_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_types` ADD CONSTRAINT `letter_types_classification_id_letter_classifications_id_fk` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letters` ADD CONSTRAINT `letters_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letters` ADD CONSTRAINT `letters_type_id_letter_types_id_fk` FOREIGN KEY (`type_id`) REFERENCES `letter_types`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letters` ADD CONSTRAINT `letters_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letters` ADD CONSTRAINT `letters_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outgoing_letters` ADD CONSTRAINT `outgoing_letters_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outgoing_letters` ADD CONSTRAINT `outgoing_letters_classification_id_letter_classifications_id_fk` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `incoming_letters_village_received_idx` ON `incoming_letters` (`village_id`,`received_date`);--> statement-breakpoint
CREATE INDEX `letters_village_type_year_idx` ON `letters` (`village_id`,`type_id`,`year`);--> statement-breakpoint
CREATE INDEX `letters_village_status_idx` ON `letters` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `outgoing_letters_village_letter_date_idx` ON `outgoing_letters` (`village_id`,`letter_date`);