-- Kolom `lampiran` sudah ada di schema Drizzle (`letter-agenda.ts`) dan dipakai
-- aksi disposisi/ekspedisi, tetapi tidak pernah dimigrasikan ke database.
-- Tanpa kolom ini setiap insert disposisi/ekspedisi gagal dengan
-- "Unknown column 'lampiran' in 'field list'" dan UI hanya menampilkan galat.
ALTER TABLE `incoming_letter_dispositions` ADD COLUMN `lampiran` text;
--> statement-breakpoint
ALTER TABLE `outgoing_letter_shipments` ADD COLUMN `lampiran` text;
