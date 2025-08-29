export default function DashboardHeader() {
  return (
    <header className="px-1">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
        Snapshot of habits, tasks, and progress.
      </p>
    </header>
  );
}
