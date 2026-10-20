CREATE TABLE `kelompok` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`type` varchar(20) NOT NULL,
	`category_id` int,
	`code` varchar(50),
	`decree_number` varchar(100),
	`description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kelompok_id` PRIMARY KEY(`id`),
	CONSTRAINT `kelompok_village_slug_uq` UNIQUE(`village_id`,`slug`),
	CONSTRAINT `kelompok_village_type_code_uq` UNIQUE(`village_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `kelompok_anggota` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kelompok_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`position` int NOT NULL,
	`member_number` varchar(50),
	`decree_number` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kelompok_anggota_id` PRIMARY KEY(`id`),
	CONSTRAINT `kelompok_anggota_kelompok_resident_uq` UNIQUE(`kelompok_id`,`resident_id`)
);
--> statement-breakpoint
CREATE TABLE `kelompok_master` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kelompok_master_id` PRIMARY KEY(`id`),
	CONSTRAINT `kelompok_master_village_name_uq` UNIQUE(`village_id`,`name`,`type`)
);
--> statement-breakpoint
ALTER TABLE `kelompok` ADD CONSTRAINT `kelompok_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelompok` ADD CONSTRAINT `kelompok_category_id_kelompok_master_id_fk` FOREIGN KEY (`category_id`) REFERENCES `kelompok_master`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelompok_anggota` ADD CONSTRAINT `kelompok_anggota_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelompok_anggota` ADD CONSTRAINT `kelompok_anggota_kelompok_id_kelompok_id_fk` FOREIGN KEY (`kelompok_id`) REFERENCES `kelompok`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelompok_anggota` ADD CONSTRAINT `kelompok_anggota_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelompok_master` ADD CONSTRAINT `kelompok_master_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `kelompok_village_type_idx` ON `kelompok` (`village_id`,`type`);--> statement-breakpoint
CREATE INDEX `kelompok_category_idx` ON `kelompok` (`category_id`);--> statement-breakpoint
CREATE INDEX `kelompok_anggota_kelompok_idx` ON `kelompok_anggota` (`kelompok_id`);--> statement-breakpoint
CREATE INDEX `kelompok_anggota_resident_idx` ON `kelompok_anggota` (`resident_id`);