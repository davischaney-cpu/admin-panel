import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { hasPermission } from "@/lib/permissions";

type DashboardShellProps = {
  children: ReactNode;
  email?: string | null;
  role?: string | null;
  currentPath?: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", permission: "viewDashboard" },
  { label: "Leads", href: "/leads", permission: "viewLeads" },
  { label: "Jobs", href: "/jobs", permission: "viewJobs" },
  { label: "Calendar", href: "/calendar", permission: "viewCalendar" },
  { label: "Users", href: "/users", permission: "manageUsers" },
] as const;

export function DashboardShell({ children, email, role, currentPath = "/" }: DashboardShellProps) {
  const visibleNavItems = navItems.filter((item) => hasPermission(role, item.permission));

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/5 p-6 lg:block">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">DavyG</p>
            <h1 className="mt-2 text-2xl font-semibold">DavyG CRM</h1>
            <p className="mt-2 text-sm text-zinc-500">Stop losing leads. Track every follow-up and job in one place.</p>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            {visibleNavItems.map((item) => {
              const isActive = item.href === currentPath || currentPath.startsWith(`${item.href}/`);
              const baseClasses = isActive
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-white/10 hover:text-white";

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
              <p className="text-sm text-zinc-300">{role ? `${role[0].toUpperCase()}${role.slice(1)}` : "Account"}</p>
              <p className="text-xs text-zinc-500">{email ?? "Signed in"}</p>
            </div>
            <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/user" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
