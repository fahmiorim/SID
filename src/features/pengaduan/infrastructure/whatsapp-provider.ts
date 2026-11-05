import { eq } from "drizzle-orm";

import { db } from "@/db";
import { buktiPengirimanNotifikasi } from "@/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Provider notifikasi WhatsApp dengan bukti pengiriman ke provider (Fase 5 - OS-WEB-009).
 */

export interface WhatsAppDeliveryProof {
  sukses: boolean;
  metode: "whatsapp";
  target: string;
  responsProvider: unknown;
  pesanError?: string;
}

/**
 * Kirim notifikasi WhatsApp dan simpan bukti pengiriman ke provider.
 */
export async function sendWhatsAppWithProof(
  villageId: number,
  pengaduanId: number,
  telepon: string,
  message: string,
): Promise<WhatsAppDeliveryProof> {
  const apiUrl = env.WHATSAPP_API_URL;
  const token = env.WHATSAPP_TOKEN;

  if (!apiUrl || !token) {
    logger.warn(
      `[whatsapp] Konfigurasi WhatsApp API tidak lengkap; pengiriman untuk pengaduan ${pengaduanId} dilewati.`,
      {},
    );
    return {
      sukses: false,
      metode: "whatsapp",
      target: telepon,
      responsProvider: null,
      pesanError: "Konfigurasi WhatsApp API belum lengkap.",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: telepon, message }),
    });

    const result = (await response.json().catch(() => null)) as unknown;

    // Simpan bukti pengiriman ke database
    await db.insert(buktiPengirimanNotifikasi).values({
      villageId,
      pengaduanId,
      metode: "whatsapp",
      target: telepon,
      responsProvider: JSON.stringify(result),
      sukses: response.ok,
      pesanError: response.ok ? undefined : `HTTP ${response.status}`,
    });

    if (!response.ok) {
      logger.warn(`[whatsapp] Provider WhatsApp menolak pesan untuk pengaduan ${pengaduanId}.`, {
        status: response.status,
      });
      return {
        sukses: false,
        metode: "whatsapp",
        target: telepon,
        responsProvider: result,
        pesanError: `Provider menolak: HTTP ${response.status}`,
      };
    }

    logger.info(`[whatsapp] Pesan WhatsApp pengaduan ${pengaduanId} berhasil dikirim.`, {});
    return {
      sukses: true,
      metode: "whatsapp",
      target: telepon,
      responsProvider: result,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kesalahan pengiriman WhatsApp tidak diketahui.";
    logger.warn(`[whatsapp] Gagal menghubungi provider WhatsApp untuk pengaduan ${pengaduanId}.`, {
      error: message,
    });

    // Simpan bukti kegagalan
    await db.insert(buktiPengirimanNotifikasi).values({
      villageId,
      pengaduanId,
      metode: "whatsapp",
      target: telepon,
      responsProvider: null,
      sukses: false,
      pesanError: message,
    });

    return {
      sukses: false,
      metode: "whatsapp",
      target: telepon,
      responsProvider: null,
      pesanError: message,
    };
  }
}

/**
 * Ambil daftar bukti pengiriman notifikasi untuk satu pengaduan.
 */
export async function getBuktiPengirimanPengaduan(
  villageId: number,
  pengaduanId: number,
): Promise<
  {
    metode: string;
    target: string;
    sukses: boolean;
    createdAt: Date;
  }[]
> {
  const rows = await db
    .select({
      metode: buktiPengirimanNotifikasi.metode,
      target: buktiPengirimanNotifikasi.target,
      sukses: buktiPengirimanNotifikasi.sukses,
      createdAt: buktiPengirimanNotifikasi.createdAt,
    })
    .from(buktiPengirimanNotifikasi)
    .where(eq(buktiPengirimanNotifikasi.pengaduanId, pengaduanId))
    .orderBy(buktiPengirimanNotifikasi.createdAt);

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
  }));
}
