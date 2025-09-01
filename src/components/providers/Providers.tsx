"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toaster";

/**
 * Central client-side provider hub.
 * Add/compose all React context providers here so RootLayout can stay a server component.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
