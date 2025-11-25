"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Target, ListTodo, Activity } from "lucide-react";
import Link from "next/link";

/* ---------- Auth-aware fetch helpers ---------- */

function loginRedirect() {
  if (typeof window === "undefined") return;

  const returnTo = window.location.pathname + window.location.search;
  window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(
    returnTo
  )}`;
}

async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    loginRedirect();
    throw new Error("Unauthorized");
  }
  return res;
}

/* ---------- Types ---------- */

type SearchResult = {
  tasks: { id: string; title: string }[];
  habits: { id: string; name: string }[];
  goals: { id: string; title: string }[];
};

const EMPTY_RESULTS: SearchResult = { tasks: [], habits: [], goals: [] };

/* ---------- Utils ---------- */

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

/** Narrow unknown errors to "abort" without using `any`. */
function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

/* ---------- Component ---------- */

export default function GlobalSearch() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 250);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const totalCount = useMemo(
    () => results.tasks.length + results.habits.length + results.goals.length,
    [results]
  );

  /* ---------- Keyboard shortcuts: ⌘/ or Ctrl/ to focus, Esc to close ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "/") {
        e.preventDefault();
        // Desktop-only search: focus and open dropdown
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Click outside to close dropdown ---------- */

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* ---------- Fetch on debounced query (with abort + 401 redirect) ---------- */

  useEffect(() => {
    let cancelled = false;

    // cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = null;

    // no query or too short → reset state
    if (!debouncedQ || debouncedQ.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(
          `/api/search?q=${encodeURIComponent(debouncedQ)}`,
          { cache: "no-store", signal: controller.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as SearchResult;
        if (!cancelled) {
          setResults(json);
          setLoading(false);
          setIsOpen(true);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (isAbortError(err)) return;

        // "Unauthorized" already handled in apiFetch (redirected)
        if (!(err instanceof Error) || err.message !== "Unauthorized") {
          const message = err instanceof Error ? err.message : "Search failed";
          setError(message);
          setLoading(false);
        }
      } finally {
        abortRef.current = null;
      }
    };

    void run();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [debouncedQ]);

  return (
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
          onFocus={() => debouncedQ.trim().length >= 2 && setIsOpen(true)}
        />
        {q && (
          <button
            aria-label="Clear"
            className="rounded p-1 transition-colors"
            style={{ color: "var(--twc-muted)" }}
            onClick={() => {
              setQ("");
              setResults(EMPTY_RESULTS);
              setError(null);
              setLoading(false);
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-[420px] max-w-[90vw] rounded-xl border shadow-xl overflow-hidden"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
          }}
          role="dialog"
          aria-label="Search results"
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
                            style={{ color: "var(--twc-text)" }}
                            onClick={() => setIsOpen(false)}
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
                            style={{ color: "var(--twc-text)" }}
                            onClick={() => setIsOpen(false)}
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
                            style={{ color: "var(--twc-text)" }}
                            onClick={() => setIsOpen(false)}
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
  );
}
