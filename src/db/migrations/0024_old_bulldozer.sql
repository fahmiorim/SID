CREATE TABLE `pembangunan_dokumentasi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proyek_id` int NOT NULL,
	`gambar` varchar(255) NOT NULL,
	`judul` varchar(150),
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pembangunan_dokumentasi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pembangunan_proyek` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(200) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`deskripsi` text,
	`lokasi` varchar(200),
	`tahun_anggaran` int NOT NULL,
	`sumber_dana` varchar(40),
	`anggaran` decimal(15,2),
	`volume` decimal(12,2),
	`satuan` varchar(30),
	`pelaksana` varchar(200),
	`mulai` date,
	`selesai` date,
	`status` varchar(20) NOT NULL DEFAULT 'rencana',
	`progres` tinyint NOT NULL DEFAULT 0,
	`hasil` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pembangunan_proyek_id` PRIMARY KEY(`id`),
	CONSTRAINT `pembangunan_proyek_village_slug_uq` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `pengaduan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nomor_tiket` varchar(40) NOT NULL,
	`kategori` varchar(30) NOT NULL DEFAULT 'umum',
	`judul` varchar(200) NOT NULL,
	`isi` text NOT NULL,
	`nama_pelapor` varchar(100) NOT NULL,
	`nik` varchar(16),
	`telepon` varchar(30),
	`email` varchar(100),
	`alamat` varchar(255),
	`lampiran` varchar(255),
	`status` varchar(20) NOT NULL DEFAULT 'baru',
	`tanggapan` text,
	`petugas_id` varchar(36),
	`ditanggapi_pada` timestamp,
	`publik` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pengaduan_id` PRIMARY KEY(`id`),
	CONSTRAINT `pengaduan_village_tiket_uq` UNIQUE(`village_id`,`nomor_tiket`)
);
--> statement-breakpoint
ALTER TABLE `pembangunan_dokumentasi` ADD CONSTRAINT `pembangunan_dokumentasi_proyek_id_pembangunan_proyek_id_fk` FOREIGN KEY (`proyek_id`) REFERENCES `pembangunan_proyek`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembangunan_proyek` ADD CONSTRAINT `pembangunan_proyek_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengaduan` ADD CONSTRAINT `pengaduan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengaduan` ADD CONSTRAINT `pengaduan_petugas_id_users_id_fk` FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pembangunan_dokumentasi_proyek_idx` ON `pembangunan_dokumentasi` (`proyek_id`);--> statement-breakpoint
CREATE INDEX `pembangunan_proyek_village_tahun_idx` ON `pembangunan_proyek` (`village_id`,`tahun_anggaran`);--> statement-breakpoint
CREATE INDEX `pembangunan_proyek_village_status_idx` ON `pembangunan_proyek` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `pengaduan_village_status_idx` ON `pengaduan` (`village_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `pengaduan_village_publik_idx` ON `pengaduan` (`village_id`,`publik`);