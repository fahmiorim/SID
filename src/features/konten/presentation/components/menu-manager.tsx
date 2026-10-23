"use client";

import { Badge } from "@/components/ui/badge";
import type { MenuRow } from "@/features/konten/domain/menu";

import { deleteMenuAction, saveMenuAction } from "../menu-actions";
import { CmsCrudManager, type CmsColumn, type CmsField } from "./cms-crud-manager";

const LINK_TIPE_OPTIONS = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "Eksternal" },
];

export function MenuManager({
  menus,
  canWrite,
  canManage,
}: {
  menus: MenuRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const columns: CmsColumn<MenuRow>[] = [
    {
      header: "Nama",
      cell: (row) => {
        const induk = row.parentId ? menus.find((menu) => menu.id === row.parentId) : null;
        return (
          <div className="space-y-1">
            <p className="font-medium">{row.nama}</p>
            {induk ? (
              <p className="text-xs text-muted-foreground">Submenu dari {induk.nama}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Link",
      cell: (row) => (
        <div className="space-y-1">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.link}</code>
          <p className="text-xs text-muted-foreground">
            {row.linkTipe === "external" ? "Eksternal" : "Internal"}
          </p>
        </div>
      ),
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

  const fields: (rows: MenuRow[], row: MenuRow | null) => CmsField[] = (rows, row) => [
    {
      type: "text",
      name: "nama",
      label: "Nama menu",
      placeholder: "Contoh: Profil Desa",
      maxLength: 50,
      required: true,
    },
    {
      type: "text",
      name: "link",
      label: "Link",
      placeholder: "/desa/profil atau https://contoh.id",
      maxLength: 500,
      required: true,
    },
    {
      type: "select",
      name: "linkTipe",
      label: "Tipe link",
      options: LINK_TIPE_OPTIONS,
      required: true,
    },
    {
      type: "select",
      name: "parentId",
      label: "Menu induk",
      options: [
        { value: "none", label: "Tanpa induk (menu utama)" },
        ...rows
          .filter((menu) => menu.parentId === null && menu.id !== row?.id)
          .map((menu) => ({ value: String(menu.id), label: menu.nama })),
      ],
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
      label: "Tampilkan di navigasi publik",
      help: "Matikan untuk menyembunyikan menu tanpa menghapusnya.",
    },
  ];

  return (
    <CmsCrudManager
      rows={menus}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.nama}
      columns={columns}
      fields={fields}
      getValues={(row) => ({
        nama: row?.nama ?? "",
        link: row?.link ?? "",
        linkTipe: row?.linkTipe ?? "internal",
        parentId: row?.parentId ? String(row.parentId) : "none",
        urut: row ? String(row.urut) : "0",
        aktif: row ? row.aktif : true,
      })}
      saveAction={saveMenuAction}
      deleteAction={deleteMenuAction}
      canWrite={canWrite}
      canManage={canManage}
      labels={{
        add: "Tambah menu",
        addTitle: "Tambah Menu",
        editTitle: "Ubah Menu",
        formDescription: "Menu ini tampil pada navigasi situs publik desa.",
        deleteTitle: "Hapus menu?",
        deleteDescription: (label) =>
          `Menu "${label}" akan dihapus permanen. Menu yang masih memiliki submenu tidak dapat dihapus.`,
        empty: "Belum ada menu publik.",
      }}
    />
  );
}
