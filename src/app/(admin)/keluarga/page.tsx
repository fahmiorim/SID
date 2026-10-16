import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function KeluargaPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.keluarga}
      title="Kartu Keluarga"
      description="Kelola data Kartu Keluarga (KK)."
    >
      <ModulePlaceholder title="Kartu Keluarga" description="Kelola data Kartu Keluarga (KK)." />
    </ModuleGuard>
  );
}
