import { redirect } from "next/navigation";

import { getDaftarBukuData } from "@/features/bumindes/application/use-cases";

/**
 * `/bumindes` hanya pintu masuk: pastikan katalog buku desa sudah disiapkan
 * lewat use case (sekaligus menegakkan izin baca), lalu arahkan ke buku
 * administrasi umum.
 */
export default async function BumindesRedirect() {
  await getDaftarBukuData();
  redirect("/bumindes/buku-administrasi");
}
