CREATE TABLE `bulanan_anak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`posyandu_id` int NOT NULL,
	`kia_id` int NOT NULL,
	`status_gizi` tinyint NOT NULL,
	`umur_bulan` tinyint NOT NULL,
	`status_tikar` tinyint NOT NULL,
	`pemberian_imunisasi_dasar` boolean NOT NULL DEFAULT false,
	`pemberian_imunisasi_campak` boolean,
	`pengukuran_berat_badan` boolean NOT NULL DEFAULT false,
	`berat_badan` float,
	`pengukuran_tinggi_badan` boolean NOT NULL DEFAULT false,
	`tinggi_badan` float,
	`konseling_gizi_ayah` boolean NOT NULL DEFAULT false,
	`konseling_gizi_ibu` boolean NOT NULL DEFAULT false,
	`kunjungan_rumah` boolean NOT NULL DEFAULT false,
	`air_bersih` boolean NOT NULL DEFAULT false,
	`kepemilikan_jamban` boolean NOT NULL DEFAULT false,
	`akta_lahir` boolean NOT NULL DEFAULT false,
	`jaminan_kesehatan` boolean NOT NULL DEFAULT false,
	`pengasuhan_paud` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bulanan_anak_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ibu_hamil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`posyandu_id` int NOT NULL,
	`kia_id` int NOT NULL,
	`status_kehamilan` tinyint,
	`usia_kehamilan` tinyint,
	`tanggal_melahirkan` date,
	`pemeriksaan_kehamilan` boolean NOT NULL DEFAULT false,
	`konsumsi_pil_fe` boolean NOT NULL DEFAULT false,
	`butir_pil_fe` int,
	`pemeriksaan_nifas` boolean NOT NULL DEFAULT false,
	`konseling_gizi` boolean NOT NULL DEFAULT false,
	`kunjungan_rumah` boolean NOT NULL DEFAULT false,
	`akses_air_bersih` boolean NOT NULL DEFAULT false,
	`kepemilikan_jamban` boolean NOT NULL DEFAULT false,
	`jaminan_kesehatan` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ibu_hamil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`no_kia` varchar(30) NOT NULL,
	`ibu_id` int NOT NULL,
	`anak_id` int,
	`hari_perkiraan_lahir` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kia_id` PRIMARY KEY(`id`),
	CONSTRAINT `kia_village_no_uq` UNIQUE(`village_id`,`no_kia`)
);
--> statement-breakpoint
CREATE TABLE `posyandu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`alamat` varchar(200),
	`nama_ketua` varchar(100),
	`nama_bidan` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posyandu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pendapat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int,
	`pengguna` varchar(100),
	`pilihan` tinyint NOT NULL,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pendapat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anggota_grup_kontak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`grup_id` int NOT NULL,
	`kontak_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anggota_grup_kontak_id` PRIMARY KEY(`id`),
	CONSTRAINT `anggota_grup_kontak_unique` UNIQUE(`grup_id`,`kontak_id`)
);
--> statement-breakpoint
CREATE TABLE `kontak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`telepon` varchar(20),
	`email` varchar(100),
	`telegram` varchar(50),
	`hubung_warga` varchar(50) DEFAULT 'Telegram',
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kontak_id` PRIMARY KEY(`id`),
	CONSTRAINT `kontak_village_telepon_uq` UNIQUE(`village_id`,`telepon`),
	CONSTRAINT `kontak_village_telegram_uq` UNIQUE(`village_id`,`telegram`),
	CONSTRAINT `kontak_village_email_uq` UNIQUE(`village_id`,`email`)
);
--> statement-breakpoint
CREATE TABLE `kontak_grup` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama_grup` varchar(50) NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kontak_grup_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_posyandu_id_posyandu_id_fk` FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_kia_id_kia_id_fk` FOREIGN KEY (`kia_id`) REFERENCES `kia`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_posyandu_id_posyandu_id_fk` FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_kia_id_kia_id_fk` FOREIGN KEY (`kia_id`) REFERENCES `kia`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_ibu_id_residents_id_fk` FOREIGN KEY (`ibu_id`) REFERENCES `residents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_anak_id_residents_id_fk` FOREIGN KEY (`anak_id`) REFERENCES `residents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posyandu` ADD CONSTRAINT `posyandu_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendapat` ADD CONSTRAINT `pendapat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendapat` ADD CONSTRAINT `pendapat_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_grup_id_kontak_grup_id_fk` FOREIGN KEY (`grup_id`) REFERENCES `kontak_grup`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_kontak_id_kontak_id_fk` FOREIGN KEY (`kontak_id`) REFERENCES `kontak`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kontak` ADD CONSTRAINT `kontak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kontak_grup` ADD CONSTRAINT `kontak_grup_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bulanan_anak_village_idx` ON `bulanan_anak` (`village_id`);--> statement-breakpoint
CREATE INDEX `bulanan_anak_kia_idx` ON `bulanan_anak` (`kia_id`);--> statement-breakpoint
CREATE INDEX `ibu_hamil_village_idx` ON `ibu_hamil` (`village_id`);--> statement-breakpoint
CREATE INDEX `ibu_hamil_kia_idx` ON `ibu_hamil` (`kia_id`);--> statement-breakpoint
CREATE INDEX `kia_village_idx` ON `kia` (`village_id`);--> statement-breakpoint
CREATE INDEX `posyandu_village_idx` ON `posyandu` (`village_id`);--> statement-breakpoint
CREATE INDEX `pendapat_village_idx` ON `pendapat` (`village_id`);--> statement-breakpoint
CREATE INDEX `pendapat_created_idx` ON `pendapat` (`created_at`);--> statement-breakpoint
CREATE INDEX `anggota_grup_kontak_village_idx` ON `anggota_grup_kontak` (`village_id`);--> statement-breakpoint
CREATE INDEX `kontak_village_idx` ON `kontak` (`village_id`);--> statement-breakpoint
CREATE INDEX `kontak_grup_village_idx` ON `kontak_grup` (`village_id`);