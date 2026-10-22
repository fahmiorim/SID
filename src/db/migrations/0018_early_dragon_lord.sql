CREATE TABLE `berita` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`kategori_id` int,
	`penulis_id` varchar(36),
	`judul` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`ringkasan` varchar(500),
	`isi` text NOT NULL,
	`gambar` varchar(255),
	`dokumen` varchar(255),
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`terbit_pada` timestamp,
	`headline` boolean NOT NULL DEFAULT false,
	`slider` boolean NOT NULL DEFAULT false,
	`boleh_komentar` boolean NOT NULL DEFAULT true,
	`hit` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `berita_id` PRIMARY KEY(`id`),
	CONSTRAINT `berita_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `berita_kategori` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`aktif` boolean NOT NULL DEFAULT true,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `berita_kategori_id` PRIMARY KEY(`id`),
	CONSTRAINT `berita_kategori_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `dokumen_publik` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`kategori` varchar(50) NOT NULL DEFAULT 'informasi_publik',
	`jenis` varchar(50),
	`nomor` varchar(100),
	`tahun` int,
	`berkas` varchar(255),
	`tautan` varchar(500),
	`keterangan` text,
	`aktif` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dokumen_publik_id` PRIMARY KEY(`id`),
	CONSTRAINT `dokumen_publik_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `galeri_album` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`keterangan` text,
	`sampul` varchar(255),
	`aktif` boolean NOT NULL DEFAULT true,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `galeri_album_id` PRIMARY KEY(`id`),
	CONSTRAINT `galeri_album_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `galeri_foto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`album_id` int,
	`gambar` varchar(255) NOT NULL,
	`judul` varchar(150),
	`keterangan` text,
	`aktif` boolean NOT NULL DEFAULT true,
	`slider` boolean NOT NULL DEFAULT false,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `galeri_foto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `halaman_statis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`isi` text NOT NULL,
	`aktif` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `halaman_statis_id` PRIMARY KEY(`id`),
	CONSTRAINT `halaman_statis_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `jabatan_perangkat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jabatan_perangkat_id` PRIMARY KEY(`id`),
	CONSTRAINT `jabatan_perangkat_village_slug_unique` UNIQUE(`village_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `menu_publik` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`parent_id` int,
	`nama` varchar(50) NOT NULL,
	`link` varchar(500) NOT NULL,
	`link_tipe` varchar(20) NOT NULL DEFAULT 'internal',
	`aktif` boolean NOT NULL DEFAULT true,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_publik_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perangkat_desa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`jabatan_id` int,
	`nama` varchar(100) NOT NULL,
	`gelar_depan` varchar(100),
	`gelar_belakang` varchar(100),
	`nip` varchar(25),
	`nik` varchar(16),
	`jenis_kelamin` varchar(10),
	`tempat_lahir` varchar(100),
	`tanggal_lahir` date,
	`foto` varchar(255),
	`tanda_tangan` varchar(255),
	`penanda_tangan` boolean NOT NULL DEFAULT false,
	`status` varchar(20) NOT NULL DEFAULT 'aktif',
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `perangkat_desa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profil_desa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`visi` text,
	`misi` text,
	`sejarah` text,
	`sambutan` text,
	`koordinat` varchar(60),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profil_desa_id` PRIMARY KEY(`id`),
	CONSTRAINT `profil_desa_village_unique` UNIQUE(`village_id`)
);
--> statement-breakpoint
CREATE TABLE `slider` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`gambar` varchar(255) NOT NULL,
	`judul` varchar(150),
	`keterangan` varchar(500),
	`tautan` varchar(255),
	`aktif` boolean NOT NULL DEFAULT true,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `slider_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `widget` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(100),
	`isi` text,
	`jenis` tinyint NOT NULL DEFAULT 1,
	`pengaturan` text,
	`aktif` boolean NOT NULL DEFAULT true,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `widget_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `berita` ADD CONSTRAINT `berita_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `berita` ADD CONSTRAINT `berita_kategori_id_berita_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `berita_kategori`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `berita` ADD CONSTRAINT `berita_penulis_id_users_id_fk` FOREIGN KEY (`penulis_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `berita_kategori` ADD CONSTRAINT `berita_kategori_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dokumen_publik` ADD CONSTRAINT `dokumen_publik_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `galeri_album` ADD CONSTRAINT `galeri_album_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `galeri_foto` ADD CONSTRAINT `galeri_foto_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `galeri_foto` ADD CONSTRAINT `galeri_foto_album_id_galeri_album_id_fk` FOREIGN KEY (`album_id`) REFERENCES `galeri_album`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `halaman_statis` ADD CONSTRAINT `halaman_statis_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jabatan_perangkat` ADD CONSTRAINT `jabatan_perangkat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_publik` ADD CONSTRAINT `menu_publik_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perangkat_desa` ADD CONSTRAINT `perangkat_desa_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perangkat_desa` ADD CONSTRAINT `perangkat_desa_jabatan_id_jabatan_perangkat_id_fk` FOREIGN KEY (`jabatan_id`) REFERENCES `jabatan_perangkat`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profil_desa` ADD CONSTRAINT `profil_desa_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider` ADD CONSTRAINT `slider_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `widget` ADD CONSTRAINT `widget_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `berita_village_status_idx` ON `berita` (`village_id`,`status`,`terbit_pada`);--> statement-breakpoint
CREATE INDEX `berita_kategori_idx` ON `berita` (`kategori_id`);--> statement-breakpoint
CREATE INDEX `dokumen_publik_village_kategori_idx` ON `dokumen_publik` (`village_id`,`kategori`);--> statement-breakpoint
CREATE INDEX `galeri_foto_village_idx` ON `galeri_foto` (`village_id`);--> statement-breakpoint
CREATE INDEX `galeri_foto_album_idx` ON `galeri_foto` (`album_id`);--> statement-breakpoint
CREATE INDEX `menu_publik_village_idx` ON `menu_publik` (`village_id`,`urut`);--> statement-breakpoint
CREATE INDEX `perangkat_desa_village_idx` ON `perangkat_desa` (`village_id`);--> statement-breakpoint
CREATE INDEX `perangkat_desa_jabatan_idx` ON `perangkat_desa` (`jabatan_id`);--> statement-breakpoint
CREATE INDEX `slider_village_idx` ON `slider` (`village_id`,`urut`);--> statement-breakpoint
CREATE INDEX `widget_village_idx` ON `widget` (`village_id`,`urut`);