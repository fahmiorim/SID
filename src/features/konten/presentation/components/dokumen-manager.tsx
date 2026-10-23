"use client";

import { Badge } from "@/components/ui/badge";
import {
  DOKUMEN_KATEGORI,
  DOKUMEN_KATEGORI_LABELS,
  type DokumenKategori,
  type DokumenRow,
} from "@/features/konten/domain/dokumen";

import { deleteDokumenAction, saveDokumenAction } from "../dokumen-actions";
import { CmsCrudManager, type CmsColumn, type CmsField } from "./cms-crud-manager";

const KATEGORI_OPTIONS = DOKUMEN_KATEGORI.map((value) => ({
  value,
  label: DOKUMEN_KATEGORI_LABELS[value],
}));

export function DokumenManager({
  dokumen,
  canWrite,
  canManage,
}: {
  dokumen: DokumenRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const columns: CmsColumn<DokumenRow>[] = [
    {
      header: "Dokumen",
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{row.nama}</p>
          <code className="text-xs text-muted-foreground">{row.slug}</code>
        </div>
      ),
    },
    {
      header: "Kategori",
      className: "w-40",
      cell: (row) => DOKUMEN_KATEGORI_LABELS[row.kategori as DokumenKategori] ?? row.kategori,
    },
    {
      header: "Tahun",
      className: "w-20",
      cell: (row) => row.tahun ?? "—",
    },
    {
      header: "Nomor/Jenis",
      className: "w-40",
      cell: (row) => (
        <div className="space-y-1 text-xs">
          <p>{row.nomor || "—"}</p>
          {row.jenis ? <p className="text-muted-foreground">{row.jenis}</p> : null}
        </div>
      ),
    },
    {
      header: "Berkas/Tautan",
      cell: (row) => (
        <span className="block max-w-xs truncate text-xs text-muted-foreground">
          {row.berkas || row.tautan || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      className: "w-28",
      cell: (row) => (
        <Badge variant={row.aktif ? "default" : "secondary"}>
          {row.aktif ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
  ];

  const fields: CmsField[] = [
    {
      type: "text",
      name: "nama",
      label: "Nama dokumen",
      placeholder: "Contoh: APBDes 2026",
      maxLength: 200,
      required: true,
      wide: true,
    },
    {
      type: "text",
      name: "slug",
      label: "Slug",
      placeholder: "Kosongkan untuk dibuat otomatis dari nama",
      maxLength: 200,
    },
    {
      type: "select",
      name: "kategori",
      label: "Kategori",
      options: KATEGORI_OPTIONS,
      required: true,
    },
    {
      type: "text",
      name: "jenis",
      label: "Jenis",
      placeholder: "Contoh: Peraturan Desa",
      maxLength: 50,
    },
    {
      type: "text",
      name: "nomor",
      label: "Nomor",
      placeholder: "Contoh: 01/2026",
      maxLength: 100,
    },
    {
      type: "number",
      name: "tahun",
      label: "Tahun",
      min: 1900,
      max: 2100,
      step: 1,
      placeholder: "2026",
    },
    {
      type: "text",
      name: "berkas",
      label: "Path berkas",
      placeholder: "/media/desa/dokumen/apbdes-2026.pdf",
      maxLength: 255,
      wide: true,
    },
    {
      type: "text",
      name: "tautan",
      label: "Tautan luar",
      placeholder: "https://contoh.id/dokumen",
      maxLength: 500,
      wide: true,
    },
    {
      type: "textarea",
      name: "keterangan",
      label: "Keterangan",
      rows: 3,
      wide: true,
    },
    {
      type: "checkbox",
      name: "aktif",
      label: "Tampilkan di halaman dokumen publik",
    },
  ];

  return (
    <CmsCrudManager
      rows={dokumen}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.nama}
      columns={columns}
      fields={() => fields}
      getValues={(row) => ({
        nama: row?.nama ?? "",
        slug: row?.slug ?? "",
        kategori: row?.kategori ?? "informasi_publik",
        jenis: row?.jenis ?? "",
        nomor: row?.nomor ?? "",
        tahun: row?.tahun ? String(row.tahun) : "",
        berkas: row?.berkas ?? "",
        tautan: row?.tautan ?? "",
        keterangan: row?.keterangan ?? "",
        aktif: row ? row.aktif : true,
      })}
      saveAction={saveDokumenAction}
      deleteAction={deleteDokumenAction}
      canWrite={canWrite}
      canManage={canManage}
      labels={{
        add: "Tambah dokumen",
        addTitle: "Tambah Dokumen",
        editTitle: "Ubah Dokumen",
        formDescription: "Dokumen ini dapat diunduh warga. Isi path berkas media atau tautan luar.",
        deleteTitle: "Hapus dokumen?",
        deleteDescription: (label) => `Dokumen "${label}" akan dihapus permanen.`,
        empty: "Belum ada dokumen publik.",
      }}
    />
  );
}
