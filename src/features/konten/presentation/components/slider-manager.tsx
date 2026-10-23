"use client";

import { Badge } from "@/components/ui/badge";
import type { SliderRow } from "@/features/konten/domain/slider";

import { deleteSliderAction, saveSliderAction } from "../slider-actions";
import { CmsCrudManager, type CmsColumn, type CmsField } from "./cms-crud-manager";

export function SliderManager({
  sliders,
  canWrite,
  canManage,
}: {
  sliders: SliderRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const columns: CmsColumn<SliderRow>[] = [
    {
      header: "Gambar",
      cell: (row) => (
        <code className="block max-w-xs truncate rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.gambar}
        </code>
      ),
    },
    {
      header: "Judul",
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{row.judul || "(tanpa judul)"}</p>
          {row.keterangan ? (
            <p className="max-w-md text-xs text-muted-foreground">{row.keterangan}</p>
          ) : null}
        </div>
      ),
    },
    {
      header: "Tautan",
      className: "w-48",
      cell: (row) =>
        row.tautan ? <span className="block max-w-40 truncate text-xs">{row.tautan}</span> : "—",
    },
    {
      header: "Urutan",
      className: "w-24",
      cell: (row) => row.urut,
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
      name: "gambar",
      label: "Path/URL gambar",
      placeholder: "/media/desa/slider/contoh.jpg",
      maxLength: 255,
      required: true,
      wide: true,
    },
    {
      type: "text",
      name: "judul",
      label: "Judul slide",
      maxLength: 150,
    },
    {
      type: "text",
      name: "tautan",
      label: "Tautan saat diklik",
      placeholder: "/desa/berita atau https://contoh.id",
      maxLength: 255,
    },
    {
      type: "textarea",
      name: "keterangan",
      label: "Keterangan",
      rows: 3,
      maxLength: 500,
      wide: true,
    },
    {
      type: "number",
      name: "urut",
      label: "Urutan",
      min: 0,
      step: 1,
      placeholder: "0",
    },
    {
      type: "checkbox",
      name: "aktif",
      label: "Tampilkan slide di beranda",
    },
  ];

  return (
    <CmsCrudManager
      rows={sliders}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.judul || row.gambar}
      columns={columns}
      fields={() => fields}
      getValues={(row) => ({
        gambar: row?.gambar ?? "",
        judul: row?.judul ?? "",
        tautan: row?.tautan ?? "",
        keterangan: row?.keterangan ?? "",
        urut: row ? String(row.urut) : "0",
        aktif: row ? row.aktif : true,
      })}
      saveAction={saveSliderAction}
      deleteAction={deleteSliderAction}
      canWrite={canWrite}
      canManage={canManage}
      labels={{
        add: "Tambah slider",
        addTitle: "Tambah Slider",
        editTitle: "Ubah Slider",
        formDescription: "Slider tampil sebagai gambar sorotan di beranda situs publik.",
        deleteTitle: "Hapus slider?",
        deleteDescription: (label) => `Slider "${label}" akan dihapus permanen.`,
        empty: "Belum ada slider.",
      }}
    />
  );
}
