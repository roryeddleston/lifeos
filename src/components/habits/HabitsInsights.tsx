// src/components/habits/HabitsInsights.tsx
import Card from "@/components/cards/Card";

export default function HabitsInsights() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-4">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--twc-text)" }}
        >
          This Week
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
          Dummy data: overall completion rate
        </p>
        <div className="mt-4">
          <div
            className="h-2 w-full rounded-full"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 10%, var(--twc-surface))",
            }}
          >
            <div
              className="h-2 rounded-full"
              style={{ width: "68%", backgroundColor: "var(--twc-accent)" }}
              aria-label="68% completion"
              title="68% completion"
            />
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--twc-muted)" }}>
            68% complete
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--twc-text)" }}
        >
          Streaks
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
          Dummy data: current & best streaks
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-lg p-3"
            style={{ border: "1px solid var(--twc-border)" }}
          >
            <div className="text-xs" style={{ color: "var(--twc-muted)" }}>
              Current
            </div>
            <div
              className="mt-1 text-lg font-semibold"
              style={{ color: "var(--twc-text)" }}
            >
              4 days
            </div>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ border: "1px solid var(--twc-border)" }}
          >
            <div className="text-xs" style={{ color: "var(--twc-muted)" }}>
              Best
            </div>
            <div
              className="mt-1 text-lg font-semibold"
              style={{ color: "var(--twc-text)" }}
            >
              9 days
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--twc-text)" }}
        >
          Last 7 Days
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
          Dummy spark bars (not connected to data)
        </p>

        <div className="mt-4">
          <svg viewBox="0 0 140 40" className="w-full">
            <line
              x1="0"
              y1="35"
              x2="140"
              y2="35"
              stroke="var(--twc-border)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="20"
              x2="140"
              y2="20"
              stroke="color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="5"
              x2="140"
              y2="5"
              stroke="color-mix(in oklab, var(--twc-text) 3%, var(--twc-surface))"
              strokeWidth="1"
            />
            {([18, 30, 12, 26, 35, 22, 28] as number[]).map((h, i) => {
              const barWidth = 12;
              const gap = 8;
              const x = i * (barWidth + gap);
              const y = 35 - h;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx="2"
                  fill="var(--twc-accent)"
                />
              );
            })}
          </svg>
          <div
            className="mt-2 flex items-center justify-between text-xs"
            style={{ color: "var(--twc-muted)" }}
          >
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
