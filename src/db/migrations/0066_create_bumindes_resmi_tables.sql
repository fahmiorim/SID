-- Migration: 0070_create_bumindes_resmi_tables.sql
-- Buku resmi bumindes: tanah kas (+ mutasi), pembangunan (+ kader), sekretariat
-- (peraturan, aparat, agenda). Idempoten lewat CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `bumindes_tanah_kas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nomor_persil` varchar(50) NOT NULL,
	`asal` varchar(255),
	`luas` decimal(14,2) NOT NULL DEFAULT '0.00',
	`lokasi` varchar(255),
	`status` varchar(150),
	`nilai` decimal(19,2) NOT NULL DEFAULT '0.00',
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_tanah_kas_id` PRIMARY KEY(`id`),
	KEY `bumindes_tanah_kas_village_idx` (`village_id`),
	CONSTRAINT `bumindes_tanah_kas_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_tanah_kas_mutasi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tanah_kas_id` int NOT NULL,
	`tanggal` date NOT NULL,
	`jenis` varchar(50) NOT NULL,
	`uraian` varchar(500) NOT NULL,
	`luas_perubahan` decimal(14,2),
	`nilai_perubahan` decimal(19,2),
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_tanah_kas_mutasi_id` PRIMARY KEY(`id`),
	KEY `bumindes_tanah_kas_mutasi_village_idx` (`village_id`),
	KEY `bumindes_tanah_kas_mutasi_persil_idx` (`tanah_kas_id`),
	CONSTRAINT `bumindes_tanah_kas_mutasi_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `bumindes_tanah_kas_mutasi_persil_id_fk` FOREIGN KEY (`tanah_kas_id`) REFERENCES `bumindes_tanah_kas`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_pembangunan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tahun` int NOT NULL,
	`nama_kegiatan` varchar(255) NOT NULL,
	`lokasi` varchar(255),
	`volume` varchar(100),
	`sumber_dana` varchar(150),
	`biaya` decimal(19,2) NOT NULL DEFAULT '0.00',
	`pelaksana` varchar(150),
	`status` varchar(20) NOT NULL DEFAULT 'rencana',
	`tanggal_mulai` date,
	`tanggal_selesai` date,
	`hasil` text,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_pembangunan_id` PRIMARY KEY(`id`),
	KEY `bumindes_pembangunan_village_tahun_idx` (`village_id`,`tahun`),
	CONSTRAINT `bumindes_pembangunan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_kader` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(150) NOT NULL,
	`jabatan` varchar(150),
	`bidang` varchar(150),
	`alamat` varchar(255),
	`no_hp` varchar(30),
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_kader_id` PRIMARY KEY(`id`),
	KEY `bumindes_kader_village_idx` (`village_id`),
	CONSTRAINT `bumindes_kader_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_peraturan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`jenis` varchar(40) NOT NULL DEFAULT 'peraturan_desa',
	`nomor` varchar(100) NOT NULL,
	`tahun` int,
	`tentang` varchar(500) NOT NULL,
	`tanggal_ditetapkan` date,
	`tanggal_diundangkan` date,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_peraturan_id` PRIMARY KEY(`id`),
	KEY `bumindes_peraturan_village_jenis_idx` (`village_id`,`jenis`),
	CONSTRAINT `bumindes_peraturan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_aparat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(150) NOT NULL,
	`nip` varchar(30),
	`jabatan` varchar(150) NOT NULL,
	`tempat_lahir` varchar(100),
	`tanggal_lahir` date,
	`pendidikan` varchar(100),
	`nomor_sk_pengangkatan` varchar(100),
	`tanggal_pengangkatan` date,
	`nomor_sk_pemberhentian` varchar(100),
	`tanggal_pemberhentian` date,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_aparat_id` PRIMARY KEY(`id`),
	KEY `bumindes_aparat_village_idx` (`village_id`),
	CONSTRAINT `bumindes_aparat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bumindes_agenda` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`jenis` varchar(20) NOT NULL DEFAULT 'masuk',
	`tanggal` date NOT NULL,
	`nomor_surat` varchar(150),
	`asal_tujuan` varchar(255),
	`perihal` varchar(500) NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_agenda_id` PRIMARY KEY(`id`),
	KEY `bumindes_agenda_village_jenis_idx` (`village_id`,`jenis`),
	CONSTRAINT `bumindes_agenda_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
