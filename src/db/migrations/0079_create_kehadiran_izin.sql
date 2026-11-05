-- OS-WGA-011: pengajuan izin warga & pengaturan jam kerja
-- Created: 2026-11-05

CREATE TABLE `kehadiran_izin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`jenis` varchar(20) NOT NULL DEFAULT 'izin',
	`tanggal_mulai` date NOT NULL,
	`tanggal_selesai` date NOT NULL,
	`alasan` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'menunggu',
	`catatan_operator` text,
	`diputuskan_oleh` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	CONSTRAINT `kehadiran_izin_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `kehadiran_izin_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `kehadiran_izin_village_status_idx` ON `kehadiran_izin` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `kehadiran_izin_village_resident_idx` ON `kehadiran_izin` (`village_id`,`resident_id`);--> statement-breakpoint
CREATE TABLE `kehadiran_pengaturan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`jam_masuk` varchar(5) NOT NULL DEFAULT '08:00',
	`jam_keluar` varchar(5) NOT NULL DEFAULT '16:00',
	`hari_libur` text NOT NULL,
	`diperbarui_oleh` varchar(36),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	CONSTRAINT `kehadiran_pengaturan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `kehadiran_pengaturan_village_idx` ON `kehadiran_pengaturan` (`village_id`);
