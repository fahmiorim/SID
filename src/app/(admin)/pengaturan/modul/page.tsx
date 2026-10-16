import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function ModulPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.modul}
      title="Modul"
      description="Kelola katalog modul aplikasi."
    >
      <ModulePlaceholder title="Modul" description="Kelola katalog modul aplikasi." />
    </ModuleGuard>
  );
}
