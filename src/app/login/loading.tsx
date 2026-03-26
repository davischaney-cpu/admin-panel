export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eaf3fb] px-4 text-slate-900">
      <div className="w-full max-w-md rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="animate-pulse">
          <div className="h-5 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-10 w-56 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-48 rounded bg-slate-100" />
          <div className="mt-8 space-y-3">
            <div className="h-12 rounded-2xl bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
