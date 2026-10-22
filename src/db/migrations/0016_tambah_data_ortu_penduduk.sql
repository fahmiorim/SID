ALTER TABLE `residents` ADD `education_sedang_id` int;--> statement-breakpoint
ALTER TABLE `residents` ADD `father_national_id` varchar(16);--> statement-breakpoint
ALTER TABLE `residents` ADD `mother_national_id` varchar(16);--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_education_sedang_id_educations_id_fk` FOREIGN KEY (`education_sedang_id`) REFERENCES `educations`(`id`) ON DELETE set null ON UPDATE no action;