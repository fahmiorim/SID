CREATE TABLE `cdesa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `nomor` varchar(50) NOT NULL,
  `nomor_persil` varchar(50) DEFAULT NULL,
  `nomor_sertifikat` varchar(100) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `nama_pemegang` varchar(100) DEFAULT NULL,
  `luas` decimal(10,2) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cdesa_village_nomor_uq` (`village_id`, `nomor`),
  INDEX `cdesa_village_sort_idx` (`village_id`, `sort_order`)
);