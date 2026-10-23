ALTER TABLE `users` ADD `must_change_pin` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `resident_id` int;--> statement-breakpoint
ALTER TABLE `perangkat_desa` ADD `periode` varchar(20);--> statement-breakpoint
ALTER TABLE `letters` ADD `verification_token` varchar(64);--> statement-breakpoint
ALTER TABLE `letters` ADD `verification_token_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;