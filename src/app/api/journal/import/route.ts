import { getLocalAdminId } from "@/server/services/local-user.service";
import { importJournalWorkbook } from "@/server/services/journal.service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ message: "File Excel wajib dipilih" }, { status: 400 });
    const result = await importJournalWorkbook(Buffer.from(await file.arrayBuffer()), await getLocalAdminId(), file.name);
    return Response.json(result);
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "Import jurnal gagal" }, { status: 400 });
  }
}
