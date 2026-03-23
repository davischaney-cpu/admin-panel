import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { importCanvasGradesFromBrowser } from "@/lib/canvas-grade-import";

export async function POST() {
  const { isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await importCanvasGradesFromBrowser();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Browser import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
