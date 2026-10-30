export interface DocsStatusCategory {
  total: number;
  done: number;
  partial: number;
  notDone: number;
}

export interface DocsStatus {
  generatedAt: string;
  catalog: {
    totalIds: number;
    sourcePath: string;
    statusSource: string;
    auditRegisterPerId: boolean;
    implementationStatusPerId: boolean;
  };
  coarseParity: {
    totalModules: number;
    done: number;
    partial: number;
    notDone: number;
    percentage: number;
    disclaimer: string;
    categories: Record<string, DocsStatusCategory>;
  };
  documents: Array<{
    name: string;
    role: string;
    status: string;
  }>;
}

const COARSE_PARITY_CATEGORIES: Record<string, DocsStatusCategory> = {
  "Kependudukan & sosial": { total: 12, done: 3, partial: 1, notDone: 8 },
  "Wilayah & pertanahan": { total: 4, done: 2, partial: 0, notDone: 2 },
  Pemerintahan: { total: 8, done: 3, partial: 2, notDone: 3 },
  Persuratan: { total: 7, done: 6, partial: 0, notDone: 1 },
  Keuangan: { total: 6, done: 4, partial: 2, notDone: 0 },
  Bumindes: { total: 11, done: 7, partial: 0, notDone: 4 },
  Pembangunan: { total: 1, done: 0, partial: 0, notDone: 1 },
  "Layanan mandiri & warga": { total: 10, done: 7, partial: 1, notDone: 2 },
  "Analisis & statistik": { total: 3, done: 0, partial: 3, notDone: 0 },
  "Web publik": { total: 21, done: 10, partial: 4, notDone: 7 },
  "Sistem & operasional": { total: 9, done: 2, partial: 1, notDone: 6 },
};

export function createDocsStatus(now = new Date()): DocsStatus {
  return {
    generatedAt: now.toISOString(),
    catalog: {
      totalIds: 113,
      sourcePath: "docs/KATALOG-FITUR-OPENSID.md",
      statusSource: "docs/PARITAS-OPENSID.md",
      auditRegisterPerId: true,
      implementationStatusPerId: true,
    },
    coarseParity: {
      totalModules: 92,
      done: 42,
      partial: 12,
      notDone: 38,
      percentage: 52.2,
      disclaimer:
        "Ringkasan 92 modul adalah baseline kasar dan bukan status resmi. Status resmi per-ID: 15 ✅ / 77 🟡 / 20 🔴 dari 112 ID dalam scope (1 ID di luar scope) di PARITAS-OPENSID.md.",
      categories: COARSE_PARITY_CATEGORIES,
    },
    documents: [
      {
        name: "KATALOG-FITUR-OPENSID.md",
        role: "Scope kebutuhan lengkap",
        status: "113 ID OS-*",
      },
      {
        name: "PARITAS-OPENSID.md",
        role: "Status implementasi",
        status: "Seluruh 113 ID sudah diaudit; implementasi belum seluruhnya selesai",
      },
      {
        name: "RENCANA-PERBAIKAN.md",
        role: "Roadmap dan milestone",
        status: "Quality gate dasar lulus (test/typecheck/lint); E2E belum dijalankan CI",
      },
      {
        name: "ARCHITECTURE.md",
        role: "Aturan teknis dan quality gate",
        status: "Quality gate wajib dijalankan sebelum milestone ditutup",
      },
    ],
  };
}
