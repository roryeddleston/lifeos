"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Target, ListTodo, Activity } from "lucide-react";
import Link from "next/link";

type SearchResult = {
  tasks: { id: string; title: string }[];
  habits: { id: string; name: string }[];
  goals: { id: string; title: string }[];
};

const EMPTY_RESULTS: SearchResult = { tasks: [], habits: [], goals: [] };

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 250);

  const [openMobile, setOpenMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ⌘/ (Ctrl+/) opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "/") {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) {
          inputRef.current?.focus();
          setOpenDropdown(true);
        } else {
          setOpenMobile(true);
          setTimeout(() => {
            const el = document.getElementById(
              "mobile-search-input"
            ) as HTMLInputElement | null;
            el?.focus();
          }, 0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // click outside to close desktop dropdown
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node))
        setOpenDropdown(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // fetch on debounced query
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!debouncedQ || debouncedQ.trim().length < 2) {
        setResults(EMPTY_RESULTS);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQ)}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as SearchResult;
        if (!cancelled) {
          setResults(json);
          setLoading(false);
          setOpenDropdown(true);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Search failed";
          setError(message);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const totalCount = useMemo(
    () => results.tasks.length + results.habits.length + results.goals.length,
    [results]
  );

  const reset = useCallback(() => {
    setQ("");
    setResults(EMPTY_RESULTS);
    setError(null);
    setLoading(false);
    setOpenDropdown(false);
  }, []);

  // Mixed list for mobile (top 6)
  const mobileList = useMemo(() => {
    const mix: {
      type: "task" | "habit" | "goal";
      id: string;
      label: string;
    }[] = [];
    results.tasks.forEach((t) =>
      mix.push({ type: "task", id: t.id, label: t.title })
    );
    results.habits.forEach((h) =>
      mix.push({ type: "habit", id: h.id, label: h.name })
    );
    results.goals.forEach((g) =>
      mix.push({ type: "goal", id: g.id, label: g.title })
    );
    return mix.slice(0, 6);
  }, [results]);

  const TypeIcon = ({ t }: { t: "task" | "habit" | "goal" }) =>
    t === "task" ? (
      <ListTodo className="h-4 w-4" style={{ color: "var(--twc-muted)" }} />
    ) : t === "habit" ? (
      <Activity className="h-4 w-4" style={{ color: "var(--twc-muted)" }} />
    ) : (
      <Target className="h-4 w-4" style={{ color: "var(--twc-muted)" }} />
    );

  return (
    <>
      {/* Desktop inline search */}
      <div className="relative hidden md:block" ref={dropdownRef}>
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm hover:shadow transition w-[420px] max-w-[52vw] focus-within:ring-2 focus-within:ring-[var(--twc-accent)]"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
          }}
        >
          <Search className="h-4 w-4" style={{ color: "var(--twc-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search (⌘/)"
            aria-label="Global search"
            className="w-full outline-none text-sm hide-native-clear placeholder:text-[var(--twc-muted)] placeholder:opacity-100"
            style={{
              color: "var(--twc-text)",
              background: "transparent",
            }}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            onFocus={() =>
              debouncedQ.trim().length >= 2 && setOpenDropdown(true)
            }
          />
          {q && (
            <button
              aria-label="Clear"
              className="rounded p-1 transition-colors"
              style={{ color: "var(--twc-muted)" }}
              onClick={() => setQ("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {openDropdown && (
          <div
            className="absolute z-50 mt-2 w-[420px] max-w-[90vw] rounded-xl border shadow-xl overflow-hidden"
            style={{
              borderColor: "var(--twc-border)",
              backgroundColor: "var(--twc-surface)",
            }}
          >
            <div className="max-h-80 overflow-auto p-2">
              {loading ? (
                <div
                  className="px-3 py-3 text-sm"
                  style={{ color: "var(--twc-muted)" }}
                >
                  Searching…
                </div>
              ) : error ? (
                <div
                  className="px-3 py-3 text-sm"
                  style={{ color: "var(--twc-danger)" }}
                >
                  {error}
                </div>
              ) : totalCount === 0 ? (
                <div
                  className="px-3 py-3 text-sm"
                  style={{ color: "var(--twc-muted)" }}
                >
                  {q.trim().length < 2
                    ? "Type at least 2 characters to search."
                    : `No results for “${debouncedQ}”.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {/* Tasks */}
                  {results.tasks.length > 0 && (
                    <div className="px-2 pt-1">
                      <div
                        className="text-[11px] uppercase tracking-wide mb-1"
                        style={{ color: "var(--twc-muted)" }}
                      >
                        Tasks
                      </div>
                      <ul className="space-y-1">
                        {results.tasks.map((t) => (
                          <li key={t.id}>
                            <Link
                              href="/tasks"
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                              style={{
                                color: "var(--twc-text)",
                              }}
                              onClick={() => setOpenDropdown(false)}
                            >
                              <ListTodo
                                className="h-4 w-4"
                                style={{ color: "var(--twc-muted)" }}
                              />
                              <span className="truncate">{t.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Habits */}
                  {results.habits.length > 0 && (
                    <div className="px-2 pt-1">
                      <div
                        className="text-[11px] uppercase tracking-wide mb-1"
                        style={{ color: "var(--twc-muted)" }}
                      >
                        Habits
                      </div>
                      <ul className="space-y-1">
                        {results.habits.map((h) => (
                          <li key={h.id}>
                            <Link
                              href="/habits"
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                              style={{
                                color: "var(--twc-text)",
                              }}
                              onClick={() => setOpenDropdown(false)}
                            >
                              <Activity
                                className="h-4 w-4"
                                style={{ color: "var(--twc-muted)" }}
                              />
                              <span className="truncate">{h.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Goals */}
                  {results.goals.length > 0 && (
                    <div className="px-2 pt-1">
                      <div
                        className="text-[11px] uppercase tracking-wide mb-1"
                        style={{ color: "var(--twc-muted)" }}
                      >
                        Goals
                      </div>
                      <ul className="space-y-1">
                        {results.goals.map((g) => (
                          <li key={g.id}>
                            <Link
                              href="/goals"
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                              style={{
                                color: "var(--twc-text)",
                              }}
                              onClick={() => setOpenDropdown(false)}
                            >
                              <Target
                                className="h-4 w-4"
                                style={{ color: "var(--twc-muted)" }}
                              />
                              <span className="truncate">{g.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile icon button that opens overlay */}
      <button
        className="md:hidden inline-flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm"
        style={{
          borderColor: "var(--twc-border)",
          backgroundColor: "var(--twc-surface)",
          color: "var(--twc-text)",
        }}
        onClick={() => setOpenMobile(true)}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" style={{ color: "var(--twc-muted)" }} />
      </button>

      {/* Mobile overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 z-[60] backdrop-blur"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          }}
        >
          <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-xl p-4">
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-2 shadow focus-within:ring-2 focus-within:ring-[var(--twc-accent)]"
              style={{
                borderColor: "var(--twc-border)",
                backgroundColor: "var(--twc-surface)",
              }}
            >
              <Search
                className="h-4 w-4"
                style={{ color: "var(--twc-muted)" }}
              />
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search"
                aria-label="Global search"
                className="w-full outline-none text-sm hide-native-clear placeholder:text-[var(--twc-muted)] placeholder:opacity-100"
                style={{
                  color: "var(--twc-text)",
                  background: "transparent",
                }}
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
                autoFocus
              />
              {q && (
                <button
                  aria-label="Clear"
                  className="rounded p-1 transition-colors"
                  style={{ color: "var(--twc-muted)" }}
                  onClick={() => setQ("")}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                aria-label="Close"
                className="rounded p-1 transition-colors"
                style={{ color: "var(--twc-muted)" }}
                onClick={() => {
                  setOpenMobile(false);
                  reset();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="mt-3 rounded-2xl border shadow max-h-[65vh] overflow-auto"
              style={{
                borderColor: "var(--twc-border)",
                backgroundColor: "var(--twc-surface)",
              }}
            >
              <div className="p-2">
                {loading ? (
                  <div
                    className="px-2 py-3 text-sm"
                    style={{ color: "var(--twc-muted)" }}
                  >
                    Searching…
                  </div>
                ) : error ? (
                  <div
                    className="px-2 py-3 text-sm"
                    style={{ color: "var(--twc-danger)" }}
                  >
                    {error}
                  </div>
                ) : mobileList.length === 0 ? (
                  <div
                    className="px-2 py-6 text-sm text-center"
                    style={{ color: "var(--twc-muted)" }}
                  >
                    {q.trim().length < 2
                      ? "Type at least 2 characters"
                      : "No results"}
                  </div>
                ) : (
                  <ul>
                    {mobileList.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={
                            item.type === "task"
                              ? "/tasks"
                              : item.type === "habit"
                              ? "/habits"
                              : "/goals"
                          }
                          className="flex items-center gap-2 px-3 py-3 transition-colors"
                          style={{
                            color: "var(--twc-text)",
                          }}
                          onClick={() => {
                            setOpenMobile(false);
                            reset();
                          }}
                        >
                          <TypeIcon t={item.type} />
                          <span className="truncate text-sm">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Tap outside to close */}
          <button
            className="absolute inset-0 -z-[1]"
            aria-label="Close search overlay"
            onClick={() => {
              setOpenMobile(false);
              reset();
            }}
          />
        </div>
      )}
    </>
  );
}
