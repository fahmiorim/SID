import { describe, expect, it } from "vitest";

import { susunPetaDesa, villageIdDariHost, type BarisDesa } from "./tenant";

/** Dua desa dengan domain berbeda (instalasi multi-tenant). */
const DUA_DESA: BarisDesa[] = [
  { id: 1, domain: "desa-a.desa.id" },
  { id: 2, domain: "desa-b.desa.id" },
];

describe("susunPetaDesa", () => {
  it("memetakan domain ternormalisasi ke id desa", () => {
    const peta = susunPetaDesa(DUA_DESA);

    expect(peta.domain.get("desa-a.desa.id")).toBe(1);
    expect(peta.domain.get("desa-b.desa.id")).toBe(2);
    expect(peta.jumlahDesa).toBe(2);
    expect(peta.desaPertamaId).toBe(1);
  });

  it("melewati desa tanpa domain dan menormalkan domain tersimpan", () => {
    const peta = susunPetaDesa([
      { id: 1, domain: null },
      { id: 2, domain: "  Desa-B.Desa.id. " },
    ]);

    expect(peta.domain.has("desa-b.desa.id")).toBe(true);
    expect(peta.domain.get("desa-b.desa.id")).toBe(2);
    expect(peta.domain.size).toBe(1);
  });
});

describe("villageIdDariHost — isolasi dua desa/dua host", () => {
  const peta = susunPetaDesa(DUA_DESA);

  it("host desa A hanya menghasilkan desa A", () => {
    expect(villageIdDariHost("desa-a.desa.id", peta)).toBe(1);
  });

  it("host desa B hanya menghasilkan desa B", () => {
    expect(villageIdDariHost("desa-b.desa.id", peta)).toBe(2);
  });

  it("menerima port, huruf besar, titik akhir, dan alias www", () => {
    expect(villageIdDariHost("DESA-A.DESA.ID:3000", peta)).toBe(1);
    expect(villageIdDariHost("desa-b.desa.id.", peta)).toBe(2);
    expect(villageIdDariHost("www.desa-b.desa.id", peta)).toBe(2);
  });

  it("host tak dikenal tidak jatuh ke desa mana pun saat ada banyak desa", () => {
    expect(villageIdDariHost("desa-c.desa.id", peta)).toBeNull();
    expect(villageIdDariHost("localhost:3000", peta)).toBeNull();
    expect(villageIdDariHost(null, peta)).toBeNull();
  });

  it("desa tanpa domain tidak membuat host desa lain bocor", () => {
    const petaCampur = susunPetaDesa([
      { id: 1, domain: "desa-a.desa.id" },
      { id: 2, domain: null },
    ]);

    expect(villageIdDariHost("desa-a.desa.id", petaCampur)).toBe(1);
    expect(villageIdDariHost("desa-b.desa.id", petaCampur)).toBeNull();
  });
});

describe("villageIdDariHost — fallback satu desa", () => {
  it("memakai satu-satunya desa untuk host apa pun", () => {
    const peta = susunPetaDesa([{ id: 7, domain: "desa-tunggal.desa.id" }]);

    expect(villageIdDariHost("desa-tunggal.desa.id", peta)).toBe(7);
    expect(villageIdDariHost("localhost:3000", peta)).toBe(7);
    expect(villageIdDariHost(null, peta)).toBe(7);
  });

  it("tidak memakai fallback bila instalasi belum berisi desa", () => {
    const peta = susunPetaDesa([]);

    expect(villageIdDariHost("localhost:3000", peta)).toBeNull();
  });
});
