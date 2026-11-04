ALTER TABLE `letter_types`
ADD COLUMN `template_variant` VARCHAR(50) NULL COMMENT 'Nama varian template (mis. default, landscape, compact)',
ADD COLUMN `layout_config` TEXT NULL COMMENT 'JSON konfigurasi layout: margin, orientasi, ukuran, header/footer, posisi QR, TTD, stempel',
ADD COLUMN `template_body_alt` TEXT NULL COMMENT 'Badan surat alternatif untuk varian kedua (opsional)';