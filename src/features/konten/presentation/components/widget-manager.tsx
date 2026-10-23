"use client";

import { Badge } from "@/components/ui/badge";
import { WIDGET_JENIS_LABELS, type WidgetRow } from "@/features/konten/domain/widget";

import { deleteWidgetAction, saveWidgetAction } from "../widget-actions";
import { CmsCrudManager, type CmsColumn, type CmsField } from "./cms-crud-manager";

const JENIS_OPTIONS = Object.entries(WIDGET_JENIS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function cuplikan(value: string | null): string {
  if (!value) return "—";
  const teks = value.replace(/\s+/g, " ").trim();
  return teks.length > 80 ? `${teks.slice(0, 80)}…` : teks;
}

export function WidgetManager({
  widgets,
  canWrite,
  canManage,
}: {
  widgets: WidgetRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const columns: CmsColumn<WidgetRow>[] = [
    {
      header: "Widget",
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{row.judul || "(tanpa judul)"}</p>
          <p className="max-w-md text-xs text-muted-foreground">{cuplikan(row.isi)}</p>
        </div>
      ),
    },
    {
      header: "Jenis",
      className: "w-40",
      cell: (row) => WIDGET_JENIS_LABELS[row.jenis] ?? `Jenis ${row.jenis}`,
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
      name: "judul",
      label: "Judul widget",
      placeholder: "Contoh: Pengumuman",
      maxLength: 100,
    },
    {
      type: "select",
      name: "jenis",
      label: "Jenis widget",
      options: JENIS_OPTIONS,
      required: true,
    },
    {
      type: "textarea",
      name: "isi",
      label: "Isi",
      placeholder: "Isi widget teks bebas...",
      rows: 5,
      wide: true,
    },
    {
      type: "textarea",
      name: "pengaturan",
      label: "Pengaturan (JSON, opsional)",
      placeholder: '{"batas": 5}',
      rows: 3,
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
      label: "Tampilkan widget",
      help: "Widget nonaktif tetap tersimpan tetapi tidak dirender di situs publik.",
    },
  ];

  return (
    <CmsCrudManager
      rows={widgets}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.judul || `Widget ${row.id}`}
      columns={columns}
      fields={() => fields}
      getValues={(row) => ({
        judul: row?.judul ?? "",
        jenis: row ? String(row.jenis) : "1",
        isi: row?.isi ?? "",
        pengaturan: row?.pengaturan ?? "",
        urut: row ? String(row.urut) : "0",
        aktif: row ? row.aktif : true,
      })}
      saveAction={saveWidgetAction}
      deleteAction={deleteWidgetAction}
      canWrite={canWrite}
      canManage={canManage}
      labels={{
        add: "Tambah widget",
        addTitle: "Tambah Widget",
        editTitle: "Ubah Widget",
        formDescription: "Widget adalah blok konten yang tampil di samping halaman publik.",
        deleteTitle: "Hapus widget?",
        deleteDescription: (label) => `Widget "${label}" akan dihapus permanen.`,
        empty: "Belum ada widget.",
      }}
    />
  );
}
