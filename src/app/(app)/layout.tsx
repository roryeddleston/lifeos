import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Providers from "@/app/providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
