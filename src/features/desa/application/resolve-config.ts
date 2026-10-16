import "server-only";

import type { CurrentUser } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import { getIdentitas } from "./get-identitas";

/**
 * Tentukan `config_id` efektif untuk operasi tulis.
 *
 * Pada mode satu-desa, pengguna biasanya sudah membawa `configId`; bila belum
 * (mis. super admin tanpa penugasan desa), gunakan desa pertama yang ada.
 */
export async function resolveConfigId(user: CurrentUser): Promise<number> {
  if (user.configId !== null) return user.configId;

  const desa = await getIdentitas();
  if (!desa) throw notFound("Identitas desa belum dikonfigurasi.");

  return desa.id;
}
