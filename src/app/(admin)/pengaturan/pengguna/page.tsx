import { ModuleGuard } from "@/components/shared/module-guard";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { RESOURCES } from "@/features/rbac/domain/resources";

export default function PenggunaPage() {
  return (
    <ModuleGuard
      resource={RESOURCES.pengguna}
      title="Pengguna"
      description="Kelola akun pengguna dan penugasan grup."
    >
      <ModulePlaceholder title="Pengguna" description="Kelola akun pengguna dan penugasan grup." />
    </ModuleGuard>
  );
}
