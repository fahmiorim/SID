-- OS-MOD-004: Tabel produk lapak UMKM
-- Created: 2026-11-05

CREATE TABLE `lapak_produk` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `village_id` INT NOT NULL,
  `lapak_id` INT NOT NULL,
  `nama` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT,
  `harga` DECIMAL(12,2) NOT NULL,
  `stok` INT DEFAULT 0,
  `gambar` VARCHAR(500),
  `aktif` INT NOT NULL DEFAULT 1,
  `latitude` VARCHAR(20),
  `longitude` VARCHAR(20),
  CONSTRAINT `fk_lapak_produk_village` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lapak_produk_lapak` FOREIGN KEY (`lapak_id`) REFERENCES `lapak`(`id`) ON DELETE CASCADE
);
