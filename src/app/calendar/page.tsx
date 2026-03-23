import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import {
  buildMonthGrid,
  dayKey,
  formatCalendarDueDate,
  getMonthLabel,
  getWeekdayLabels,
  groupAssignmentsByDay,
  isSameMonth,
  isToday,
  parseDayKey,
} from "@/lib/calendar";
import { db } from "@/lib/db";

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCourseId = getSearchParam(resolvedSearchParams.course);
  const selectedDay = parseDayKey(getSearchParam(resolvedSearchParams.day));
  const monthParam = getSearchParam(resolvedSearchParams.month);
  const monthDate = monthParam ? new Date(`${monthParam}-01T12:00:00`) : new Date();
  const referenceDate = Number.isNaN(monthDate.getTime()) ? new Date() : monthDate;

  const [courses, assignments] = await Promise.all([
    db.canvasCourse.findMany({ orderBy: { name: "asc" } }),
    db.canvasAssignment.findMany({
      where: {
        ...(selectedCourseId ? { courseId: selectedCourseId } : {}),
      },
      include: { course: true },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 250,
    }),
  ]);

  const calendarAssignments = assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.name,
    course: assignment.course.name,
    dueAt: assignment.dueAt,
    htmlUrl: assignment.htmlUrl,
    pointsPossible: assignment.pointsPossible,
    submissionStatus: assignment.submissionStatus,
    workflowState: assignment.workflowState,
    courseId: assignment.courseId,
  }));

  const assignmentMap = groupAssignmentsByDay(calendarAssignments);
  const gridDays = buildMonthGrid(referenceDate);
  const activeDay = selectedDay ?? new Date();
  const activeDayKey = dayKey(activeDay);
  const activeAssignments = assignmentMap.get(activeDayKey) ?? [];

  const overdueAssignments = calendarAssignments.filter(
    (assignment) => assignment.dueAt && assignment.dueAt.getTime() < Date.now(),
  ).length;
  const dueThisWeek = calendarAssignments.filter((assignment) => {
    if (!assignment.dueAt) return false;
    const diff = assignment.dueAt.getTime() - Date.now();
    return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const monthValue = `${year}-${String(month + 1).padStart(2, "0")}`;
  const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthValue = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
  const baseParams = new URLSearchParams();
  if (selectedCourseId) baseParams.set("course", selectedCourseId);

  return (
    <DashboardShell email={email} role={role} currentPath="/calendar">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Student control center</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Calendar</h2>
          <p className="mt-2 text-sm text-zinc-500">See upcoming work by day, class, and due date.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Assignments loaded</p>
            <p className="mt-2 text-2xl font-semibold">{calendarAssignments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Due this week</p>
            <p className="mt-2 text-2xl font-semibold">{dueThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Overdue</p>
            <p className="mt-2 text-2xl font-semibold">{overdueAssignments}</p>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/calendar?${new URLSearchParams({ ...Object.fromEntries(baseParams.entries()), month: previousMonthValue }).toString()}`}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            ← Prev
          </Link>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
            <p className="text-sm font-medium">{getMonthLabel(referenceDate)}</p>
          </div>
          <Link
            href={`/calendar?${new URLSearchParams({ ...Object.fromEntries(baseParams.entries()), month: nextMonthValue }).toString()}`}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            Next →
          </Link>
          <Link
            href={`/calendar?${new URLSearchParams({ ...Object.fromEntries(baseParams.entries()), month: monthValue }).toString()}`}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            This month
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/calendar"
            className={`rounded-full px-4 py-2 text-sm ${!selectedCourseId ? "bg-white text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
          >
            All classes
          </Link>
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/calendar?${new URLSearchParams({ course: course.id, month: monthValue }).toString()}`}
              className={`rounded-full px-4 py-2 text-sm ${selectedCourseId === course.id ? "bg-cyan-300 text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
            >
              {course.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-zinc-500">
            {getWeekdayLabels().map((label) => (
              <div key={label} className="py-2">{label}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {gridDays.map((day) => {
              const key = dayKey(day);
              const dayAssignments = assignmentMap.get(key) ?? [];
              const inMonth = isSameMonth(day, referenceDate);
              const selected = key === activeDayKey;

              return (
                <Link
                  key={key}
                  href={`/calendar?${new URLSearchParams({ ...(selectedCourseId ? { course: selectedCourseId } : {}), month: monthValue, day: key }).toString()}`}
                  className={`min-h-28 rounded-2xl border p-3 text-left transition ${selected ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20 hover:bg-white/10"} ${inMonth ? "text-zinc-100" : "text-zinc-600"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isToday(day) ? "rounded-full bg-white px-2 py-0.5 text-black" : ""}`}>
                      {day.getDate()}
                    </span>
                    {dayAssignments.length ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-300">
                        {dayAssignments.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayAssignments.slice(0, 3).map((assignment) => (
                      <div key={assignment.id} className="rounded-xl bg-white/8 px-2 py-1 text-xs text-zinc-200">
                        <p className="truncate font-medium">{assignment.title}</p>
                        <p className="truncate text-zinc-400">{assignment.course}</p>
                      </div>
                    ))}
                    {dayAssignments.length > 3 ? (
                      <p className="text-xs text-zinc-500">+{dayAssignments.length - 3} more</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">{activeDay.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {activeAssignments.length ? `${activeAssignments.length} assignment${activeAssignments.length === 1 ? "" : "s"}` : "No assignments due"}
            </p>

            <div className="mt-5 space-y-3">
              {activeAssignments.length ? (
                activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{assignment.course}</p>
                    <p className="mt-2 text-sm text-zinc-500">{formatCalendarDueDate(assignment.dueAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
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
                    {assignment.htmlUrl ? (
                      <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cyan-300 hover:text-cyan-200">
                        Open in Canvas
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  Nothing due for this day.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Quick views</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/canvas/assignments" className="block rounded-2xl border border-white/10 px-4 py-3 text-zinc-200 hover:bg-white/10">
                View all assignments
              </Link>
              <Link href="/canvas" className="block rounded-2xl border border-white/10 px-4 py-3 text-zinc-200 hover:bg-white/10">
                Open grades and courses
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
