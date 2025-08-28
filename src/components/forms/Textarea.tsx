"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <label className="block">
        {label && <span className="text-sm font-medium">{label}</span>}
        <textarea
          ref={ref}
          className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 ${className}`}
          {...props}
        />
        {error && (
          <span className="mt-1 block text-xs text-rose-600">{error}</span>
        )}
      </label>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
