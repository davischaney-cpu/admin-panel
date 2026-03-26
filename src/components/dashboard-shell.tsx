"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useRef, type ReactNode } from "react";
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
  const userButtonRef = useRef<HTMLDivElement | null>(null);

  function openUserMenu() {
    const trigger = userButtonRef.current?.querySelector("button");
    trigger?.click();
  }

  return (
    <main className="min-h-screen text-slate-900">
      <div className="min-h-screen">
        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 rounded-[32px] bg-blue-800 px-5 py-4 text-white shadow-[0_18px_60px_rgba(30,64,175,0.28)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-blue-100">CRM workspace</p>
                <p className="text-xs text-blue-200/80">{email ?? "Signed in"}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-[24px] bg-white/10 p-2">
                {visibleNavItems.map((item) => {
                  const isActive = item.href === currentPath || currentPath.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-2xl px-5 py-2.5 text-sm transition ${isActive ? "bg-white text-blue-800" : "text-white hover:bg-white/10"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={openUserMenu}
                  className="ml-1 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 transition hover:bg-blue-50"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-slate-900">{role ? `${role[0].toUpperCase()}${role.slice(1)}` : "Account"}</p>
                    <p className="text-xs text-slate-500">Open menu</p>
                  </div>
                  <div ref={userButtonRef} onClick={(event) => event.stopPropagation()}>
                    <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/user" />
                  </div>
                </button>
              </div>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
