ALTER TABLE `verifikasi_kontak` MODIFY COLUMN `target` varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifikasi_kontak` ADD `kanal` varchar(20) DEFAULT 'whatsapp' NOT NULL;