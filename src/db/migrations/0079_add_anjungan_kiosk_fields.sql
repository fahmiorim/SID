-- OS-MOD-001: Anjungan kiosk device fields
-- Created: 2026-11-05

ALTER TABLE `anjungan` ADD COLUMN `uuid` varchar(36);
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `ip_address` varchar(45);
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `mac_address` varchar(17);
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `ip_address_port_printer` varchar(100);
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `keyboard` int DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `orientasi_layar` int DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `permohonan_surat_tanpa_akun` int DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `anjungan` ADD COLUMN `status` varchar(20) DEFAULT 'aktif';
--> statement-breakpoint
ALTER TABLE `anjungan` ADD UNIQUE INDEX `anjungan_uuid_unique` (`uuid`);