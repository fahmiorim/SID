ALTER TABLE `inventaris_mutasi` ADD `diajukan_oleh` varchar(150);--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `diajukan_oleh_id` varchar(50);--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `verifikasi_oleh` varchar(150);--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `verifikasi_sekdes` varchar(150);--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `verifikasi_kades` varchar(150);--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `log_verifikasi` text;--> statement-breakpoint
ALTER TABLE `inventaris_mutasi` ADD `catatan_verifikasi` text;