CREATE TABLE `bantuan_peserta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`program_id` int NOT NULL,
	`resident_id` int,
	`family_id` int,
	`rtm_id` int,
	`card_number` varchar(60),
	`card_national_id` varchar(30),
	`card_name` varchar(100),
	`card_birth_place` varchar(100),
	`card_birth_date` date,
	`card_address` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bantuan_peserta_id` PRIMARY KEY(`id`),
	CONSTRAINT `bantuan_peserta_program_resident_uq` UNIQUE(`program_id`,`resident_id`),
	CONSTRAINT `bantuan_peserta_program_family_uq` UNIQUE(`program_id`,`family_id`),
	CONSTRAINT `bantuan_peserta_program_rtm_uq` UNIQUE(`program_id`,`rtm_id`)
);
--> statement-breakpoint
CREATE TABLE `bantuan_program` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`sasaran` int NOT NULL,
	`description` varchar(500),
	`start_date` date,
	`end_date` date,
	`asal_dana` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bantuan_program_id` PRIMARY KEY(`id`),
	CONSTRAINT `bantuan_program_village_slug_uq` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `bantuan_peserta` ADD CONSTRAINT `bantuan_peserta_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bantuan_peserta` ADD CONSTRAINT `bantuan_peserta_program_id_bantuan_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `bantuan_program`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bantuan_peserta` ADD CONSTRAINT `bantuan_peserta_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bantuan_peserta` ADD CONSTRAINT `bantuan_peserta_family_id_families_id_fk` FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bantuan_peserta` ADD CONSTRAINT `bantuan_peserta_rtm_id_rtm_id_fk` FOREIGN KEY (`rtm_id`) REFERENCES `rtm`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bantuan_program` ADD CONSTRAINT `bantuan_program_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bantuan_peserta_program_idx` ON `bantuan_peserta` (`program_id`);--> statement-breakpoint
CREATE INDEX `bantuan_program_village_sasaran_idx` ON `bantuan_program` (`village_id`,`sasaran`);