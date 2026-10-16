import "server-only";

import { eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { grupAkses, settingModul, userGrup } from "@/db/schema";

/** Representasi ringkas sebuah role (`user_grup`). */
export interface RoleRecord {
  id: number;
  slug: string;
  nama: string;
  jenis: number;
}

/** Representasi sebuah modul/resource (`setting_modul`). */
export interface ModuleRecord {
  id: number;
  parent: number | null;
  slug: string;
  modul: string;
  url: string | null;
  ikon: string | null;
  ikonKecil: string | null;
  urut: number | null;
  level: boolean;
  hidden: boolean;
  aktif: boolean;
}

const roleColumns = {
  id: userGrup.id,
  slug: userGrup.slug,
  nama: userGrup.nama,
  jenis: userGrup.jenis,
};

const moduleColumns = {
  id: settingModul.id,
  parent: settingModul.parent,
  slug: settingModul.slug,
  modul: settingModul.modul,
  url: settingModul.url,
  ikon: settingModul.ikon,
  ikonKecil: settingModul.ikonKecil,
  urut: settingModul.urut,
  level: settingModul.level,
  hidden: settingModul.hidden,
  aktif: settingModul.aktif,
};

export async function findRoleById(roleId: number): Promise<RoleRecord | null> {
  const [row] = await db.select(roleColumns).from(userGrup).where(eq(userGrup.id, roleId)).limit(1);
  return row ?? null;
}

export async function listModules(configId: number | null): Promise<ModuleRecord[]> {
  return db
    .select(moduleColumns)
    .from(settingModul)
    .where(configId === null ? isNull(settingModul.configId) : eq(settingModul.configId, configId));
}

/** Kode akses per modul untuk sebuah role. */
export async function listAksesByRole(roleId: number): Promise<Map<number, number>> {
  const rows = await db
    .select({ idModul: grupAkses.idModul, akses: grupAkses.akses })
    .from(grupAkses)
    .where(eq(grupAkses.idGrup, roleId));

  return new Map(rows.map((row) => [row.idModul, row.akses ?? 0]));
}
