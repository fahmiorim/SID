import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function PengaturanDesaPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.identitasDesa}
      title="Identitas Desa"
      description="Ubah identitas, alamat, kontak, dan logo desa."
    >
      <ModulePlaceholder
        title="Identitas Desa"
        description="Ubah identitas, alamat, kontak, dan logo desa."
      />
    </ModuleGuard>
  );
}
