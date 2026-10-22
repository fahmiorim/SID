"use server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  listWidget,
  type WidgetRingkas,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";

export async function daftarWidget(): Promise<WidgetRingkas[]> {
  const user = await requirePermission("widget", "read");
  const villageId = await resolveVillageId(user);
  return listWidget(villageId) as unknown as WidgetRingkas[];
}
