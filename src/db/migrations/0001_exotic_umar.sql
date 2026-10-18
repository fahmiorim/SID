CREATE TABLE `blood_types` (
	`id` int NOT NULL,
	`name` varchar(20) NOT NULL,
	CONSTRAINT `blood_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `citizenships` (
	`id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `citizenships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educations` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `educations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_relations` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `family_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marital_statuses` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `marital_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `occupations` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `occupations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `religions` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `religions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `residents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`village_id` int NOT NULL,
	`national_id` varchar(16),
	`family_card_number` varchar(16),
	`name` varchar(100) NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`birth_place` varchar(100),
	`birth_date` date,
	`religion_id` int,
	`education_id` int,
	`occupation_id` int,
	`marital_status_id` int,
	`family_relation_id` int,
	`blood_type_id` int,
	`citizenship_id` int,
	`residence_status` enum('permanent','temporary') NOT NULL DEFAULT 'permanent',
	`life_status` enum('alive','deceased','moved','missing','departed','invalid') NOT NULL DEFAULT 'alive',
	`region_id` int,
	`address` varchar(255),
	`phone` varchar(30),
	`father_name` varchar(100),
	`mother_name` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `residents_id` PRIMARY KEY(`id`),
	CONSTRAINT `residents_village_national_id_uq` UNIQUE(`village_id`,`national_id`)
);
--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_religion_id_religions_id_fk` FOREIGN KEY (`religion_id`) REFERENCES `religions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_education_id_educations_id_fk` FOREIGN KEY (`education_id`) REFERENCES `educations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_occupation_id_occupations_id_fk` FOREIGN KEY (`occupation_id`) REFERENCES `occupations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_marital_status_id_marital_statuses_id_fk` FOREIGN KEY (`marital_status_id`) REFERENCES `marital_statuses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_family_relation_id_family_relations_id_fk` FOREIGN KEY (`family_relation_id`) REFERENCES `family_relations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_blood_type_id_blood_types_id_fk` FOREIGN KEY (`blood_type_id`) REFERENCES `blood_types`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_citizenship_id_citizenships_id_fk` FOREIGN KEY (`citizenship_id`) REFERENCES `citizenships`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_region_id_regions_id_fk` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `residents_village_name_idx` ON `residents` (`village_id`,`name`);--> statement-breakpoint
CREATE INDEX `residents_village_family_card_idx` ON `residents` (`village_id`,`family_card_number`);--> statement-breakpoint
CREATE INDEX `residents_village_life_status_idx` ON `residents` (`village_id`,`life_status`);--> statement-breakpoint
CREATE INDEX `residents_region_idx` ON `residents` (`region_id`);