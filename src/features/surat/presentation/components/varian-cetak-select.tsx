"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VARIAN_CETAK } from "@/features/surat/domain/varian-cetak";

/**
 * Pemilih varian cetak.
 *
 * Halaman cetak adalah Server Component, sehingga `onValueChange` tidak boleh
 * dibuat di sana (React menolak meneruskan fungsi ke props Client Component).
 * Pemilih ini mengganti URL dengan `?varian=` agar halaman dirender ulang.
 */
export function VarianCetakSelect({ nilai }: { nilai: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select value={nilai} onValueChange={(value) => router.replace(`${pathname}?varian=${value}`)}>
      <SelectTrigger id="template-variant" className="w-48">
        <SelectValue placeholder="Pilih varian" />
      </SelectTrigger>
      <SelectContent>
        {VARIAN_CETAK.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
