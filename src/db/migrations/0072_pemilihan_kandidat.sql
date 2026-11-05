CREATE TABLE `pemilihan_kandidat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`pemilihan_id` int NOT NULL,
	`nomor_urut` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`keterangan` varchar(500),
	`jumlah_suara` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pemilihan_kandidat_id` PRIMARY KEY(`id`),
	CONSTRAINT `pemilihan_kandidat_nomor_uq` UNIQUE(`pemilihan_id`,`nomor_urut`)
);
--> statement-breakpoint
ALTER TABLE `pemilihan_kandidat` ADD CONSTRAINT `pemilihan_kandidat_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pemilihan_kandidat` ADD CONSTRAINT `pemilihan_kandidat_pemilihan_id_pemilihan_id_fk` FOREIGN KEY (`pemilihan_id`) REFERENCES `pemilihan`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pemilihan_kandidat_pemilihan_idx` ON `pemilihan_kandidat` (`pemilihan_id`);
