import { BookOpen, Dumbbell } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="p-3 md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Journal */}
        <div
          className="rounded-xl border p-3 md:p-4 transition-colors"
          style={{ borderColor: "var(--twc-border)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="rounded-lg p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ color: "var(--twc-text)" }}>
                Journal
              </div>
              <p
                className="mt-1 text-sm leading-5"
                style={{ color: "var(--twc-muted)" }}
              >
                Daily journaling with fast search and filters — reflect, tag,
                and find entries in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Workout tracker */}
        <div
          className="rounded-xl border p-3 md:p-4 transition-colors"
          style={{ borderColor: "var(--twc-border)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="rounded-lg p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
            >
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ color: "var(--twc-text)" }}>
                Workout tracker
              </div>
              <p
                className="mt-1 text-sm leading-5"
                style={{ color: "var(--twc-muted)" }}
              >
                Log sessions, track previous workouts, and manage progress over
                time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
