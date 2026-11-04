import { permanentRedirect } from "next/navigation";

/**
 * Rute lama ringkasan IDM.
 *
 * Halaman kanonis publik ada di `/desa/idm-sdgs` (IDM + SDGs). Rute ini
 * dipertahankan sebagai pengalihan permanen agar tautan lama tidak berakhir
 * 404 dan tidak ada dua halaman publik yang menampilkan data yang sama.
 */
export default function IdmLegacyPage() {
  permanentRedirect("/desa/idm-sdgs");
}
