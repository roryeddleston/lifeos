// src/lib/client-fetch.ts
export async function fetchJSON<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  if (res.status === 401) {
    // Option A: soft prompt
    // throw new Error("Please log in to continue.");

    // Option B: send them to Auth0 login
    window.location.href = "/api/auth/login";
    // Return a never-resolving promise to stop caller flow:
    return new Promise<T>(() => {});
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
