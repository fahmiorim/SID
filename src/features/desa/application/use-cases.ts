import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { IDENTITAS_DESA_RESOURCE, type DesaFormInput } from "@/features/desa/domain/desa";
import {
  getIdentitasDesa,
  updateIdentitasDesa,
  type IdentitasDesa,
} from "@/features/desa/infrastructure/desa-repository";
import { requirePermission } from "@/lib/dal";
import { notFound } from "@/lib/errors";

export async function getIdentitas(): Promise<IdentitasDesa | null> {
  const user = await requirePermission(IDENTITAS_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return getIdentitasDesa(villageId);
}

export async function updateIdentitas(input: DesaFormInput): Promise<{ id: number }> {
  const user = await requirePermission(IDENTITAS_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const existing = await getIdentitasDesa(villageId);
  if (!existing) throw notFound("Identitas desa tidak ditemukan.");

  await updateIdentitasDesa(villageId, input);
  return { id: villageId };
}
