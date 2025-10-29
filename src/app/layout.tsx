import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { montserrat } from "@/styles/fonts";
import Providers from "./providers";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Life OS",
  description: "Your personal operating system.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${montserrat.className} min-h-screen bg-[var(--bg)] text-[var(--text)]`}
        >
          <ClerkLoaded>
            <SignedIn>
              <Providers>
                <AppShell>{children}</AppShell>
              </Providers>
            </SignedIn>
            <SignedOut>{children}</SignedOut>
          </ClerkLoaded>
          <ClerkLoading>
            <div className="flex justify-center items-center min-h-screen">
              <p>Loading...</p>
            </div>
          </ClerkLoading>
        </body>
      </html>
    </ClerkProvider>
  );
}
