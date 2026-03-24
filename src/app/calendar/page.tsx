import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { buildMonthGrid, dayKey, getMonthLabel, getWeekdayLabels, isSameMonth, isToday, parseDayKey } from "@/lib/calendar";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewCalendar")) {
    return <UnauthorizedState email={email} />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedDay = parseDayKey(getSearchParam(resolvedSearchParams.day));
  const monthParam = getSearchParam(resolvedSearchParams.month);
  const monthDate = monthParam ? new Date(`${monthParam}-01T12:00:00`) : new Date();
  const referenceDate = Number.isNaN(monthDate.getTime()) ? new Date() : monthDate;

  const jobs = await db.job.findMany({
    where: {
      scheduledFor: {
        not: null,
      },
    },
    include: { lead: true },
    orderBy: [{ scheduledFor: "asc" }],
    take: 250,
  });

  const jobsByDay = new Map<string, typeof jobs>();
  for (const job of jobs) {
    if (!job.scheduledFor) continue;
    const key = dayKey(job.scheduledFor);
    const existing = jobsByDay.get(key) ?? [];
    existing.push(job);
    jobsByDay.set(key, existing);
  }

  const gridDays = buildMonthGrid(referenceDate);
  const activeDay = selectedDay ?? new Date();
  const activeJobs = jobsByDay.get(dayKey(activeDay)) ?? [];

  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const monthValue = `${year}-${String(month + 1).padStart(2, "0")}`;
  const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthValue = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <DashboardShell email={email} role={role} currentPath="/calendar">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Scheduling</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Jobs calendar</h2>
          <p className="mt-2 text-sm text-zinc-500">See booked work by day and keep the week from getting messy.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Jobs loaded</p>
            <p className="mt-2 text-2xl font-semibold">{jobs.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Scheduled this month</p>
            <p className="mt-2 text-2xl font-semibold">{jobs.filter((job) => job.scheduledFor?.getMonth() === month && job.scheduledFor?.getFullYear() === year).length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">Today</p>
            <p className="mt-2 text-2xl font-semibold">{jobsByDay.get(dayKey(new Date()))?.length ?? 0}</p>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={`/calendar?month=${previousMonthValue}`} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">← Prev</Link>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <p className="text-sm font-medium">{getMonthLabel(referenceDate)}</p>
        </div>
        <Link href={`/calendar?month=${nextMonthValue}`} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Next →</Link>
        <Link href={`/calendar?month=${monthValue}`} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">This month</Link>
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
              const dayJobs = jobsByDay.get(key) ?? [];
              const selected = key === dayKey(activeDay);
              const inMonth = isSameMonth(day, referenceDate);

              return (
                <Link
                  key={key}
                  href={`/calendar?month=${monthValue}&day=${key}`}
                  className={`min-h-28 rounded-2xl border p-3 text-left transition ${selected ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20 hover:bg-white/10"} ${inMonth ? "text-zinc-100" : "text-zinc-600"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isToday(day) ? "rounded-full bg-white px-2 py-0.5 text-black" : ""}`}>{day.getDate()}</span>
                    {dayJobs.length ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-300">{dayJobs.length}</span> : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {dayJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="rounded-xl bg-white/8 px-2 py-1 text-xs text-zinc-200">
                        <p className="truncate font-medium">{job.title}</p>
                        <p className="truncate text-zinc-400">{job.lead?.fullName || job.serviceType}</p>
                      </div>
                    ))}
                    {dayJobs.length > 3 ? <p className="text-xs text-zinc-500">+{dayJobs.length - 3} more</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">{activeDay.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            <p className="mt-1 text-sm text-zinc-500">{activeJobs.length ? `${activeJobs.length} job${activeJobs.length === 1 ? "" : "s"}` : "No jobs scheduled"}</p>
            <div className="mt-5 space-y-3">
              {activeJobs.length ? activeJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                  <p className="font-medium">{job.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  Nothing booked for this day. Jobs you schedule will appear here automatically.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
