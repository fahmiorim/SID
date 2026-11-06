-- Migration: 0072_create_unified_shipments_and_audit.sql

CREATE TABLE `unified_shipments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `source_module` varchar(50) NOT NULL,
  `source_id` int NOT NULL,
  `sent_date` varchar(10) NOT NULL,
  `recipient` varchar(150),
  `delivery_method` varchar(50),
  `tracking_no` varchar(50),
  `note` varchar(255),
  `lampiran` text,
  `created_by` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `unified_shipments_id` PRIMARY KEY(`id`),
  CONSTRAINT `unified_shipments_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `unified_shipments_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `unified_shipments_village_idx` ON `unified_shipments` (`village_id`);
--> statement-breakpoint
CREATE INDEX `unified_shipments_source_idx` ON `unified_shipments` (`source_module`, `source_id`);
--> statement-breakpoint
CREATE TABLE `surat_audit_trail` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `actor_id` varchar(255),
  `action` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `surat_audit_trail_id` PRIMARY KEY(`id`),
  CONSTRAINT `surat_audit_trail_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `surat_audit_trail_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `surat_audit_trail_village_idx` ON `surat_audit_trail` (`village_id`);
--> statement-breakpoint
CREATE INDEX `surat_audit_trail_entity_idx` ON `surat_audit_trail` (`entity_type`, `entity_id`);
