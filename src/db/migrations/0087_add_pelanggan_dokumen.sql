-- OS-MOD-005: Dokumen kerja sama pelanggan
-- Created: 2026-11-06

ALTER TABLE `pelanggan` ADD COLUMN `dokumen_kerjasama` varchar(500);
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `dokumen_nama` varchar(255);
--> statement-breakpoint
ALTER TABLE `pelanggan` ADD COLUMN `dokumen_mime` varchar(100);
