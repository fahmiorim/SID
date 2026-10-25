CREATE TABLE `dtks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`rtm_id` int NOT NULL,
	`keluarga_id` int,
	`versi_kuisioner` enum('regsos_ek2022_k') NOT NULL DEFAULT 'regsos_ek2022_k',
	`status` enum('draf','terverifikasi') NOT NULL DEFAULT 'draf',
	`tanggal_pencacahan` date,
	`tanggal_pemeriksaan` date,
	`nama_petugas_pencacahan` varchar(100),
	`nama_responden` varchar(100),
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dtks_id` PRIMARY KEY(`id`),
	CONSTRAINT `dtks_village_rtm_versi_uq` UNIQUE(`village_id`,`rtm_id`,`versi_kuisioner`)
);
--> statement-breakpoint
CREATE TABLE `dtks_anggota` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`dtks_id` int NOT NULL,
	`penduduk_id` int NOT NULL,
	`hubungan_id` int,
	`status_anggota` varchar(30) DEFAULT 'aktif',
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dtks_anggota_id` PRIMARY KEY(`id`),
	CONSTRAINT `dtks_anggota_dtks_penduduk_uq` UNIQUE(`dtks_id`,`penduduk_id`)
);
--> statement-breakpoint
CREATE TABLE `dtks_lampiran` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`berkas` varchar(255) NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dtks_lampiran_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dtks_pengaturan_program` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kode_program` varchar(50) NOT NULL,
	`nama_program` varchar(200) NOT NULL,
	`aktif` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dtks_pengaturan_program_id` PRIMARY KEY(`id`),
	CONSTRAINT `dtks_pengaturan_program_village_kode_uq` UNIQUE(`village_id`,`kode_program`)
);
--> statement-breakpoint
CREATE TABLE `dtks_ref_lampiran` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dtks_id` int NOT NULL,
	`lampiran_id` int NOT NULL,
	CONSTRAINT `dtks_ref_lampiran_id` PRIMARY KEY(`id`),
	CONSTRAINT `dtks_ref_lampiran_dtks_lampiran_uq` UNIQUE(`dtks_id`,`lampiran_id`)
);
--> statement-breakpoint
ALTER TABLE `dtks` ADD CONSTRAINT `dtks_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks` ADD CONSTRAINT `dtks_rtm_id_rtm_id_fk` FOREIGN KEY (`rtm_id`) REFERENCES `rtm`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks` ADD CONSTRAINT `dtks_keluarga_id_families_id_fk` FOREIGN KEY (`keluarga_id`) REFERENCES `families`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_anggota` ADD CONSTRAINT `dtks_anggota_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_anggota` ADD CONSTRAINT `dtks_anggota_dtks_id_dtks_id_fk` FOREIGN KEY (`dtks_id`) REFERENCES `dtks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_anggota` ADD CONSTRAINT `dtks_anggota_penduduk_id_residents_id_fk` FOREIGN KEY (`penduduk_id`) REFERENCES `residents`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_lampiran` ADD CONSTRAINT `dtks_lampiran_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_pengaturan_program` ADD CONSTRAINT `dtks_pengaturan_program_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_ref_lampiran` ADD CONSTRAINT `dtks_ref_lampiran_dtks_id_dtks_id_fk` FOREIGN KEY (`dtks_id`) REFERENCES `dtks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dtks_ref_lampiran` ADD CONSTRAINT `dtks_ref_lampiran_lampiran_id_dtks_lampiran_id_fk` FOREIGN KEY (`lampiran_id`) REFERENCES `dtks_lampiran`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dtks_village_status_idx` ON `dtks` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `dtks_village_versi_idx` ON `dtks` (`village_id`,`versi_kuisioner`);--> statement-breakpoint
CREATE INDEX `dtks_rtm_idx` ON `dtks` (`rtm_id`);--> statement-breakpoint
CREATE INDEX `dtks_keluarga_idx` ON `dtks` (`keluarga_id`);--> statement-breakpoint
CREATE INDEX `dtks_anggota_village_idx` ON `dtks_anggota` (`village_id`);--> statement-breakpoint
CREATE INDEX `dtks_anggota_dtks_idx` ON `dtks_anggota` (`dtks_id`);--> statement-breakpoint
CREATE INDEX `dtks_anggota_penduduk_idx` ON `dtks_anggota` (`penduduk_id`);--> statement-breakpoint
CREATE INDEX `dtks_lampiran_village_idx` ON `dtks_lampiran` (`village_id`);