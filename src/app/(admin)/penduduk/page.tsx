import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function PendudukPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.penduduk}
      title="Data Penduduk"
      description="Daftar penduduk terdaftar pada desa ini."
    >
      <ModulePlaceholder
        title="Data Penduduk"
        description="Daftar penduduk terdaftar pada desa ini."
      />
    </ModuleGuard>
  );
}
