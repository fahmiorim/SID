"use client";

import { Baby, LogIn, LogOut, RefreshCw, Skull } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PendudukListRow } from "@/features/penduduk/domain/penduduk";

import { CatatDatangDialog } from "./catat-datang-dialog";
import { CatatKelahiranDialog } from "./catat-kelahiran-dialog";
import { CatatKematianDialog } from "./catat-kematian-dialog";
import { CatatPerubahanDialog } from "./catat-perubahan-dialog";
import { CatatPindahKeluarDialog } from "./catat-pindah-keluar-dialog";

interface RiwayatActionsProps {
  pendudukOptions: PendudukListRow[];
}

export function RiwayatActions({ pendudukOptions }: RiwayatActionsProps) {
  const [openKelahiran, setOpenKelahiran] = useState(false);
  const [openDatang, setOpenDatang] = useState(false);
  const [openKematian, setOpenKematian] = useState(false);
  const [openPerubahan, setOpenPerubahan] = useState(false);
  const [openPindah, setOpenPindah] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Catat Riwayat</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenKelahiran(true)}>
            <Baby className="mr-2 h-4 w-4" />
            Catat Kelahiran
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDatang(true)}>
            <LogIn className="mr-2 h-4 w-4" />
            Catat Kedatangan/Pindah Masuk
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenKematian(true)}>
            <Skull className="mr-2 h-4 w-4" />
            Catat Kematian
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPerubahan(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Catat Perubahan Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPindah(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Catat Pindah Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CatatKelahiranDialog open={openKelahiran} onOpenChange={setOpenKelahiran} />
      <CatatDatangDialog open={openDatang} onOpenChange={setOpenDatang} />
      <CatatKematianDialog
        open={openKematian}
        onOpenChange={setOpenKematian}
        pendudukOptions={pendudukOptions}
      />
      <CatatPerubahanDialog
        open={openPerubahan}
        onOpenChange={setOpenPerubahan}
        pendudukOptions={pendudukOptions}
      />
      <CatatPindahKeluarDialog
        open={openPindah}
        onOpenChange={setOpenPindah}
        pendudukOptions={pendudukOptions}
      />
    </>
  );
}
