import React from "react";

type CardProps = React.PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}>;

export default function Card({
  className = "",
  title,
  subtitle,
  footer,
  children,
}: CardProps) {
  return (
    <section
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow ${className}`}
    >
      {(title || subtitle) && (
        <header className="px-4 pt-4">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </header>
      )}

      <div className={`${title || subtitle ? "p-4 pt-3" : "p-4"}`}>
        {children}
      </div>

      {footer && (
        <footer className="px-4 pb-4 pt-0 text-xs text-gray-500">
          {footer}
        </footer>
      )}
    </section>
  );
}
