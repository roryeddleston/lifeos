"use client";

import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  label: string;
};

/**
 * Professional Add Action Button:
 * - Blue-green gradient background
 * - 2px border accent
 * - White text
 * - Smooth hover/active/focus states
 */
export default function AddActionButton({
  label,
  className = "",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "cursor-pointer select-none",
        className,
      ].join(" ")}
      style={{
        background:
          "linear-gradient(135deg, var(--twc-accent), color-mix(in oklab, var(--twc-accent) 80%, #0ea5e9))",
        border: "2px solid var(--twc-accent)",
        color: "#fff",
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.08), 0 4px 10px rgba(20, 184, 166, 0.25)", // subtle teal glow
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "brightness(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(1.08)";
      }}
    >
      {label}
    </button>
  );
}
