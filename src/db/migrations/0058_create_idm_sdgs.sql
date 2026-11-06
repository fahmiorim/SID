CREATE TABLE `idm_sdgs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `tahun` int NOT NULL,
  `goal` int NOT NULL,
  `skor` int NOT NULL DEFAULT 0,
  `keterangan` text,
  CONSTRAINT `idm_sdgs_id` PRIMARY KEY(`id`),
  CONSTRAINT `idm_sdgs_village_tahun_goal_uq` UNIQUE(`village_id`,`tahun`,`goal`),
  CONSTRAINT `idm_sdgs_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE
);
