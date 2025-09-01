import "server-only";
import { redirect } from "next/navigation";
import { getUser, getUserId, type UserLike } from "@/lib/user";

/** For pages that work with or without a user. */
export async function optionalUser(): Promise<UserLike | null> {
  return getUser();
}

/** For pages that require auth: redirects to login if unauthenticated. */
export async function requireUser(returnTo?: string): Promise<UserLike> {
  const u = await getUser();
  if (!u)
    redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo ?? "/")}`);
  return u;
}

/** Same as above but returns just the id. */
export async function requireUserId(returnTo?: string): Promise<string> {
  const id = await getUserId();
  if (!id)
    redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo ?? "/")}`);
  return id;
}
