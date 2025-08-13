import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { montserrat } from "@/styles/fonts";
import { ToastProvider } from "@/components/ui/Toaster";

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
    <html lang="en" className="h-full">
      <body
        className={`${montserrat.className} min-h-screen bg-white text-gray-900`}
      >
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
