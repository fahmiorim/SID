CREATE TABLE `persil` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nomor` varchar(50) NOT NULL,
  `nomor_cdesa` varchar(50) DEFAULT NULL,
  `luas` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `path` text DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `persil_village_nomor_uq` (`village_id`, `nomor`),
  INDEX `persil_village_sort_idx` (`village_id`, `sort_order`)
);