/**
 * Utilitas pengembangan: pastikan database target sudah ada sebelum migrasi.
 *
 * `drizzle-kit migrate` tidak membuat database, hanya tabel. Skrip ini membaca
 * DATABASE_URL dari `.env`, lalu menjalankan `CREATE DATABASE IF NOT EXISTS`.
 *
 * Jalankan: npm run db:create
 */
import mysql from "mysql2/promise";

try {
  process.loadEnvFile();
} catch {
  // .env opsional bila variabel sudah tersedia di lingkungan proses.
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum diisi. Buat berkas .env dari .env.example.");
}

const url = new URL(databaseUrl);
const databaseName = url.pathname.replace(/^\//, "");

if (!databaseName) {
  throw new Error("Nama database tidak ditemukan pada DATABASE_URL.");
}

// Hubungkan tanpa menyebut nama database, lalu buat bila belum ada.
url.pathname = "/";

const connection = await mysql.createConnection({
  uri: url.toString(),
  timezone: "Z",
});

await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` ` +
    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
);

await connection.end();

console.log(`Database "${databaseName}" siap dipakai.`);
