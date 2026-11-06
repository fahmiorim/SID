CREATE TABLE `polygon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nama` varchar(50) NOT NULL,
  `simbol` varchar(50) DEFAULT NULL,
  `color` varchar(25) DEFAULT NULL,
  `tipe` int NOT NULL DEFAULT 0,
  `parrent` int DEFAULT 1,
  `enabled` int NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `polygon_village_sort_idx` (`village_id`, `sort_order`),
  INDEX `polygon_village_parrent_idx` (`village_id`, `parrent`),
  CONSTRAINT `polygon_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE
);