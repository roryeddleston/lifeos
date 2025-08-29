type Item = { id: string; title: string; when: string };

export default function RecentlyCompleted({ items }: { items: Item[] }) {
  return (
    <>
      <ul className="divide-y divide-[var(--twc-border)]">
        {items.length === 0 ? (
          <li
            className="py-4 px-3 text-sm"
            style={{ color: "var(--twc-muted)" }}
          >
            No tasks completed yet.
          </li>
        ) : (
          items.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-3 py-3 transition-colors"
              style={{}}
            >
              <span
                className="text-sm leading-5"
                style={{ color: "var(--twc-text)" }}
              >
                {t.title}
              </span>
              <span
                className="text-xs tabular-nums"
                style={{ color: "var(--twc-muted)" }}
              >
                {t.when}
              </span>
            </li>
          ))
        )}
      </ul>

      <div className="mt-3 flex justify-end">
        <a
          href="/tasks?view=done"
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--twc-accent)" }}
        >
          View all completed
        </a>
      </div>
    </>
  );
}
