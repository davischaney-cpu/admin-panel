import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 py-8 text-zinc-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.16),transparent_28%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <div className="grid lg:grid-cols-[1fr_460px]">
          <section className="hidden border-r border-white/10 p-10 lg:block">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">DavyG</p>
            <h1 className="mt-4 max-w-sm text-4xl font-semibold tracking-tight">Create access for DavyG Admin Panel.</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
              Make the account first, then we can control who actually gets admin access inside the app.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "Email or Google sign-in",
                "Protected dashboard routes",
                "Admin role managed in Clerk",
                "Built for real school workflow",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="relative p-3 sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-2">
              <SignUp
                path="/sign-up"
                routing="path"
                signInUrl="/login"
                forceRedirectUrl="/dashboard"
                appearance={clerkAppearance}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
