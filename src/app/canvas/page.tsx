import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { CanvasSyncButton } from "@/components/canvas-sync-button";
import { ImportCanvasFromBrowserButton } from "@/components/import-canvas-from-browser-button";
import { getAdminContext } from "@/lib/admin";
import { getImportedCanvasGradeMap } from "@/lib/canvas-grade-source";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatScore } from "@/lib/grades";

export default async function CanvasPage() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const [courses, importedGrades] = await Promise.all([
    db.canvasCourse.findMany({
      orderBy: [{ currentScore: "desc" }, { name: "asc" }],
      include: { assignments: { orderBy: { dueAt: "asc" }, take: 3 } },
    }),
    getImportedCanvasGradeMap(),
  ]);

  const assignmentCount = await db.canvasAssignment.count();
  const latestSync = courses[0]?.lastSyncedAt ?? null;

  return (
    <DashboardShell email={email} role={role} currentPath="/canvas">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Canvas integration</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Canvas</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cleaned up to show your active academic classes and current grades first.
          </p>
          <CanvasSyncButton />
          <ImportCanvasFromBrowserButton />
        </div>
        <div className="flex gap-3">
          <Link href="/canvas/import" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            Import grades
          </Link>
          <Link href="/canvas/assignments" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            View assignments
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Academic courses</p>
          <p className="mt-3 text-3xl font-semibold">{courses.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Upcoming assignments</p>
          <p className="mt-3 text-3xl font-semibold">{assignmentCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Last synced</p>
          <p className="mt-3 text-lg font-semibold">{latestSync ? formatDate(latestSync) : "Never"}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {courses.map((course) => {
          const importedGrade = importedGrades.get(course.canvasCourseId);
          const displayGrade = importedGrade?.grade ?? course.currentScore;
          const sourceLabel = importedGrade?.source === "canvas-grades-page"
            ? "grades page"
            : importedGrade?.source === "better-canvas"
              ? "Better Canvas"
              : null;

          return (
            <div key={course.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    <Link href={`/courses/${course.id}`} className="hover:text-cyan-200">
                      {course.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-zinc-500">{course.courseCode || "No course code"}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-200 ring-1 ring-cyan-400/20">
                    Current: {formatScore(displayGrade)}
                  </span>
                  {sourceLabel ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300 ring-1 ring-white/10">
                      Source: {sourceLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-zinc-300">Due soon</p>
                {course.assignments.length ? (
                  <div className="mt-3 space-y-2">
                    {course.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{assignment.name}</p>
                          <p className="text-sm text-zinc-500">Due {assignment.dueAt ? formatDate(assignment.dueAt) : "TBD"}</p>
                        </div>
                        {assignment.htmlUrl ? (
                          <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200">
                            Open in Canvas
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">Nothing due soon in this class.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
