-- OS-MOD-004: Tabel keranjang belanja publik
-- Created: 2026-11-05

CREATE TABLE `keranjang` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lapak_id` INT NOT NULL,
  `produk_id` INT NOT NULL,
  `jumlah` INT NOT NULL DEFAULT 1,
  `session_key` VARCHAR(100) NOT NULL,
  CONSTRAINT `fk_keranjang_lapak` FOREIGN KEY (`lapak_id`) REFERENCES `lapak`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_keranjang_produk` FOREIGN KEY (`produk_id`) REFERENCES `lapak_produk`(`id`) ON DELETE CASCADE
);
