"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useMemo } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? "light") === "dark";

  const styles = useMemo<React.CSSProperties>(() => {
    // Light mode: navy chip with green icon
    // Dark mode: white chip with green icon
    return isDark
      ? {
          backgroundColor: "#ffffff",
          border: "1px solid var(--twc-border)",
          color: "var(--twc-accent)",
        }
      : {
          backgroundColor: "#0e172a", // navy in light mode
          border:
            "1px solid color-mix(in oklab, var(--twc-text) 12%, transparent)",
          color: "var(--twc-accent)",
        };
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light" : "Switch to dark"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer hover:opacity-90"
      style={styles}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
