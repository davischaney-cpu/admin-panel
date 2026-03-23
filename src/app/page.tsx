import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { getImportedCanvasGradeMap } from "@/lib/canvas-grade-source";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { formatScore } from "@/lib/grades";

function getStatusTone(dueAt: Date | null) {
  if (!dueAt) {
    return {
      label: "No due date",
      classes: "bg-white/10 text-zinc-300 ring-1 ring-white/10",
    };
  }

  const diff = dueAt.getTime() - Date.now();

  if (diff < 0) {
    return {
      label: "Overdue",
      classes: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20",
    };
  }

  if (diff <= 1000 * 60 * 60 * 24) {
    return {
      label: "Due soon",
      classes: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
    };
  }

  return {
    label: "Upcoming",
    classes: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  };
}

export default async function Home() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  const [dbUsers, canvasCourses, assignments, importedGrades] = await Promise.all([
    db.user.count(),
    db.canvasCourse.findMany({ orderBy: [{ name: "asc" }] }),
    db.canvasAssignment.findMany({
      where: {
        OR: [{ dueAt: null }, { dueAt: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30) } }],
      },
      include: { course: true },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 50,
    }),
    getImportedCanvasGradeMap(),
  ]);

  const gradedCourses = canvasCourses
    .map((course) => {
      const importedGrade = importedGrades.get(course.canvasCourseId);
      return importedGrade?.grade ?? course.currentScore;
    })
    .filter((grade): grade is number => typeof grade === "number");

  const averageGrade = gradedCourses.length
    ? gradedCourses.reduce((sum, grade) => sum + grade, 0) / gradedCourses.length
    : null;

  const overdueAssignments = assignments.filter((assignment) => assignment.dueAt && assignment.dueAt < now);
  const dueThisWeekAssignments = assignments.filter(
    (assignment) => assignment.dueAt && assignment.dueAt >= now && assignment.dueAt <= weekFromNow,
  );
  const upcomingAssignments = assignments
    .filter((assignment) => !assignment.dueAt || assignment.dueAt >= now)
    .slice(0, 8);

  const topCourses = [...canvasCourses]
    .sort((a, b) => {
      const aGrade = importedGrades.get(a.canvasCourseId)?.grade ?? a.currentScore ?? -1;
      const bGrade = importedGrades.get(b.canvasCourseId)?.grade ?? b.currentScore ?? -1;
      return bGrade - aGrade;
    })
    .slice(0, 4);

  const stats = [
    { label: "Database Users", value: String(dbUsers), change: "live" },
    { label: "Academic Classes", value: String(canvasCourses.length), change: "synced" },
    { label: "Due This Week", value: String(dueThisWeekAssignments.length), change: "real" },
    { label: "Average Grade", value: averageGrade != null ? formatScore(averageGrade) : "—", change: "tracked" },
  ];

  return (
    <DashboardShell email={email} role={role} currentPath="/">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Personal control center</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Overview dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Link href="/calendar" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">
            Open Calendar
          </Link>
          <Link href="/canvas" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            Open Canvas
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upcoming assignments</h3>
              <p className="text-sm text-zinc-400">What needs attention next</p>
            </div>
            <Link href="/canvas/assignments" className="text-sm text-cyan-300 hover:text-cyan-200">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingAssignments.length ? (
              upcomingAssignments.map((assignment) => {
                const tone = getStatusTone(assignment.dueAt);
                return (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{assignment.name}</p>
                      <p className="text-sm text-zinc-400">{assignment.course.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {assignment.dueAt ? formatDateTime(assignment.dueAt) : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs ${tone.classes}`}>{tone.label}</span>
                      {assignment.htmlUrl ? (
                        <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200">
                          Open
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500">No upcoming assignments yet. Run Canvas sync to load more data.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Current grades</h3>
              <p className="mt-1 text-sm text-zinc-400">Active classes only</p>
            </div>
            <Link href="/canvas" className="text-sm text-cyan-300 hover:text-cyan-200">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {topCourses.length ? (
              topCourses.map((course) => {
                const importedGrade = importedGrades.get(course.canvasCourseId);
                const displayGrade = importedGrade?.grade ?? course.currentScore;
                const sourceLabel = importedGrade?.source === "canvas-grades-page"
                  ? "grades page"
                  : importedGrade?.source === "better-canvas"
                    ? "Better Canvas"
                    : null;

                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div>
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-zinc-400">{course.courseCode || "No course code"}</p>
                      {sourceLabel ? <p className="mt-1 text-xs text-zinc-500">Source: {sourceLabel}</p> : null}
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">
                      {formatScore(displayGrade)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500">Run Canvas sync to load your school data.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Workload snapshot</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Overdue assignments</p>
              <p className="mt-2 text-3xl font-semibold">{overdueAssignments.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Due in the next 7 days</p>
              <p className="mt-2 text-3xl font-semibold">{dueThisWeekAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Useful next moves</h3>
              <p className="text-sm text-zinc-400">Skip the old fake analytics and go straight to the real stuff</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/calendar" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10">
              <p className="font-medium">Open calendar</p>
              <p className="mt-2 text-sm text-zinc-500">See due dates by day and class.</p>
            </Link>
            <Link href="/canvas/assignments" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10">
              <p className="font-medium">Review assignments</p>
              <p className="mt-2 text-sm text-zinc-500">Check everything upcoming in one list.</p>
            </Link>
            <Link href="/canvas" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10">
              <p className="font-medium">Check grades</p>
              <p className="mt-2 text-sm text-zinc-500">Compare current class performance fast.</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
