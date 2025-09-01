import "server-only";
import { getSession } from "@auth0/nextjs-auth0";

export type UserLike = {
  sub: string; // stable user id from Auth0
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

export async function getUser(): Promise<UserLike | null> {
  const session = await getSession();
  return (session?.user as UserLike) ?? null;
}

/** Returns the Auth0 subject (user id) or null if unauthenticated. */
export async function getUserId(): Promise<string | null> {
  const u = await getUser();
  return u?.sub ?? null;
}
