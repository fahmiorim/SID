import "server-only";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface HasilSms {
  sukses: boolean;
  dilewati: boolean;
  error?: string;
}

/** Kirim satu SMS; provider yang belum dikonfigurasi dicatat sebagai dilewati. */
export async function kirimSms(target: string, pesan: string): Promise<HasilSms> {
  const apiUrl = env.SMS_API_URL;
  const token = env.SMS_TOKEN;

  if (!apiUrl || !token) {
    logger.warn("[sms] SMS gateway belum dikonfigurasi; pesan dilewati.", { target });
    return { sukses: false, dilewati: true, error: "SMS gateway belum dikonfigurasi." };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: target, message: pesan }),
    });

    return {
      sukses: response.ok,
      dilewati: false,
      error: response.ok ? undefined : `Provider menolak: HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      sukses: false,
      dilewati: false,
      error: error instanceof Error ? error.message : "Kesalahan pengiriman SMS tidak diketahui.",
    };
  }
}
