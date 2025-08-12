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
          <div className="rounded-lg bg-gray-100 p-2">
            <Icon size={18} />
          </div>
        )}

        <div className="flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-semibold">{value}</span>
            {delta && (
              <span
                className={`text-xs ${
                  positive ? "text-emerald-600" : "text-rose-600"
                }`}
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
