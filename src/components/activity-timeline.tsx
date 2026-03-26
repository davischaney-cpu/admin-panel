type ActivityItem = {
  id: string;
  message: string;
  createdAt: Date;
};

export function ActivityTimeline({ title = "Activity", items }: { title?: string; items: ActivityItem[] }) {
  return (
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
            <p className="font-medium text-slate-900">{item.message}</p>
            <p className="mt-1 text-xs text-slate-600">{item.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f7fbff] p-4 text-sm text-slate-700">
            No activity yet.
          </div>
        )}
      </div>
    </div>
  );
}
