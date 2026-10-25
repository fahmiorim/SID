CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int,
	`actor_id` varchar(36),
	`event` varchar(80) NOT NULL,
	`resource` varchar(80) NOT NULL,
	`resource_id` varchar(100),
	`ip_address` varchar(45),
	`user_agent` text,
	`details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keuangan_transaksi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`template_uuid` varchar(20),
	`keterangan` varchar(255) NOT NULL,
	`jumlah` decimal(65,2) NOT NULL DEFAULT '0.00',
	`jenis` enum('pendapatan','belanja') NOT NULL,
	`tanggal` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keuangan_transaksi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_transaksi` ADD CONSTRAINT `keuangan_transaksi_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_transaksi` ADD CONSTRAINT `keuangan_transaksi_template_uuid_keuangan_template_uuid_fk` FOREIGN KEY (`template_uuid`) REFERENCES `keuangan_template`(`uuid`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keuangan_transaksi` ADD CONSTRAINT `keuangan_transaksi_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_village_created_idx` ON `audit_logs` (`village_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_event_idx` ON `audit_logs` (`event`);--> statement-breakpoint
CREATE INDEX `keuangan_transaksi_village_idx` ON `keuangan_transaksi` (`village_id`);--> statement-breakpoint
CREATE INDEX `keuangan_transaksi_jenis_idx` ON `keuangan_transaksi` (`jenis`);