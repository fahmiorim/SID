CREATE TABLE `cdesa_rincian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cdesa_id` int NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `dllb` varchar(100) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);