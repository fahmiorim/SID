SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cdesa_mutasi'
    AND CONSTRAINT_NAME = 'cdesa_mutasi_village_id_villages_id_fk'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
--> statement-breakpoint
SET @ddl := IF(
  @has_fk = 0,
  'ALTER TABLE `cdesa_mutasi` ADD CONSTRAINT `cdesa_mutasi_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE',
  'DO 0'
);
--> statement-breakpoint
PREPARE stmt FROM @ddl;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
