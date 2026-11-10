import type { Metadata } from "next";

import { agendaMendatang } from "@/features/agenda/application/agenda-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Agenda Kegiatan · ${desa.namaDesa ?? "Desa"}`,
    description: `Jadwal kegiatan ${desa.namaDesa ?? "desa"} yang dijadwalkan dalam waktu dekat.`,
  };
}

export default async function AgendaPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const agenda = await agendaMendatang(desa.id, 50);

  const Agenda = tema.agenda;

  return <Agenda ctx={ctx} agenda={agenda} />;
}
