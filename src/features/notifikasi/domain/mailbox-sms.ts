import { z } from "zod";

/** Payload webhook email masuk (disederhanakan agar kompatibel banyak provider). */
export const pesanEmailMasukSchema = z.object({
  from: z.email("Alamat pengirim email tidak valid."),
  subject: z.string().trim().max(255).optional().default(""),
  text: z.string().trim().min(1, "Isi email wajib ada.").max(10_000),
});

/** Payload webhook SMS masuk. */
export const pesanSmsMasukSchema = z.object({
  from: z.string().trim().min(5, "Nomor pengirim tidak valid.").max(30),
  message: z.string().trim().min(1, "Isi SMS wajib ada.").max(2_000),
  id: z.string().trim().max(100).optional(),
});

/** Balasan manual dari operator. */
export const balasPesanSchema = z.object({
  isi: z
    .string()
    .trim()
    .min(1, "Balasan wajib diisi.")
    .max(2_000, "Balasan maksimal 2000 karakter."),
});

export type PesanEmailMasuk = z.infer<typeof pesanEmailMasukSchema>;
export type PesanSmsMasuk = z.infer<typeof pesanSmsMasukSchema>;

/** Normalisasi nomor SMS Indonesia: buang non-digit, `62`/`8` menjadi `0`. */
export function normalisasiNomorSms(nomor: string): string {
  const digit = nomor.replace(/\D/g, "");
  if (digit.startsWith("62")) return `0${digit.slice(2)}`;
  if (digit.startsWith("8")) return `0${digit}`;
  return digit;
}

export interface BarisPercakapan {
  nomor: string;
  createdAt: Date;
  arah: string;
  dibaca: boolean;
}

export interface PercakapanSms<T extends BarisPercakapan> {
  nomor: string;
  pesan: T[];
  belumDibaca: number;
  terakhir: Date;
}

/**
 * Kelompokkan pesan SMS per nomor, urut percakapan terbaru lebih dulu dan isi
 * percakapan dari yang terlama. Fungsi murni agar tampilan mudah diuji.
 */
export function susunPercakapanSms<T extends BarisPercakapan>(
  rows: readonly T[],
): PercakapanSms<T>[] {
  const peta = new Map<string, T[]>();

  for (const row of rows) {
    const nomor = normalisasiNomorSms(row.nomor);
    const daftar = peta.get(nomor);
    if (daftar) daftar.push(row);
    else peta.set(nomor, [row]);
  }

  return [...peta.entries()]
    .map(([nomor, pesan]) => {
      const terurut = [...pesan].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const terakhir = terurut[terurut.length - 1]?.createdAt ?? new Date(0);
      return {
        nomor,
        pesan: terurut,
        belumDibaca: terurut.filter((item) => item.arah === "masuk" && !item.dibaca).length,
        terakhir,
      };
    })
    .sort((a, b) => new Date(b.terakhir).getTime() - new Date(a.terakhir).getTime());
}

/** Bandingkan token webhook dengan aman terhadap timing attack. */
export function tokenWebhookValid(
  diberikan: string | null,
  diharapkan: string | undefined,
): boolean {
  if (!diharapkan || !diberikan) return false;
  const a = Buffer.from(diberikan);
  const b = Buffer.from(diharapkan);
  if (a.length !== b.length) return false;

  let hasil = 0;
  for (let i = 0; i < a.length; i += 1) hasil |= a.readUInt8(i) ^ b.readUInt8(i);
  return hasil === 0;
}
