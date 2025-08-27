"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Minimal light/dark toggle.
 * Avoids hydration mismatch by waiting until mounted.
 */
export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // keep layout stable
    return (
      <button
        aria-label="Toggle theme"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/70 text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200"
      />
    );
  }

  const resolved = theme === "system" ? systemTheme : theme;
  const isDark = resolved === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-800 transition"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
