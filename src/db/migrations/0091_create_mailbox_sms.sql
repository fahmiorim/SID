CREATE TABLE `mailbox_pesan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`arah` varchar(10) NOT NULL,
	`alamat` varchar(255) NOT NULL,
	`subjek` varchar(255),
	`isi` text NOT NULL,
	`dibaca` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mailbox_pesan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_pesan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`arah` varchar(10) NOT NULL,
	`nomor` varchar(30) NOT NULL,
	`isi` text NOT NULL,
	`provider_id` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'diterima',
	`dibaca` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_pesan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mailbox_pesan` ADD CONSTRAINT `mailbox_pesan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sms_pesan` ADD CONSTRAINT `sms_pesan_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `mailbox_pesan_village_created_idx` ON `mailbox_pesan` (`village_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sms_pesan_village_nomor_created_idx` ON `sms_pesan` (`village_id`,`nomor`,`created_at`);