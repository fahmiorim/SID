CREATE TABLE `sinergi_program` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `nama` varchar(200) NOT NULL,
  `mitra` varchar(200) DEFAULT NULL,
  `tahun` int DEFAULT NULL,
  `tanggal_mulai` varchar(20) DEFAULT NULL,
  `tanggal_selesai` varchar(20) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  CONSTRAINT `sinergi_program_id` PRIMARY KEY(`id`),
  CONSTRAINT `sinergi_program_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE
);
