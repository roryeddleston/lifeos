import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { montserrat } from "@/styles/fonts";
import { ToastProvider } from "@/components/ui/Toaster";
import ThemeProvider from "@/components/theme/ThemeProvider";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

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
          <ThemeProvider>
            <ToastProvider>
              {/* Header for signed-in users only */}
              <SignedIn>
                <AppShell>{children}</AppShell>
              </SignedIn>

              {/* Signed-out fallback – show children like the /sign-in page */}
              <SignedOut>{children}</SignedOut>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
