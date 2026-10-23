"use client";

import { useActionState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
  MUTASI_JENIS,
  MUTASI_JENIS_LABELS,
  MUTASI_STATUS_LABELS,
  type InventarisOption,
  type MutasiRow,
} from "@/features/inventaris/domain/inventaris";
import {
  ajukanMutasiAction,
  setujuiMutasiAction,
  tolakMutasiAction,
} from "@/features/inventaris/presentation/actions";
import { idleActionState, type ActionState } from "@/lib/action-state";

interface MutasiManagerProps {
  rows: MutasiRow[];
  inventaris: InventarisOption[];
  canWrite: boolean;
  canManage: boolean;
  today: string;
}

export function MutasiManager({
  rows,
  inventaris,
  canWrite,
  canManage,
  today,
}: MutasiManagerProps) {
  return (
    <div className="space-y-6">
      {canWrite ? <AjukanMutasiForm inventaris={inventaris} today={today} /> : null}

      <Card>
        <div className="p-6">
          <h2 className="mb-1 font-medium">Riwayat Mutasi</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Pengajuan mutasi inventaris dan status persetujuannya.
          </p>

          {rows.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-sm text-muted-foreground">Belum ada pengajuan mutasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Barang</th>
                    <th className="p-2 text-left">Jenis</th>
                    <th className="p-2 text-left">Tanggal</th>
                    <th className="p-2 text-left">Alasan</th>
                    <th className="p-2 text-left">Status</th>
                    {canManage ? <th className="p-2 text-center">Aksi</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b align-top">
                      <td className="p-2">
                        {row.namaBarang ?? "Barang dihapus"}
                        {row.nomorInventaris ? ` (${row.nomorInventaris})` : ""}
                      </td>
                      <td className="p-2">{MUTASI_JENIS_LABELS[row.jenis]}</td>
                      <td className="p-2 whitespace-nowrap">{row.tanggalMutasi}</td>
                      <td className="p-2">{row.alasan ?? "-"}</td>
                      <td className="p-2">
                        <Badge variant={row.status === "disetujui" ? "secondary" : "outline"}>
                          {MUTASI_STATUS_LABELS[row.status]}
                        </Badge>
                      </td>
                      {canManage ? (
                        <td className="p-2 text-center">
                          {row.status === "diajukan" ? (
                            <MutasiRowActions id={row.id} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AjukanMutasiForm({
  inventaris,
  today,
}: {
  inventaris: InventarisOption[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState(ajukanMutasiAction, idleActionState);

  return (
    <Card className="p-6">
      <h2 className="mb-1 font-medium">Ajukan Mutasi Baru</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Mutasi dicatat sebagai pengajuan. Persetujuan mengubah status pengajuan, bukan data barang.
      </p>

      <ActionMessage state={state} />

      {inventaris.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada data inventaris. Tambahkan barang terlebih dahulu di halaman Inventaris.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="inventarisId">Barang</Label>
              <Select
                name="inventarisId"
                defaultValue={inventaris[0] ? String(inventaris[0].id) : ""}
                required
              >
                <SelectTrigger id="inventarisId" className="w-full">
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {inventaris.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.namaBarang}
                      {item.nomorInventaris ? ` (${item.nomorInventaris})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jenis">Jenis Mutasi</Label>
              <Select name="jenis" defaultValue="pindah" required>
                <SelectTrigger id="jenis" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUTASI_JENIS.map((jenis) => (
                    <SelectItem key={jenis} value={jenis}>
                      {MUTASI_JENIS_LABELS[jenis]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="alasan">Alasan Mutasi</Label>
            <Input
              id="alasan"
              name="alasan"
              required
              maxLength={500}
              placeholder="Alasan wajib diisi"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kondisiBaru">Kondisi Baru</Label>
              <Select name="kondisiBaru" defaultValue="baik">
                <SelectTrigger id="kondisiBaru" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVENTARIS_KONDISI.map((kondisi) => (
                    <SelectItem key={kondisi} value={kondisi}>
                      {INVENTARIS_KONDISI_LABELS[kondisi]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lokasiBaru">Lokasi Baru</Label>
              <Input
                id="lokasiBaru"
                name="lokasiBaru"
                maxLength={150}
                placeholder="Contoh: Gudang utama"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Input id="keterangan" name="keterangan" maxLength={500} placeholder="Opsional" />
          </div>

          <input type="hidden" name="tanggalMutasi" value={today} />
          <input type="hidden" name="jumlahMutasi" value="1" />

          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "Mengirim..." : "Ajukan Mutasi"}
          </Button>
        </form>
      )}
    </Card>
  );
}

function MutasiRowActions({ id }: { id: number }) {
  const [approveState, approveAction, approving] = useActionState(
    setujuiMutasiAction,
    idleActionState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(tolakMutasiAction, idleActionState);

  return (
    <div className="space-y-2">
      <form action={approveAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm" variant="secondary" disabled={approving}>
          {approving ? "Memproses..." : "Setujui"}
        </Button>
      </form>

      <details>
        <summary className="cursor-pointer text-xs text-muted-foreground">Tolak</summary>
        <form action={rejectAction} className="mt-2 space-y-2 text-left">
          <input type="hidden" name="id" value={id} />
          <Input
            name="catatanPenolakan"
            required
            maxLength={500}
            placeholder="Alasan penolakan"
            aria-label="Alasan penolakan"
          />
          <Button type="submit" size="sm" variant="destructive" disabled={rejecting}>
            {rejecting ? "Memproses..." : "Tolak Mutasi"}
          </Button>
        </form>
      </details>

      <ActionMessage state={approveState} compact />
      <ActionMessage state={rejectState} compact />
    </div>
  );
}

function ActionMessage({ state, compact = false }: { state: ActionState; compact?: boolean }) {
  if (state.status === "idle") return null;

  const success = state.status === "success";
  return (
    <div
      className={`rounded-md border text-sm ${compact ? "px-2 py-1 text-xs" : "mb-4 px-4 py-3"} ${
        success
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {state.message}
      {state.status === "error" && state.fieldErrors ? (
        <ul className="mt-2 list-inside list-disc text-xs">
          {Object.entries(state.fieldErrors).flatMap(([field, errors]) =>
            errors.map((error) => (
              <li key={`${field}-${error}`}>
                {field}: {error}
              </li>
            )),
          )}
        </ul>
      ) : null}
    </div>
  );
}
