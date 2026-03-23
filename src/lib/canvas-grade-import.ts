import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { db } from "@/lib/db";
import { fetchCanvasCourses, isAcademicCanvasCourse } from "@/lib/canvas";

const execFileAsync = promisify(execFile);
const scriptPath = path.join(process.cwd(), "scripts", "read_canvas_course_total.applescript");

export type ImportedCanvasGradeResult = {
  courseId: number;
  name: string;
  grade: number | null;
  url: string;
  title: string;
};

async function scrapeCanvasCourseTotal(courseId: number) {
  const courseUrl = `https://tvs.instructure.com/courses/${courseId}/grades`;
  const { stdout } = await execFileAsync("osascript", [scriptPath, courseUrl], {
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  });

  const parsed = JSON.parse(stdout.trim()) as {
    url: string;
    title: string;
    total: string | null;
  };

  const normalized = parsed.total?.trim() || null;
  const grade = normalized && normalized !== "-" ? Number(normalized) : null;

  return {
    grade: Number.isFinite(grade) ? grade : null,
    url: parsed.url,
    title: parsed.title,
  };
}

export async function importCanvasGradesFromBrowser() {
  const courses = (await fetchCanvasCourses()).filter((course) => isAcademicCanvasCourse(course));
  const results: ImportedCanvasGradeResult[] = [];

  for (const course of courses) {
    const scraped = await scrapeCanvasCourseTotal(course.id);

    await db.importedCanvasGrade.upsert({
      where: { canvasCourseId: course.id },
      update: {
        grade: scraped.grade,
        source: "canvas-grades-page",
        importedAt: new Date(),
      },
      create: {
        canvasCourseId: course.id,
        grade: scraped.grade,
        source: "canvas-grades-page",
        importedAt: new Date(),
      },
    });

    results.push({
      courseId: course.id,
      name: course.name,
      grade: scraped.grade,
      url: scraped.url,
      title: scraped.title,
    });
  }

  return {
    imported: results.length,
    results,
  };
}
