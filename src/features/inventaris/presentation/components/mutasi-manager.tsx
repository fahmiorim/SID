"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
  MUTASI_JENIS,
  MUTASI_JENIS_LABELS,
  MUTASI_STATUS_LABELS,
  MUTASI_STEP_LABELS,
  MUTASI_STEPS,
  nextMutasiStep,
  type InventarisOption,
  type MutasiJenis,
  type MutasiRow,
  type MutasiStep,
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
  approverSteps: MutasiStep[];
  today: string;
}

export function MutasiManager({
  rows,
  inventaris,
  canWrite,
  approverSteps,
  today,
}: MutasiManagerProps) {
  return (
    <div className="space-y-6">
      {canWrite ? <AjukanMutasiForm inventaris={inventaris} today={today} /> : null}

      <Card>
        <div className="p-6">
          <h2 className="mb-1 font-medium">Riwayat Mutasi</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Mutasi berjenjang: operator → sekretaris desa → kepala desa. Perubahan aset baru
            diterapkan setelah tahap kepala desa disetujui.
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
                    <th className="p-2 text-left">Tahap</th>
                    <th className="p-2 text-left">Pengaju</th>
                    <th className="p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const nextStep = nextMutasiStep(row);
                    const canApprove = nextStep !== null && approverSteps.includes(nextStep);

                    return (
                      <tr key={row.id} className="border-b align-top">
                        <td className="p-2">
                          <p className="font-medium">{row.namaBarang ?? "Barang dihapus"}</p>
                          {row.nomorInventaris ? (
                            <p className="text-xs text-muted-foreground">{row.nomorInventaris}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {row.jenis === "pindah" && row.lokasiBaru
                              ? `Tujuan: ${row.lokasiBaru}`
                              : row.kondisiBaru
                                ? `Kondisi: ${INVENTARIS_KONDISI_LABELS[row.kondisiBaru]}`
                                : ""}
                          </p>
                        </td>
                        <td className="p-2 whitespace-nowrap">{MUTASI_JENIS_LABELS[row.jenis]}</td>
                        <td className="p-2 whitespace-nowrap">{row.tanggalMutasi}</td>
                        <td className="max-w-xs p-2">
                          <p>{row.alasan ?? "-"}</p>
                          {row.catatanPenolakan ? (
                            <p className="mt-1 text-xs text-destructive">
                              Ditolak: {row.catatanPenolakan}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-2">
                          <MutasiStatusBadge row={row} />
                          {row.status === "diajukan" && nextStep ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Menunggu {MUTASI_STEP_LABELS[nextStep]}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-2">
                          <p>{row.diajukanOleh ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{row.tanggalMutasi}</p>
                        </td>
                        <td className="p-2 text-center">
                          {canApprove && nextStep ? (
                            <MutasiRowActions id={row.id} step={nextStep} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function MutasiStatusBadge({ row }: { row: MutasiRow }) {
  const nextStep = nextMutasiStep(row);

  return (
    <div className="space-y-2">
      <Badge
        variant={
          row.status === "disetujui"
            ? "secondary"
            : row.status === "ditolak"
              ? "destructive"
              : "outline"
        }
      >
        {row.status === "diajukan" && nextStep
          ? `Menunggu ${MUTASI_STEP_LABELS[nextStep]}`
          : MUTASI_STATUS_LABELS[row.status]}
      </Badge>

      <div className="flex flex-wrap gap-1">
        {MUTASI_STEPS.map((step) => {
          const nama =
            step === "operator"
              ? row.verifikasiOleh
              : step === "sekdes"
                ? row.verifikasiSekdes
                : row.verifikasiKades;
          return (
            <span
              key={step}
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                nama ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
              }`}
              title={nama ? `Disetujui ${nama}` : `Belum ${MUTASI_STEP_LABELS[step]}`}
            >
              {nama ? <Check className="size-3" /> : <Circle className="size-3" />}
              {MUTASI_STEP_LABELS[step]}
            </span>
          );
        })}
      </div>
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(ajukanMutasiAction, idleActionState);
  const [inventarisId, setInventarisId] = useState(inventaris[0] ? String(inventaris[0].id) : "");
  const [jenis, setJenis] = useState<MutasiJenis>("pindah");

  const selected = inventaris.find((item) => String(item.id) === inventarisId);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card className="p-6">
      <h2 className="mb-1 font-medium">Ajukan Mutasi Baru</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Mutasi disimpan sebagai pengajuan. Data barang tidak berubah sampai tahap kepala desa
        menyetujui.
      </p>

      <ActionMessage state={state} />

      {inventaris.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada data inventaris. Tambahkan barang terlebih dahulu di halaman Inventaris.
        </p>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="inventarisId">Barang</Label>
              <Select
                name="inventarisId"
                value={inventarisId}
                onValueChange={setInventarisId}
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
              {selected ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Jumlah aset: {selected.jumlah} {selected.satuan ?? ""}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="jenis">Jenis Mutasi</Label>
              <Select
                name="jenis"
                value={jenis}
                onValueChange={(value) => setJenis(value as MutasiJenis)}
                required
              >
                <SelectTrigger id="jenis" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUTASI_JENIS.map((jenisMutasi) => (
                    <SelectItem key={jenisMutasi} value={jenisMutasi}>
                      {MUTASI_JENIS_LABELS[jenisMutasi]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tanggalMutasi">Tanggal Mutasi</Label>
              <Input
                id="tanggalMutasi"
                name="tanggalMutasi"
                type="date"
                defaultValue={today}
                required
              />
            </div>

            {jenis === "hapus" ? (
              <div>
                <Label htmlFor="jumlahMutasi">Jumlah yang Dihapus</Label>
                <Input
                  id="jumlahMutasi"
                  name="jumlahMutasi"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selected?.jumlah}
                  defaultValue="1"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Bila jumlah habis, barang otomatis dinonaktifkan pada tahap akhir.
                </p>
              </div>
            ) : (
              <input type="hidden" name="jumlahMutasi" value={selected?.jumlah ?? "1"} />
            )}
          </div>

          {jenis === "pindah" ? (
            <div>
              <Label htmlFor="lokasiBaru">Lokasi Baru</Label>
              <Input
                id="lokasiBaru"
                name="lokasiBaru"
                required
                maxLength={150}
                placeholder="Contoh: Gudang utama"
              />
            </div>
          ) : null}

          {jenis === "rusak" ? (
            <div>
              <Label htmlFor="kondisiBaru">Kondisi Setelah Rusak</Label>
              <Select name="kondisiBaru" defaultValue="rusak_ringan" required>
                <SelectTrigger id="kondisiBaru" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rusak_ringan">
                    {INVENTARIS_KONDISI_LABELS.rusak_ringan}
                  </SelectItem>
                  <SelectItem value="rusak_berat">
                    {INVENTARIS_KONDISI_LABELS.rusak_berat}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {jenis === "perbaikan" ? (
            <div>
              <Label htmlFor="kondisiBaru">Kondisi Setelah Perbaikan</Label>
              <Select name="kondisiBaru" defaultValue="baik" required>
                <SelectTrigger id="kondisiBaru" className="w-full sm:w-64">
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
          ) : null}

          {jenis === "hapus" ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Penghapusan tidak dapat dibatalkan setelah tahap akhir disetujui.
            </p>
          ) : null}

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

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              rows={2}
              maxLength={500}
              placeholder="Opsional"
            />
          </div>

          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? "Mengirim..." : "Ajukan Mutasi"}
          </Button>
        </form>
      )}
    </Card>
  );
}

function MutasiRowActions({ id, step }: { id: number; step: MutasiStep }) {
  const router = useRouter();
  const [approveState, approveAction, approving] = useActionState(
    setujuiMutasiAction,
    idleActionState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(tolakMutasiAction, idleActionState);

  useEffect(() => {
    if (approveState.status === "success") {
      toast.success(approveState.message);
      router.refresh();
    }
  }, [approveState, router]);

  useEffect(() => {
    if (rejectState.status === "success") {
      toast.success(rejectState.message);
      router.refresh();
    }
  }, [rejectState, router]);

  return (
    <div className="space-y-2">
      <form action={approveAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm" variant="secondary" disabled={approving}>
          {approving ? <Loader2 className="animate-spin" /> : <Check className="size-3" />}
          {approving ? "Memproses..." : `Setujui ${MUTASI_STEP_LABELS[step]}`}
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
            {rejecting ? <Loader2 className="animate-spin" /> : <X className="size-3" />}
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
  if (state.status === "idle" || state.status === "success") return null;

  return (
    <div
      className={`rounded-md border text-sm ${compact ? "px-2 py-1 text-xs" : "mb-4 px-4 py-3"} border-red-200 bg-red-50 text-red-800`}
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
