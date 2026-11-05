"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PelangganDTO } from "@/features/pelanggan/domain/pelanggan";
import { createIdleActionState } from "@/lib/action-state";

import { deletePelangganAction, updateStatusLanggananAction } from "../pelanggan-actions";
import { PelangganFormDialog } from "./pelanggan-form-dialog";
import { StatusLanggananDropdown } from "./status-langganan-dropdown";

interface PelangganTableProps {
  items: PelangganDTO[];
}

export function PelangganTable({ items: initialItems }: PelangganTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PelangganDTO | null>(null);
  const [deleteState] = useActionState(
    deletePelangganAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [statusState] = useActionState(
    updateStatusLanggananAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message);
    }
  }, [deleteState]);

  useEffect(() => {
    if (statusState.status === "success") {
      toast.success(statusState.message);
    }
  }, [statusState]);

  const getStatusVariant = (status: string | null) => {
    if (!status) return "outline";
    switch (status) {
      case "aktif":
        return "default";
      case "nonaktif":
        return "secondary";
      case "menunggu":
        return "outline";
      case "kadaluarsa":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customer Data</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status Langganan</TableHead>
              <TableHead>No. Kerjasama</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada data pelanggan.
                </TableCell>
              </TableRow>
            ) : (
              initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.kontak ?? "-"}</TableCell>
                  <TableCell>{item.alamat ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.statusLangganan)}>
                      {item.statusLangganan}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.noKerjasama ?? "-"}</TableCell>
                  <TableCell>
                    {item.dokumenKerjasama ? (
                      <a
                        href={`/pelanggan/${item.id}/dokumen`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat dokumen
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <StatusLanggananDropdown item={item} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(item);
                          setOpen(true);
                        }}
                      >
                        Ubah
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <PelangganFormDialog open={open} onOpenChange={setOpen} item={selected} />
    </Card>
  );
}
