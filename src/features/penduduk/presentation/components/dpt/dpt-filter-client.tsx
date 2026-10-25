"use client";

import { Filter, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
import type { IdOption, LabelOption } from "@/features/penduduk/domain/penduduk-references";

interface DptFilterClientProps {
  activeElection: { judul: string; tanggal: string } | null;
  defaultParams: {
    search: string;
    dusun: string;
    rw: string;
    rt: string;
    gender: string;
    agamaId?: number;
    pendidikanId?: number;
    pekerjaanId?: number;
    statusKawinId?: number;
    umurMin?: number;
    umurMax?: number;
  };
  agamaOptions: IdOption[];
  pendidikanOptions: IdOption[];
  pekerjaanOptions: IdOption[];
  statusKawinOptions: IdOption[];
  wilayahOptions: LabelOption[];
}

export function DptFilterClient({
  activeElection,
  defaultParams,
  agamaOptions,
  pendidikanOptions,
  pekerjaanOptions,
  statusKawinOptions,
  wilayahOptions,
}: DptFilterClientProps) {
  const router = useRouter();

  const hasFilters =
    defaultParams.search ||
    defaultParams.dusun ||
    defaultParams.rw ||
    defaultParams.rt ||
    defaultParams.gender ||
    defaultParams.agamaId ||
    defaultParams.pendidikanId ||
    defaultParams.pekerjaanId ||
    defaultParams.statusKawinId ||
    defaultParams.umurMin ||
    defaultParams.umurMax;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (value !== "") params.set(key, value.toString());
    }
    router.push(`/penduduk/dpt?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/penduduk/dpt");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filter DPT</h3>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-3" />
            Hapus filter
          </Button>
        )}
      </div>

      {!activeElection && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Tidak ada pemilihan aktif. DPT tidak dapat ditampilkan.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="search">Cari nama/NIK</Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              name="search"
              placeholder="Nama atau NIK..."
              defaultValue={defaultParams.search}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dusun">Dusun</Label>
          <Select name="dusun" defaultValue={defaultParams.dusun}>
            <SelectTrigger>
              <SelectValue placeholder="Semua dusun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua dusun</SelectItem>
              {wilayahOptions.map((w) => (
                <SelectItem key={w.id} value={w.label.split(" · ")[0]?.replace("Dusun ", "") ?? ""}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rw">RW</Label>
          <Input id="rw" name="rw" placeholder="RW" defaultValue={defaultParams.rw} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rt">RT</Label>
          <Input id="rt" name="rt" placeholder="RT" defaultValue={defaultParams.rt} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <Select name="gender" defaultValue={defaultParams.gender}>
            <SelectTrigger>
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua</SelectItem>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agamaId">Agama</Label>
          <Select name="agamaId" defaultValue={defaultParams.agamaId?.toString() ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Semua agama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua agama</SelectItem>
              {agamaOptions.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pendidikanId">Pendidikan</Label>
          <Select name="pendidikanId" defaultValue={defaultParams.pendidikanId?.toString() ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Semua pendidikan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua pendidikan</SelectItem>
              {pendidikanOptions.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pekerjaanId">Pekerjaan</Label>
          <Select name="pekerjaanId" defaultValue={defaultParams.pekerjaanId?.toString() ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Semua pekerjaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua pekerjaan</SelectItem>
              {pekerjaanOptions.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statusKawinId">Status Kawin</Label>
          <Select name="statusKawinId" defaultValue={defaultParams.statusKawinId?.toString() ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua status</SelectItem>
              {statusKawinOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="umurMin">Umur Minimal</Label>
          <Input
            id="umurMin"
            name="umurMin"
            type="number"
            min="0"
            max="120"
            placeholder="Min"
            defaultValue={defaultParams.umurMin ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="umurMax">Umur Maksimal</Label>
          <Input
            id="umurMax"
            name="umurMax"
            type="number"
            min="0"
            max="120"
            placeholder="Max"
            defaultValue={defaultParams.umurMax ?? ""}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Filter className="mr-2 size-4" />
          Terapkan Filter
        </Button>
      </div>
    </form>
  );
}
