ALTER TABLE `persil`
  MODIFY COLUMN `luas` decimal(10,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'milik',
  ADD CONSTRAINT `persil_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE;