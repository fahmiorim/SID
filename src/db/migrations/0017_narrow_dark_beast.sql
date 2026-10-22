ALTER TABLE `villages` ADD `domain` varchar(255);--> statement-breakpoint
ALTER TABLE `villages` ADD CONSTRAINT `villages_domain_unique` UNIQUE(`domain`);