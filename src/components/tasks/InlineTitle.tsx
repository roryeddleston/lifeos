"use client";

import { useState, useRef } from "react";

const capSentence = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export default function InlineTitle({
  // id is intentionally unused here; prefix to satisfy ESLint
  id: _id,
  title,
  done,
  onChange,
}: {
  id: string;
  title: string;
  done: boolean;
  onChange?: (next: string) => Promise<boolean> | boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  const ref = useRef<HTMLInputElement>(null);

  async function save() {
    const next = capSentence(val.trim());
    setEditing(false);
    if (next === title) return;

    const ok = (await onChange?.(next)) ?? true;
    if (!ok) setVal(title);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true);
          setTimeout(() => ref.current?.focus(), 0);
        }}
        className="text-left w-full rounded cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2"
        style={{
          color: done
            ? "color-mix(in oklab, var(--twc-text) 45%, transparent)"
            : "var(--twc-text)",
          textDecoration: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.textDecoration = "underline")
        }
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        aria-label="Edit title"
        title="Edit title"
      >
        {done ? (
          <span style={{ textDecoration: "line-through" }}>
            {capSentence(val)}
          </span>
        ) : (
          capSentence(val)
        )}
      </button>
    );
  }

  return (
    <input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          setVal(title);
          setEditing(false);
        }
      }}
      className="w-full bg-transparent focus:outline-none"
      style={{
        border: "none",
        borderBottom:
          "1px solid color-mix(in oklab, var(--twc-text) 18%, transparent)",
        color: "var(--twc-text)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderBottom = "1px solid var(--twc-accent)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderBottom =
          "1px solid color-mix(in oklab, var(--twc-text) 18%, transparent)";
      }}
      aria-label="Task title input"
    />
  );
}
