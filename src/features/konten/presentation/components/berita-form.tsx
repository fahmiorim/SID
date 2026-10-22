"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BeritaAdminDetail, KategoriBeritaOption } from "@/features/konten/domain/berita";
import { urlMedia } from "@/features/publik/domain/format";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { simpanBeritaAction } from "../actions";

interface BeritaFormProps {
  /** Kosong = mode tambah; terisi = mode ubah. */
  berita?: BeritaAdminDetail | null;
  kategori: KategoriBeritaOption[];
}

/** Tampilkan pesan kesalahan milik satu field. */
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

/** Form berita lengkap dengan pratinjau sampul dan pengaturan publikasi. */
export function BeritaForm({ berita, kategori }: BeritaFormProps) {
  const isEdit = Boolean(berita);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(simpanBeritaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const sampul = urlMedia(berita?.gambar);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/konten/berita");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {berita ? <input type="hidden" name="id" value={berita.id} /> : null}

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Isi Berita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul</Label>
                <Input
                  id="judul"
                  name="judul"
                  defaultValue={berita?.judul ?? ""}
                  maxLength={200}
                  aria-invalid={Boolean(fieldErrors?.judul)}
                />
                <FieldError messages={fieldErrors?.judul} />
                {berita ? (
                  <p className="text-xs text-muted-foreground">
                    Slug: <code>{berita.slug}</code> (dibentuk ulang bila judul berubah)
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Slug dibuat otomatis dari judul dan diunikan per desa.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ringkasan">Ringkasan</Label>
                <Textarea
                  id="ringkasan"
                  name="ringkasan"
                  defaultValue={berita?.ringkasan ?? ""}
                  maxLength={500}
                  rows={3}
                  aria-invalid={Boolean(fieldErrors?.ringkasan)}
                />
                <FieldError messages={fieldErrors?.ringkasan} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isi">Isi (HTML)</Label>
                <Textarea
                  id="isi"
                  name="isi"
                  defaultValue={berita?.isi ?? ""}
                  rows={18}
                  className="font-mono text-sm"
                  aria-invalid={Boolean(fieldErrors?.isi)}
                />
                <p className="text-xs text-muted-foreground">
                  Tag aman seperti paragraf, judul, daftar, tabel, tautan, dan gambar diizinkan.
                  Skrip dan atribut berbahaya dibuang saat disimpan.
                </p>
                <FieldError messages={fieldErrors?.isi} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="gambar">Sampul</Label>
                {sampul ? (
                  // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
                  <img
                    src={sampul}
                    alt="Sampul berita saat ini"
                    className="h-32 w-full max-w-sm rounded-lg border object-cover"
                  />
                ) : null}
                <Input
                  id="gambar"
                  name="gambar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  aria-invalid={Boolean(fieldErrors?.gambar)}
                />
                <p className="text-xs text-muted-foreground">
                  {sampul
                    ? "Pilih berkas baru untuk mengganti sampul."
                    : "JPG, PNG, WEBP, GIF, atau SVG maksimal 5 MB."}
                </p>
                <FieldError messages={fieldErrors?.gambar} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dokumen">Lampiran PDF</Label>
                {berita?.dokumen ? (
                  <p className="text-xs text-muted-foreground">
                    Lampiran saat ini: <code>{berita.dokumen}</code>
                  </p>
                ) : null}
                <Input
                  id="dokumen"
                  name="dokumen"
                  type="file"
                  accept="application/pdf"
                  aria-invalid={Boolean(fieldErrors?.dokumen)}
                />
                <FieldError messages={fieldErrors?.dokumen} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={berita?.status ?? "draft"}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draf (belum tampil)</SelectItem>
                    <SelectItem value="published">Terbit</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError messages={fieldErrors?.status} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terbitPada">Jadwal Terbit</Label>
                <Input
                  id="terbitPada"
                  name="terbitPada"
                  type="date"
                  defaultValue={berita?.terbitPada ?? ""}
                  aria-invalid={Boolean(fieldErrors?.terbitPada)}
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan untuk terbit sekarang saat status Terbit.
                </p>
                <FieldError messages={fieldErrors?.terbitPada} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategoriId">Kategori</Label>
                <Select
                  name="kategoriId"
                  defaultValue={berita?.kategoriId ? String(berita.kategoriId) : NO_SELECTION}
                >
                  <SelectTrigger id="kategoriId" className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>Tanpa kategori</SelectItem>
                    {kategori.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError messages={fieldErrors?.kategoriId} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Penempatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox name="headline" defaultChecked={berita?.headline ?? false} />
                <span>
                  Headline
                  <span className="block text-xs text-muted-foreground">
                    Tampil sebagai berita utama di beranda.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <Checkbox name="slider" defaultChecked={berita?.slider ?? false} />
                <span>
                  Sorotan beranda
                  <span className="block text-xs text-muted-foreground">
                    Ikut masuk area sorotan bila tema mendukung.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <Checkbox name="bolehKomentar" defaultChecked={berita?.bolehKomentar ?? true} />
                <span>
                  Izinkan komentar
                  <span className="block text-xs text-muted-foreground">
                    Fitur komentar menyusul; penanda disimpan sekarang.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Simpan berita"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/konten/berita">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
