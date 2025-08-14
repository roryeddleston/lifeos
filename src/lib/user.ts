// If you later add Clerk, you can import { auth } from "@clerk/nextjs";
// and return auth().userId || "demo".
export async function getUserId(): Promise<string> {
  // Demo fallback (no auth configured yet)
  return "demo";
}
