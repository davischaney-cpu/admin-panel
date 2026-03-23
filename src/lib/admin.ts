import { currentUser } from "@clerk/nextjs/server";

export async function getAdminContext() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null;

  return {
    user,
    email,
    role,
    isAdmin: role === "admin",
  };
}
