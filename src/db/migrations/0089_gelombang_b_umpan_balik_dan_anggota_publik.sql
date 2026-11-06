CREATE TABLE `umpan_balik` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100),
	`kontak` varchar(150),
	`pesan` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'baru',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `umpan_balik_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kelompok_anggota` ADD `tampil_publik` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `umpan_balik` ADD CONSTRAINT `umpan_balik_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `umpan_balik_village_status_idx` ON `umpan_balik` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `umpan_balik_village_created_idx` ON `umpan_balik` (`village_id`,`created_at`);