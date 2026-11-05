import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getKeranjang } from "@/features/lapak/application/keranjang-use-cases";
import type { KeranjangItemDTO } from "@/features/lapak/domain/lapak-produk";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak Faktur",
  description: "Faktur belanja produk UMKM",
};

export default async function CetakFakturPage() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const cookieStore = await cookies();
  const sessionKey = cookieStore.get("lapak_session")?.value;

  let items: KeranjangItemDTO[] = [];
  if (sessionKey) {
    items = await getKeranjang(sessionKey, villageId);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted-foreground">Tekan Ctrl+P atau Cmd+P untuk mencetak.</p>
        <Button variant="outline" asChild>
          <Link href="/desa/lapak/keranjang">Kembali ke Keranjang</Link>
        </Button>
      </div>
      <FakturServer desaName={identitas?.namaDesa ?? "Desa"} items={items} />
    </div>
  );
}

function FakturServer({
  desaName,
  items,
}: {
  desaName: string;
  items: {
    id: number;
    produkNama: string;
    produkHarga: string;
    jumlah: number;
  }[];
}) {
  const grandTotal = items.reduce((sum, item) => sum + Number(item.produkHarga) * item.jumlah, 0);
  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print:print">
      <header className="mb-8 border-b-2 pb-4">
        <h1 className="text-2xl font-bold">Faktur Belanja</h1>
        <p className="text-muted-foreground">{desaName}</p>
        <p className="text-sm text-muted-foreground">{tanggal}</p>
      </header>

      {items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Keranjang Anda kosong.</p>
      ) : (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Produk</th>
                <th className="py-2 text-right">Harga</th>
                <th className="py-2 text-right">Jumlah</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-dashed">
                  <td className="py-2">{item.produkNama}</td>
                  <td className="py-2 text-right">
                    Rp {Number(item.produkHarga).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 text-right">{item.jumlah}</td>
                  <td className="py-2 text-right">
                    Rp {(Number(item.produkHarga) * item.jumlah).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>Terima kasih telah berbelanja di {desaName}.</p>
            <p className="mt-1">Faktur ini dicetak secara otomatis.</p>
          </footer>
        </>
      )}
    </div>
  );
}
