import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Array<{
      courseId?: string | number | null;
      grade?: string | null;
    }>;

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array." }, { status: 400 });
    }

    let imported = 0;

    for (const row of body) {
      const canvasCourseId = Number(row.courseId);
      if (!canvasCourseId || Number.isNaN(canvasCourseId)) continue;

      const normalized = typeof row.grade === "string"
        ? row.grade.replace(/%/g, "").trim()
        : null;

      const parsedGrade = normalized && normalized !== "--" ? Number(normalized) : null;

      await db.importedCanvasGrade.upsert({
        where: { canvasCourseId },
        update: {
          grade: parsedGrade,
          source: "better-canvas",
          importedAt: new Date(),
        },
        create: {
          canvasCourseId,
          grade: parsedGrade,
          source: "better-canvas",
          importedAt: new Date(),
        },
      });

      imported += 1;
    }

    return NextResponse.json({ ok: true, imported });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to import grades";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
