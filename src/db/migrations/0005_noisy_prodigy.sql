CREATE TABLE `keuangan_laporan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tipe` varchar(40) NOT NULL,
	`judul` varchar(255) NOT NULL,
	`tahun` int NOT NULL,
	`semester` int NOT NULL,
	`nama_file` varchar(255) NOT NULL,
	`jalur_file` varchar(255) NOT NULL,
	`ukuran_file` int NOT NULL DEFAULT 0,
	`kirim_pada` timestamp,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keuangan_laporan_id` PRIMARY KEY(`id`),
	CONSTRAINT `keuangan_laporan_village_tahun_semester_unique` UNIQUE(`village_id`,`tipe`,`tahun`,`semester`)
);
--> statement-breakpoint
ALTER TABLE `keuangan_laporan` ADD CONSTRAINT `keuangan_laporan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_laporan` ADD CONSTRAINT `keuangan_laporan_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `keuangan_laporan_village_tahun_idx` ON `keuangan_laporan` (`village_id`,`tahun`);