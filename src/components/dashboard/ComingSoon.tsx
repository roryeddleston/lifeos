import { BookOpen, Dumbbell } from "lucide-react";
import type { ReactNode } from "react";
import Card from "@/components/cards/Card";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-xl p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div
          className="rounded-lg p-2"
          style={{
            background:
              "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
            color: "var(--twc-accent)",
          }}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium" style={{ color: "var(--twc-text)" }}>
            {title}
          </div>
          <p
            className="mt-1 text-sm leading-5"
            style={{ color: "var(--twc-muted)" }}
          >
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function ComingSoon() {
  return (
    <div className="p-3 md:p-4">
      <h3 className="text-lg font-bold" style={{ color: "var(--twc-text)" }}>
        Coming soon
      </h3>
      <div className="grid grid-cols-1 mt-6 gap-3 md:grid-cols-2 md:gap-4">
        <FeatureCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Journal"
          description="Daily journaling with fast search and filters — reflect, tag, and find entries in seconds."
        />
        <FeatureCard
          icon={<Dumbbell className="h-5 w-5" />}
          title="Workout tracker"
          description="Log sessions, track previous workouts, and manage progress over time."
        />
      </div>
    </div>
  );
}
