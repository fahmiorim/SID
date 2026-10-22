"use client";

import { Check, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { idleActionState } from "@/lib/action-state";

import { gantiTemaAction } from "../tema-actions";

export interface KartuTemaView {
  slug: string;
  nama: string;
  versi: string;
  deskripsi: string;
  warnaPratinjau: string;
  aktif: boolean;
}

/**
 * Pemilih tema aktif.
 *
 * Hanya tema yang terdaftar di `src/themes/registry.ts` yang ditampilkan;
 * menambah tema berarti menambah kode dan membangun ulang aplikasi, bukan
 * mengunggah berkas saat runtime.
 */
export function TemaSwitcher({
  daftar,
  canManage,
}: {
  daftar: KartuTemaView[];
  canManage: boolean;
}) {
  const [state, formAction, pending] = useActionState(gantiTemaAction, idleActionState);

  return (
    <div className="space-y-4">
      {state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {daftar.map((tema) => (
          <Card key={tema.slug} className={tema.aktif ? "ring-2 ring-primary" : undefined}>
            <CardHeader>
              <div
                className="mb-2 h-20 w-full rounded-md"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${tema.warnaPratinjau}, ${tema.warnaPratinjau}55)`,
                }}
                aria-hidden
              />
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>{tema.nama}</span>
                {tema.aktif ? (
                  <Badge className="gap-1">
                    <Check className="size-3" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary">v{tema.versi}</Badge>
                )}
              </CardTitle>
              <CardDescription>{tema.deskripsi}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                <input type="hidden" name="slug" value={tema.slug} />
                <Button
                  type="submit"
                  variant={tema.aktif ? "secondary" : "default"}
                  disabled={!canManage || tema.aktif || pending}
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {tema.aktif ? "Sedang dipakai" : "Pakai tema ini"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
}
