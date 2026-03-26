export function DashboardLoading({ title = "Loading dashboard..." }: { title?: string }) {
  return (
    <main className="min-h-screen bg-[#eaf3fb] text-slate-900">
      <div className="min-h-screen p-5 sm:p-8 lg:p-10">
        <div className="mb-8 rounded-[32px] bg-blue-800 px-5 py-4 text-white shadow-[0_18px_60px_rgba(30,64,175,0.28)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-28 animate-pulse rounded-2xl bg-white/15" />
              <div className="animate-pulse">
                <div className="h-4 w-28 rounded bg-white/15" />
                <div className="mt-2 h-3 w-44 rounded bg-white/10" />
              </div>
            </div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/15" />
          </div>
        </div>

        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-sky-200" />
          <div className="mt-3 h-10 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-80 rounded bg-slate-200" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-10 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[22px] bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-[22px] bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500">{title}</p>
      </div>
    </main>
  );
}
