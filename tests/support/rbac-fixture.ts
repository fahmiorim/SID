import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

/**
 * Salin katalog modul desa sumber ke desa fixture beserta izin milik satu role.
 *
 * Fixture E2E membuat desa terpisah agar datanya terisolasi, tetapi `modules` /
 * `role_permissions` hanya di-seed untuk desa utama. Tanpa salinan ini pengguna
 * fixture tidak punya menu dan seluruh aksi RBAC ditolak.
 */
export async function salinModulDesa(
  pool: Pool,
  desaId: number,
  sumberDesaId: number,
  roleId: number,
): Promise<void> {
  const [modul] = await pool.query<RowDataPacket[]>(
    "SELECT id, slug, name, url, icon, is_group, is_hidden, is_active, sort_order FROM modules WHERE village_id = ? ORDER BY id",
    [sumberDesaId],
  );

  const peta = new Map<number, number>();
  for (const item of modul) {
    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO modules
         (village_id, slug, name, url, icon, is_group, is_hidden, is_active, sort_order, parent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        desaId,
        item.slug,
        item.name,
        item.url,
        item.icon ?? "",
        item.is_group,
        item.is_hidden,
        item.is_active,
        item.sort_order ?? 0,
      ],
    );
    peta.set(Number(item.id), hasil.insertId);
  }

  const [induk] = await pool.query<RowDataPacket[]>(
    "SELECT id, parent_id FROM modules WHERE village_id = ?",
    [sumberDesaId],
  );
  for (const item of induk) {
    const baru = peta.get(Number(item.id));
    if (!baru) continue;
    const indukBaru = item.parent_id ? (peta.get(Number(item.parent_id)) ?? 0) : 0;
    if (indukBaru !== 0) {
      await pool.execute("UPDATE modules SET parent_id = ? WHERE id = ?", [indukBaru, baru]);
    }
  }

  const [izin] = await pool.query<RowDataPacket[]>(
    "SELECT module_id, access FROM role_permissions WHERE role_id = ?",
    [roleId],
  );
  for (const item of izin) {
    const modulBaru = peta.get(Number(item.module_id));
    if (!modulBaru) continue;
    await pool.execute(
      "INSERT INTO role_permissions (role_id, module_id, access) VALUES (?, ?, ?)",
      [roleId, modulBaru, item.access],
    );
  }
}
