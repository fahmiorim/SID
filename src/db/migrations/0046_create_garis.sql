CREATE TABLE `garis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nama` varchar(50) NOT NULL,
  `path` text DEFAULT NULL,
  `ref_line` int DEFAULT NULL,
  `foto` varchar(100) DEFAULT NULL,
  `desk` text DEFAULT NULL,
  `enabled` int NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `garis_village_sort_idx` (`village_id`, `sort_order`),
  INDEX `garis_village_ref_line_idx` (`village_id`, `ref_line`),
  CONSTRAINT `garis_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE
);