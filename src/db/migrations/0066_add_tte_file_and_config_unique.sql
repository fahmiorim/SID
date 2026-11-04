ALTER TABLE `letters` ADD `tte_file` varchar(255);--> statement-breakpoint
ALTER TABLE `tte_config` ADD CONSTRAINT `tte_config_village_uq` UNIQUE(`village_id`);