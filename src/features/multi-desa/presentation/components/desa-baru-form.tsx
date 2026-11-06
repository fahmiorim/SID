"use client";

import { Loader2, Plus } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { buatDesaAction } from "../actions";

const FIELDS = [
  { name: "name", label: "Nama desa", placeholder: "Desa Sukamaju", required: true },
  { name: "code", label: "Kode desa (10 digit)", placeholder: "3201012001", required: true },
  { name: "domain", label: "Domain publik (opsional)", placeholder: "desa-sukamaju.id" },
  { name: "district", label: "Kecamatan", placeholder: "Kecamatan Sukamaju" },
  { name: "regency", label: "Kabupaten/kota", placeholder: "Kabupaten Contoh" },
  { name: "province", label: "Provinsi", placeholder: "Jawa Barat" },
  { name: "headName", label: "Nama kepala desa", placeholder: "H. Ahmad" },
  {
    name: "adminName",
    label: "Nama admin desa",
    placeholder: "Administrator Desa",
    required: true,
  },
  {
    name: "adminUsername",
    label: "Username admin",
    placeholder: "admin.sukamaju",
    required: true,
  },
  {
    name: "adminEmail",
    label: "Email admin",
    placeholder: "admin@sukamaju.id",
    required: true,
    type: "email",
  },
  {
    name: "adminPassword",
    label: "Sandi admin",
    placeholder: "Minimal 8 karakter",
    required: true,
    type: "password",
  },
] as const;

type DesaBaruState = Awaited<ReturnType<typeof buatDesaAction>>;

/** State awal; didefinisikan di klien karena modul `"use server"` hanya boleh mengekspor fungsi async. */
const initialState: DesaBaruState = { status: "idle" };

export function DesaBaruForm() {
  const [state, formAction, pending] = useActionState(buatDesaAction, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const pesan = state.status === "idle" ? null : state.message;
  const sukses = state.status === "success";

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const errors = fieldErrors?.[field.name];
          const wajib = "required" in field ? field.required : false;
          return (
            <div key={field.name} className="space-y-1.5">
              <label htmlFor={`desa-${field.name}`} className="text-sm font-medium">
                {field.label}
                {wajib ? <span className="text-destructive"> *</span> : null}
              </label>
              <Input
                id={`desa-${field.name}`}
                name={field.name}
                placeholder={field.placeholder}
                required={wajib}
                type={"type" in field ? field.type : "text"}
                autoComplete="off"
                aria-invalid={errors ? true : undefined}
              />
              {errors?.length ? (
                <p className="text-xs text-destructive">{errors.join(", ")}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {pesan ? (
        <p className={sukses ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{pesan}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Buat desa
      </Button>
    </form>
  );
}
