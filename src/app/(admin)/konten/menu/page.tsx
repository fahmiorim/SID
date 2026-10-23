import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listMenu } from "@/features/konten/application/menu-use-cases";

export default async function MenuPage() {
  const menus = await listMenu({ search: "", status: "", page: 1 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Navigasi"
        description="Menu yang tampil pada navigasi situs publik desa."
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    Belum ada menu publik.
                  </TableCell>
                </TableRow>
              ) : (
                menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium">{menu.nama}</TableCell>
                    <TableCell>{menu.link}</TableCell>
                    <TableCell>{menu.linkTipe}</TableCell>
                    <TableCell>{menu.urut}</TableCell>
                    <TableCell>
                      <Badge variant={menu.aktif ? "secondary" : "outline"}>
                        {menu.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
