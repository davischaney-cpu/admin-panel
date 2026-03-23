import { NextResponse } from "next/server";
import {
  fetchCanvasAssignments,
  fetchCanvasCourses,
  getDisplayScore,
  isAcademicCanvasCourse,
  normalizeDisplayScore,
} from "@/lib/canvas";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const courses = await fetchCanvasCourses();

    const gradedCourses = courses.filter((course) => {
      if (!isAcademicCanvasCourse(course)) return false;
      const enrollment = course.enrollments?.[0];
      return getDisplayScore(enrollment ?? { computed_current_score: null, computed_final_score: null }) != null;
    });

    const activeCourseIds = gradedCourses.map((course) => course.id);

    const staleCourses = await db.canvasCourse.findMany({
      where: { canvasCourseId: { notIn: activeCourseIds } },
      select: { id: true },
    });

    if (staleCourses.length) {
      await db.canvasAssignment.deleteMany({
        where: { courseId: { in: staleCourses.map((course) => course.id) } },
      });
      await db.canvasCourse.deleteMany({
        where: { id: { in: staleCourses.map((course) => course.id) } },
      });
    }

    for (const course of gradedCourses) {
      const enrollment = course.enrollments?.[0];
      const currentScore = normalizeDisplayScore(enrollment?.computed_current_score ?? null);
      const finalScore = normalizeDisplayScore(enrollment?.computed_final_score ?? null);

      const savedCourse = await db.canvasCourse.upsert({
        where: { canvasCourseId: course.id },
        update: {
          name: course.name,
          courseCode: course.course_code ?? null,
          currentScore,
          finalScore,
          hasGrade: currentScore != null || finalScore != null,
          lastSyncedAt: new Date(),
        },
        create: {
          canvasCourseId: course.id,
          name: course.name,
          courseCode: course.course_code ?? null,
          currentScore,
          finalScore,
          hasGrade: currentScore != null || finalScore != null,
          lastSyncedAt: new Date(),
        },
      });

      const assignments = await fetchCanvasAssignments(course.id);

      await db.canvasAssignment.deleteMany({
        where: { courseId: savedCourse.id },
      });

      const upcomingAssignments = assignments.filter((assignment) => {
        if (!assignment.due_at) return false;
        return !assignment.submission?.workflow_state || assignment.submission.workflow_state !== "graded";
      });

      if (upcomingAssignments.length > 0) {
        await db.canvasAssignment.createMany({
          data: upcomingAssignments.map((assignment) => ({
            canvasAssignmentId: assignment.id,
            canvasCourseId: assignment.course_id,
            courseId: savedCourse.id,
            name: assignment.name,
            dueAt: assignment.due_at ? new Date(assignment.due_at) : null,
            htmlUrl: assignment.html_url ?? null,
            pointsPossible: assignment.points_possible ?? null,
            submissionStatus: assignment.submission?.submission_type ?? null,
            workflowState: assignment.submission?.workflow_state ?? null,
          })),
          skipDuplicates: true,
        });
      }
    }

    const courseCount = await db.canvasCourse.count();
    const assignmentCount = await db.canvasAssignment.count();

    return NextResponse.json({ ok: true, courseCount, assignmentCount, syncedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Canvas sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
