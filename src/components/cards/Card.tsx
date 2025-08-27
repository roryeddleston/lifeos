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
      className={`rounded-xl shadow-sm transition-shadow hover:shadow ${className}`}
      // Use theme tokens instead of fixed Tailwind colors
      style={{
        backgroundColor: "var(--twc-surface)",
        border: "1px solid var(--twc-border)",
      }}
    >
      {(title || subtitle) && (
        <header className="px-4 pt-4">
          {title && (
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--twc-text)" }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-xs" style={{ color: "var(--twc-muted)" }}>
              {subtitle}
            </p>
          )}
        </header>
      )}

      <div className={`${title || subtitle ? "p-4 pt-3" : "p-4"}`}>
        {children}
      </div>

      {footer && (
        <footer
          className="px-4 pb-4 pt-0 text-xs"
          style={{ color: "var(--twc-muted)" }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}
