-- Rapikan nilai kosong lebih dahulu agar kolom bisa dijadikan NOT NULL pada
-- database yang sempat diisi sebelum hardening ini.
UPDATE `persil` SET `luas` = 0 WHERE `luas` IS NULL;
--> statement-breakpoint
UPDATE `persil` SET `status` = 'milik' WHERE `status` IS NULL;
--> statement-breakpoint
ALTER TABLE `persil`
  MODIFY COLUMN `luas` decimal(10,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'milik';
--> statement-breakpoint
-- Sebagian database sudah memiliki FK ini dari hardening sebelumnya; jangan
-- gagal hanya karena nama constraint-nya sudah terpakai.
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'persil'
    AND CONSTRAINT_NAME = 'persil_village_id_villages_id_fk'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
--> statement-breakpoint
SET @ddl := IF(
  @has_fk = 0,
  'ALTER TABLE `persil` ADD CONSTRAINT `persil_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE',
  'DO 0'
);
--> statement-breakpoint
PREPARE stmt FROM @ddl;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
