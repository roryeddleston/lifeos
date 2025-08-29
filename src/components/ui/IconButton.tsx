"use client";

import * as React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 28 | 32 | 36 | 40;
  intent?: "neutral" | "danger" | "accent";
  circular?: boolean;
};

export default function IconButton({
  size = 32,
  intent = "neutral",
  circular = false,
  className,
  style,
  ...rest
}: Props) {
  const base = clsx(
    "inline-flex items-center justify-center select-none",
    "cursor-pointer transition active:scale-[0.98]",
    // focus ring only when tabbing (focus-visible)
    "outline-none focus-visible:ring-2",
    circular ? "rounded-full" : "rounded-md"
  );

  const dim =
    size === 40
      ? "h-10 w-10"
      : size === 36
      ? "h-9 w-9"
      : size === 28
      ? "h-7 w-7"
      : "h-8 w-8";

  const computedStyle: React.CSSProperties = {
    color:
      intent === "danger"
        ? "var(--twc-danger)"
        : intent === "accent"
        ? "var(--twc-accent)"
        : "var(--twc-text)",
    backgroundColor: "var(--twc-surface)",
    border: "1px solid var(--twc-border)",
    ...style,
  };

  return (
    <button
      {...rest}
      className={clsx(base, dim, className)}
      style={computedStyle}
      onMouseEnter={(e) => {
        // subtle neutral hover
        e.currentTarget.style.backgroundColor =
          "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--twc-surface)";
      }}
    />
  );
}
