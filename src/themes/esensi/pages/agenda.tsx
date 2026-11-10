import { CalendarDays, MapPin } from "lucide-react";

import { agendaLabelTanggal } from "@/features/agenda/domain/agenda";
import type { AgendaProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Agenda kegiatan desa yang ditayangkan pengelola. */
export function EsensiAgenda({ ctx, agenda }: AgendaProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Agenda Kegiatan"
        description={`Kegiatan ${ctx.desa.namaDesa ?? "desa"} yang dijadwalkan dalam waktu dekat.`}
      />

      {agenda.length === 0 ? (
        <ThemeEmpty>Belum ada agenda kegiatan yang dijadwalkan.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {agenda.map((item) => (
            <li key={item.id}>
              <ThemeCard className="h-full p-5">
                <article className="flex gap-4">
                  <div
                    className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--pub-primary) 10%, transparent)",
                      color: "var(--pub-primary-text)",
                    }}
                  >
                    <CalendarDays className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-[11px] font-semibold tracking-wide text-[var(--pub-primary-text)] uppercase">
                      {agendaLabelTanggal(item.mulai, item.selesai)}
                    </p>
                    <h2 className="text-base leading-snug font-semibold">{item.judul}</h2>
                    {item.lokasi ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        {item.lokasi}
                      </p>
                    ) : null}
                    {item.deskripsi ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {item.deskripsi}
                      </p>
                    ) : null}
                  </div>
                </article>
              </ThemeCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
