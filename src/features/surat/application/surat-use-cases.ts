import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getIdentitasDesa,
  type IdentitasDesa,
} from "@/features/desa/infrastructure/desa-repository";
import { GENDER_LABELS } from "@/features/penduduk/domain/penduduk";
import {
  getPendudukSuratData,
  listPendudukOptions,
  type PendudukSuratData,
} from "@/features/penduduk/infrastructure/penduduk-repository";
import {
  addMonthsIso,
  buildSuratNumber,
  formatTanggalIndonesia,
  renderSuratTemplate,
  SURAT_RESOURCE,
  type JenisSuratDTO,
  type LetterStatus,
  type SuratDetail,
  type SuratInput,
} from "@/features/surat/domain/surat";
import { getJenisSurat, listJenisSurat } from "@/features/surat/infrastructure/master-repository";
import {
  createSuratDraft,
  deleteSurat,
  getSurat,
  issueSuratRecord,
  listSurat,
  nextSuratSequence,
  recapSuratByStatus,
  suratNumberExists,
  updateSuratDraft,
} from "@/features/surat/infrastructure/surat-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

export interface SuratPrintData {
  surat: SuratDetail;
  jenis: JenisSuratDTO;
  desa: IdentitasDesa;
  penduduk: PendudukSuratData | null;
  content: string;
}

function text(value: string | null | undefined): string {
  return value && value.trim() !== "" ? value : "-";
}

function buildValues(
  surat: SuratDetail,
  jenis: JenisSuratDTO,
  desa: IdentitasDesa,
  penduduk: PendudukSuratData | null,
  number: string,
): Record<string, string> {
  const effectiveLetterDate = surat.letterDate ?? "-";
  const berlakuSampai = addMonthsIso(effectiveLetterDate, jenis.validityMonths);

  return {
    nama_desa: text(desa.namaDesa),
    kode_desa: text(desa.kodeDesa),
    nama_kecamatan: text(desa.namaKecamatan),
    nama_kabupaten: text(desa.namaKabupaten),
    nama_propinsi: text(desa.namaPropinsi),
    alamat_kantor: text(desa.alamatKantor),
    telepon_desa: text(desa.telepon),
    email_desa: text(desa.emailDesa),
    nama: text(penduduk?.name),
    nik: text(penduduk?.nationalId),
    tempat_lahir: text(penduduk?.birthPlace),
    tanggal_lahir: formatTanggalIndonesia(penduduk?.birthDate),
    jenis_kelamin: penduduk ? GENDER_LABELS[penduduk.gender] : "-",
    agama: text(penduduk?.religionName),
    pekerjaan: text(penduduk?.occupationName),
    alamat: text(penduduk?.address),
    no_kk: text(penduduk?.familyNumber),
    nomor_surat: number,
    tanggal_surat: formatTanggalIndonesia(effectiveLetterDate),
    keperluan: text(surat.purpose ?? "-"),
    berlaku_sampai: formatTanggalIndonesia(berlakuSampai),
  };
}

async function loadJenis(villageId: number, typeId: number): Promise<JenisSuratDTO> {
  const jenis = await getJenisSurat(villageId, typeId);
  if (!jenis) throw conflict("Jenis surat tidak ditemukan.");
  if (!jenis.isActive) throw conflict("Jenis surat sedang tidak aktif.");
  return jenis;
}

async function ensureResident(
  villageId: number,
  jenis: JenisSuratDTO,
  residentId: number | null,
): Promise<void> {
  if (residentId === null) {
    if (jenis.requiresResident) throw conflict("Penduduk wajib dipilih untuk jenis surat ini.");
    return;
  }

  const penduduk = await getPendudukSuratData(villageId, residentId);
  if (!penduduk) throw conflict("Penduduk yang dipilih tidak ditemukan pada desa ini.");
}

export async function listSuratWithMeta(params: { search: string; status: LetterStatus | null }) {
  const user = await requirePermission(SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [result, jenis, penduduk, recap] = await Promise.all([
    listSurat({ villageId, ...params }),
    listJenisSurat(villageId),
    listPendudukOptions(villageId),
    recapSuratByStatus(villageId),
  ]);

  return {
    ...result,
    jenis: jenis.filter((item) => item.isActive),
    penduduk,
    recap,
  };
}

export async function getSuratFormOptions() {
  const user = await requirePermission(SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [jenis, penduduk] = await Promise.all([
    listJenisSurat(villageId),
    listPendudukOptions(villageId),
  ]);

  return { jenis: jenis.filter((item) => item.isActive), penduduk };
}

export async function createSuratDraftData(input: SuratInput): Promise<{ id: number }> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const jenis = await loadJenis(villageId, input.typeId);
  await ensureResident(villageId, jenis, input.residentId);

  const letterDate = input.letterDate ?? "-";
  const year = Number(letterDate.slice(0, 4));
  const id = await createSuratDraft({
    villageId,
    typeId: jenis.id,
    residentId: input.residentId,
    letterDate: input.letterDate,
    year,
    purpose: input.purpose,
    typeName: jenis.name,
    createdBy: user.id,
  });

  return { id };
}

export async function updateSuratDraftData(id: number, input: SuratInput): Promise<void> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "draft") throw conflict("Hanya konsep surat yang dapat diubah.");

  const jenis = await loadJenis(villageId, input.typeId);
  await ensureResident(villageId, jenis, input.residentId);

  const letterDate = input.letterDate ?? "-";
  await updateSuratDraft(villageId, id, {
    typeId: jenis.id,
    residentId: input.residentId,
    letterDate: input.letterDate,
    year: Number(letterDate.slice(0, 4)),
    purpose: input.purpose,
    typeName: jenis.name,
  });
}

export async function deleteSuratData(id: number): Promise<void> {
  const user = await requirePermission(SURAT_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "draft") throw conflict("Surat yang sudah terbit tidak dapat dihapus.");

  await deleteSurat(villageId, id);
}

export async function issueSuratData(id: number): Promise<{ number: string }> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "draft") throw conflict("Surat ini sudah diterbitkan.");

  const jenis = await loadJenis(villageId, surat.typeId);
  const penduduk = surat.residentId
    ? await getPendudukSuratData(villageId, surat.residentId)
    : null;
  if (jenis.requiresResident && !penduduk) {
    throw conflict("Surat ini membutuhkan data penduduk yang valid.");
  }

  const desa = await getIdentitasDesa();
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");

  const letterDate = surat.letterDate ?? "-";
  const year = Number(letterDate.slice(0, 4));
  const month = Number(letterDate.slice(5, 7));
  let sequence = await nextSuratSequence(villageId, jenis.id, year);
  let number = "";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = buildSuratNumber(jenis.numberFormat, {
      sequence,
      kodeSurat: jenis.code,
      kodeDesa: desa.kodeDesa ?? "",
      year,
      month,
    });

    if (!(await suratNumberExists(villageId, candidate))) {
      number = candidate;
      break;
    }
    sequence += 1;
  }

  if (number === "") throw conflict("Gagal menentukan nomor surat. Coba lagi.");

  const content = renderSuratTemplate(
    jenis.templateBody,
    buildValues(surat, jenis, desa, penduduk, number),
  );

  await issueSuratRecord(id, { number, sequence, content, issuedAt: new Date() });
  return { number };
}

/** Data lengkap untuk halaman cetak & PDF (konsep memakai render sementara). */
export async function getSuratPrintData(id: number): Promise<SuratPrintData> {
  const user = await requirePermission(SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");

  const jenis = await getJenisSurat(villageId, surat.typeId);
  if (!jenis) throw notFound("Jenis surat tidak ditemukan.");

  const desa = await getIdentitasDesa();
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");

  const penduduk = surat.residentId
    ? await getPendudukSuratData(villageId, surat.residentId)
    : null;

  const content =
    surat.content ??
    renderSuratTemplate(
      jenis.templateBody,
      buildValues(surat, jenis, desa, penduduk, surat.number ?? "KONSEP"),
    );

  return { surat, jenis, desa, penduduk, content };
}
