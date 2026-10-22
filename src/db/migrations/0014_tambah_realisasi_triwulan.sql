CREATE TABLE `keuangan_triwulan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`template_uuid` varchar(20) NOT NULL,
	`tahun` int NOT NULL,
	`tw1` decimal(65,2) NOT NULL DEFAULT '0.00',
	`tw2` decimal(65,2) NOT NULL DEFAULT '0.00',
	`tw3` decimal(65,2) NOT NULL DEFAULT '0.00',
	`tw4` decimal(65,2) NOT NULL DEFAULT '0.00',
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keuangan_triwulan_id` PRIMARY KEY(`id`),
	CONSTRAINT `keuangan_triwulan_village_tahun_uuid_unique` UNIQUE(`village_id`,`tahun`,`template_uuid`)
);
--> statement-breakpoint
ALTER TABLE `keuangan_triwulan` ADD CONSTRAINT `keuangan_triwulan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_triwulan` ADD CONSTRAINT `keuangan_triwulan_template_uuid_keuangan_template_uuid_fk` FOREIGN KEY (`template_uuid`) REFERENCES `keuangan_template`(`uuid`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_triwulan` ADD CONSTRAINT `keuangan_triwulan_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `keuangan_triwulan_village_tahun_idx` ON `keuangan_triwulan` (`village_id`,`tahun`);