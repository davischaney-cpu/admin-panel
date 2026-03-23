import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type CanvasAssignmentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CanvasAssignmentsPage({ searchParams }: CanvasAssignmentsPageProps) {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCourseId = getSearchParam(resolvedSearchParams.course);
  const selectedBucket = getSearchParam(resolvedSearchParams.bucket) ?? "all";
  const selectedSort = getSearchParam(resolvedSearchParams.sort) ?? "due";

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

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const weekFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  const normalizedAssignments = assignments.map((assignment) => {
    const dueAt = assignment.dueAt;
    const isOverdue = Boolean(dueAt && dueAt < now);
    const isDueToday = Boolean(dueAt && dueAt >= now && dueAt <= endOfToday);
    const isDueThisWeek = Boolean(dueAt && dueAt >= now && dueAt <= weekFromNow);
    const isUngraded = assignment.submissionStatus === "submitted" || assignment.workflowState === "submitted";

    return {
      ...assignment,
      isOverdue,
      isDueToday,
      isDueThisWeek,
      isUngraded,
    };
  });

  const filteredAssignments = normalizedAssignments.filter((assignment) => {
    switch (selectedBucket) {
      case "overdue":
        return assignment.isOverdue;
      case "today":
        return assignment.isDueToday;
      case "week":
        return assignment.isDueThisWeek;
      case "ungraded":
        return assignment.isUngraded;
      default:
        return true;
    }
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (selectedSort === "points") {
      return (b.pointsPossible ?? -1) - (a.pointsPossible ?? -1);
    }

    const aTime = a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  const summary = {
    all: normalizedAssignments.length,
    overdue: normalizedAssignments.filter((assignment) => assignment.isOverdue).length,
    today: normalizedAssignments.filter((assignment) => assignment.isDueToday).length,
    week: normalizedAssignments.filter((assignment) => assignment.isDueThisWeek).length,
    ungraded: normalizedAssignments.filter((assignment) => assignment.isUngraded).length,
  };

  function hrefFor(bucket: string, sort = selectedSort, course = selectedCourseId) {
    const params = new URLSearchParams();
    if (bucket && bucket !== "all") params.set("bucket", bucket);
    if (sort && sort !== "due") params.set("sort", sort);
    if (course) params.set("course", course);
    const query = params.toString();
    return query ? `/canvas/assignments?${query}` : "/canvas/assignments";
  }

  const buckets = [
    { key: "all", label: "All assignments", value: summary.all },
    { key: "overdue", label: "Overdue", value: summary.overdue },
    { key: "today", label: "Due today", value: summary.today },
    { key: "week", label: "Due this week", value: summary.week },
    { key: "ungraded", label: "Submitted / ungraded", value: summary.ungraded },
  ];

  return (
    <DashboardShell email={email} role={role} currentPath="/canvas">
      <header className="border-b border-white/10 pb-6">
        <p className="text-sm text-zinc-400">Canvas integration</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Assignment command center</h2>
        <p className="mt-2 text-sm text-zinc-500">Filter what matters: overdue work, this week, today, and submitted items still waiting on grades.</p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {buckets.map((bucket) => {
          const isActive = selectedBucket === bucket.key || (bucket.key === "all" && selectedBucket === "all");
          return (
            <Link
              key={bucket.key}
              href={hrefFor(bucket.key)}
              className={`rounded-2xl border p-5 transition ${isActive ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
            >
              <p className="text-sm text-zinc-400">{bucket.label}</p>
              <p className="mt-3 text-3xl font-semibold">{bucket.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor(selectedBucket, selectedSort)}
            className={`rounded-full px-4 py-2 text-sm ${!selectedCourseId ? "bg-white text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
          >
            All classes
          </Link>
          {courses.map((course) => (
            <Link
              key={course.id}
              href={hrefFor(selectedBucket, selectedSort, course.id)}
              className={`rounded-full px-4 py-2 text-sm ${selectedCourseId === course.id ? "bg-cyan-300 text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
            >
              {course.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor(selectedBucket, "due")}
            className={`rounded-full px-4 py-2 text-sm ${selectedSort === "due" ? "bg-white text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
          >
            Sort: Due date
          </Link>
          <Link
            href={hrefFor(selectedBucket, "points")}
            className={`rounded-full px-4 py-2 text-sm ${selectedSort === "points" ? "bg-white text-black" : "border border-white/10 text-zinc-300 hover:bg-white/10"}`}
          >
            Sort: Points
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="pb-3 font-medium">Assignment</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium">Points</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.length ? (
                sortedAssignments.map((assignment) => {
                  const status = assignment.isOverdue
                    ? { label: "Overdue", classes: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20" }
                    : assignment.isDueToday
                      ? { label: "Due today", classes: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20" }
                      : assignment.isDueThisWeek
                        ? { label: "This week", classes: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20" }
                        : { label: "Later", classes: "bg-white/10 text-zinc-300 ring-1 ring-white/10" };

                  return (
                    <tr key={assignment.id} className="border-b border-white/5 last:border-0">
                      <td className="py-4 font-medium">{assignment.name}</td>
                      <td className="py-4 text-zinc-300">
                        <Link href={`/courses/${assignment.courseId}`} className="hover:text-white">
                          {assignment.course.name}
                        </Link>
                      </td>
                      <td className="py-4 text-zinc-300">{assignment.dueAt ? formatDateTime(assignment.dueAt) : "TBD"}</td>
                      <td className="py-4 text-zinc-300">{assignment.pointsPossible ?? "—"}</td>
                      <td className="py-4">
                        <span className={`rounded-full px-3 py-1 text-xs ${status.classes}`}>{status.label}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-3">
                          {assignment.htmlUrl ? (
                            <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                              Canvas
                            </a>
                          ) : null}
                          <Link href={`/courses/${assignment.courseId}`} className="text-zinc-300 hover:text-white">
                            Course
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    No assignments matched this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
