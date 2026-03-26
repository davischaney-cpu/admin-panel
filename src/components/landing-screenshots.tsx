const pipelineColumns = [
  { column: "NEW", tone: "bg-cyan-400/15 text-cyan-200", items: ["Marcus Rivera", "Kayla Young"] },
  { column: "QUOTED", tone: "bg-amber-400/15 text-amber-200", items: ["Nina Brooks", "Fleet detail quote"] },
  { column: "BOOKED", tone: "bg-emerald-400/15 text-emerald-200", items: ["Ethan Cole"] },
];

const jobSummaryCards = [
  { label: "Customer", value: "Marcus Rivera" },
  { label: "Status", value: "Scheduled" },
  { label: "Scheduled", value: "Tue 9:00 AM" },
  { label: "Value", value: "$185" },
];

const dashboardStatCards = [
  { label: "New leads", value: "12", tone: "cyan" },
  { label: "Overdue", value: "4", tone: "rose" },
  { label: "Jobs this week", value: "9", tone: "violet" },
  { label: "Pipeline value", value: "$6.4k", tone: "emerald" },
];

function statToneClass(tone: string) {
  switch (tone) {
    case "cyan":
      return "bg-cyan-400/10 shadow-[0_12px_32px_-24px_rgba(34,211,238,0.8)]";
    case "rose":
      return "bg-rose-400/10 shadow-[0_12px_32px_-24px_rgba(251,113,133,0.8)]";
    case "violet":
      return "bg-violet-400/10 shadow-[0_12px_32px_-24px_rgba(167,139,250,0.8)]";
    case "emerald":
      return "bg-emerald-400/10 shadow-[0_12px_32px_-24px_rgba(52,211,153,0.8)]";
    default:
      return "bg-black/20";
  }
}

export function LandingScreenshots() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Screenshots</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">What the product actually looks like</h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-500">These are product-style previews meant to sell the workflow: pipeline, job details, and the daily operating view.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Pipeline</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Scheduling</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Team ops</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/20">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0f1218] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Screenshot 01</p>
                <h3 className="mt-2 text-xl font-semibold">Pipeline + recent leads</h3>
              </div>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">Leads</span>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {pipelineColumns.map(({ column, tone, items }) => (
                <div key={column} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{column}</h4>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">{items.length}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {items.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/20">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0f1218] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Screenshot 02</p>
              <h3 className="mt-2 text-xl font-semibold">Job detail</h3>
              <div className="mt-5 space-y-3">
                {jobSummaryCards.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="mt-1 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/20">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0f1218] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Screenshot 03</p>
              <h3 className="mt-2 text-xl font-semibold">Daily dashboard</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {dashboardStatCards.map(({ label, value, tone }) => (
                  <div key={label} className={`rounded-2xl border border-white/10 p-3 ${statToneClass(tone)}`}>
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
