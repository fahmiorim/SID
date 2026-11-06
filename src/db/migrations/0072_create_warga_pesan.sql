-- OS-WGA-006: Percakapan dua arah warga <-> operator desa
-- Created: 2026-11-05

CREATE TABLE `warga_pesan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`pengirim` varchar(20) NOT NULL,
	`isi` text NOT NULL,
	`dibaca_warga_pada` timestamp,
	`dibaca_operator_pada` timestamp,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	PRIMARY KEY(`id`),
	CONSTRAINT `warga_pesan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `warga_pesan_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `warga_pesan_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `warga_pesan_village_resident_idx` ON `warga_pesan` (`village_id`,`resident_id`);--> statement-breakpoint
CREATE INDEX `warga_pesan_village_created_idx` ON `warga_pesan` (`village_id`,`created_at`);
