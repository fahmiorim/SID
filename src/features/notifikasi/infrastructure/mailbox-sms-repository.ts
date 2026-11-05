import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { mailboxPesan, smsPesan } from "@/db/schema/mailbox-sms";

export interface BarisMailbox {
  id: number;
  arah: string;
  alamat: string;
  subjek: string | null;
  isi: string;
  dibaca: boolean;
  createdAt: Date;
}

export interface BarisSms {
  id: number;
  arah: string;
  nomor: string;
  isi: string;
  status: string;
  dibaca: boolean;
  createdAt: Date;
}

export async function listMailbox(villageId: number, limit = 50): Promise<BarisMailbox[]> {
  return db
    .select({
      id: mailboxPesan.id,
      arah: mailboxPesan.arah,
      alamat: mailboxPesan.alamat,
      subjek: mailboxPesan.subjek,
      isi: mailboxPesan.isi,
      dibaca: mailboxPesan.dibaca,
      createdAt: mailboxPesan.createdAt,
    })
    .from(mailboxPesan)
    .where(eq(mailboxPesan.villageId, villageId))
    .orderBy(desc(mailboxPesan.createdAt), desc(mailboxPesan.id))
    .limit(limit);
}

export async function cariMailbox(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(mailboxPesan)
    .where(and(eq(mailboxPesan.villageId, villageId), eq(mailboxPesan.id, id)))
    .limit(1);

  return row ?? null;
}

export async function tambahMailbox(input: {
  villageId: number;
  arah: "masuk" | "keluar";
  alamat: string;
  subjek?: string | null;
  isi: string;
}): Promise<void> {
  await db.insert(mailboxPesan).values({
    villageId: input.villageId,
    arah: input.arah,
    alamat: input.alamat,
    subjek: input.subjek ?? null,
    isi: input.isi,
    dibaca: input.arah === "keluar",
  });
}

export async function tandaiMailboxDibaca(villageId: number, id: number): Promise<void> {
  await db
    .update(mailboxPesan)
    .set({ dibaca: true })
    .where(and(eq(mailboxPesan.villageId, villageId), eq(mailboxPesan.id, id)));
}

export async function listSms(villageId: number, limit = 200): Promise<BarisSms[]> {
  return db
    .select({
      id: smsPesan.id,
      arah: smsPesan.arah,
      nomor: smsPesan.nomor,
      isi: smsPesan.isi,
      status: smsPesan.status,
      dibaca: smsPesan.dibaca,
      createdAt: smsPesan.createdAt,
    })
    .from(smsPesan)
    .where(eq(smsPesan.villageId, villageId))
    .orderBy(desc(smsPesan.createdAt), desc(smsPesan.id))
    .limit(limit);
}

export async function tambahSms(input: {
  villageId: number;
  arah: "masuk" | "keluar";
  nomor: string;
  isi: string;
  providerId?: string | null;
  status?: string;
}): Promise<void> {
  await db.insert(smsPesan).values({
    villageId: input.villageId,
    arah: input.arah,
    nomor: input.nomor,
    isi: input.isi,
    providerId: input.providerId ?? null,
    status: input.status ?? "diterima",
    dibaca: input.arah === "keluar",
  });
}

export async function tandaiSmsNomorDibaca(villageId: number, nomor: string): Promise<void> {
  await db
    .update(smsPesan)
    .set({ dibaca: true })
    .where(
      and(eq(smsPesan.villageId, villageId), eq(smsPesan.nomor, nomor), eq(smsPesan.arah, "masuk")),
    );
}
