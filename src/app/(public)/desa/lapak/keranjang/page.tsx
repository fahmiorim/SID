import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getKeranjang } from "@/features/lapak/application/keranjang-use-cases";
import type { KeranjangItemDTO } from "@/features/lapak/domain/lapak-produk";
import KeranjangClient from "@/features/lapak/presentation/components/keranjang-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keranjang Belanja",
  description: "Keranjang belanja produk UMKM desa",
};

export default async function KeranjangPage() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const cookieStore = await cookies();
  const sessionKey = cookieStore.get("lapak_session")?.value;

  let items: KeranjangItemDTO[] = [];
  if (sessionKey) {
    items = await getKeranjang(sessionKey, villageId);
  }

  const namaDesa = identitas?.namaDesa ?? "Desa";

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <p className="text-sm text-muted-foreground">Produk dari {namaDesa}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/desa/lapak">Lihat Produk</Link>
          </Button>
          {items.length > 0 && (
            <Button asChild>
              <Link href="/desa/lapak/keranjang/cetak">Cetak Faktur</Link>
            </Button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keranjang Anda masih kosong.
          </CardContent>
        </Card>
      ) : (
        <KeranjangClient items={items} />
      )}
    </div>
  );
}
