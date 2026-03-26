"use client";

import { SignOutButton } from "@clerk/nextjs";

export function LogoutButton() {
  return (
    <SignOutButton>
      <button className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f]">
        Logout
      </button>
    </SignOutButton>
  );
}
