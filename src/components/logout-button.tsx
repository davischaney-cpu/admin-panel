"use client";

import { SignOutButton } from "@clerk/nextjs";

export function LogoutButton() {
  return (
    <SignOutButton>
      <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
        Logout
      </button>
    </SignOutButton>
  );
}
