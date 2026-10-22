import "server-only";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";
import { getTemaAktif } from "@/features/publik/application/tema-use-cases";
import { susunMenu } from "@/features/publik/domain/menu";
import { themeCssVars, type ThemeOptions } from "@/features/publik/domain/theme";
import { listMenuPublik } from "@/features/publik/infrastructure/content-repository";
import type { ThemeComponents } from "@/themes/kontrak";
import { resolveTheme } from "@/themes/registry";
import type { ThemeContext } from "@/themes/types";

/**
 * Perakit konteks tema untuk halaman publik (Fase 1D).
 *
 * Halaman rute cukup memanggil `siapkanTema()` lalu memilih komponen tema yang
 * diinginkan; resolusi tenant, menu, dan opsi tema ditangani di sini agar tidak
 * diduplikasi di setiap halaman.
 */
export interface TemaSiap {
  ctx: ThemeContext;
  tema: ThemeComponents;
  desa: IdentitasDesa;
  opsi: ThemeOptions;
}

export async function siapkanTema(): Promise<TemaSiap> {
  const desa = await getIdentitasFromRequest();
  const [menu, aktif] = await Promise.all([listMenuPublik(desa.id), getTemaAktif(desa.id)]);

  const ctx: ThemeContext = {
    desa,
    menu: susunMenu(menu),
    opsi: aktif.opsi,
    tema: {
      slug: aktif.manifest.slug,
      nama: aktif.manifest.nama,
      cssVars: themeCssVars(aktif.opsi),
    },
  };

  return { ctx, tema: resolveTheme(aktif.manifest.slug), desa, opsi: aktif.opsi };
}
