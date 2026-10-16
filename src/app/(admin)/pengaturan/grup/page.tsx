import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function GrupAksesPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.grupAkses}
      title="Grup & Hak Akses"
      description="Atur peran dan matriks akses per modul."
    >
      <ModulePlaceholder
        title="Grup & Hak Akses"
        description="Atur peran dan matriks akses per modul."
      />
    </ModuleGuard>
  );
}
