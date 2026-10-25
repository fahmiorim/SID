"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import {
  getAccountLoginContext,
  touchLastLogin,
} from "@/features/auth/infrastructure/auth-repository";
import { signInSchema } from "@/features/auth/schemas";
import { errorState, toErrorState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

/** Validasi tujuan pengalihan agar hanya boleh path internal (cegah open redirect). */
function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const fallback = "/beranda";
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function getAuditRequestContext(requestHeaders: Headers): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ipAddress: requestHeaders.get("x-real-ip") ?? forwarded ?? null,
    userAgent: requestHeaders.get("user-agent"),
  };
}

/**
 * Masuk memakai username & kata sandi.
 *
 * Dipakai sebagai `<form action={signInAction}>` dengan `useActionState` pada
 * sisi klien; tetap berfungsi tanpa JavaScript (progressive enhancement).
 */
export async function signInAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  const requestHeaders = await headers();
  const auditRequest = getAuditRequestContext(requestHeaders);
  const requestedRedirect = safeRedirectTarget(formData.get("next"));

  let redirectTo = requestedRedirect;

  try {
    const result = await auth.api.signInUsername({
      body: { username: parsed.data.username, password: parsed.data.password },
    });

    const context = await getAccountLoginContext(result.user.id);
    if (!context?.active) {
      await recordAuditEvent({
        villageId: context?.villageId ?? null,
        actorId: result.user.id,
        event: AUDIT_EVENTS.loginFailure,
        resource: "auth",
        resourceId: result.user.id,
        ...auditRequest,
        details: { reason: "inactive_account" },
      });
      await auth.api.signOut({ headers: requestHeaders });
      return errorState("Akun Anda dinonaktifkan. Hubungi administrator.");
    }

    await touchLastLogin(result.user.id);
    await recordAuditEvent({
      villageId: context.villageId,
      actorId: result.user.id,
      event: AUDIT_EVENTS.loginSuccess,
      resource: "auth",
      resourceId: result.user.id,
      ...auditRequest,
    });

    if (context.residentId !== null) {
      // Akun warga tidak boleh diarahkan ke area admin, dan wajib mengganti
      // PIN sementara sebelum memakai layanan.
      if (context.mustChangePin) {
        redirectTo = "/layanan-mandiri/ubah-pin";
      } else if (!requestedRedirect.startsWith("/layanan-mandiri")) {
        redirectTo = "/layanan-mandiri/beranda";
      }
    } else if (requestedRedirect.startsWith("/layanan-mandiri")) {
      // Akun staf yang mencoba membuka area warga dikembalikan ke beranda.
      redirectTo = "/beranda";
    }
  } catch (error) {
    await recordAuditEvent({
      villageId: null,
      event: AUDIT_EVENTS.loginFailure,
      resource: "auth",
      ...auditRequest,
      details: {
        reason:
          error instanceof Error && error.name === "APIError"
            ? "invalid_credentials"
            : "system_error",
      },
    });
    logger.warn("Login gagal", { username: parsed.data.username });
    // better-auth melempar APIError untuk kredensial salah; jangan bocorkan detail.
    if (error instanceof Error && error.name === "APIError") {
      return errorState("Username atau NIK atau PIN salah.");
    }
    return toErrorState(error);
  }

  // `redirect` harus dipanggil di luar try/catch (ia melempar sinyal khusus).
  redirect(redirectTo);
}

/** Keluar dari sesi saat ini lalu kembali ke halaman masuk. */
export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/masuk");
}
