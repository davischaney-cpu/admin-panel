import Link from "next/link";
import { PublicLeadCaptureForm } from "@/components/public-lead-capture-form";

const highlights = [
  "Pipeline board for leads and follow-ups",
  "Booked jobs calendar for home-service teams",
  "Quote-to-job workflow without spreadsheet chaos",
  "Fast admin dashboard with Clerk auth and Postgres",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">DavyG</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">DavyG CRM</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                A lean CRM for home-service operators who need to capture leads, follow up fast, send quotes, and get jobs on the calendar.
              </p>
            </div>
            <div className="hidden gap-3 sm:flex">
              <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Sign in</Link>
              <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">Open app</Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-sm text-zinc-400">Why it sells</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Stop losing leads because follow-up is messy.</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-300">
              <p>Most small operators do not need Salesforce. They need one place to see new inquiries, quotes waiting on approval, callbacks due today, and jobs already booked.</p>
              <p>DavyG CRM is shaped around that exact workflow: lead in, follow-up fast, quote, book, complete.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Starter", "$29/mo", "Single operator, pipeline, follow-ups, and jobs calendar."],
                ["Pro", "$79/mo", "More automation, richer job workflows, and better reporting."],
                ["Team", "$149/mo", "Multiple users, deeper workflow controls, and team ops visibility."],
              ].map(([name, price, copy]) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-zinc-400">{name}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{price}</p>
                  <p className="mt-2 text-sm text-zinc-400">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-200">Create account</Link>
              <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Log in</Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-8">
              <p className="text-sm text-zinc-400">Core features</p>
              <div className="mt-5 space-y-4">
                {[
                  ["Leads", "Track source, value, urgency, and next follow-up."],
                  ["Pipeline", "Move inquiries from new to booked without losing context."],
                  ["Jobs", "Convert leads into booked work and keep the calendar clean."],
                  ["Calendar", "See scheduled jobs by day and stay ahead of crew chaos."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-medium text-white">{title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <PublicLeadCaptureForm />
          </div>
        </div>
      </section>
    </main>
  );
}
