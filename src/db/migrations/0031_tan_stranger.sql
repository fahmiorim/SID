CREATE TABLE `suplemen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`sasaran` int NOT NULL DEFAULT 1,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suplemen_id` PRIMARY KEY(`id`),
	CONSTRAINT `suplemen_village_slug_uq` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `suplemen_terdata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`id_suplemen` int NOT NULL,
	`penduduk_id` int,
	`keluarga_id` int,
	`data_form_isian` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suplemen_terdata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `suplemen` ADD CONSTRAINT `suplemen_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suplemen_terdata` ADD CONSTRAINT `suplemen_terdata_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suplemen_terdata` ADD CONSTRAINT `suplemen_terdata_id_suplemen_suplemen_id_fk` FOREIGN KEY (`id_suplemen`) REFERENCES `suplemen`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suplemen_terdata` ADD CONSTRAINT `suplemen_terdata_penduduk_id_residents_id_fk` FOREIGN KEY (`penduduk_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suplemen_terdata` ADD CONSTRAINT `suplemen_terdata_keluarga_id_families_id_fk` FOREIGN KEY (`keluarga_id`) REFERENCES `families`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `suplemen_terdata_suplemen_idx` ON `suplemen_terdata` (`id_suplemen`);--> statement-breakpoint
CREATE INDEX `suplemen_terdata_penduduk_idx` ON `suplemen_terdata` (`penduduk_id`);--> statement-breakpoint
CREATE INDEX `suplemen_terdata_keluarga_idx` ON `suplemen_terdata` (`keluarga_id`);