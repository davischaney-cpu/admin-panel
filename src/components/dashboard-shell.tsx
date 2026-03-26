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
  { label: "Overview", href: "/dashboard", permission: "viewDashboard" },
  { label: "Leads", href: "/leads", permission: "viewLeads" },
  { label: "Jobs", href: "/jobs", permission: "viewJobs" },
  { label: "Calendar", href: "/calendar", permission: "viewCalendar" },
  { label: "Users", href: "/users", permission: "manageUsers" },
] as const;

export function DashboardShell({ children, email, role, currentPath = "/" }: DashboardShellProps) {
  const visibleNavItems = navItems.filter((item) => hasPermission(role, item.permission));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen text-slate-900">
      <div className="min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/35"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[300px] border-r border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-700/60">AdminPaneling</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">DavyG CRM</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">A cleaner workspace for leads, jobs, follow-ups, and team visibility.</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            {visibleNavItems.map((item) => {
              const isActive = item.href === currentPath || currentPath.startsWith(`${item.href}/`);
              const baseClasses = isActive
                ? "bg-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center rounded-2xl px-4 py-3 transition ${baseClasses}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 rounded-[32px] bg-blue-800 px-5 py-4 text-white shadow-[0_18px_60px_rgba(30,64,175,0.28)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl bg-white/12 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  ☰ Menu
                </button>
                <div>
                  <p className="text-sm text-blue-100">CRM workspace</p>
                  <p className="text-xs text-blue-200/80">{email ?? "Signed in"}</p>
                </div>
              </div>

              <div className="hidden xl:flex items-center gap-3 rounded-full bg-white/10 p-2">
                {visibleNavItems.slice(0, 4).map((item) => {
                  const isActive = item.href === currentPath || currentPath.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-2xl px-5 py-2.5 text-sm transition ${isActive ? "bg-white text-blue-800" : "text-white/90 hover:bg-white/10"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 self-end xl:self-auto">
                <div className="text-right">
                  <p className="text-sm text-white">{role ? `${role[0].toUpperCase()}${role.slice(1)}` : "Account"}</p>
                  <p className="text-xs text-blue-200/80">Active workspace</p>
                </div>
                <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/user" />
              </div>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
