// src/components/habits/HabitsInsights.tsx
"use client";

import Card from "@/components/cards/Card";

export default function HabitsInsights() {
  // Purely dummy / static content for visual comparison
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Completion Summary */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900">This Week</h3>
        <p className="mt-1 text-sm text-gray-600">
          Dummy data: overall completion rate
        </p>

        {/* Fake progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: "68%" }}
              aria-label="68% completion"
              title="68% completion"
            />
          </div>
          <div className="mt-2 text-xs text-gray-600">68% complete</div>
        </div>
      </Card>

      {/* Streaks */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900">Streaks</h3>
        <p className="mt-1 text-sm text-gray-600">
          Dummy data: current & best streaks
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600">Current</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              4 days
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600">Best</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              9 days
            </div>
          </div>
        </div>
      </Card>

      {/* Mini Bar Chart (inline SVG, just for looks) */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900">Last 7 Days</h3>
        <p className="mt-1 text-sm text-gray-600">
          Dummy spark bars (not connected to data)
        </p>

        <div className="mt-4">
          <svg viewBox="0 0 140 40" className="w-full">
            {/* background grid lines */}
            <line
              x1="0"
              y1="35"
              x2="140"
              y2="35"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="20"
              x2="140"
              y2="20"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="5"
              x2="140"
              y2="5"
              stroke="#f8fafc"
              strokeWidth="1"
            />

            {/* 7 bars */}
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
                  className="fill-emerald-500"
                />
              );
            })}
          </svg>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
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

      {/* Notes / Text Block */}
      <Card className="p-4 lg:col-span-3">
        <h3 className="text-sm font-medium text-gray-900">Notes</h3>
        <p className="mt-1 text-sm text-gray-600">
          This is placeholder text so you can compare layouts with the earlier
          version. None of the numbers or visuals above are wired to real data.
        </p>
      </Card>
    </div>
  );
}
