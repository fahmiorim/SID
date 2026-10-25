CREATE TABLE `kontak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama` varchar(100) NOT NULL,
	`telepon` varchar(20),
	`email` varchar(100),
	`telegram` varchar(50),
	`hubung_warga` varchar(50) DEFAULT 'Telegram',
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kontak_id` PRIMARY KEY(`id`),
	CONSTRAINT `kontak_village_telepon_uq` UNIQUE(`village_id`,`telepon`),
	CONSTRAINT `kontak_village_telegram_uq` UNIQUE(`village_id`,`telegram`),
	CONSTRAINT `kontak_village_email_uq` UNIQUE(`village_id`,`email`)
);
--> statement-breakpoint
CREATE TABLE `kontak_grup` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`nama_grup` varchar(50) NOT NULL,
	`keterangan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kontak_grup_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anggota_grup_kontak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`grup_id` int NOT NULL,
	`kontak_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anggota_grup_kontak_id` PRIMARY KEY(`id`),
	CONSTRAINT `anggota_grup_kontak_unique` UNIQUE(`grup_id`,`kontak_id`)
);
--> statement-breakpoint
ALTER TABLE `kontak` ADD CONSTRAINT `kontak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `kontak_grup` ADD CONSTRAINT `kontak_grup_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_grup_id_kontak_grup_id_fk` FOREIGN KEY (`grup_id`) REFERENCES `kontak_grup`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `anggota_grup_kontak` ADD CONSTRAINT `anggota_grup_kontak_kontak_id_kontak_id_fk` FOREIGN KEY (`kontak_id`) REFERENCES `kontak`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `kontak_village_idx` ON `kontak`(`village_id`);
--> statement-breakpoint
CREATE INDEX `kontak_grup_village_idx` ON `kontak_grup`(`village_id`);
--> statement-breakpoint
CREATE INDEX `anggota_grup_kontak_village_idx` ON `anggota_grup_kontak`(`village_id`);