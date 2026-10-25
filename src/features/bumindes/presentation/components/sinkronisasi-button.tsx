"use client";

import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { sinkronisasiBumindesAction } from "../actions";

export function SinkronisasiButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await sinkronisasiBumindesAction();
          if (result.status === "success") toast.success(result.message);
          else if (result.status === "error") toast.error(result.message);
        });
      }}
    >
      <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
      Sinkronisasi dari Penduduk
    </Button>
  );
}
