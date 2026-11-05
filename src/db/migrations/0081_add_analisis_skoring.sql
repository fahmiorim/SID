-- Batch 7: parameter/bobot, periode & sasaran survei, indikator soal
-- Created: 2026-11-05

ALTER TABLE `analisis_indikator` ADD COLUMN `bobot` int NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `survey` ADD COLUMN `sasaran` varchar(200);
--> statement-breakpoint
ALTER TABLE `survey` ADD COLUMN `mulai` date;
--> statement-breakpoint
ALTER TABLE `survey` ADD COLUMN `selesai` date;
--> statement-breakpoint
ALTER TABLE `survey_soal` ADD COLUMN `bobot` int NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `survey_soal` ADD COLUMN `skor_pilihan` text;
--> statement-breakpoint
ALTER TABLE `survey_soal` ADD COLUMN `indikator_id` int;
--> statement-breakpoint
ALTER TABLE `survey_soal` ADD CONSTRAINT `survey_soal_indikator_id_analisis_indikator_id_fk` FOREIGN KEY (`indikator_id`) REFERENCES `analisis_indikator`(`id`) ON DELETE set null ON UPDATE no action;
