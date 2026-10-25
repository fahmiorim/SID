"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUTATION_TYPE_LABELS } from "@/features/penduduk/domain/riwayat-penduduk";

export function RiwayatFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = searchParams.get("type") ?? "all";
  const q = searchParams.get("q") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function apply(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const t = formData.get("type") as string;
    const query = formData.get("q") as string;
    const f = formData.get("from") as string;
    const tt = formData.get("to") as string;

    if (t && t !== "all") params.set("type", t);
    else params.delete("type");
    if (query) params.set("q", query);
    else params.delete("q");
    if (f) params.set("from", f);
    else params.delete("from");
    if (tt) params.set("to", tt);
    else params.delete("to");
    params.delete("page");

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function reset() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <form action={apply} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="type">Jenis</Label>
        <Select name="type" defaultValue={type}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(MUTATION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="q">Cari</Label>
        <Input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Nama/NIK/No. surat"
          className="w-[220px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="from">Dari</Label>
        <Input id="from" name="from" type="date" defaultValue={from} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="to">Sampai</Label>
        <Input id="to" name="to" type="date" defaultValue={to} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          Terapkan
        </Button>
        <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
          Reset
        </Button>
      </div>
    </form>
  );
}
