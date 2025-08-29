import StatCard from "@/components/cards/StatCard";
import type { LucideIcon } from "lucide-react";

type Item =
  | {
      label: string;
      value: number | string;
      delta?: string;
      positive?: boolean;
      icon: LucideIcon;
    }
  | {
      label: string;
      value: number | string;
      icon: LucideIcon;
      delta?: string;
      positive?: boolean;
    };

export default function StatCardsRow({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it, i) => (
        <StatCard
          key={i}
          label={it.label}
          value={it.value}
          delta={it.delta ?? ""}
          positive={!!it.positive}
          icon={it.icon}
        />
      ))}
    </div>
  );
}
