import "server-only";

import type { CurrentUser } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import { getIdentitas } from "./get-identitas";

/**
 * Tentukan `village_id` efektif untuk operasi tulis.
 *
 * Pada mode satu-desa, pengguna biasanya sudah membawa `villageId`; bila belum
 * (mis. super admin tanpa penugasan desa), gunakan desa pertama yang ada.
 */
export async function resolveVillageId(user: CurrentUser): Promise<number> {
  if (user.villageId !== null) return user.villageId;

  const desa = await getIdentitas();
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");

  return desa.id;
}
