import { NextResponse } from "next/server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { listPendudukOptions } from "@/features/penduduk/infrastructure/penduduk-repository";
import { verifySession } from "@/lib/dal";

export async function GET(request: Request) {
  const user = await verifySession();
  if (!user) return new Response("Sesi Anda telah berakhir.", { status: 401 });

  try {
    const url = new URL(request.url);
    const nik = url.searchParams.get("nik")?.trim();
    if (!nik || nik.length !== 16) {
      return NextResponse.json({ ok: false, message: "NIK harus 16 digit." }, { status: 400 });
    }

    const villageId = await resolveVillageId(user);
    const all = await listPendudukOptions(villageId);
    const matched = all.find((p) => p.nationalId === nik);

    if (!matched) {
      return NextResponse.json({ ok: false, message: "NIK tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, resident: matched });
  } catch (error) {
    console.error("Gagal lookup NIK:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
