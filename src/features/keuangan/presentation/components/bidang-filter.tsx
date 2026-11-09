"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BidangFilterProps {
  tahun: number;
  bidang: string;
  options: { kode: string; uraian: string }[];
}

/**
 * Filter bidang laporan keuangan.
 *
 * Harus komponen klien: `onValueChange` adalah fungsi dan tidak boleh dikirim
 * dari Server Component ke `Select`.
 */
export function BidangFilter({ tahun, bidang, options }: BidangFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={bidang}
      disabled={pending}
      onValueChange={(value) => {
        const params = new URLSearchParams({ tahun: String(tahun) });
        if (value) params.set("bidang", value);
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter Bidang" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Semua Bidang</SelectItem>
        {options.map((item) => (
          <SelectItem key={item.kode} value={item.kode}>
            {item.uraian}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
