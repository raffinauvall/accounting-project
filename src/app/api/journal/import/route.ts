import { getSessionUser } from "@/server/services/auth.service";
import { importJournalWorkbook } from "@/server/services/journal.service";

export async function POST(request: Request) {
  const actor = await getSessionUser();
  if (!actor) return Response.json({ message: "Sesi tidak valid" }, { status: 401 });
  if (actor.role === "VIEWER") return Response.json({ message: "Pengguna hanya dapat melihat jurnal" }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Permintaan lintas situs ditolak" }, { status: 403 });
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ message: "File Excel wajib dipilih" }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".xlsx")) return Response.json({ message: "File harus berformat .xlsx" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return Response.json({ message: "Ukuran file maksimal 20 MB" }, { status: 413 });
    const result = await importJournalWorkbook(Buffer.from(await file.arrayBuffer()), actor.id, file.name);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "Import jurnal gagal" }, { status: 400 });
  }
}
