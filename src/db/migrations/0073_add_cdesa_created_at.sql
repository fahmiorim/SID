SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cdesa_mutasi'
    AND COLUMN_NAME = 'created_at'
);
--> statement-breakpoint
SET @ddl := IF(
  @has_created_at = 0,
  'ALTER TABLE `cdesa_mutasi` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
  'DO 0'
);
--> statement-breakpoint
PREPARE stmt FROM @ddl;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
--> statement-breakpoint
SET @has_created_at_rincian := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cdesa_rincian'
    AND COLUMN_NAME = 'created_at'
);
--> statement-breakpoint
SET @ddl := IF(
  @has_created_at_rincian = 0,
  'ALTER TABLE `cdesa_rincian` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
  'DO 0'
);
--> statement-breakpoint
PREPARE stmt FROM @ddl;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
