CREATE TABLE `pengguna_menu_urutan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`urut` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pengguna_menu_urutan_id` PRIMARY KEY(`id`),
	CONSTRAINT `pengguna_menu_urutan_user_slug_uq` UNIQUE(`user_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `pengguna_menu_urutan` ADD CONSTRAINT `pengguna_menu_urutan_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;