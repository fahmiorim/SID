import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { residents } from "@/db/schema/resident";
import { residentMutations } from "@/db/schema/resident-mutation";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import {
  catatDatangSchema,
  catatKelahiranSchema,
  catatKematianSchema,
  catatPerubahanSchema,
  catatPindahKeluarSchema,
  type CatatDatangInput,
  type CatatKelahiranInput,
  type CatatKematianInput,
  type CatatPerubahanInput,
  type CatatPindahKeluarInput,
  type ListRiwayatParams,
  type ListRiwayatResult,
} from "@/features/penduduk/domain/riwayat-penduduk";
import {
  findPendudukById,
  nationalIdExists,
} from "@/features/penduduk/infrastructure/penduduk-repository";
import {
  getRiwayatByResident,
  listRiwayatPenduduk,
  listRiwayatPendudukExport,
} from "@/features/penduduk/infrastructure/riwayat-penduduk-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

export async function listRiwayat(params: ListRiwayatParams): Promise<ListRiwayatResult> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listRiwayatPenduduk(villageId, params);
}

export async function listRiwayatExport(params: ListRiwayatParams) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listRiwayatPendudukExport(villageId, params);
}

export async function getRiwayatByPendudukId(residentId: number) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return getRiwayatByResident(villageId, residentId);
}

export async function catatKelahiran(input: CatatKelahiranInput, actorId?: string | null) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parsed = catatKelahiranSchema.parse(input);

  const nid = parsed.nationalId;
  if (nid && (await nationalIdExists(villageId, nid, null))) {
    throw conflict("NIK sudah terdaftar di desa ini.");
  }

  const meta = {
    fatherName: parsed.fatherName || null,
    motherName: parsed.motherName || null,
  };

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(residents)
      .values({
        villageId,
        familyId: parsed.familyId ?? null,
        regionId: parsed.regionId ?? null,
        nationalId: nid,
        name: parsed.name.trim(),
        gender: parsed.gender === "male" || parsed.gender === "female" ? parsed.gender : "male",
        birthDate: parsed.eventDate,
        birthPlace: null,
        address: parsed.address || null,
        phone: null,
        fatherName: parsed.fatherName || null,
        motherName: parsed.motherName || null,
        fatherNationalId: null,
        motherNationalId: null,
        lifeStatus: "alive",
        residenceStatus: "permanent",
        familyRelationId: null,
        religionId: null,
        maritalStatusId: null,
        educationId: null,
        educationSedangId: null,
        occupationId: null,
        citizenshipId: null,
        bloodTypeId: null,
        rtmId: null,
        rtmLevel: null,
      })
      .$returningId();

    if (!inserted) throw new Error("Gagal menyimpan data penduduk.");
    const residentId = inserted.id;

    await tx.insert(residentMutations).values({
      villageId,
      residentId,
      type: "birth",
      eventDate: parsed.eventDate,
      reportedAt: new Date(),
      actorId: actorId ?? user.id,
      reason: parsed.reason || null,
      notes: parsed.notes || null,
      referenceNo: parsed.referenceNo || null,
      meta,
    });

    return { id: residentId };
  });

  return result;
}

export async function catatKematian(input: CatatKematianInput, actorId?: string | null) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parsed = catatKematianSchema.parse(input);

  const penduduk = await findPendudukById(villageId, parsed.residentId);
  if (!penduduk) throw notFound("Data penduduk tidak ditemukan.");

  if (penduduk.lifeStatus === "deceased") {
    throw conflict("Penduduk ini sudah tercatat meninggal.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(residents)
      .set({ lifeStatus: "deceased", updatedAt: new Date() })
      .where(and(eq(residents.id, parsed.residentId), eq(residents.villageId, villageId)));

    await tx.insert(residentMutations).values({
      villageId,
      residentId: parsed.residentId,
      type: "death",
      eventDate: parsed.eventDate,
      reportedAt: new Date(),
      actorId: actorId ?? user.id,
      reason: parsed.reason || null,
      notes: parsed.notes || null,
      referenceNo: parsed.referenceNo || null,
      meta: null,
    });
  });
}

export async function catatPindahKeluar(input: CatatPindahKeluarInput, actorId?: string | null) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parsed = catatPindahKeluarSchema.parse(input);

  const penduduk = await findPendudukById(villageId, parsed.residentId);
  if (!penduduk) throw notFound("Data penduduk tidak ditemukan.");

  if (penduduk.lifeStatus === "moved") {
    throw conflict("Penduduk ini sudah tercatat pindah keluar.");
  }

  const meta = { destination: parsed.destination || null };

  await db.transaction(async (tx) => {
    await tx
      .update(residents)
      .set({ lifeStatus: "moved", updatedAt: new Date() })
      .where(and(eq(residents.id, parsed.residentId), eq(residents.villageId, villageId)));

    await tx.insert(residentMutations).values({
      villageId,
      residentId: parsed.residentId,
      type: "move_out",
      eventDate: parsed.eventDate,
      reportedAt: new Date(),
      actorId: actorId ?? user.id,
      reason: parsed.reason || null,
      notes: parsed.notes || null,
      referenceNo: parsed.referenceNo || null,
      toAddress: parsed.toAddress || null,
      meta,
    });
  });
}

export async function catatPerubahan(input: CatatPerubahanInput, actorId?: string | null) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parsed = catatPerubahanSchema.parse(input);

  if (parsed.lifeStatus === "deceased" || parsed.lifeStatus === "moved") {
    throw conflict("Gunakan pencatatan kematian atau pindah keluar untuk status tersebut.");
  }

  const penduduk = await findPendudukById(villageId, parsed.residentId);
  if (!penduduk) throw notFound("Data penduduk tidak ditemukan.");
  if (penduduk.lifeStatus === parsed.lifeStatus) {
    throw conflict("Status kependudukan tidak berubah.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(residents)
      .set({ lifeStatus: parsed.lifeStatus, updatedAt: new Date() })
      .where(and(eq(residents.id, parsed.residentId), eq(residents.villageId, villageId)));

    await tx.insert(residentMutations).values({
      villageId,
      residentId: parsed.residentId,
      type: "change",
      eventDate: parsed.eventDate,
      reportedAt: new Date(),
      actorId: actorId ?? user.id,
      reason: parsed.reason || null,
      notes: parsed.notes || null,
      referenceNo: parsed.referenceNo || null,
      meta: { fromLifeStatus: penduduk.lifeStatus, toLifeStatus: parsed.lifeStatus },
    });
  });
}

export async function catatDatang(input: CatatDatangInput, actorId?: string | null) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parsed = catatDatangSchema.parse(input);

  const nid = parsed.nationalId;
  if (nid && (await nationalIdExists(villageId, nid, null))) {
    throw conflict("NIK sudah terdaftar di desa ini.");
  }

  const meta = { fromAddress: parsed.fromAddress || null };

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(residents)
      .values({
        villageId,
        familyId: parsed.familyId ?? null,
        regionId: parsed.regionId ?? null,
        nationalId: nid,
        name: parsed.name.trim(),
        gender: parsed.gender === "male" || parsed.gender === "female" ? parsed.gender : "male",
        birthDate: parsed.birthDate,
        birthPlace: parsed.birthPlace || null,
        address: parsed.address || null,
        phone: null,
        fatherName: null,
        motherName: null,
        fatherNationalId: null,
        motherNationalId: null,
        lifeStatus: "alive",
        residenceStatus: "permanent",
        familyRelationId: null,
        religionId: null,
        maritalStatusId: null,
        educationId: null,
        educationSedangId: null,
        occupationId: null,
        citizenshipId: null,
        bloodTypeId: null,
        rtmId: null,
        rtmLevel: null,
      })
      .$returningId();

    if (!inserted) throw new Error("Gagal menyimpan data penduduk.");
    const residentId = inserted.id;

    await tx.insert(residentMutations).values({
      villageId,
      residentId,
      type: "move_in",
      eventDate: parsed.eventDate,
      reportedAt: new Date(),
      actorId: actorId ?? user.id,
      reason: parsed.reason || null,
      notes: parsed.notes || null,
      referenceNo: parsed.referenceNo || null,
      fromAddress: parsed.fromAddress || null,
      meta,
    });

    return { id: residentId };
  });

  return result;
}
