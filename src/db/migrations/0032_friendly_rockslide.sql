CREATE TABLE `posyandu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`alamat` varchar(200),
	`nama_ketua` varchar(100),
	`nama_bidan` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posyandu_id` PRIMARY KEY(`id`)
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
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kia_id` PRIMARY KEY(`id`),
	CONSTRAINT `kia_village_no_uq` UNIQUE(`village_id`,`no_kia`)
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
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ibu_hamil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bulanan_anak_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `posyandu` ADD CONSTRAINT `posyandu_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_ibu_id_residents_id_fk` FOREIGN KEY (`ibu_id`) REFERENCES `residents`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `kia` ADD CONSTRAINT `kia_anak_id_residents_id_fk` FOREIGN KEY (`anak_id`) REFERENCES `residents`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_posyandu_id_posyandu_id_fk` FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `ibu_hamil` ADD CONSTRAINT `ibu_hamil_kia_id_kia_id_fk` FOREIGN KEY (`kia_id`) REFERENCES `kia`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_posyandu_id_posyandu_id_fk` FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `bulanan_anak` ADD CONSTRAINT `bulanan_anak_kia_id_kia_id_fk` FOREIGN KEY (`kia_id`) REFERENCES `kia`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `posyandu_village_idx` ON `posyandu`(`village_id`);
--> statement-breakpoint
CREATE INDEX `kia_village_idx` ON `kia`(`village_id`);
--> statement-breakpoint
CREATE INDEX `ibu_hamil_village_idx` ON `ibu_hamil`(`village_id`);
--> statement-breakpoint
CREATE INDEX `ibu_hamil_kia_idx` ON `ibu_hamil`(`kia_id`);
--> statement-breakpoint
CREATE INDEX `bulanan_anak_village_idx` ON `bulanan_anak`(`village_id`);
--> statement-breakpoint
CREATE INDEX `bulanan_anak_kia_idx` ON `bulanan_anak`(`kia_id`);