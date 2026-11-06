-- OS-WEB-015: Tables for komentar and pengunjung statistics
-- Created: 2026-11-05

CREATE TABLE `komentar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`halaman` varchar(50) NOT NULL,
	`nama_penulis` varchar(100) NOT NULL,
	`isi` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'aktif',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	CONSTRAINT `komentar_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `komentar_village_halaman_idx` ON `komentar` (`village_id`,`halaman`);--> statement-breakpoint
CREATE INDEX `komentar_village_status_idx` ON `komentar` (`village_id`,`status`);--> statement-breakpoint
CREATE TABLE `pengunjung_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`halaman` varchar(100) NOT NULL,
	`tanggal` varchar(10) NOT NULL,
	`jumlah` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	PRIMARY KEY(`id`),
	CONSTRAINT `pengunjung_log_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `pengunjung_log_village_halaman_tanggal_idx` ON `pengunjung_log` (`village_id`,`halaman`,`tanggal`);--> statement-breakpoint
CREATE TABLE `bukti_pengiriman_notifikasi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`pengaduan_id` int NOT NULL,
	`metode` varchar(20) NOT NULL,
	`target` varchar(255) NOT NULL,
	`respons_provider` text,
	`sukses` boolean NOT NULL DEFAULT false,
	`pesan_error` text,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	PRIMARY KEY(`id`),
	CONSTRAINT `bukti_pengiriman_notifikasi_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `bukti_pengiriman_notifikasi_pengaduan_id_pengaduan_id_fk` FOREIGN KEY (`pengaduan_id`) REFERENCES `pengaduan`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `bukti_pengiriman_notifikasi_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bukti_pengiriman_pengaduan_metode_target_unique` ON `bukti_pengiriman_notifikasi` (`pengaduan_id`,`metode`,`target`);
