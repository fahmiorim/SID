CREATE TABLE `keuangan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`template_uuid` varchar(20) NOT NULL,
	`tahun` int NOT NULL,
	`anggaran` decimal(65,2) NOT NULL DEFAULT '0.00',
	`realisasi` decimal(65,2) NOT NULL DEFAULT '0.00',
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keuangan_id` PRIMARY KEY(`id`),
	CONSTRAINT `keuangan_village_tahun_uuid_unique` UNIQUE(`village_id`,`tahun`,`template_uuid`)
);
--> statement-breakpoint
CREATE TABLE `keuangan_template` (
	`uuid` varchar(20) NOT NULL,
	`parent_uuid` varchar(20),
	`uraian` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keuangan_template_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
ALTER TABLE `keuangan` ADD CONSTRAINT `keuangan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan` ADD CONSTRAINT `keuangan_template_uuid_keuangan_template_uuid_fk` FOREIGN KEY (`template_uuid`) REFERENCES `keuangan_template`(`uuid`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan` ADD CONSTRAINT `keuangan_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `keuangan_village_tahun_idx` ON `keuangan` (`village_id`,`tahun`);--> statement-breakpoint
CREATE INDEX `keuangan_template_parent_idx` ON `keuangan_template` (`parent_uuid`);