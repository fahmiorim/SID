"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type DokumenRow } from "@/features/konten/domain/dokumen";
import { type ActionState } from "@/lib/action-state";

import { deleteDokumenAction, saveDokumenAction } from "./actions";

interface DokumenFormProps {
  dokumenList: DokumenRow[];
}

function hasFieldErrors(
  state: ActionState<null>,
): state is ActionState<null> & { fieldErrors: Record<string, string[]> } {
  return "fieldErrors" in state && state.fieldErrors !== undefined;
}

export function DokumenForm({ dokumenList }: DokumenFormProps) {
  const [formState, formAction] = useActionState(saveDokumenAction, { status: "idle" });
  const [, deleteAction] = useActionState(deleteDokumenAction, { status: "idle" });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    nama: string;
    slug: string;
    kategori: "informasi_publik" | "produk_hukum" | "lainnya";
    jenis: string;
    nomor: string;
    tahun: string;
    berkas: string;
    tautan: string;
    keterangan: string;
    aktif: boolean;
  }>({
    nama: "",
    slug: "",
    kategori: "informasi_publik",
    jenis: "",
    nomor: "",
    tahun: "",
    berkas: "",
    tautan: "",
    keterangan: "",
    aktif: true,
  });

  useEffect(() => {
    if (editingId) {
      const doc = dokumenList.find((d) => d.id === editingId);
      if (doc) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          nama: doc.nama,
          slug: doc.slug,
          kategori: doc.kategori as "informasi_publik" | "produk_hukum" | "lainnya",
          jenis: doc.jenis ?? "",
          nomor: doc.nomor ?? "",
          tahun: doc.tahun?.toString() ?? "",
          berkas: doc.berkas ?? "",
          tautan: doc.tautan ?? "",
          keterangan: doc.keterangan ?? "",
          aktif: doc.aktif,
        });
      }
    } else {
      setFormData({
        nama: "",
        slug: "",
        kategori: "informasi_publik",
        jenis: "",
        nomor: "",
        tahun: "",
        berkas: "",
        tautan: "",
        keterangan: "",
        aktif: true,
      });
    }
  }, [editingId, dokumenList]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", editingId ? String(editingId) : "");
    formAction(fd);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus dokumen ini?")) return;
    const fd = new FormData();
    fd.set("id", String(id));
    deleteAction(fd);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFieldError = (state: ActionState<null>, field: string) => {
    if (hasFieldErrors(state) && state.fieldErrors[field]) {
      return state.fieldErrors[field][0];
    }
    return undefined;
  };

  const getAriaInvalid = (state: ActionState<null>, field: string) => {
    return !!getFieldError(state, field);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formState.status !== "idle" && formState.message && (
        <div
          className={`rounded p-3 text-sm ${
            formState.status === "success"
              ? "bg-green-50 text-green-700"
              : formState.status === "error"
                ? "bg-red-50 text-red-700"
                : ""
          }`}
        >
          {formState.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Nama Dokumen</label>
          <Input
            name="nama"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Masukkan nama dokumen"
            required
            aria-invalid={getAriaInvalid(formState, "nama")}
          />
          {getFieldError(formState, "nama") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "nama")}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Kategori</label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={(e) =>
              setFormData({
                ...formData,
                kategori: e.target.value as "informasi_publik" | "produk_hukum" | "lainnya",
              })
            }
            className="file:placeholder-text-muted-foreground block w-full rounded border border-input px-2 py-1.5 text-sm file:bg-transparent file:text-sm file:select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30 dark:text-white"
            aria-invalid={getAriaInvalid(formState, "kategori")}
          >
            <option value="informasi_publik">Informasi publik</option>
            <option value="produk_hukum">Produk hukum</option>
            <option value="lainnya">Lainnya</option>
          </select>
          {getFieldError(formState, "kategori") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "kategori")}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Slug (opsional)</label>
        <Input
          name="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="Otomatis dari nama jika kosong"
        />
        {getFieldError(formState, "slug") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "slug")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Jenis</label>
          <Input
            name="jenis"
            value={formData.jenis}
            onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
            placeholder="Contoh: Peraturan, Keputusan, SK"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Nomor</label>
          <Input
            name="nomor"
            value={formData.nomor}
            onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
            placeholder="Nomor dokumen"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Tahun</label>
        <Input
          name="tahun"
          type="number"
          value={formData.tahun}
          onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
          placeholder="2024"
          min="1900"
          max="2100"
        />
        {getFieldError(formState, "tahun") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "tahun")}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Path Berkas / Tautan</label>
        <Input
          name="berkas"
          value={formData.berkas}
          onChange={(e) => setFormData({ ...formData, berkas: e.target.value })}
          placeholder="Path berkas (mis. /storage/...) atau tautan Unduh"
          aria-invalid={getAriaInvalid(formState, "berkas")}
        />
        {getFieldError(formState, "berkas") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "berkas")}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Tautan (opsional)</label>
        <Input
          name="tautan"
          value={formData.tautan}
          onChange={(e) => setFormData({ ...formData, tautan: e.target.value })}
          placeholder="https://... atau /path"
        />
        {getFieldError(formState, "tautan") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError(formState, "tautan")}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Keterangan</label>
        <textarea
          name="keterangan"
          value={formData.keterangan}
          onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
          className="file:placeholder-text-muted-foreground block w-full rounded border border-input px-2 py-1.5 text-sm file:bg-transparent file:text-sm file:select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30 dark:text-white"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          name="aktif"
          type="checkbox"
          checked={formData.aktif}
          onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label className="text-sm">Aktif (tampil di situs publik)</label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="w-full sm:w-auto">
          {editingId ? "Perbarui Dokumen" : "Simpan Dokumen"}
        </Button>
        {editingId && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
        )}
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold">Daftar Dokumen</h3>
      {dokumenList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada dokumen.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pr-4 pb-2">Nama</th>
                <th className="pr-4 pb-2">Kategori</th>
                <th className="pr-4 pb-2">Tahun</th>
                <th className="pr-4 pb-2">Status</th>
                <th className="pr-4 pb-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dokumenList.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="py-2 pr-4">{doc.nama}</td>
                  <td className="py-2 pr-4">{doc.kategori}</td>
                  <td className="py-2 pr-4">{doc.tahun ?? "-"}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                        doc.aktif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {doc.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(doc.id)}>
                      Ubah
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}
