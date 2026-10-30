CREATE TABLE `cdesa_mutasi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `village_id` int NOT NULL,
  `cdesa_id` int NOT NULL,
  `nomor` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `tipe` varchar(50) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `cdesa_mutasi_village_idx` (`village_id`)
);