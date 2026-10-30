ALTER TABLE `kontak` ADD `resident_id` int NULL,
ADD CONSTRAINT `kontak_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;