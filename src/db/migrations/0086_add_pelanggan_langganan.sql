-- OS-MOD-005: Add fields to pelanggan table for subscription management
-- Created: 2026-11-05

ALTER TABLE `pelanggan` ADD COLUMN `status_langganan` varchar(20) DEFAULT 'menunggu';
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `tanggal_mulai` date;
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `tanggal_selesai` date;
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `no_kerjasama` varchar(100);
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `keterangan_langganan` text;
