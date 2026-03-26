import Link from "next/link";
import { LandingScreenshots } from "@/components/landing-screenshots";
import { PublicLeadCaptureForm } from "@/components/public-lead-capture-form";

const highlights = [
  "Capture every lead before it slips through the cracks",
  "See your pipeline, follow-ups, and booked jobs in one place",
  "Turn quotes into scheduled work faster",
  "Built for small home-service operators, not enterprise teams",
];

const featureCards = [
  ["Lead capture", "Track source, value, urgency, and next follow-up without spreadsheet chaos."],
  ["Pipeline view", "Move inquiries from new to booked with a board that actually matches the way small shops work."],
  ["Jobs calendar", "See booked work by day so nothing gets forgotten or double-booked."],
  ["Job detail", "Keep notes, pricing, scheduling, and customer context on one screen."],
];

const pricing = [
  ["Starter", "$29/mo", "Single operator, pipeline, follow-ups, and jobs calendar."],
  ["Pro", "$79/mo", "More automation, richer job workflows, and better reporting."],
  ["Team", "$149/mo", "Multiple users, deeper workflow controls, and team ops visibility."],
];

const trustSignals = [
  "Built for home-service operators",
  "Fast lead intake and follow-up workflow",
  "Jobs, calendar, and team visibility in one place",
  "Cleaner than spreadsheets and generic CRMs",
];

const comparisonPoints = [
  ["Follow-up speed", "See overdue callbacks and today’s touchpoints the second you log in."],
  ["Scheduling clarity", "Move from quote to booked job without juggling separate calendars and notes."],
  ["Team visibility", "Owners, sales, and ops all get the context they need without extra noise."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">DavyG</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                The simple CRM for home-service operators who need to follow up faster.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                DavyG CRM helps solo operators and small crews keep up with new leads, quotes, callbacks, and booked jobs without bouncing between notes, texts, and spreadsheets.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">Start free</Link>
                <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">Sign in</Link>
                <Link href="#pricing" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">See pricing</Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {trustSignals.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0f1218] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Product preview</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Today’s operating view</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">Live pipeline</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    ["New leads", "12"],
                    ["Follow-ups overdue", "4"],
                    ["Jobs this week", "9"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-sm text-zinc-400">{label}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">Leads needing attention</h3>
                      <span className="text-xs text-zinc-500">Pipeline</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Marcus Rivera", "Full detail • Frisco", "Follow up today", "$185"],
                        ["Nina Brooks", "Interior detail • Plano", "Quote waiting", "$140"],
                        ["Ethan Cole", "Wash + wax • Dallas", "Booked this week", "$220"],
                      ].map(([name, meta, status, value]) => (
                        <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div>
                            <p className="font-medium text-white">{name}</p>
                            <p className="text-xs text-zinc-500">{meta}</p>
                            <p className="mt-1 text-xs text-cyan-300">{status}</p>
                          </div>
                          <span className="text-sm text-zinc-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">This week’s jobs</h3>
                      <span className="text-xs text-zinc-500">Calendar</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Tue 9:00 AM", "Escalade full detail"],
                        ["Wed 1:30 PM", "Tesla wash + wax"],
                        ["Fri 11:00 AM", "Fleet interior cleanup"],
                      ].map(([time, title]) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xs text-zinc-500">{time}</p>
                          <p className="mt-1 font-medium text-white">{title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingScreenshots />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <p className="text-sm text-zinc-400">Why it sells</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Stop losing leads because follow-up is messy.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-300">
                <p>Most small operators do not need Salesforce. They need one place to see new inquiries, quotes waiting on approval, callbacks due today, and jobs already booked.</p>
                <p>DavyG CRM is shaped around that exact workflow: lead in, follow-up fast, quote, book, complete.</p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {featureCards.map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="font-medium text-white">{title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-8">
              <p className="text-sm text-zinc-400">What feels better</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Built for operators, not enterprise theater.</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {comparisonPoints.map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-medium text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div id="pricing" className="rounded-3xl border border-white/10 bg-black/20 p-8">
              <p className="text-sm text-zinc-400">Pricing</p>
              <div className="mt-5 space-y-4">
                {pricing.map(([name, price, copy]) => (
                  <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{name}</h3>
                      <span className="text-lg font-semibold text-white">{price}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <PublicLeadCaptureForm />
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
              <p className="text-sm text-cyan-200">Ready to modernize the workflow?</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Book a demo, seed sample data, and show the team how fast this can feel.</h2>
              <p className="mt-3 text-sm leading-6 text-cyan-50/80">Use this page as the sales surface, then walk prospects through the live dashboard, leads pipeline, and jobs flow.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/sign-up" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-100">Start free</Link>
                <Link href="/dashboard" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10">View dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
