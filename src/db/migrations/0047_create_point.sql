CREATE TABLE `point` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nama` varchar(50) NOT NULL,
  `simbol` varchar(50) DEFAULT NULL,
  `tipe` int DEFAULT 0,
  `parrent` int DEFAULT 1,
  `path` text DEFAULT NULL,
  `enabled` int NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `point_village_sort_idx` (`village_id`, `sort_order`),
  INDEX `point_village_parrent_idx` (`village_id`, `parrent`),
  CONSTRAINT `point_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE
);