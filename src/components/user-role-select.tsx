"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { APP_ROLES } from "@/lib/permissions";
import { useToast } from "@/components/toast-provider";

export function UserRoleSelect({ userId, value }: { userId: string; value: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function updateRole(nextRole: string) {
    const response = await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = await response.json() as { error?: string };

    startTransition(() => {
      showToast(response.ok ? "Role updated." : data.error ?? "Could not update role.");
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => updateRole(e.target.value)}
      className="rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none"
    >
      {APP_ROLES.filter((role) => role !== "OWNER").map((role) => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}
