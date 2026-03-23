import { db } from "@/lib/db";

export type ImportedCanvasGradeInfo = {
  grade: number | null;
  source: string;
};

export async function getImportedCanvasGradeMap() {
  const rows = await db.importedCanvasGrade.findMany();
  return new Map<number, ImportedCanvasGradeInfo>(
    rows.map((row) => [row.canvasCourseId, { grade: row.grade, source: row.source }])
  );
}
