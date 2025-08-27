import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { montserrat } from "@/styles/fonts";
import { ToastProvider } from "@/components/ui/Toaster";
import ThemeProvider from "@/components/theme/ThemeProvider";

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
    // Allow next-themes to flip a `class` on <html> without hydration warnings
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${montserrat.className} min-h-screen bg-white text-gray-900 dark:bg-[#0b0f1a] dark:text-gray-100`}
      >
        <ThemeProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
