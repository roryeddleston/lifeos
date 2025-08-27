"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class" // toggles 'dark' class on <html>
      defaultTheme="light" // start in light
      enableSystem={false} // ignore OS; pure manual toggle (simpler)
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
