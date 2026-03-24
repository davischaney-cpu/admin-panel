export type ImportedCanvasGradeInfo = {
  grade: number | null;
  source: string | null;
};

export async function getImportedCanvasGradeMap() {
  return new Map<number, ImportedCanvasGradeInfo>();
}
