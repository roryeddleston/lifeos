"use client";
import { forwardRef, InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <label className="block">
        {label && <span className="text-sm font-medium">{label}</span>}
        <input
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
Input.displayName = "Input";
export default Input;
