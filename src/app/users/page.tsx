import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminContext } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader, SectionCard, SectionTitle, StatCard, SecondaryButton } from "@/components/ui";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { UserRoleSelect } from "@/components/user-role-select";
import { getRolePermissions } from "@/lib/permissions";

function roleClasses(role: string) {
  switch (role) {
    case "OWNER":
      return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20";
    case "ADMIN":
      return "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20";
    case "SALES":
      return "bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/20";
    case "OPS":
      return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20";
    default:
      return "bg-zinc-400/15 text-zinc-200 ring-1 ring-zinc-400/20";
  }
}

const roleDescriptions: Record<string, string> = {
  OWNER: "Full control, including billing, roles, and company-wide settings.",
  ADMIN: "Runs the business day-to-day and manages the team.",
  SALES: "Owns leads, follow-ups, and converting work into booked jobs.",
  OPS: "Handles scheduling, jobs, and operational execution.",
  VIEWER: "Read-only access for oversight without editing power.",
};

export default async function UsersPage() {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("manageUsers")) {
    return <UnauthorizedState email={email} />;
  }

  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  const ownerCount = users.filter((user) => user.role === "OWNER").length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const opsCount = users.filter((user) => user.role === "OPS").length;
  const salesCount = users.filter((user) => user.role === "SALES").length;

  return (
    <DashboardShell email={email} role={role} currentPath="/users">
      <PageHeader
        eyebrow="Team access"
        title="Users & roles"
        description="Keep access clean across the company — owners, admins, sales, ops, and view-only users all get different capabilities."
        actions={<SecondaryButton href="/dashboard">Back to dashboard</SecondaryButton>}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={String(users.length)} />
        <StatCard label="Owners + admins" value={String(ownerCount + adminCount)} />
        <StatCard label="Sales + ops" value={String(salesCount + opsCount)} />
        <StatCard label="Newest signup" value={users[0] ? formatDate(users[0].createdAt) : "No users yet"} />
      </div>

      <div className="mt-8 grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Team members" description="Change a role here and the app updates both database access and Clerk metadata." />
            <div className="mt-6 space-y-3">
              {users.length ? users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium text-white">{user.name || "Unnamed user"}</p>
                        <span className={`rounded-full px-3 py-1 text-xs ${roleClasses(user.role)}`}>{user.role}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">{user.email}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                        <span>Joined {formatDate(user.createdAt)}</span>
                        <span className="font-mono">{user.clerkUserId}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-40">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Role</p>
                      {hasPermission("manageRoles") ? <UserRoleSelect userId={user.id} value={user.role} /> : <span className="text-zinc-500">No access</span>}
                    </div>
                  </div>
                </div>
              )) : null}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Role guide" description="A quick explanation of what each role can do." />
            <div className="mt-5 space-y-4">
              {(["OWNER", "ADMIN", "SALES", "OPS", "VIEWER"] as const).map((roleName) => (
                <div key={roleName} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${roleClasses(roleName)}`}>{roleName}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{roleDescriptions[roleName]}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getRolePermissions(roleName).map((permission) => (
                      <span key={permission} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{permission}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
