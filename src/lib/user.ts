import "server-only";
import { cookies } from "next/headers";

export type UserLike = {
  sub: string; // stable user id from Auth0
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

// Narrow return shape we care about
type SessionLike = { user?: unknown } | null;
type GetSessionFn = (...args: unknown[]) => Promise<SessionLike>;
type Auth0Module = { getSession?: GetSessionFn };

/**
 * Load getSession from whichever export your installed SDK provides.
 * Supports both:
 *   - @auth0/nextjs-auth0 (older/newer root export)
 *   - @auth0/nextjs-auth0/server (some versions)
 */
async function loadGetSession(): Promise<GetSessionFn | null> {
  try {
    const mod = (await import("@auth0/nextjs-auth0")) as unknown as Auth0Module;
    if (typeof mod.getSession === "function") return mod.getSession;
    // Some builds put it on default
    const def = (mod as unknown as { default?: Auth0Module }).default;
    if (def?.getSession) return def.getSession;
  } catch {
    // ignore — fallback below
  }

  try {
    const modServer = (await import(
      "@auth0/nextjs-auth0/server"
    )) as unknown as Auth0Module;
    if (typeof modServer.getSession === "function") return modServer.getSession;
  } catch {
    // ignore
  }

  return null;
}

export async function getUser(): Promise<UserLike | null> {
  // Prevent Next.js 15 “cookies() should be awaited…” when SDK sets cookies
  await cookies();

  const getSession = await loadGetSession();
  if (!getSession) return null;

  const session = await getSession();
  const u = (session?.user ?? null) as UserLike | null;
  return u;
}

/** Returns the Auth0 subject (user id) or null if unauthenticated. */
export async function getUserId(): Promise<string | null> {
  const u = await getUser();
  return u?.sub ?? null;
}
