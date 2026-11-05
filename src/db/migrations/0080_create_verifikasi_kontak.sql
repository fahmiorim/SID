-- OS-WGA-001: verifikasi nomor HP warga
-- Created: 2026-11-05

CREATE TABLE `verifikasi_kontak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`target` varchar(20) NOT NULL,
	`kode_hash` varchar(64) NOT NULL,
	`kedaluwarsa` timestamp NOT NULL,
	`terverifikasi_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	PRIMARY KEY(`id`),
	CONSTRAINT `verifikasi_kontak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `verifikasi_kontak_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `verifikasi_kontak_resident_idx` ON `verifikasi_kontak` (`village_id`,`resident_id`);
