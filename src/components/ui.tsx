import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-700/70">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "blue" }: { label: string; value: string; hint?: string; tone?: "purple" | "blue" | "cyan" | "green" }) {
  const toneClass =
    tone === "purple"
      ? "from-violet-600 to-indigo-500"
      : tone === "cyan"
        ? "from-sky-500 to-cyan-500"
        : tone === "green"
          ? "from-teal-500 to-emerald-400"
          : "from-blue-700 to-blue-500";

  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${toneClass} p-6 text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)]`}>
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
      <p className="font-medium text-slate-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800">{children}</a>;
}

export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 transition hover:bg-slate-50">{children}</a>;
}
