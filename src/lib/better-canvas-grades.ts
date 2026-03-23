import { db } from "@/lib/db";

export async function getBetterCanvasGrade(courseId: number | string) {
  const row = await db.importedCanvasGrade.findUnique({
    where: { canvasCourseId: Number(courseId) },
  });
  return row?.grade ?? null;
}
