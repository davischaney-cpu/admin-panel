import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f8] px-4 py-8 text-slate-900">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-blue-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid lg:grid-cols-[1fr_460px]">
          <section className="hidden bg-[#163f87] p-10 text-white lg:block">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100/80">DavyG</p>
            <h1 className="mt-4 max-w-sm text-4xl font-semibold tracking-tight">Create your DavyG CRM account.</h1>

            <div className="mt-10 space-y-3">
              {[
                "Email or Google sign-in",
                "Protected company workspace",
                "Roles synced with Clerk and the app",
                "Built for leads, jobs, and follow-ups",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/12 px-4 py-3 text-sm text-white">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="relative bg-[#f7fbff] p-3 sm:p-6">
            <div className="mb-4 rounded-[1.5rem] bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#163f87]">Get started</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create your DavyG CRM account</h2>
            </div>
            <div className="rounded-[1.5rem] border border-blue-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
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
