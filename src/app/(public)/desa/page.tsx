import { redirect } from "next/navigation";

/**
 * `/desa` adalah pintu masuk lama. Beranda publik kini berada di `/`, sehingga
 * rute ini dialihkan agar tidak ada dua halaman dengan isi berbeda.
 */
export default function DesaIndexPage() {
  redirect("/");
}
