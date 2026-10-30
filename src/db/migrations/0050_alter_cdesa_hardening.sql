ALTER TABLE `cdesa`
  MODIFY COLUMN `nomor_sertifikat` varchar(50) DEFAULT NULL,
  MODIFY COLUMN `nama_pemegang` varchar(255) DEFAULT NULL,
  MODIFY COLUMN `luas` decimal(10,2) NOT NULL DEFAULT 0.00,
  ADD CONSTRAINT `cdesa_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE;