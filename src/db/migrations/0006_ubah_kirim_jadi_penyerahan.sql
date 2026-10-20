-- Rename kolom penandaan kirim menjadi tanggal penyerahan: yang dicatat cukup
-- tanggal dokumen diserahkan, tanpa status pengiriman.
ALTER TABLE `keuangan_laporan` RENAME COLUMN `kirim_pada` TO `diserahkan_pada`;
