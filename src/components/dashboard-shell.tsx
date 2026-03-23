import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { clerkAppearance } from "@/lib/clerk-appearance";

type DashboardShellProps = {
  children: ReactNode;
  email?: string | null;
  role?: string | null;
  currentPath?: string;
};

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Users", href: "/users" },
  { label: "Canvas", href: "/canvas" },
  { label: "Calendar", href: "/calendar" },
  { label: "Analytics", href: "#" },
  { label: "Settings", href: "#" },
];

export function DashboardShell({ children, email, role, currentPath = "/" }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/5 p-6 lg:block">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Wilson</p>
            <h1 className="mt-2 text-2xl font-semibold">Admin Panel</h1>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && (item.href === currentPath || currentPath.startsWith(`${item.href}/`));
              const baseClasses = isActive
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-white/10 hover:text-white";

              if (item.href === "#") {
                return (
                  <span
                    key={item.label}
                    className={`flex cursor-not-allowed items-center rounded-xl px-4 py-3 opacity-60 ${baseClasses}`}
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center rounded-xl px-4 py-3 transition ${baseClasses}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">Signed in</p>
              <p className="text-xs text-zinc-500">{email ?? "unknown user"}</p>
            </div>
            <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/user" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
