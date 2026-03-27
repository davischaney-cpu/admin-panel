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
    <main className="min-h-screen bg-[#edf3f8] text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#163f87]">DavyG</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              The simple CRM for home-service operators who need to follow up faster.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              DavyG CRM helps solo operators and small crews keep up with new leads, quotes, callbacks, and booked jobs without bouncing between notes, texts, and spreadsheets.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#12346f]">Start free</Link>
              <Link href="/login" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] transition hover:bg-blue-50">Sign in</Link>
              <Link href="#pricing" className="rounded-xl border-2 border-blue-200 bg-[#eef5ff] px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-[#e4eeff]">See pricing</Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-blue-200 bg-white p-5 text-sm text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {trustSignals.map((item) => (
                <span key={item} className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-900">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="rounded-[1.5rem] bg-[#f7fbff] p-5">
              <div className="flex items-center justify-between border-b border-blue-200 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Product preview</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Today’s operating view</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Live pipeline</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  ["New leads", "12"],
                  ["Follow-ups overdue", "4"],
                  ["Jobs this week", "9"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-blue-200 bg-white p-4">
                    <p className="text-sm text-slate-600">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">Leads needing attention</h3>
                    <span className="text-xs text-slate-500">Pipeline</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Marcus Rivera", "Full detail • Frisco", "Follow up today", "$185"],
                      ["Nina Brooks", "Interior detail • Plano", "Quote waiting", "$140"],
                      ["Ethan Cole", "Wash + wax • Dallas", "Booked this week", "$220"],
                    ].map(([name, meta, status, value]) => (
                      <div key={name} className="flex items-center justify-between rounded-2xl border border-blue-200 bg-[#f7fbff] p-3">
                        <div>
                          <p className="font-medium text-slate-900">{name}</p>
                          <p className="text-xs text-slate-600">{meta}</p>
                          <p className="mt-1 text-xs font-medium text-[#163f87]">{status}</p>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">This week’s jobs</h3>
                    <span className="text-xs text-slate-500">Calendar</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Tue 9:00 AM", "Escalade full detail"],
                      ["Wed 1:30 PM", "Tesla wash + wax"],
                      ["Fri 11:00 AM", "Fleet interior cleanup"],
                    ].map(([time, title]) => (
                      <div key={title} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-3">
                        <p className="text-xs text-slate-500">{time}</p>
                        <p className="mt-1 font-medium text-slate-900">{title}</p>
                      </div>
                    ))}
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
            <div className="rounded-[30px] border border-blue-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm text-slate-600">Why it sells</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Stop losing leads because follow-up is messy.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
                <p>Most small operators do not need Salesforce. They need one place to see new inquiries, quotes waiting on approval, callbacks due today, and jobs already booked.</p>
                <p>DavyG CRM is shaped around that exact workflow: lead in, follow-up fast, quote, book, complete.</p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {featureCards.map(([title]) => (
                  <div key={title} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                    <h3 className="font-medium text-slate-900">{title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-blue-200 bg-[#e8f1ff] p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm text-slate-600">What feels better</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Built for operators, not enterprise theater.</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {comparisonPoints.map(([title]) => (
                  <div key={title} className="rounded-2xl bg-white p-4">
                    <h3 className="font-medium text-slate-900">{title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div id="pricing" className="rounded-[30px] border border-blue-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm text-slate-600">Pricing</p>
              <div className="mt-5 space-y-4">
                {pricing.map(([name, price]) => (
                  <div key={name} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900">{name}</h3>
                      <span className="text-lg font-semibold text-slate-900">{price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PublicLeadCaptureForm />
            <div className="rounded-[30px] bg-[#163f87] p-8 text-white shadow-[0_18px_50px_rgba(22,63,135,0.22)]">
              <p className="text-sm text-blue-100/85">Ready to modernize the workflow?</p>
              <h2 className="mt-2 text-2xl font-semibold">Book a demo, seed sample data, and show the team how fast this can feel.</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100/85">Use this page as the sales surface, then walk prospects through the live dashboard, leads pipeline, and jobs flow.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/sign-up" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] transition hover:bg-blue-50">Start free</Link>
                <Link href="/dashboard" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm text-white transition hover:bg-white/10">View dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
