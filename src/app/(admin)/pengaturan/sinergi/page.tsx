import { redirect } from "next/navigation";

/** Rute lama; modul sinergi kini berada di area pemerintahan desa. */
export default function SinergiRedirectPage() {
  redirect("/desa/sinergi");
}
