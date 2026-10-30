"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SuplemenOption } from "@/features/penduduk/domain/suplemen";

import { tambahTerdataIsianAction } from "../../actions-suplemen-berkas";

interface BarisIsian {
  nama: string;
  nilai: string;
}

interface SuplemenTerdataIsianFormProps {
  suplemenId: number;
  /** 2 = keluarga (KK), selain itu penduduk. */
  sasaran: number;
  penduduk: SuplemenOption[];
  keluarga: SuplemenOption[];
  canManage: boolean;
  /** Nama kolom isian yang sudah pernah dipakai, ditampilkan sebagai saran. */
  suggestedColumns?: readonly string[];
}

/**
 * Formulir tambah terdata dengan isian dinamis.
 *
 * Suplemen boleh punya kolom sendiri (mis. jenis disabilitas, jenis bantuan),
 * jadi pengguna menambah baris nama–nilai sebanyak yang diperlukan. Kolom yang
 * sama nantinya otomatis muncul sebagai kolom di tabel dan ekspor.
 */
export function SuplemenTerdataIsianForm({
  suplemenId,
  sasaran,
  penduduk,
  keluarga,
  canManage,
  suggestedColumns,
}: SuplemenTerdataIsianFormProps) {
  const router = useRouter();
  const modeKeluarga = sasaran === 2;
  const [pending, setPending] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [baris, setBaris] = useState<BarisIsian[]>([{ nama: "", nilai: "" }]);

  if (!canManage) return null;

  const opsi = modeKeluarga ? keluarga : penduduk;

  async function kirim(formData: FormData) {
    setPending(true);
    setGalat(null);

    const hasil = await tambahTerdataIsianAction(formData);

    setPending(false);
    if (!hasil.ok) {
      setGalat(hasil.message);
      return;
    }

    toast.success(hasil.message);
    setBaris([{ nama: "", nilai: "" }]);
    router.refresh();
  }

  return (
    <form action={kirim} className="space-y-3 rounded-lg border p-4">
      <input type="hidden" name="suplemenId" value={suplemenId} />
      <input type="hidden" name="mode" value={modeKeluarga ? "keluarga" : "penduduk"} />

      <div className="space-y-2">
        <Label htmlFor="sasaran-terdata">{modeKeluarga ? "Keluarga (KK)" : "Penduduk"}</Label>
        <select
          id="sasaran-terdata"
          name="sasaran"
          required
          disabled={pending}
          className="h-8 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="">Pilih sasaran…</option>
          {opsi.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        {opsi.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada {modeKeluarga ? "Kartu Keluarga" : "penduduk"} yang bisa dipilih.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Isian tambahan (opsional)</p>
          {suggestedColumns && suggestedColumns.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Kolom yang pernah dipakai: {suggestedColumns.join(", ")}
            </p>
          ) : null}
        </div>
        {baris.map((item, indeks) => (
          <div key={indeks} className="flex flex-wrap items-center gap-2">
            <Input
              name="isianNama"
              value={item.nama}
              maxLength={60}
              placeholder="Nama kolom (mis. Jenis Disabilitas)"
              className="max-w-64"
              disabled={pending}
              onChange={(event) =>
                setBaris((lama) =>
                  lama.map((row, i) => (i === indeks ? { ...row, nama: event.target.value } : row)),
                )
              }
            />
            <Input
              name="isianNilai"
              value={item.nilai}
              maxLength={200}
              placeholder="Nilai"
              className="max-w-64"
              disabled={pending}
              onChange={(event) =>
                setBaris((lama) =>
                  lama.map((row, i) =>
                    i === indeks ? { ...row, nilai: event.target.value } : row,
                  ),
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Hapus isian baris ${indeks + 1}`}
              disabled={pending || baris.length === 1}
              onClick={() => setBaris((lama) => lama.filter((_, i) => i !== indeks))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || baris.length >= 20}
          onClick={() => setBaris((lama) => [...lama, { nama: "", nilai: "" }])}
        >
          <Plus className="size-4" />
          Tambah kolom
        </Button>
      </div>

      {galat ? (
        <Alert variant="destructive">
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Tambah terdata
      </Button>
    </form>
  );
}
