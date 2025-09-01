"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  CalendarDays,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Cloudy,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import GlobalSearch from "./GlobalSearch";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

/* ---------- date (client-only to avoid hydration mismatch) ---------- */
function formatShortGB(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ---------- weather helpers ---------- */
type Weather = {
  temp: number | null;
  icon: "sun" | "cloud" | "cloudSun" | "cloudy" | "rain" | null;
};

function iconForCode(code: number): Weather["icon"] {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "cloudSun";
  if (code === 3) return "cloudy";
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return "rain";
  return "cloud";
}

async function getWeather(): Promise<Weather> {
  return new Promise<Weather>((resolve) => {
    if (!navigator.geolocation) return resolve({ temp: null, icon: null });
    navigator.geolocation.getCurrentPosition(
      async (pos: GeolocationPosition) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) throw new Error("weather fetch failed");
          const j: {
            current?: { weather_code?: number; temperature_2m?: number };
          } = await r.json();
          const code = j?.current?.weather_code ?? null;
          const temp = j?.current?.temperature_2m ?? null;
          resolve({ temp, icon: code != null ? iconForCode(code) : null });
        } catch {
          resolve({ temp: null, icon: null });
        }
      },
      () => resolve({ temp: null, icon: null }),
      { maximumAge: 30_000, timeout: 8_000 }
    );
  });
}

/* ---------- subcomponents ---------- */
function WeatherPill() {
  const [w, setW] = useState<Weather>({ temp: null, icon: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getWeather();
      if (!cancelled) setW(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const Icon = useMemo(() => {
    switch (w.icon) {
      case "sun":
        return Sun;
      case "cloudSun":
        return CloudSun;
      case "cloudy":
        return Cloudy;
      case "rain":
        return CloudRain;
      case "cloud":
      default:
        return Cloud;
    }
  }, [w.icon]);

  return (
    <div
      className="hidden lg:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
        color: "var(--twc-text)",
      }}
      title="Local weather"
    >
      <Icon className="h-4 w-4 opacity-80" />
      {w.temp != null ? <span>{Math.round(w.temp)}°C</span> : <span>—</span>}
    </div>
  );
}

function QuickAdd() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on outside click/tap
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor =
      "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))";
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer hover:opacity-95"
        style={{
          background:
            "linear-gradient(135deg, var(--twc-accent), color-mix(in oklab, var(--twc-accent) 70%, teal))",
          color: "white",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
        <ChevronDown className="h-4 w-4 opacity-90" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border p-1 shadow-xl"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
          }}
          role="menu"
        >
          {["Task", "Habit", "Goal"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}s?quick=new`}
              className="block rounded-lg px-3 py-2 text-sm transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--twc-text)" }}
              role="menuitem"
              onClick={() => setOpen(false)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- user menu ---------- */
function UserMenu() {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        className="h-8 w-8 rounded-full"
        style={{
          background:
            "color-mix(in oklab, var(--twc-text) 10%, var(--twc-surface))",
        }}
      />
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(pathname || "/");
    return (
      <Link
        href={`/api/auth/login?returnTo=${returnTo}`}
        className="inline-flex items-center rounded-full px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2"
        style={{
          border: "1px solid var(--twc-border)",
          color: "var(--twc-text)",
          backgroundColor: "var(--twc-surface)",
        }}
      >
        Log in
      </Link>
    );
  }

  const displayName =
    (user.name && user.name.trim()) ||
    (user.email && user.email.split("@")[0]) ||
    "You";
  const initial = displayName.charAt(0).toUpperCase();

  const onHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor =
      "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))";
  };
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-1 py-1 focus:outline-none focus-visible:ring-2 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
        style={{
          border: "1px solid var(--twc-border)",
          backgroundColor: "var(--twc-surface)",
          color: "var(--twc-text)",
        }}
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover cursor-pointer"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-sm font-medium cursor-pointer"
            aria-hidden
            style={{
              background:
                "color-mix(in oklab, var(--twc-text) 10%, var(--twc-surface))",
            }}
          >
            {initial}
          </span>
        )}
        {/* No displayName text shown in the topbar */}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border p-1 shadow-xl"
          role="menu"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
            color: "var(--twc-text)",
          }}
        >
          {/* Header (name only, no email) */}
          <div className="px-3 py-2 text-sm">
            <div className="font-medium truncate">{displayName}</div>
          </div>
          <hr
            style={{
              border: 0,
              height: 1,
              background:
                "color-mix(in oklab, var(--twc-text) 10%, transparent)",
            }}
          />

          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm transition-colors"
            role="menuitem"
            style={{ color: "var(--twc-text)" }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            Home
          </Link>

          <Link
            href="/api/auth/logout"
            className="block rounded-lg px-3 py-2 text-sm transition-colors"
            role="menuitem"
            style={{ color: "var(--twc-text)" }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---------- topbar ---------- */
type TopbarProps = {
  title?: string;
  subtitle?: string;
  onOpenMenu?: () => void;
  showSearch?: boolean;
  primaryActionHref?: string;
  primaryActionLabel?: string;
};

export default function Topbar(props: TopbarProps) {
  const { showSearch = true } = props;
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(formatShortGB(new Date()));
  }, []);

  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/20"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "color-mix(in oklab, var(--twc-bg) 80%, transparent)",
      }}
    >
      <div className="mx-auto max-w-6xl w-full px-3 md:px-4">
        {/* Row: search left, everything else right */}
        <div className="h-14 md:h-[60px] flex items-center justify-between gap-3">
          {/* LEFT: search */}
          <div className="min-w-0">{showSearch && <GlobalSearch />}</div>

          {/* RIGHT: date+weather + actions */}
          <div className="flex items-center gap-3">
            <div
              className="hidden md:flex items-center gap-3 text-sm"
              style={{ color: "var(--twc-text)" }}
            >
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  borderColor: "var(--twc-border)",
                  backgroundColor: "var(--twc-surface)",
                  color: "var(--twc-text)",
                }}
                suppressHydrationWarning
              >
                <CalendarDays className="h-4 w-4 opacity-80" />
                {today || "\u00A0"}
              </span>
              <WeatherPill />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <QuickAdd />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
