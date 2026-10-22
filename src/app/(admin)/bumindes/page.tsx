import { redirect } from "next/navigation";

import { ensureBumindesBuku } from "@/features/bumindes/infrastructure/bumindes-repository";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";

export default async function BumindesRedirect() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  await ensureBumindesBuku(villageId);

  redirect("/bumindes/buku-administrasi");
}
