import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getIdentitasDesa,
  type IdentitasDesa,
} from "@/features/desa/infrastructure/desa-repository";
import { sinkronStatusSuratPermohonan } from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { calculateAge, GENDER_LABELS } from "@/features/penduduk/domain/penduduk";
import {
  getPendudukSuratData,
  listAnggotaKeluargaSurat,
  listPendudukOptions,
  type AnggotaKeluargaSuratRow,
  type PendudukSuratData,
} from "@/features/penduduk/infrastructure/penduduk-repository";
import { findRoleById } from "@/features/rbac/infrastructure/rbac-repository";
import {
  buildIsianValues,
  isianErrorsToFieldErrors,
  parseIsianFields,
  parseNilaiIsian,
  parseSyaratIds,
  serializeNilaiIsian,
  validateIsianValues,
  type IsianField,
} from "@/features/surat/domain/isian";
import { normalizePenomoranMode, type PenomoranSuratMode } from "@/features/surat/domain/penomoran";
import {
  addMonthsIso,
  buildKlgPlaceholders,
  buildSuratNumber,
  butuhKonfirmasiSyarat,
  canVerifyStep,
  DEFAULT_NUMBER_FORMAT,
  formatTanggalIndonesia,
  generateVerificationToken,
  nextVerificationStep,
  renderSuratTemplate,
  roleCanVerifyStep,
  SURAT_RESOURCE,
  VERIFICATION_STEP_LABELS,
  type AnggotaKeluargaSurat,
  type JenisSuratDTO,
  type LetterStatus,
  type SuratDetail,
  type SuratInput,
  type VerificationStep,
} from "@/features/surat/domain/surat";
import { isiTerbilangDanHitung, terbilangIsi } from "@/features/surat/domain/terbilang";
import {
  getJenisSurat,
  listJenisSurat,
  listSyaratSurat,
} from "@/features/surat/infrastructure/master-repository";
import {
  createSuratDraft,
  deleteSurat,
  getSurat,
  issueSuratRecord,
  listSurat,
  nextSuratSequence,
  nextSuratSequenceByKlasifikasi,
  nextSuratSequenceCombined,
  nextSuratSequenceGlobal,
  recapSuratByStatus,
  rejectSurat,
  suratNumberExists,
  suratNumberExistsWithAgenda,
  updateSuratDraft,
  updateSuratVerification,
} from "@/features/surat/infrastructure/surat-repository";
import { requirePermission, requireWargaAktif } from "@/lib/dal";
import { conflict, forbidden, notFound, validationError } from "@/lib/errors";

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

function toAnggotaKeluarga(rows: readonly AnggotaKeluargaSuratRow[]): AnggotaKeluargaSurat[] {
  return rows.map((row) => ({
    nik: row.nationalId,
    nama: row.name,
    jenisKelamin: GENDER_LABELS[row.gender],
    tempatLahir: row.birthPlace,
    tanggalLahir: formatTanggalIndonesia(row.birthDate),
    usia: String(calculateAge(row.birthDate) ?? "-"),
    agama: row.religionName,
    pendidikan: row.educationName,
    pendidikanSedang: row.educationSedangName,
    pekerjaan: row.occupationName,
    statusKawin: row.maritalStatusName,
    hubunganKk: row.familyRelationName,
    kewarganegaraan: row.citizenshipName,
    golonganDarah: row.bloodTypeName,
    alamat: row.address,
    namaAyah: row.fatherName,
    namaIbu: row.motherName,
    nikAyah: row.fatherNationalId,
    nikIbu: row.motherNationalId,
  }));
}

async function loadAnggotaKeluarga(
  villageId: number,
  penduduk: PendudukSuratData | null,
): Promise<AnggotaKeluargaSurat[]> {
  if (!penduduk?.familyId) return [];
  const rows = await listAnggotaKeluargaSurat(villageId, penduduk.familyId);
  return toAnggotaKeluarga(rows);
}

function buildValues(
  surat: SuratDetail,
  jenis: JenisSuratDTO,
  desa: IdentitasDesa,
  penduduk: PendudukSuratData | null,
  anggotaKeluarga: readonly AnggotaKeluargaSurat[],
  number: string,
): Record<string, string> {
  const effectiveLetterDate = surat.letterDate ?? "-";
  const berlakuSampai = addMonthsIso(effectiveLetterDate, jenis.validityMonths);

  return {
    // Nilai isian dinamis (kode isian kustom) disisipkan lebih dulu agar
    // placeholder bawaan selalu menang bila kodenya bentrok.
    ...parseNilaiIsian(surat.nilaiIsian),
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
    format_nomor_surat: number,
    tanggal_surat: formatTanggalIndonesia(effectiveLetterDate),
    keperluan: text(surat.purpose ?? "-"),
    berlaku_sampai: formatTanggalIndonesia(berlakuSampai),
    ...buildKlgPlaceholders(anggotaKeluarga),
    // Nilai isian angka otomatis mendapat padanan kata `[<kode>_terbilang]`
    // untuk penulisan "sejumlah ... rupiah" (lihat domain/terbilang.ts).
    ...terbilangIsi(parseNilaiIsian(surat.nilaiIsian)),
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

  const [result, jenis, penduduk, recap, syarat] = await Promise.all([
    listSurat({ villageId, ...params }),
    listJenisSurat(villageId),
    listPendudukOptions(villageId),
    recapSuratByStatus(villageId),
    listSyaratSurat(villageId),
  ]);

  return {
    ...result,
    jenis: jenis.filter((item) => item.isActive),
    penduduk,
    recap,
    syarat,
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

/**
 * Hitung nilai isian dari formulir dan periksa isian wajib.
 *
 * Nilai disimpan sebagai JSON map `kode isian → nilai`; isian yang tidak
 * diisi tidak ikut disimpan agar surat tetap ringkas.
 */
function resolveIsianValues(
  jenis: JenisSuratDTO,
  raw: Readonly<Record<string, string>>,
): { fields: IsianField[]; values: Record<string, string> } {
  const fields = parseIsianFields(jenis.formIsian);
  const values = buildIsianValues(fields, raw);
  const errors = validateIsianValues(fields, values);

  if (Object.keys(errors).length > 0) {
    throw validationError(
      "Lengkapi isian surat yang wajib diisi.",
      isianErrorsToFieldErrors(errors),
    );
  }

  return { fields, values };
}

export async function createSuratDraftData(input: SuratInput): Promise<{ id: number }> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const jenis = await loadJenis(villageId, input.typeId);
  await ensureResident(villageId, jenis, input.residentId);

  const { values } = resolveIsianValues(jenis, input.isiSurat);

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
    nilaiIsian: serializeNilaiIsian(values),
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

  const { values } = resolveIsianValues(jenis, input.isiSurat);

  const letterDate = input.letterDate ?? "-";
  await updateSuratDraft(villageId, id, {
    typeId: jenis.id,
    residentId: input.residentId,
    letterDate: input.letterDate,
    year: Number(letterDate.slice(0, 4)),
    purpose: input.purpose,
    typeName: jenis.name,
    nilaiIsian: serializeNilaiIsian(values),
  });
}

export async function deleteSuratData(id: number): Promise<void> {
  const user = await requirePermission(SURAT_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "draft") throw conflict("Hanya konsep surat yang dapat dihapus.");

  await deleteSurat(villageId, id);
}

/** Ajukan konsep ke antrean verifikasi (operator → sekdes → kades). */
export async function ajukanVerifikasiSuratData(
  id: number,
  konfirmasiSyarat = false,
): Promise<void> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "draft") throw conflict("Hanya konsep surat yang dapat diajukan.");

  // Penegakan syarat jalur operator: bila jenis surat ini menuntut syarat,
  // pengajuan harus diikuti konfirmasi kelengkapan dari pencetus (lihat
  // `butuhKonfirmasiSyarat`). Tanpa ini surat bisa terbit walau dokumen
  // persyaratannya belum lengkap.
  const jenis = await getJenisSurat(villageId, surat.typeId);
  const jumlahSyarat = jenis === null ? 0 : parseSyaratIds(jenis.syaratSurat).length;
  if (butuhKonfirmasiSyarat(jumlahSyarat) && !konfirmasiSyarat) {
    throw validationError("Tandai kelengkapan syarat surat sebelum mengajukan verifikasi.");
  }

  await updateSuratVerification(villageId, id, {
    status: "verifikasi",
    verifikasiOperator: null,
    verifikasiSekdes: null,
    verifikasiKades: null,
    logVerifikasi: "diajukan",
    catatanVerifikasi: null,
  });
}

async function nomorUrutBerikutnya(
  mode: PenomoranSuratMode,
  villageId: number,
  jenis: JenisSuratDTO,
  year: number,
): Promise<number> {
  switch (mode) {
    case 1:
      return nextSuratSequenceGlobal(villageId, year);
    case 3:
      return nextSuratSequenceCombined(villageId, year);
    case 4:
      if (jenis.classificationId === null) {
        throw conflict(
          "Mode penomoran 4 memerlukan klasifikasi surat. Atur klasifikasi jenis surat terlebih dahulu.",
        );
      }
      return nextSuratSequenceByKlasifikasi(villageId, jenis.classificationId, year);
    default:
      return nextSuratSequence(villageId, jenis.id, year);
  }
}

async function nomorSudahDipakai(
  mode: PenomoranSuratMode,
  villageId: number,
  candidate: string,
): Promise<boolean> {
  return mode === 3
    ? suratNumberExistsWithAgenda(villageId, candidate)
    : suratNumberExists(villageId, candidate);
}

/**
 * Terbitkan surat setelah tahap Kades disetujui.
 *
 * Nomor baru diberikan pada tahap akhir agar surat yang ditolak tidak
 * menghabiskan nomor urut.
 */
async function terbitkanSurat(
  villageId: number,
  surat: SuratDetail,
  desa: IdentitasDesa,
): Promise<{ number: string; verificationToken: string }> {
  const jenis = await loadJenis(villageId, surat.typeId);
  const penduduk = surat.residentId
    ? await getPendudukSuratData(villageId, surat.residentId)
    : null;
  if (jenis.requiresResident && !penduduk) {
    throw conflict("Surat ini membutuhkan data penduduk yang valid.");
  }

  const anggotaKeluarga = await loadAnggotaKeluarga(villageId, penduduk);
  const letterDate = surat.letterDate ?? "-";
  const year = Number(letterDate.slice(0, 4));
  const month = Number(letterDate.slice(5, 7));
  const mode = normalizePenomoranMode(desa.penomoranSurat);
  const format = jenis.numberFormat || DEFAULT_NUMBER_FORMAT;

  let sequence = await nomorUrutBerikutnya(mode, villageId, jenis, year);
  let number = "";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = buildSuratNumber(format, {
      sequence,
      kodeSurat: jenis.code,
      kodeDesa: desa.kodeDesa ?? "",
      year,
      month,
    });

    if (!(await nomorSudahDipakai(mode, villageId, candidate))) {
      number = candidate;
      break;
    }
    sequence += 1;
  }

  if (number === "") throw conflict("Gagal menentukan nomor surat. Coba lagi.");

  const values = buildValues(surat, jenis, desa, penduduk, anggotaKeluarga, number);
  const content = isiTerbilangDanHitung(renderSuratTemplate(jenis.templateBody, values), values);

  // Token verifikasi publik: token mentah dipakai untuk tautan/QR dan
  // disimpan agar bisa dicetak ulang; hash dipakai sebagai kunci pencarian.
  // Surat lama yang sudah terbit tanpa token tetap valid — token hanya
  // dihasilkan saat penerbitan baru.
  const { token, hash } = await generateVerificationToken();

  await issueSuratRecord(villageId, surat.id, {
    number,
    sequence,
    content,
    issuedAt: new Date(),
    logVerifikasi: "kades",
    verificationToken: token,
    verificationTokenHash: hash,
  });

  return { number, verificationToken: token };
}

/**
 * Verifikasi berjenjang pra-terbit: operator → sekdes → kades.
 *
 * Tahap Kades sekaligus menerbitkan surat dan memberi nomor. Role yang tidak
 * sesuai tahap ditolak, begitu pula upaya melompati urutan.
 */
export async function verifySuratData(
  id: number,
  step: VerificationStep,
): Promise<{ number: string | null; verificationToken: string | null }> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "verifikasi") {
    throw conflict("Surat belum diajukan untuk verifikasi.");
  }

  const role = user.roleId === null ? null : await findRoleById(user.roleId);
  if (!roleCanVerifyStep(step, role?.slug ?? null, user.permissions.isSuperadmin)) {
    throw forbidden(`Tahap ${VERIFICATION_STEP_LABELS[step]} bukan wewenang role Anda.`);
  }

  if (!canVerifyStep(surat, step)) {
    const next = nextVerificationStep(surat);
    throw conflict(
      next
        ? `Verifikasi harus berurutan. Tahap berikutnya: ${VERIFICATION_STEP_LABELS[next]}.`
        : "Surat ini sudah selesai diverifikasi.",
    );
  }

  if (step === "operator") {
    await updateSuratVerification(villageId, id, {
      verifikasiOperator: true,
      logVerifikasi: "operator",
      status: "verifikasi",
    });
    return { number: null, verificationToken: null };
  }

  if (step === "sekdes") {
    await updateSuratVerification(villageId, id, {
      verifikasiSekdes: true,
      logVerifikasi: "sekdes",
      status: "verifikasi",
    });
    return { number: null, verificationToken: null };
  }

  const desa = await getIdentitasDesa(villageId);
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");
  const { number, verificationToken } = await terbitkanSurat(villageId, surat, desa);

  // Permohonan warga yang terhubung menjadi "Siap Diambil" begitu surat terbit.
  await sinkronStatusSuratPermohonan(villageId, id, 3);

  return { number, verificationToken };
}

export async function rejectSuratData(id: number, reason: string): Promise<void> {
  const user = await requirePermission(SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");
  if (surat.status !== "verifikasi") {
    throw conflict("Hanya surat yang sedang menunggu verifikasi yang bisa ditolak.");
  }
  if (!reason?.trim()) throw conflict("Alasan penolakan wajib diisi.");

  await rejectSurat(villageId, id, reason.trim());

  // Surat yang ditolak membuat permohonan terkait ikut dibatalkan dengan alasan.
  await sinkronStatusSuratPermohonan(villageId, id, 5, reason.trim());
}

/** Susun data cetak/PDF untuk desa & surat tertentu (tanpa cek izin). */
async function loadSuratPrintData(villageId: number, id: number): Promise<SuratPrintData> {
  const surat = await getSurat(villageId, id);
  if (!surat) throw notFound("Surat tidak ditemukan.");

  const jenis = await getJenisSurat(villageId, surat.typeId);
  if (!jenis) throw notFound("Jenis surat tidak ditemukan.");

  const desa = await getIdentitasDesa(villageId);
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");

  const penduduk = surat.residentId
    ? await getPendudukSuratData(villageId, surat.residentId)
    : null;
  const anggotaKeluarga = await loadAnggotaKeluarga(villageId, penduduk);

  const values = buildValues(
    surat,
    jenis,
    desa,
    penduduk,
    anggotaKeluarga,
    surat.number ?? "KONSEP",
  );
  const content =
    surat.content ?? isiTerbilangDanHitung(renderSuratTemplate(jenis.templateBody, values), values);

  return { surat, jenis, desa, penduduk, content };
}

/** Data lengkap untuk halaman cetak & PDF (konsep memakai render sementara). */
export async function getSuratPrintData(id: number): Promise<SuratPrintData> {
  const user = await requirePermission(SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return loadSuratPrintData(villageId, id);
}

/**
 * Data cetak untuk warga pemilik surat.
 *
 * Hanya surat yang `residentId`-nya sama dengan sesi yang boleh dibaca. Surat
 * yang belum terbit (draft/verifikasi) tidak ditampilkan sebagai dokumen warga.
 */
export async function getSuratPrintDataWarga(id: number): Promise<SuratPrintData> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const data = await loadSuratPrintData(villageId, id);

  if (data.surat.residentId !== user.residentId) {
    throw notFound("Surat tidak ditemukan.");
  }

  if (data.surat.status !== "issued") {
    throw notFound("Surat belum terbit.");
  }

  return data;
}
