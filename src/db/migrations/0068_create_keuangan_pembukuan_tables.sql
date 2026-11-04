-- Migration: 0068_create_keuangan_pembukuan_tables.sql

CREATE TABLE `keuangan_jurnal` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `village_id` int NOT NULL,
  `tahun` int NOT NULL,
  `tanggal` date NOT NULL,
  `kode_rekening` varchar(50) NOT NULL,
  `uraian` text NOT NULL,
  `debet` decimal(19, 2) NOT NULL DEFAULT 0.00,
  `kredit` decimal(19, 2) NOT NULL DEFAULT 0.00,
  `sumber` varchar(20) NOT NULL DEFAULT 'manual',
  `referensi` varchar(255),
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_keuangan_jurnal_village_tahun` (`village_id`, `tahun`),
  INDEX `idx_keuangan_jurnal_tanggal` (`tanggal`)
);
--> statement-breakpoint
CREATE TABLE `keuangan_saldo_bank` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `village_id` int NOT NULL,
  `tahun` int NOT NULL,
  `rekening_bank` varchar(50) NOT NULL,
  `nama_bank` varchar(100) NOT NULL,
  `saldo_awal` decimal(19, 2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_saldo_bank` (`village_id`, `tahun`, `rekening_bank`)
);
