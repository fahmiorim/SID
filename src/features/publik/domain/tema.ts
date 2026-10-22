import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

import { FONT_CHOICES, HEADER_VARIANTS, HOME_SECTION_IDS } from "./theme";

/**
 * Kontrak administratif tema (Fase 1D.7): resource RBAC + skema form.
 *
 * Slug resource dipakai modul `tema` di `src/db/seed/data/modules.ts`.
 */
export const TEMA_RESOURCE = RESOURCES.tema;

export const pengaturanTemaSchema = z.object({
  warnaPrimer: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna primer harus format heks seperti #1a7f4b."),
  warnaSekunder: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna sekunder harus format heks seperti #0f5132."),
  font: z.enum(FONT_CHOICES),
  kelengkungan: z.coerce.number().min(0).max(2),
  heroJudul: z.string().trim().max(120).default(""),
  heroTombol: z.string().trim().max(60).default(""),
  heroTombolUrl: z.string().trim().max(255).default(""),
  headerVarian: z.enum(HEADER_VARIANTS),
  beranda: z.array(z.enum(HOME_SECTION_IDS)).default([]),
  tampilMenu: z.boolean().default(true),
  tampilKontakFooter: z.boolean().default(true),
});

export type PengaturanTemaForm = z.infer<typeof pengaturanTemaSchema>;

/**
 * Nilai awal form tema (dipakai komponen klien).
 *
 * Bentuknya sama dengan opsi tema, tetapi `beranda` dijadikan `string[]` agar
 * mudah dipetakan ke checkbox.
 */
export interface TemaFormValues {
  warnaPrimer: string;
  warnaSekunder: string;
  font: (typeof FONT_CHOICES)[number];
  kelengkungan: number;
  heroJudul: string;
  heroTombol: string;
  heroTombolUrl: string;
  headerVarian: (typeof HEADER_VARIANTS)[number];
  beranda: string[];
  tampilMenu: boolean;
  tampilKontakFooter: boolean;
}

/** Ubah opsi tema tersimpan menjadi nilai awal form admin. */
export function opsiKeForm(opsi: {
  warnaPrimer: string;
  warnaSekunder: string;
  font: (typeof FONT_CHOICES)[number];
  kelengkungan: number;
  heroJudul: string;
  heroTombol: string;
  heroTombolUrl: string;
  headerVarian: (typeof HEADER_VARIANTS)[number];
  beranda: readonly (typeof HOME_SECTION_IDS)[number][];
  tampilMenu: boolean;
  tampilKontakFooter: boolean;
}): TemaFormValues {
  return {
    warnaPrimer: opsi.warnaPrimer,
    warnaSekunder: opsi.warnaSekunder,
    font: opsi.font,
    kelengkungan: opsi.kelengkungan,
    heroJudul: opsi.heroJudul,
    heroTombol: opsi.heroTombol,
    heroTombolUrl: opsi.heroTombolUrl,
    headerVarian: opsi.headerVarian,
    beranda: [...opsi.beranda],
    tampilMenu: opsi.tampilMenu,
    tampilKontakFooter: opsi.tampilKontakFooter,
  };
}
