"use client";
type Option = { label: string; value: string };

export default function Select({
  label,
  error,
  options,
  value,
  onChange,
  name,
}: {
  label?: string;
  error?: string;
  options: Option[];
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
}) {
  return (
    <label className="block">
      {label && <span className="text-sm font-medium">{label}</span>}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  );
}
