CREATE TABLE `analisis_indikator` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kategori_id` int,
	`kode` varchar(20) NOT NULL,
	`nama` varchar(200) NOT NULL,
	`keterangan` text,
	CONSTRAINT `analisis_indikator_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analisis_kategori` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`keterangan` text,
	CONSTRAINT `analisis_kategori_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anjungan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`deskripsi` text,
	`aktif` int DEFAULT 1,
	`urutan` int DEFAULT 0,
	CONSTRAINT `anjungan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `arsip` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kategori` varchar(100),
	`judul` varchar(200) NOT NULL,
	`berkas` varchar(255),
	`keterangan` text,
	CONSTRAINT `arsip_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buku_tamu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`instansi` varchar(200),
	`keperluan` text,
	`tanggal` date NOT NULL,
	`jam_masuk` time,
	`jam_keluar` time,
	`keterangan` text,
	CONSTRAINT `buku_tamu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dokumen_desa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`jenis` varchar(50),
	`nomor` varchar(100),
	`judul` varchar(200) NOT NULL,
	`berkas` varchar(255),
	`keterangan` text,
	CONSTRAINT `dokumen_desa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gis_simbol` (
	`id` int AUTO_INCREMENT NOT NULL,
	`simbol` varchar(40) NOT NULL,
	`desk` text,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `gis_simbol_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `idm_indikator` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tahun` int NOT NULL,
	`kode` varchar(20) NOT NULL,
	`nama` varchar(200) NOT NULL,
	`skor` int DEFAULT 0,
	`kategori` varchar(50),
	`keterangan` text,
	CONSTRAINT `idm_indikator_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rentang_umur_defaults` (
	`village_id` int NOT NULL,
	`default_sets` varchar(200) NOT NULL DEFAULT 'standard',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rentang_umur_defaults_village_id_pk` PRIMARY KEY(`village_id`)
);
--> statement-breakpoint
CREATE TABLE `pemilihan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tahun` int NOT NULL,
	`jenis` varchar(50) NOT NULL,
	`tanggal` date,
	`keterangan` text,
	CONSTRAINT `pemilihan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registrasi_warga` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nik` varchar(16) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`no_hp` varchar(20),
	`status` varchar(20) DEFAULT 'menunggu',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registrasi_warga_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lapak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`pemilik` varchar(100),
	`kategori` varchar(100),
	`alamat` text,
	`keterangan` text,
	CONSTRAINT `lapak_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kehadiran_perangkat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`perangkat_id` int,
	`tanggal` date NOT NULL,
	`jam_masuk` time,
	`jam_keluar` time,
	`status` varchar(20) DEFAULT 'hadir',
	CONSTRAINT `kehadiran_perangkat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tte_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`provider` varchar(50) DEFAULT 'bsre',
	`aktif` int DEFAULT 0,
	`konfigurasi` text,
	CONSTRAINT `tte_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sisa_lebih` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`tahun` int NOT NULL,
	`jumlah` varchar(50),
	`keterangan` text,
	`tanggal` date,
	CONSTRAINT `sisa_lebih_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pelanggan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`kontak` varchar(100),
	`alamat` text,
	`keterangan` text,
	CONSTRAINT `pelanggan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analisis_indikator` ADD CONSTRAINT `analisis_indikator_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `analisis_indikator` ADD CONSTRAINT `analisis_indikator_kategori_id_analisis_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `analisis_kategori`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `analisis_kategori` ADD CONSTRAINT `analisis_kategori_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `anjungan` ADD CONSTRAINT `anjungan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `arsip` ADD CONSTRAINT `arsip_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `buku_tamu` ADD CONSTRAINT `buku_tamu_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `dokumen_desa` ADD CONSTRAINT `dokumen_desa_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `idm_indikator` ADD CONSTRAINT `idm_indikator_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `rentang_umur_defaults` ADD CONSTRAINT `rentang_umur_defaults_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `pemilihan` ADD CONSTRAINT `pemilihan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `registrasi_warga` ADD CONSTRAINT `registrasi_warga_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `lapak` ADD CONSTRAINT `lapak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `kehadiran_perangkat` ADD CONSTRAINT `kehadiran_perangkat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `tte_config` ADD CONSTRAINT `tte_config_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `sisa_lebih` ADD CONSTRAINT `sisa_lebih_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD CONSTRAINT `pelanggan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
