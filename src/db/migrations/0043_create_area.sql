CREATE TABLE `area` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nama` varchar(50) NOT NULL,
  `path` text DEFAULT NULL,
  `ref_polygon` int DEFAULT NULL,
  `foto` varchar(100) DEFAULT NULL,
  `desk` text DEFAULT NULL,
  `enabled` int NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `area_village_sort_idx` (`village_id`, `sort_order`),
  INDEX `area_village_polygon_idx` (`village_id`, `ref_polygon`),
  CONSTRAINT `area_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `area_ref_polygon_polygon_id_fk` FOREIGN KEY (`ref_polygon`) REFERENCES `polygon` (`id`) ON DELETE SET NULL
);