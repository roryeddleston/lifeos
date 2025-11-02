import type { Metadata } from "next";
import "./globals.css";
import { montserrat } from "@/styles/fonts";
import { ToastProvider } from "@/components/ui/Toaster";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

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
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
