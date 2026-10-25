CREATE TABLE `elections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`judul` varchar(200) NOT NULL,
	`status` enum('draf','aktif','selesai') NOT NULL DEFAULT 'draf',
	`tanggal` date NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `elections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `elections` ADD CONSTRAINT `elections_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `elections_village_status_idx` ON `elections` (`village_id`,`status`);--> statement-breakpoint
CREATE INDEX `elections_village_tanggal_idx` ON `elections` (`village_id`,`tanggal`);