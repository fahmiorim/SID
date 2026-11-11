import { db } from "../src/db";

interface ColumnInfo {
  Field: string;
  Type: string;
  Key: string;
  Default: string | null;
  Null: string;
}

async function main() {
  const res1 = await db.execute("SHOW FULL COLUMNS FROM slider");
  const rows1 = (res1 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "SLIDER:",
    JSON.stringify(
      rows1.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res2 = await db.execute("SHOW FULL COLUMNS FROM galeri_album");
  const rows2 = (res2 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "GALERI_ALBUM:",
    JSON.stringify(
      rows2.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res3 = await db.execute("SHOW FULL COLUMNS FROM pembangunan_proyek");
  const rows3 = (res3 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "PEMBANGUNAN_PROYEK:",
    JSON.stringify(
      rows3.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res4 = await db.execute("SHOW FULL COLUMNS FROM bantuan_program");
  const rows4 = (res4 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "BANTUAN_PROGRAM:",
    JSON.stringify(
      rows4.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res5 = await db.execute("SHOW FULL COLUMNS FROM kelompok_master");
  const rows5 = (res5 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "KELOMPOK_MASTER:",
    JSON.stringify(
      rows5.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res6 = await db.execute("SHOW FULL COLUMNS FROM widget");
  const rows6 = (res6 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "WIDGET:",
    JSON.stringify(
      rows6.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  const res7 = await db.execute("SHOW FULL COLUMNS FROM halaman_statis");
  const rows7 = (res7 as unknown as ColumnInfo[][])[0]!;
  console.log(
    "HALAMAN_STATIS:",
    JSON.stringify(
      rows7.map((r) => ({
        field: r.Field,
        type: r.Type,
        key: r.Key,
        default: r.Default,
        null: r.Null,
      })),
      null,
      2,
    ),
  );

  process.exit(0);
}

main();
