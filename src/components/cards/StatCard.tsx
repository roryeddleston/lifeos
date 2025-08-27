import { type ElementType } from "react";
import Card from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  delta?: string; // e.g. "+12%" or "-3"
  positive?: boolean; // controls delta color
  icon?: ElementType; // lucide icon component
  className?: string;
};

export default function StatCard({
  label,
  value,
  delta,
  positive,
  icon: Icon,
  className = "",
}: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className="rounded-lg p-2"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
              border: "1px solid var(--twc-border)",
              color: "var(--twc-text)",
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--twc-muted)" }}>
            {label}
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="text-xl font-semibold"
              style={{ color: "var(--twc-text)" }}
            >
              {value}
            </span>

            {delta && (
              <span
                className="text-xs"
                style={{
                  color: positive
                    ? "var(--twc-accent)"
                    : "color-mix(in oklab, #ef4444 85%, var(--twc-text))",
                }}
                aria-label={positive ? "increase" : "decrease"}
              >
                {delta}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
