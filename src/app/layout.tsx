import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Life OS",
  description: "Your personal operating system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="md:flex">
          <Sidebar />
          <div className="flex-1 min-h-screen">
            <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
              <div className="mx-auto max-w-6xl px-4 py-3">
                <h1 className="text-sm font-medium tracking-tight">
                  Welcome back
                </h1>
              </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
