"use client";

import { Badge } from "@/components/ui/badge";
import { agendaLabelTanggal, type AgendaRow } from "@/features/agenda/domain/agenda";
import {
  CmsCrudManager,
  type CmsColumn,
  type CmsField,
} from "@/features/konten/presentation/components/cms-crud-manager";

import { deleteAgendaAction, saveAgendaAction } from "../actions";

export function AgendaManager({
  agenda,
  canWrite,
  canManage,
}: {
  agenda: AgendaRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const columns: CmsColumn<AgendaRow>[] = [
    {
      header: "Kegiatan",
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{row.judul}</p>
          {row.lokasi ? <p className="text-xs text-muted-foreground">{row.lokasi}</p> : null}
        </div>
      ),
    },
    {
      header: "Tanggal",
      className: "w-56",
      cell: (row) => <span className="text-sm">{agendaLabelTanggal(row.mulai, row.selesai)}</span>,
    },
    {
      header: "Tayang",
      className: "w-28",
      cell: (row) => (
        <Badge variant={row.tayang ? "default" : "secondary"}>
          {row.tayang ? "Tayang" : "Draf"}
        </Badge>
      ),
    },
  ];

  const fields: CmsField[] = [
    {
      type: "text",
      name: "judul",
      label: "Judul kegiatan",
      placeholder: "Musyawarah Desa",
      maxLength: 200,
      required: true,
      wide: true,
    },
    {
      type: "text",
      name: "mulai",
      label: "Tanggal mulai",
      placeholder: "2026-11-20",
      required: true,
    },
    {
      type: "text",
      name: "selesai",
      label: "Tanggal selesai (opsional)",
      placeholder: "2026-11-20",
    },
    {
      type: "text",
      name: "lokasi",
      label: "Lokasi",
      placeholder: "Balai Desa",
      maxLength: 200,
      wide: true,
    },
    {
      type: "textarea",
      name: "deskripsi",
      label: "Keterangan",
      rows: 3,
      maxLength: 2000,
      wide: true,
    },
    {
      type: "checkbox",
      name: "tayang",
      label: "Tayangkan di situs publik",
      help: "Agenda hanya terlihat warga setelah pilihan ini dicentang.",
    },
  ];

  return (
    <CmsCrudManager
      rows={agenda}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.judul}
      columns={columns}
      fields={() => fields}
      getValues={(row) => ({
        judul: row?.judul ?? "",
        mulai: row?.mulai ?? "",
        selesai: row?.selesai ?? "",
        lokasi: row?.lokasi ?? "",
        deskripsi: row?.deskripsi ?? "",
        tayang: row?.tayang ?? false,
      })}
      saveAction={saveAgendaAction}
      deleteAction={deleteAgendaAction}
      canWrite={canWrite}
      canManage={canManage}
      labels={{
        add: "Tambah agenda",
        addTitle: "Tambah Agenda Kegiatan",
        editTitle: "Ubah Agenda Kegiatan",
        formDescription:
          "Agenda kegiatan tampil di halaman agenda dan beranda setelah ditayangkan.",
        deleteTitle: "Hapus agenda?",
        deleteDescription: (label) => `Agenda "${label}" akan dihapus permanen.`,
        empty: "Belum ada agenda kegiatan.",
      }}
    />
  );
}
