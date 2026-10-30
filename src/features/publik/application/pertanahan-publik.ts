import "server-only";

import {
  listCdesa as repoListCdesa,
  listCdesaMutasi as repoListCdesaMutasi,
  listPersil as repoListPersil,
} from "@/features/gis/infrastructure/gis-repository";

export interface CatatanPertanahan {
  id: number;
  nama: string;
  kode: string | null;
  keterangan: string | null;
  createdAt: Date;
}

/**
 * Data pertanahan publik — gabungan persil, Cdesa, dan mutasi.
 */
export interface PertanahanPublik {
  persil: {
    id: number;
    nomor: string;
    nomorCdesa: string | null;
    luas: number;
    status: string | null;
    keterangan: string | null;
  }[];
  cdesa: {
    id: number;
    nomor: string;
    nomorPersil: string | null;
    nomorSertifikat: string | null;
    tanggal: string | null;
    namaPemegang: string | null;
    luas: number;
    keterangan: string | null;
  }[];
  mutasi: {
    id: number;
    nomor: string;
    tanggal: Date;
    tipe: string;
    keterangan: string | null;
  }[];
}

export async function listCatatanPertanahan(_villageId: number): Promise<CatatanPertanahan[]> {
  return [];
}

export async function listPertanahanPublik(villageId: number): Promise<PertanahanPublik> {
  const [persil, cdesa, mutasi] = await Promise.all([
    repoListPersil(villageId),
    repoListCdesa(villageId),
    repoListCdesaMutasi(villageId),
  ]);

  return {
    persil: persil.map((r) => ({
      id: r.id,
      nomor: r.nomor,
      nomorCdesa: r.nomorCdesa,
      luas: r.luas,
      status: r.status,
      keterangan: r.keterangan,
    })),
    cdesa: cdesa.map((r) => ({
      id: r.id,
      nomor: r.nomor,
      nomorPersil: r.nomorPersil,
      nomorSertifikat: r.nomorSertifikat,
      tanggal: r.tanggal,
      namaPemegang: r.namaPemegang,
      luas: r.luas,
      keterangan: r.keterangan,
    })),
    mutasi: mutasi
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .map((r) => ({
        id: r.id,
        nomor: r.nomor,
        tanggal: new Date(r.tanggal),
        tipe: r.tipe,
        keterangan: r.keterangan,
      })),
  };
}
