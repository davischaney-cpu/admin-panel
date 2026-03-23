import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminContext } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";

function roleClasses(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20";
    case "EDITOR":
      return "bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/20";
    default:
      return "bg-zinc-400/15 text-zinc-200 ring-1 ring-zinc-400/20";
  }
}

export default async function UsersPage() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell email={email} role={role} currentPath="/users">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Database-backed data</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Users</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Reading live records from Postgres with Prisma.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
          Back to overview
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Total users</p>
          <p className="mt-3 text-3xl font-semibold">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Admins</p>
          <p className="mt-3 text-3xl font-semibold">{users.filter((user) => user.role === "ADMIN").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Newest signup</p>
          <p className="mt-3 text-lg font-semibold">
            {users[0] ? formatDate(users[0].createdAt) : "No users yet"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">All users</h3>
            <p className="text-sm text-zinc-400">Synced from Clerk into Postgres</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
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
                    <span className={`rounded-full px-3 py-1 text-xs ${roleClasses(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-300">{formatDate(user.createdAt)}</td>
                  <td className="py-4 font-mono text-xs text-zinc-500">{user.clerkUserId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
