-- OS-WGA-001/009: bukti pengiriman notifikasi lintas fitur
-- Created: 2026-11-05

CREATE TABLE `notifikasi_terkirim` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int,
	`jenis` varchar(60) NOT NULL,
	`kanal` varchar(20) NOT NULL,
	`target` varchar(255) NOT NULL,
	`subjek` varchar(200),
	`pesan` text,
	`sukses` boolean NOT NULL DEFAULT false,
	`dilewati` boolean NOT NULL DEFAULT false,
	`respons_provider` text,
	`pesan_error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	PRIMARY KEY(`id`),
	CONSTRAINT `notifikasi_terkirim_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `notifikasi_terkirim_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `notifikasi_terkirim_village_jenis_idx` ON `notifikasi_terkirim` (`village_id`,`jenis`);
