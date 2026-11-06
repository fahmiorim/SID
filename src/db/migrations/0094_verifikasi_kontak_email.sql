ALTER TABLE `verifikasi_kontak` MODIFY COLUMN `target` varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifikasi_kontak` ADD `kanal` varchar(20) DEFAULT 'whatsapp' NOT NULL;--> statement-breakpoint
CREATE TABLE `pengguna_menu_urutan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pengguna_menu_urutan_id` PRIMARY KEY(`id`),
	CONSTRAINT `pengguna_menu_urutan_user_slug_uq` UNIQUE(`user_id`,`slug`)
);