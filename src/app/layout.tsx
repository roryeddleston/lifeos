import type { Metadata } from "next";
import "./globals.css";
import { montserrat } from "@/styles/fonts";
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
