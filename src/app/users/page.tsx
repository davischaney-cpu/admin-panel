import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminContext } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { DashboardShell } from "@/components/dashboard-shell";
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

export default async function UsersPage() {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("manageUsers")) {
    return <UnauthorizedState email={email} />;
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell email={email} role={role} currentPath="/users">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Team access</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Users</h2>
          <p className="mt-2 text-sm text-zinc-500">Manage company roles and control who can edit what inside the app.</p>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
          Back to dashboard
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Total users</p>
          <p className="mt-3 text-3xl font-semibold">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Admins + owners</p>
          <p className="mt-3 text-3xl font-semibold">{users.filter((user) => user.role === "ADMIN" || user.role === "OWNER").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Newest signup</p>
          <p className="mt-3 text-lg font-semibold">{users[0] ? formatDate(users[0].createdAt) : "No users yet"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">All users</h3>
              <p className="text-sm text-zinc-400">Role changes update what each person can create, edit, or manage.</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Change role</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Clerk ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 last:border-0">
                    <td className="py-4 font-medium">{user.name || "—"}</td>
                    <td className="py-4 text-zinc-300">{user.email}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${roleClasses(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="py-4">
                      {hasPermission("manageRoles") ? <UserRoleSelect userId={user.id} value={user.role} /> : <span className="text-zinc-500">No access</span>}
                    </td>
                    <td className="py-4 text-zinc-300">{formatDate(user.createdAt)}</td>
                    <td className="py-4 font-mono text-xs text-zinc-500">{user.clerkUserId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Role permissions</h3>
          <div className="mt-5 space-y-4">
            {(["OWNER", "ADMIN", "SALES", "OPS", "VIEWER"] as const).map((roleName) => (
              <div key={roleName} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium">{roleName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getRolePermissions(roleName).map((permission) => (
                    <span key={permission} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
