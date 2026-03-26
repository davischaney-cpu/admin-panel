"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-50">
      <div className="min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px]"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[290px] border-r border-white/10 bg-[#0b0d12]/95 p-6 backdrop-blur-xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">DavyG</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">DavyG CRM</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">A tighter workspace for leads, jobs, follow-ups, and team visibility.</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
            >
              Close
            </button>
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

        <section className="p-5 sm:p-8 lg:p-10 lg:pl-12">
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                ☰ Menu
              </button>
              <div>
                <p className="text-sm text-zinc-300">{role ? `${role[0].toUpperCase()}${role.slice(1)}` : "Account"}</p>
                <p className="text-xs text-zinc-500">{email ?? "Signed in"}</p>
              </div>
            </div>
            <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/user" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
