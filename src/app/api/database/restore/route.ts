import { pulihkanBackupSql } from "@/features/database/application/database-use-cases";
import { isAllowedSqlFile } from "@/features/database/domain/database";

function isAppErrorWithStatus(error: unknown): error is Error & { status: number } {
  return error instanceof Error && typeof (error as { status?: number }).status === "number";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("berkas");
    const konfirmasi = formData.get("konfirmasi") === "1";

    if (!(file instanceof File)) {
      return new Response("Berkas backup wajib diunggah.", { status: 400 });
    }
    if (!isAllowedSqlFile(file.name)) {
      return new Response("Hanya berkas .sql atau .sql.gz yang diizinkan.", { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await pulihkanBackupSql({
      filename: file.name,
      size: buffer.length,
      buffer,
      konfirmasi,
    });
    return new Response(null, {
      status: 303,
      headers: { Location: "/pengaturan/database?restored=1" },
    });
  } catch (error) {
    if (isAppErrorWithStatus(error) && error.status >= 400 && error.status < 600) {
      return new Response(error.message, { status: error.status });
    }
    console.error("Gagal merestore database:", error);
    return new Response("Gagal merestore database.", { status: 500 });
  }
}
