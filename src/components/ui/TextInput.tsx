"use client";

import * as React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

export default function TextInput({
  label,
  hint,
  className,
  containerClassName,
  style,
  ...rest
}: Props) {
  const base =
    "mt-1 w-full rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-2";
  const fieldStyle: React.CSSProperties = {
    border: "1px solid var(--twc-border)",
    color: "var(--twc-text)",
    backgroundColor: "var(--twc-surface)",
    ...style,
  };

  return (
    <div className={clsx("w-full", containerClassName)}>
      {label && (
        <label className="block text-xs" style={{ color: "var(--twc-muted)" }}>
          {label}
        </label>
      )}
      <input className={clsx(base, className)} style={fieldStyle} {...rest} />
      {hint && (
        <div className="mt-1 text-[11px]" style={{ color: "var(--twc-muted)" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
