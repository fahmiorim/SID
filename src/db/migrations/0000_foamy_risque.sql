CREATE TABLE `accounts` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_account_uq` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_uq` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`username` varchar(100),
	`display_username` varchar(100),
	`config_id` int,
	`grup_id` int,
	`active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`),
	CONSTRAINT `users_username_uq` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grup_akses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int,
	`id_grup` int NOT NULL,
	`id_modul` int NOT NULL,
	`akses` tinyint DEFAULT 0,
	CONSTRAINT `grup_akses_id` PRIMARY KEY(`id`),
	CONSTRAINT `grup_akses_grup_modul_uq` UNIQUE(`id_grup`,`id_modul`)
);
--> statement-breakpoint
CREATE TABLE `setting_modul` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int,
	`modul` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`url` varchar(255),
	`aktif` boolean NOT NULL DEFAULT false,
	`ikon` varchar(100) DEFAULT '',
	`ikon_kecil` varchar(100) DEFAULT '',
	`urut` int,
	`level` boolean NOT NULL DEFAULT false,
	`hidden` boolean NOT NULL DEFAULT false,
	`parent` int DEFAULT 0,
	CONSTRAINT `setting_modul_id` PRIMARY KEY(`id`),
	CONSTRAINT `setting_modul_slug_config_uq` UNIQUE(`config_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_grup` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int,
	`nama` varchar(50) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`jenis` tinyint NOT NULL DEFAULT 2,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_grup_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_grup_slug_config_uq` UNIQUE(`config_id`,`slug`),
	CONSTRAINT `user_grup_nama_config_uq` UNIQUE(`config_id`,`nama`)
);
--> statement-breakpoint
CREATE TABLE `config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`app_key` varchar(255),
	`nama_desa` varchar(100),
	`kode_desa` varchar(10),
	`kode_pos` varchar(5),
	`nama_kecamatan` varchar(100),
	`kode_kecamatan` varchar(8),
	`nama_kepala_camat` varchar(100),
	`nip_kepala_camat` varchar(30),
	`nama_kabupaten` varchar(100),
	`kode_kabupaten` varchar(4),
	`nama_propinsi` varchar(100),
	`kode_propinsi` varchar(2),
	`logo` varchar(255),
	`lat` varchar(30),
	`lng` varchar(30),
	`alamat_kantor` varchar(255),
	`email_desa` varchar(100),
	`telepon` varchar(30),
	`website` varchar(255),
	`jam_kerja` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_config_id_config_id_fk` FOREIGN KEY (`config_id`) REFERENCES `config`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_grup_id_user_grup_id_fk` FOREIGN KEY (`grup_id`) REFERENCES `user_grup`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grup_akses` ADD CONSTRAINT `grup_akses_config_id_config_id_fk` FOREIGN KEY (`config_id`) REFERENCES `config`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grup_akses` ADD CONSTRAINT `grup_akses_id_grup_user_grup_id_fk` FOREIGN KEY (`id_grup`) REFERENCES `user_grup`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grup_akses` ADD CONSTRAINT `grup_akses_id_modul_setting_modul_id_fk` FOREIGN KEY (`id_modul`) REFERENCES `setting_modul`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `setting_modul` ADD CONSTRAINT `setting_modul_config_id_config_id_fk` FOREIGN KEY (`config_id`) REFERENCES `config`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_grup` ADD CONSTRAINT `user_grup_config_id_config_id_fk` FOREIGN KEY (`config_id`) REFERENCES `config`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_grup_idx` ON `users` (`grup_id`);--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `grup_akses_id_modul_idx` ON `grup_akses` (`id_modul`);