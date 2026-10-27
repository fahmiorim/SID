"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type SuplemenListRow } from "@/features/penduduk/domain/suplemen";
import { deleteSuplemenAction } from "@/features/penduduk/presentation/actions-suplemen";
import { SuplemenDialog } from "@/features/penduduk/presentation/components/suplemen/suplemen-dialog";

export function SuplemenActions({ suplemen }: { suplemen: SuplemenListRow }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/penduduk/suplemen/${suplemen.id}`}>Detail</Link>
      </Button>
      <SuplemenDialog
        suplemen={suplemen}
        trigger={
          <Button variant="ghost" size="sm">
            Ubah
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        disabled={deleting}
        onClick={async () => {
          if (!confirm(`Hapus suplemen "${suplemen.nama}"?`)) return;
          setDeleting(true);
          const res = await deleteSuplemenAction(suplemen.id);
          if ("error" in res) {
            setDeleting(false);
            alert(res.error);
          }
        }}
      >
        {deleting ? "Menghapus..." : "Hapus"}
      </Button>
    </div>
  );
}
