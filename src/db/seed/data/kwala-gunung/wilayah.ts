/**
 * Wilayah administratif (dusun/RW/RT) Desa Kwala Gunung.
 */

export interface WilayahSeed {
  dusun: string;
  rw?: string;
  rt?: string;
  sortOrder: number;
}

export const WILAYAH_SEEDS: WilayahSeed[] = [
  { dusun: "Dusun I", rw: "01", rt: "001", sortOrder: 1 },
  { dusun: "Dusun I", rw: "01", rt: "002", sortOrder: 2 },
  { dusun: "Dusun I", rw: "01", rt: "003", sortOrder: 3 },
  { dusun: "Dusun I", rw: "02", rt: "004", sortOrder: 4 },
  { dusun: "Dusun I", rw: "02", rt: "005", sortOrder: 5 },
  { dusun: "Dusun II", rw: "03", rt: "006", sortOrder: 6 },
  { dusun: "Dusun II", rw: "03", rt: "007", sortOrder: 7 },
  { dusun: "Dusun II", rw: "04", rt: "008", sortOrder: 8 },
  { dusun: "Dusun II", rw: "04", rt: "009", sortOrder: 9 },
  { dusun: "Dusun III", rw: "05", rt: "010", sortOrder: 10 },
  { dusun: "Dusun III", rw: "05", rt: "011", sortOrder: 11 },
  { dusun: "Dusun III", rw: "06", rt: "012", sortOrder: 12 },
];
