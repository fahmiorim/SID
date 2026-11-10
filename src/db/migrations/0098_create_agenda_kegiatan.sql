-- Agenda kegiatan desa untuk situs publik.
-- Terpisah dari `bumindes_agenda` (buku agenda surat) agar metadata surat
-- internal tidak pernah tampil di situs publik. Idempoten lewat IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS `agenda_kegiatan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(200) NOT NULL,
	`mulai` date NOT NULL,
	`selesai` date,
	`lokasi` varchar(200),
	`deskripsi` text,
	`tayang` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agenda_kegiatan_id` PRIMARY KEY(`id`),
	KEY `agenda_kegiatan_village_mulai_idx` (`village_id`,`mulai`),
	CONSTRAINT `agenda_kegiatan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action
);
