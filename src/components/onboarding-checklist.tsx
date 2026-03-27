import Link from "next/link";

type OnboardingChecklistProps = {
  hasLeads: boolean;
  hasJobs: boolean;
  hasFollowUps: boolean;
};

export function OnboardingChecklist({ hasLeads, hasJobs, hasFollowUps }: OnboardingChecklistProps) {
  const steps = [
    {
      done: hasLeads,
      title: "Create your first lead",
      description: "Add an inquiry so the pipeline has something real in it.",
      href: "/leads",
      cta: hasLeads ? "Done" : "Open leads",
    },
    {
      done: hasFollowUps,
      title: "Schedule a follow-up",
      description: "Set a next contact date so nobody slips through the cracks.",
      href: "/leads",
      cta: hasFollowUps ? "Done" : "Set follow-up",
    },
    {
      done: hasJobs,
      title: "Convert a lead into a job",
      description: "Turn an inquiry into booked work and get it on the calendar.",
      href: "/jobs",
      cta: hasJobs ? "Done" : "View jobs",
    },
  ];

  const completed = steps.filter((step) => step.done).length;

  return (
    <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">First-run setup</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Get the CRM working for you in 3 moves</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{completed}/3 complete</span>
      </div>

      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {step.done ? "✓" : "•"}
                  </span>
                  <p className="font-medium text-slate-900">{step.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">{step.description}</p>
              </div>
              <Link href={step.href} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                {step.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
