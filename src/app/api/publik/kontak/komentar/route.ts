import { NextResponse } from "next/server";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  daftarKomentarPublik,
  kirimKomentarPublik,
} from "@/features/kontak/application/kontak-use-cases";
import { bacaPengaturan } from "@/features/pengaturan/application/pengaturan-use-cases";

/** GET /api/publik/kontak/komentar — Daftar commentaires publics actifs */
export async function GET(request: Request) {
  let desa;
  try {
    desa = await getIdentitasFromRequest();
  } catch {
    return NextResponse.json({ error: "Desa tidak valid" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

  const result = await daftarKomentarPublik({
    villageId: desa.id,
    filter: { halaman: "kontak", page, pageSize: 10 },
  });

  return NextResponse.json(result);
}

/** POST /api/publik/kontak/komentar — Kirim commentaire publik baru */
export async function POST(request: Request) {
  let desa;
  try {
    desa = await getIdentitasFromRequest();
  } catch {
    return NextResponse.json({ error: "Desa tidak valid" }, { status: 400 });
  }

  const pengaturan = await bacaPengaturan(desa.id);
  if (!pengaturan.komentarAktif) {
    return NextResponse.json({ error: "Komentar dinonaktifkan oleh desa" }, { status: 403 });
  }

  let body: { nama: string; isi: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  if (!body.nama || typeof body.nama !== "string" || body.nama.trim().length < 2) {
    return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });
  }
  if (!body.isi || typeof body.isi !== "string" || body.isi.trim().length < 5) {
    return NextResponse.json({ error: "Isi commentaire minimal 5 karakter" }, { status: 400 });
  }
  if (body.isi.length > 2000) {
    return NextResponse.json({ error: "Isi commentaire maksimal 2000 karakter" }, { status: 400 });
  }

  const id = await kirimKomentarPublik({
    villageId: desa.id,
    namaPenulis: body.nama.trim(),
    isi: body.isi.trim(),
  });

  return NextResponse.json({ id }, { status: 201 });
}
