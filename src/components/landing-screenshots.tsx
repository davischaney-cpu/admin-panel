const pipelineColumns = [
  { column: "NEW", tone: "bg-sky-100 text-sky-800", items: ["Marcus Rivera", "Kayla Young"] },
  { column: "QUOTED", tone: "bg-amber-100 text-amber-800", items: ["Nina Brooks", "Fleet detail quote"] },
  { column: "BOOKED", tone: "bg-emerald-100 text-emerald-800", items: ["Ethan Cole"] },
];

const jobSummaryCards = [
  { label: "Customer", value: "Marcus Rivera" },
  { label: "Status", value: "Scheduled" },
  { label: "Scheduled", value: "Tue 9:00 AM" },
  { label: "Value", value: "$185" },
];

const dashboardStatCards = [
  { label: "New leads", value: "12", tone: "blue" },
  { label: "Overdue", value: "4", tone: "rose" },
  { label: "Jobs this week", value: "9", tone: "violet" },
  { label: "Pipeline value", value: "$6.4k", tone: "emerald" },
];

function statToneClass(tone: string) {
  switch (tone) {
    case "blue":
      return "bg-blue-100 text-blue-900";
    case "rose":
      return "bg-rose-100 text-rose-900";
    case "violet":
      return "bg-violet-100 text-violet-900";
    case "emerald":
      return "bg-emerald-100 text-emerald-900";
    default:
      return "bg-slate-100 text-slate-900";
  }
}

export function LandingScreenshots() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-slate-600">Screenshots</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">What the product actually looks like</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-700">These are product-style previews meant to sell the workflow: pipeline, job details, and the daily operating view.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="rounded-full bg-blue-100 px-3 py-1.5">Pipeline</span>
          <span className="rounded-full bg-blue-100 px-3 py-1.5">Scheduling</span>
          <span className="rounded-full bg-blue-100 px-3 py-1.5">Team ops</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-blue-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="rounded-[1.5rem] bg-[#f7fbff] p-5">
            <div className="flex items-center justify-between border-b border-blue-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Screenshot 01</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Pipeline + recent leads</h3>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">Leads</span>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {pipelineColumns.map(({ column, tone, items }) => (
                <div key={column} className="rounded-2xl border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{column}</h4>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{items.length}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {items.map((item) => (
                      <div key={item} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-3 text-sm text-slate-900">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-blue-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="rounded-[1.5rem] bg-[#f7fbff] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Screenshot 02</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Job detail</h3>
              <div className="mt-5 space-y-3">
                {jobSummaryCards.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-blue-200 bg-white p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="rounded-[1.5rem] bg-[#f7fbff] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Screenshot 03</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Daily dashboard</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {dashboardStatCards.map(({ label, value, tone }) => (
                  <div key={label} className={`rounded-2xl p-3 ${statToneClass(tone)}`}>
                    <p className="text-xs opacity-70">{label}</p>
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
