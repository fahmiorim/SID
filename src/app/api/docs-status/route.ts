import { createDocsStatus } from "@/lib/docs-status";

export async function GET() {
  return Response.json(createDocsStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
