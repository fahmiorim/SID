"use client";

import type { Metadata } from "next";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ajukanMutasi,
  getMutasiPageData,
  setujuiMutasiData,
  tolakMutasiData,
} from "@/features/inventaris/application/inventaris-use-cases";
import {
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
  MUTASI_JENIS,
  MUTASI_JENIS_LABELS,
} from "@/features/inventaris/domain/inventaris";

export const metadata: Metadata = { title: "Mutasi Inventaris" };

export default function MutasiPage() {
  const [mutasiList, setMutasiList] = useState<
    {
      id: number;
      namaBarang: string | null;
      nomorInventaris: string | null;
      jenis: string;
      tanggalMutasi: string;
      alasan: string | null;
      status: string;
    }[]
  >([]);
  const [formInventarisId, setFormInventarisId] = useState(0);
  const [formJenis, setFormJenis] = useState("pindah");
  const [formAlasan, setFormAlasan] = useState("");
  const [formKondisiBaru, setFormKondisiBaru] = useState("baik");
  const [formLokasiBaru, setFormLokasiBaru] = useState("");
  const [formJumlahMutasi, setFormJumlahMutasi] = useState(1);

  // Initial data load
  useEffect(() => {
    async function loadData() {
      const { rows } = await getMutasiPageData();
      setMutasiList(rows);
    }
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const inventarisId = formData.get("inventarisId");
    const jenis = formData.get("jenis");
    const tanggalMutasi = formData.get("tanggalMutasi") || new Date().toISOString().split("T")[0];
    const lokasiBaru = formData.get("lokasiBaru") || "";
    const kondisiBaru = formData.get("kondisiBaru") || "baik";
    const alasan = formData.get("alasan") || "";
    const keterangan = formData.get("keterangan") || "";
    const jumlahMutasi = formData.get("jumlahMutasi") ? Number(formData.get("jumlahMutasi")) : 1;

    await ajukanMutasi({
      inventarisId: inventarisId ? Number(inventarisId) : 0,
      jenis: jenis as "pindah" | "rusak" | "hapus" | "perbaikan",
      tanggalMutasi: tanggalMutasi as string,
      lokasiBaru: lokasiBaru as string,
      kondisiBaru: kondisiBaru as "baik" | "rusak_ringan" | "rusak_berat",
      alasan: alasan as string,
      keterangan: keterangan as string,
      jumlahMutasi,
    });

    // Reset form
    setFormInventarisId(0);
    setFormJenis("pindah");
    setFormAlasan("");
    setFormKondisiBaru("baik");
    setFormLokasiBaru("");
    setFormJumlahMutasi(1);

    // Refresh the mutasi list
    async function refreshData() {
      const { rows } = await getMutasiPageData();
      setMutasiList(rows);
    }
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mutasi Inventaris</h1>
        <p className="text-muted-foreground">
          Pengajuan mutasi (pindah/rusak/hapus/perbaikan) & persetujuan.
        </p>

        {/* Form Ajukan Mutasi */}
        <Card className="mt-4 p-6">
          <h2 className="mb-4 font-medium">Ajukan Mutasi Baru</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="inventarisId" defaultValue={formInventarisId.toString()} />
            <input
              type="hidden"
              name="tanggalMutasi"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <input type="hidden" name="jumlahMutasi" defaultValue={formJumlahMutasi.toString()} />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Barang</label>
                <Select defaultValue={formInventarisId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang" />
                  </SelectTrigger>
                  <SelectContent>{/* Barang akan diisi dari database */}</SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Jenis Mutasi</label>
                <Select defaultValue={formJenis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUTASI_JENIS.map((j) => (
                      <SelectItem key={j} value={j}>
                        {MUTASI_JENIS_LABELS[j as keyof typeof MUTASI_JENIS_LABELS]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Alasan Mutasi *</label>
              <Input
                required
                placeholder="Alasan wajib diisi"
                value={formAlasan}
                onChange={(e) => setFormAlasan(e.target.value as string)}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Kondisi Baru</label>
                <Select defaultValue={formKondisiBaru}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTARIS_KONDISI.map((k) => (
                      <SelectItem key={k} value={k}>
                        {INVENTARIS_KONDISI_LABELS[k as keyof typeof INVENTARIS_KONDISI_LABELS]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Lokasi Baru *</label>
                <Input
                  required
                  placeholder="Contoh: Gudang utama, Ruang 1"
                  value={formLokasiBaru}
                  onChange={(e) => setFormLokasiBaru(e.target.value as string)}
                />
              </div>
            </div>

            <div>
              <Button type="submit" variant="secondary">
                Ajukan Mutasi
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Daftar Mutasi Menunggu Persetujuan */}
      <Card>
        <div className="p-6">
          <h2 className="mb-4 font-medium">Pengajuan Mutasi Menunggu Persetujuan</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Lakukan verifikasi pada masing-masing tahap (sekdes, kades)
          </p>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Barang</th>
                  <th className="p-2 text-left">Jenis</th>
                  <th className="p-2 text-left">Tanggal</th>
                  <th className="p-2 text-left">Alasan</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mutasiList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      Belum ada pengajuan mutasi
                    </td>
                  </tr>
                ) : (
                  mutasiList.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">
                        {r.namaBarang} {r.nomorInventaris ? `(${r.nomorInventaris})` : ""}
                      </td>
                      <td className="p-2 capitalize">
                        {MUTASI_JENIS_LABELS[r.jenis as keyof typeof MUTASI_JENIS_LABELS]}
                      </td>
                      <td className="p-2">{r.tanggalMutasi}</td>
                      <td className="p-2">{r.alasan}</td>
                      <td className="p-2 capitalize">{r.status}</td>
                      <td className="p-2 text-center">
                        {r.status === "diajukan" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setujuiMutasiData(r.id)}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => tolakMutasiData(r.id, "Menunggu verifikasi")}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
