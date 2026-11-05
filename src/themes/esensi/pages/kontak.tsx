import { Mail, MapPin, Phone } from "lucide-react";

import type { KontakProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

/** Halaman kontak: alamat, telepon, email, dan jam pelayanan. */
export function EsensiKontak({ ctx }: KontakProps) {
  const desa = ctx.desa;

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Kontak"
        description={`Hubungi kantor ${desa.namaDesa ?? "desa"} untuk informasi dan layanan.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ThemeCard className="space-y-4 p-6 text-sm">
          <h2 className="text-base font-semibold">Alamat & Kontak</h2>
          <div className="flex gap-3">
            <MapPin className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.alamatKantor ?? "Alamat kantor desa belum diatur."}</span>
          </div>
          <div className="flex gap-3">
            <Phone className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.telepon ?? "Nomor telepon belum diatur."}</span>
          </div>
          <div className="flex gap-3">
            <Mail className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.emailDesa ?? "Email belum diatur."}</span>
          </div>
        </ThemeCard>

        <ThemeCard className="p-6 text-sm">
          <h2 className="text-base font-semibold">Jam Pelayanan</h2>
          <ul className="mt-4 space-y-2">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Senin – Kamis</span>
              <span>08.00 – 15.00 WIB</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Jumat</span>
              <span>08.00 – 11.00 WIB</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Sabtu – Minggu</span>
              <span>Tutup</span>
            </li>
          </ul>
        </ThemeCard>
      </div>

      {/* OS-WEB-015: Komentar & Statistik Pengunjung */}
      <div className="grid gap-6 md:grid-cols-2">
        <ThemeCard className="p-6">
          <h2 className="text-base font-semibold">留言區</h2>
          <p className="mt-1 text-sm text-muted-foreground">留下您的建議或問題，我們會儘快回覆。</p>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="您的姓名"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <textarea
              placeholder="請輸入您的留言..."
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              送出留言
            </button>
          </div>
        </ThemeCard>

        <ThemeCard className="p-6">
          <h2 className="text-base font-semibold">訪客統計（近30天）</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">總訪問次數</span>
              <span className="font-bold">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">日均訪問</span>
              <span className="font-bold">—</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">統計數據將自動累積，供管理參考。</p>
          </div>
        </ThemeCard>
      </div>
    </div>
  );
}
