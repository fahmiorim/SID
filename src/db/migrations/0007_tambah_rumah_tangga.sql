-- Modul Rumah Tangga (RTM): tabel `rtm` + kolom `rtm_id`/`rtm_level` pada
-- `residents`. Keanggotaan RTM eksklusif (satu penduduk satu RTM), sehingga
-- relasinya berupa FK langsung, bukan tabel pivot.
CREATE TABLE `rtm` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`number` varchar(32) NOT NULL,
	`address` varchar(255),
	`region_id` int,
	`kelas_sosial` int,
	`bdt` varchar(30),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rtm_id` PRIMARY KEY(`id`),
	CONSTRAINT `rtm_village_number_uq` UNIQUE(`village_id`,`number`)
);
--> statement-breakpoint
ALTER TABLE `residents` ADD `rtm_id` int;--> statement-breakpoint
ALTER TABLE `residents` ADD `rtm_level` int;--> statement-breakpoint
ALTER TABLE `rtm` ADD CONSTRAINT `rtm_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rtm` ADD CONSTRAINT `rtm_region_id_regions_id_fk` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `rtm_region_idx` ON `rtm` (`region_id`);--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_rtm_id_rtm_id_fk` FOREIGN KEY (`rtm_id`) REFERENCES `rtm`(`id`) ON DELETE set null ON UPDATE no action;
