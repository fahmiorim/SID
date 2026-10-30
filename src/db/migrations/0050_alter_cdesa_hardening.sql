UPDATE `cdesa` SET `luas` = 0 WHERE `luas` IS NULL;
--> statement-breakpoint
ALTER TABLE `cdesa`
  MODIFY COLUMN `nomor_sertifikat` varchar(50) DEFAULT NULL,
  MODIFY COLUMN `nama_pemegang` varchar(255) DEFAULT NULL,
  MODIFY COLUMN `luas` decimal(10,2) NOT NULL DEFAULT 0.00;
--> statement-breakpoint
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cdesa'
    AND CONSTRAINT_NAME = 'cdesa_village_id_villages_id_fk'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
--> statement-breakpoint
SET @ddl := IF(
  @has_fk = 0,
  'ALTER TABLE `cdesa` ADD CONSTRAINT `cdesa_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE',
  'DO 0'
);
--> statement-breakpoint
PREPARE stmt FROM @ddl;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
