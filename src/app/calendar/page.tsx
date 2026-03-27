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
      <header className="rounded-[30px] bg-[#0f3d91] px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,61,145,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-blue-100/85">Scheduling</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Jobs calendar</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-3 text-slate-900">
              <p className="text-sm text-slate-600">Jobs loaded</p>
              <p className="mt-2 text-2xl font-semibold">{jobs.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-slate-900">
              <p className="text-sm text-slate-600">Scheduled this month</p>
              <p className="mt-2 text-2xl font-semibold">{jobs.filter((job) => job.scheduledFor?.getMonth() === month && job.scheduledFor?.getFullYear() === year).length}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-slate-900">
              <p className="text-sm text-slate-600">Today</p>
              <p className="mt-2 text-2xl font-semibold">{jobsByDay.get(dayKey(new Date()))?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={`/calendar?month=${previousMonthValue}`} className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] shadow-[0_8px_22px_rgba(15,23,42,0.06)] hover:bg-blue-50">← Prev</Link>
        <div className="rounded-2xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(22,63,135,0.18)]">
          {getMonthLabel(referenceDate)}
        </div>
        <Link href={`/calendar?month=${nextMonthValue}`} className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] shadow-[0_8px_22px_rgba(15,23,42,0.06)] hover:bg-blue-50">Next →</Link>
        <Link href={`/calendar?month=${monthValue}`} className="rounded-2xl border border-blue-200 bg-[#edf4ff] px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-[#e4eeff]">This month</Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <div className="rounded-[30px] border border-blue-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
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
                  className={`min-h-32 rounded-[22px] border p-3 text-left transition ${selected ? "border-[#163f87] bg-[#163f87] text-white shadow-[0_12px_28px_rgba(22,63,135,0.22)]" : inMonth ? "border-blue-200 bg-[#f7fbff] text-slate-900 hover:bg-[#eef5ff]" : "border-slate-200 bg-[#f3f6fa] text-slate-500 hover:bg-[#edf2f7]"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isToday(day) && !selected ? "rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-800" : ""}`}>{day.getDate()}</span>
                    {dayJobs.length ? <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${selected ? "bg-white/15 text-white" : "bg-white text-slate-700"}`}>{dayJobs.length}</span> : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {dayJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className={`rounded-xl px-2.5 py-1.5 text-xs ${selected ? "bg-white/12 text-white" : "bg-white text-slate-800"}`}>
                        <p className="truncate font-medium">{job.title}</p>
                        <p className={`truncate ${selected ? "text-blue-100/85" : "text-slate-500"}`}>{job.lead?.fullName || job.serviceType}</p>
                      </div>
                    ))}
                    {dayJobs.length > 3 ? <p className={`text-xs ${selected ? "text-blue-100/85" : "text-slate-500"}`}>+{dayJobs.length - 3} more</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold text-slate-900">{activeDay.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            <p className="mt-1 text-sm text-slate-700">{activeJobs.length ? `${activeJobs.length} job${activeJobs.length === 1 ? "" : "s"}` : "No jobs scheduled"}</p>
            <div className="mt-5 space-y-3">
              {activeJobs.length ? activeJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-blue-200 bg-[#f7fbff] p-4 transition hover:bg-[#eef5ff]">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-[#163f87]">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f7fbff] p-4 text-sm text-slate-700">
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
