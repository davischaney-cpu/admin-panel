export function DashboardLoading({ title = "Loading dashboard..." }: { title?: string }) {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/5 p-6 lg:block">
          <div className="animate-pulse">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="mt-3 h-8 w-36 rounded bg-white/10" />
            <div className="mt-2 h-4 w-48 rounded bg-white/5" />
          </div>
          <div className="mt-10 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-11 rounded-xl bg-white/5" />
            ))}
          </div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="animate-pulse">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="mt-2 h-3 w-40 rounded bg-white/5" />
            </div>
            <div className="h-9 w-9 rounded-full bg-white/10" />
          </div>

          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="mt-3 h-10 w-72 rounded bg-white/10" />
            <div className="mt-2 h-4 w-64 rounded bg-white/5" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-4 h-8 w-16 rounded bg-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="h-6 w-48 rounded bg-white/10" />
              <div className="mt-2 h-4 w-36 rounded bg-white/5" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-black/20" />
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="h-6 w-36 rounded bg-white/10" />
              <div className="mt-2 h-4 w-24 rounded bg-white/5" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-2xl bg-black/20" />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-500">{title}</p>
        </section>
      </div>
    </main>
  );
}
