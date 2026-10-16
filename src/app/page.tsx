import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";

/**
 * Halaman akar: arahkan ke beranda bila sudah masuk, atau ke halaman masuk.
 */
export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? "/beranda" : "/masuk");
}
