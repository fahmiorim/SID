CREATE TABLE `bumindes_buku` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kode_buku` varchar(20) NOT NULL,
	`nama_buku` varchar(150) NOT NULL,
	`uraian` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_buku_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bumindes_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`buku_id` int NOT NULL,
	`nomor_urut` int NOT NULL DEFAULT 0,
	`tanggal` date,
	`uraian` varchar(500) NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bumindes_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventaris` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kategori_id` int,
	`nomor_inventaris` varchar(50),
	`nama_barang` varchar(200) NOT NULL,
	`kode_barang` varchar(50),
	`merk` varchar(100),
	`tipe` varchar(100),
	`spesifikasi` text,
	`jumlah` decimal(12,2) NOT NULL DEFAULT '1',
	`satuan` varchar(20) DEFAULT 'buah',
	`harga_satuan` decimal(15,2),
	`nilai_akhir` decimal(15,2),
	`tahun_pembelian` int,
	`tanggal_pembelian` date,
	`asal` enum('pembelian','hibah','bantuan_pemerintah','sumbangan','lainnya'),
	`donatur` varchar(150),
	`kondisi` enum('baik','rusak_ringan','rusak_berat') NOT NULL DEFAULT 'baik',
	`lokasi` varchar(150),
	`keterangan` text,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventaris_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventaris_kategori` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kode` varchar(20) NOT NULL,
	`nama` varchar(150) NOT NULL,
	`golongan` enum('tanah','gedung_bangunan','jalan_irigasi_jaringan','peralatan_mesin','aset_lainnya','konstruksi_dalam_pengerjaan') NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventaris_kategori_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventaris_mutasi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`inventaris_id` int NOT NULL,
	`jenis` enum('pindah','rusak','hapus','perbaikan') NOT NULL,
	`status` enum('diajukan','disetujui','ditolak') NOT NULL DEFAULT 'diajukan',
	`tanggal_mutasi` date NOT NULL,
	`lokasi_baru` varchar(150),
	`kondisi_baru` enum('baik','rusak_ringan','rusak_berat'),
	`jumlah_mutasi` decimal(12,2) DEFAULT '1',
	`alasan` text,
	`keterangan` text,
	`disetujui_oleh` varchar(150),
	`tanggal_persetujuan` timestamp,
	`catatan_penolakan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventaris_mutasi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permohonan_surat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`letter_type_id` int NOT NULL,
	`no_antrian` varchar(30),
	`status` int NOT NULL DEFAULT 1,
	`isian_form` text,
	`syarat` text,
	`no_hp_aktif` varchar(30),
	`keterangan` text,
	`alasan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permohonan_surat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(200) NOT NULL,
	`deskripsi` text,
	`aktif` int DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_jawaban` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responden_id` int NOT NULL,
	`soal_id` int NOT NULL,
	`jawaban` text,
	CONSTRAINT `survey_jawaban_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_responden` (
	`id` int AUTO_INCREMENT NOT NULL,
	`survey_id` int NOT NULL,
	`nama` varchar(150),
	`nik` varchar(16),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responden_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_soal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`survey_id` int NOT NULL,
	`pertanyaan` text NOT NULL,
	`tipe` varchar(20) DEFAULT 'text',
	`urutan` int DEFAULT 0,
	CONSTRAINT `survey_soal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `letter_types` ADD `form_isian` text;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `kode_isian` text;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `format_nomor_global` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `satuan_masa_berlaku` varchar(15) DEFAULT 'M';--> statement-breakpoint
ALTER TABLE `letter_types` ADD `qr_code` boolean;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `qr_code_tte` boolean;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `logo_garuda` boolean;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `kecamatan` boolean;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `orientasi` varchar(10);--> statement-breakpoint
ALTER TABLE `letter_types` ADD `ukuran` varchar(10);--> statement-breakpoint
ALTER TABLE `letter_types` ADD `margin` text;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `header` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `footer` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `sumber_penduduk_berulang` boolean;--> statement-breakpoint
ALTER TABLE `letters` ADD `isi_surat` text;--> statement-breakpoint
ALTER TABLE `letters` ADD `verifikasi_operator` boolean;--> statement-breakpoint
ALTER TABLE `letters` ADD `verifikasi_sekdes` boolean;--> statement-breakpoint
ALTER TABLE `letters` ADD `verifikasi_kades` boolean;--> statement-breakpoint
ALTER TABLE `letters` ADD `log_verifikasi` varchar(100);--> statement-breakpoint
ALTER TABLE `letters` ADD `tte` boolean;--> statement-breakpoint
ALTER TABLE `letters` ADD `urls_id` int;--> statement-breakpoint
ALTER TABLE `letters` ADD `pemohon` varchar(200);--> statement-breakpoint
ALTER TABLE `letters` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `bumindes_buku` ADD CONSTRAINT `bumindes_buku_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bumindes_item` ADD CONSTRAINT `bumindes_item_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bumindes_item` ADD CONSTRAINT `bumindes_item_buku_id_bumindes_buku_id_fk` FOREIGN KEY (`buku_id`) REFERENCES `bumindes_buku`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventaris` ADD CONSTRAINT `inventaris_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventaris` ADD CONSTRAINT `inventaris_kategori_id_inventaris_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `inventaris_kategori`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventaris_kategori` ADD CONSTRAINT `inventaris_kategori_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD CONSTRAINT `inventaris_mutasi_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD CONSTRAINT `inventaris_mutasi_inventaris_id_inventaris_id_fk` FOREIGN KEY (`inventaris_id`) REFERENCES `inventaris`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permohonan_surat` ADD CONSTRAINT `permohonan_surat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permohonan_surat` ADD CONSTRAINT `permohonan_surat_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permohonan_surat` ADD CONSTRAINT `permohonan_surat_letter_type_id_letter_types_id_fk` FOREIGN KEY (`letter_type_id`) REFERENCES `letter_types`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey` ADD CONSTRAINT `survey_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_jawaban` ADD CONSTRAINT `survey_jawaban_responden_id_survey_responden_id_fk` FOREIGN KEY (`responden_id`) REFERENCES `survey_responden`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_jawaban` ADD CONSTRAINT `survey_jawaban_soal_id_survey_soal_id_fk` FOREIGN KEY (`soal_id`) REFERENCES `survey_soal`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_responden` ADD CONSTRAINT `survey_responden_survey_id_survey_id_fk` FOREIGN KEY (`survey_id`) REFERENCES `survey`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_soal` ADD CONSTRAINT `survey_soal_survey_id_survey_id_fk` FOREIGN KEY (`survey_id`) REFERENCES `survey`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `inv_village_kategori` ON `inventaris` (`village_id`,`kategori_id`);--> statement-breakpoint
CREATE INDEX `inv_village_no` ON `inventaris` (`village_id`,`nomor_inventaris`);--> statement-breakpoint
CREATE INDEX `inv_kat_village_kode` ON `inventaris_kategori` (`village_id`,`kode`);--> statement-breakpoint
CREATE INDEX `inv_mut_village_inv` ON `inventaris_mutasi` (`village_id`,`inventaris_id`);--> statement-breakpoint
CREATE INDEX `inv_mut_village_status` ON `inventaris_mutasi` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `permohonan_surat_village_status_idx` ON `permohonan_surat` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `permohonan_surat_village_created_idx` ON `permohonan_surat` (`village_id`,`created_at`);