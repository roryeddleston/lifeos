// src/components/layout/Topbar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

function formatLongDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type Weather = {
  temp: number | null;
  icon: "sun" | "cloud" | "cloudSun" | "cloudy" | "rain" | null;
};
function iconForCode(code: number): Weather["icon"] {
  if ([0].includes(code)) return "sun";
  if ([1, 2].includes(code)) return "cloudSun";
  if ([3].includes(code)) return "cloudy";
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return "rain";
  return "cloud";
}

async function getWeather(): Promise<Weather> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ temp: null, icon: null });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) throw new Error("weather fetch failed");
          const j = await r.json();
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
      className="hidden lg:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs text-gray-700"
      title="Local weather"
    >
      <Icon className="h-4 w-4" />
      {w.temp != null ? <span>{Math.round(w.temp)}°C</span> : <span>—</span>}
    </div>
  );
}

function QuickAdd() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
        <ChevronDown className="h-4 w-4 opacity-80" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
          role="menu"
        >
          <Link
            href="/tasks?quick=new"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Task
          </Link>
          <Link
            href="/habits?quick=new"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Habit
          </Link>
          <Link
            href="/goals?quick=new"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Goal
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const today = formatLongDate();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-2 gap-3 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
        {/* Title */}
        <div className="col-span-2 md:col-span-1">
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Center: Search (desktop inline; mobile renders icon in component) */}
        <div className="order-last md:order-none md:justify-self-center">
          <GlobalSearch />
        </div>

        {/* Right: date & weather (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-700">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-3 py-1">
            <CalendarDays className="h-4 w-4" />
            {today}
          </span>
          <WeatherPill />
        </div>

        {/* Far right: actions + avatar */}
        <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
          <QuickAdd />
          <div
            className="h-8 w-8 rounded-full bg-gray-200"
            aria-label="Account"
          />
        </div>
      </div>
    </header>
  );
}
