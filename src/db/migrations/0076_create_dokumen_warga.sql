-- OS-WGA-005: Arsip dokumen pribadi warga
-- Created: 2026-11-05

CREATE TABLE `dokumen_warga` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`jenis` varchar(40) NOT NULL,
	`nama` varchar(200) NOT NULL,
	`berkas` text NOT NULL,
	`mime` varchar(100) NOT NULL,
	`nama_asli` varchar(255) NOT NULL,
	`sumber` varchar(20) NOT NULL DEFAULT 'warga',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	CONSTRAINT `dokumen_warga_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `dokumen_warga_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `dokumen_warga_village_resident_idx` ON `dokumen_warga` (`village_id`,`resident_id`);--> statement-breakpoint
CREATE INDEX `dokumen_warga_village_jenis_idx` ON `dokumen_warga` (`village_id`,`jenis`);
