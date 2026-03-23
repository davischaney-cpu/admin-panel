export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 text-zinc-50">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20">
        <div className="animate-pulse">
          <div className="h-5 w-24 rounded bg-white/10" />
          <div className="mt-4 h-10 w-56 rounded bg-white/10" />
          <div className="mt-2 h-4 w-48 rounded bg-white/5" />
          <div className="mt-8 space-y-3">
            <div className="h-12 rounded-2xl bg-black/20" />
            <div className="h-12 rounded-2xl bg-black/20" />
            <div className="h-12 rounded-2xl bg-black/20" />
          </div>
        </div>
      </div>
    </main>
  );
}
