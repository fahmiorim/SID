import { describe, expect, it } from "vitest";

import { DEFAULT_THEME_SLUG } from "@/features/publik/domain/theme";

import { slotTerpenuhi } from "./kontrak";
import { THEME_MANIFESTS } from "./manifests";
import {
  getDefaultTheme,
  getTheme,
  getThemeManifest,
  isThemeSlug,
  listThemeManifests,
  resolveTheme,
} from "./registry";

describe("registry tema", () => {
  it("tema bawaan terdaftar", () => {
    expect(isThemeSlug(DEFAULT_THEME_SLUG)).toBe(true);
    expect(getDefaultTheme().manifest.slug).toBe(DEFAULT_THEME_SLUG);
  });

  it("menolak slug yang tidak dikenal tanpa mengeksekusi kode luar registry", () => {
    expect(getTheme("../../etc/passwd")).toBeNull();
    expect(getThemeManifest("tidak-ada")).toBeNull();
    // Fallback aman ke tema bawaan, bukan melempar.
    expect(resolveTheme("tidak-ada").manifest.slug).toBe(DEFAULT_THEME_SLUG);
  });

  it("setiap tema terdaftar mengimplementasikan seluruh slot yang diklaim", () => {
    for (const manifest of listThemeManifests()) {
      expect(getTheme(manifest.slug), `tema ${manifest.slug} tidak ada di registry`).not.toBeNull();
      expect(slotTerpenuhi(manifest), `slot tema ${manifest.slug} belum lengkap`).toBe(true);
    }
  });

  it("katalog manifest dan registry berisi slug yang sama", () => {
    const dariKatalog = THEME_MANIFESTS.map((manifest) => manifest.slug).sort();
    const dariRegistry = listThemeManifests()
      .map((manifest) => manifest.slug)
      .sort();
    expect(dariRegistry).toEqual(dariKatalog);
  });
});
