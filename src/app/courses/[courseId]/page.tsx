import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { getImportedCanvasGradeMap } from "@/lib/canvas-grade-source";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { formatScore } from "@/lib/grades";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const { courseId } = await params;
  const [course, importedGrades] = await Promise.all([
    db.canvasCourse.findUnique({
      where: { id: courseId },
      include: {
        assignments: {
          orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
          take: 100,
        },
      },
    }),
    getImportedCanvasGradeMap(),
  ]);

  if (!course) {
    notFound();
  }

  const importedGrade = importedGrades.get(course.canvasCourseId);
  const displayGrade = importedGrade?.grade ?? course.currentScore;
  const now = new Date();
  const upcoming = course.assignments.filter((assignment) => assignment.dueAt && assignment.dueAt >= now);
  const overdue = course.assignments.filter((assignment) => assignment.dueAt && assignment.dueAt < now);
  const ungraded = course.assignments.filter(
    (assignment) => assignment.submissionStatus === "submitted" || assignment.workflowState === "submitted",
  );

  return (
    <DashboardShell email={email} role={role} currentPath="/canvas">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Course detail</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{course.name}</h2>
          <p className="mt-2 text-sm text-zinc-500">{course.courseCode || "No course code available"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/canvas/assignments" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            Back to assignments
          </Link>
          <Link href="/canvas" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            Back to Canvas
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Current grade</p>
          <p className="mt-3 text-3xl font-semibold">{formatScore(displayGrade)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Assignments tracked</p>
          <p className="mt-3 text-3xl font-semibold">{course.assignments.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Upcoming</p>
          <p className="mt-3 text-3xl font-semibold">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Overdue</p>
          <p className="mt-3 text-3xl font-semibold">{overdue.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Assignment timeline</h3>
              <p className="text-sm text-zinc-400">Everything we’ve synced for this class</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {course.assignments.length ? (
              course.assignments.map((assignment) => {
                const status = assignment.dueAt && assignment.dueAt < now
                  ? { label: "Overdue", classes: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20" }
                  : assignment.dueAt
                    ? { label: "Upcoming", classes: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20" }
                    : { label: "No due date", classes: "bg-white/10 text-zinc-300 ring-1 ring-white/10" };

                return (
                  <div key={assignment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">{assignment.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {assignment.dueAt ? formatDateTime(assignment.dueAt) : "No due date"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full px-2.5 py-1 ${status.classes}`}>{status.label}</span>
                          {assignment.pointsPossible != null ? (
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-zinc-300">
                              {assignment.pointsPossible} pts
                            </span>
                          ) : null}
                          {assignment.submissionStatus ? (
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-zinc-300">
                              {assignment.submissionStatus}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {assignment.htmlUrl ? (
                        <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200">
                          Open in Canvas
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500">No assignments synced for this course yet.</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Course snapshot</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Imported grade source</p>
                <p className="mt-2 text-base font-medium text-zinc-100">{importedGrade?.source ?? "Canvas API"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Submitted / ungraded</p>
                <p className="mt-2 text-3xl font-semibold">{ungraded.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Last synced</p>
                <p className="mt-2 text-base font-medium text-zinc-100">{formatDateTime(course.lastSyncedAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Jump to</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link href={`/canvas/assignments?course=${course.id}`} className="block rounded-2xl border border-white/10 px-4 py-3 text-zinc-200 hover:bg-white/10">
                Filter assignments to this class
              </Link>
              <Link href="/calendar" className="block rounded-2xl border border-white/10 px-4 py-3 text-zinc-200 hover:bg-white/10">
                Open calendar
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
