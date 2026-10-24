ALTER TABLE `permohonan_surat` ADD `letter_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_resident_uq` UNIQUE(`resident_id`);--> statement-breakpoint
ALTER TABLE `permohonan_surat` ADD CONSTRAINT `permohonan_surat_letter_id_letters_id_fk` FOREIGN KEY (`letter_id`) REFERENCES `letters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `permohonan_surat_letter_idx` ON `permohonan_surat` (`letter_id`);