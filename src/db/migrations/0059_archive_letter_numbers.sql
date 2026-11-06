CREATE TABLE `letter_number_archive` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `letter_id` int,
  `number` varchar(50) NOT NULL,
  `sequence` int NOT NULL,
  `year` int NOT NULL,
  `type_id` int NOT NULL,
  `classification_id` int,
  `type_name` varchar(150) NOT NULL,
  `issued_at` timestamp NOT NULL,
  CONSTRAINT `letter_number_archive_id` PRIMARY KEY(`id`),
  CONSTRAINT `letter_number_archive_village_number_uq` UNIQUE(`village_id`,`number`),
  CONSTRAINT `letter_number_archive_letter_uq` UNIQUE(`letter_id`),
  CONSTRAINT `letter_number_archive_village_id_villages_id_fk`
    FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `letter_number_archive_letter_id_letters_id_fk`
    FOREIGN KEY (`letter_id`) REFERENCES `letters`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `letter_number_archive_type_year_idx`
  ON `letter_number_archive` (`village_id`,`type_id`,`year`);--> statement-breakpoint
CREATE INDEX `letter_number_archive_class_year_idx`
  ON `letter_number_archive` (`village_id`,`classification_id`,`year`);--> statement-breakpoint
CREATE INDEX `letter_number_archive_year_idx`
  ON `letter_number_archive` (`village_id`,`year`);--> statement-breakpoint
INSERT IGNORE INTO `letter_number_archive`
  (`village_id`, `letter_id`, `number`, `sequence`, `year`, `type_id`, `classification_id`, `type_name`, `issued_at`)
SELECT l.`village_id`, l.`id`, l.`number`, l.`sequence`, l.`year`, l.`type_id`,
       lt.`classification_id`, l.`type_name`, COALESCE(l.`issued_at`, l.`created_at`, CURRENT_TIMESTAMP)
FROM `letters` l
LEFT JOIN `letter_types` lt ON lt.`id` = l.`type_id`
WHERE l.`number` IS NOT NULL AND l.`number` <> ''
ORDER BY l.`village_id`, l.`issued_at`, l.`id`;