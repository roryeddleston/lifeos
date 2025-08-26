// src/components/layout/Topbar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Cloudy,
  MapPin,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

// --- Small date helpers ---
function formatLongDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// --- Simple weather fetcher (Open-Meteo, no API key) ---
type Weather = {
  temp: number | null;
  icon: "sun" | "cloud" | "cloudSun" | "cloudy" | "rain" | null;
  city: string | null;
};

function iconForCode(code: number): Weather["icon"] {
  // Open-Meteo weather codes
  if ([0].includes(code)) return "sun";
  if ([1, 2].includes(code)) return "cloudSun";
  if ([3].includes(code)) return "cloudy";
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return "rain";
  return "cloud";
}

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    if (!r.ok) return null;
    const j = await r.json();
    return (
      j?.address?.city ||
      j?.address?.town ||
      j?.address?.village ||
      j?.address?.suburb ||
      j?.address?.county ||
      null
    );
  } catch {
    return null;
  }
}

async function getWeather(): Promise<Weather> {
  return new Promise((resolve) => {
    if (!navigator.geolocation)
      return resolve({ temp: null, icon: null, city: null });

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

          const city = await reverseGeocode(latitude, longitude);
          resolve({
            temp,
            icon: code != null ? iconForCode(code) : null,
            city,
          });
        } catch {
          resolve({ temp: null, icon: null, city: null });
        }
      },
      () => resolve({ temp: null, icon: null, city: null }),
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 8_000 }
    );
  });
}

// --- UI bits ---
function WeatherPill() {
  const [w, setW] = useState<Weather>({ temp: null, icon: null, city: null });

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
      className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs text-gray-700"
      title="Local weather"
    >
      <Icon className="h-4 w-4" />
      {w.temp != null ? <span>{Math.round(w.temp)}°C</span> : <span>—</span>}
      <span className="inline-flex items-center gap-1 text-gray-500">
        <MapPin className="h-3 w-3" />
        {w.city ?? "Locating…"}
      </span>
    </div>
  );
}

function QuickAdd() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" />
        New
        <ChevronDown className="h-4 w-4 opacity-80" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/tasks?quick=new"
            className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Task
          </Link>
          <Link
            href="/habits?quick=new"
            className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Habit
          </Link>
          <Link
            href="/goals?quick=new"
            className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
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

function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘/ to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-full max-w-xl hidden md:flex">
      <div className="flex items-center gap-2 rounded-md border px-2 py-1.5 bg-white w-full">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search tasks, habits, goals… (⌘/)"
          aria-label="Global search"
          className="w-full outline-none placeholder:text-gray-400 text-sm"
        />
      </div>
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
      <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] items-center gap-3">
        {/* Left: page title */}
        <div>
          <h1 className="text-base font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Center: search */}
        <div className="order-last md:order-none md:justify-self-center">
          <GlobalSearch />
        </div>

        {/* Right: date + weather */}
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-700">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-3 py-1">
            <CalendarDays className="h-4 w-4" />
            {today}
          </span>
          <WeatherPill />
        </div>

        {/* Far right: quick actions */}
        <div className="flex items-center justify-end gap-2">
          <QuickAdd />
          {/* Avatar placeholder */}
          <div
            className="h-8 w-8 rounded-full bg-gray-200"
            aria-label="Account"
          />
        </div>
      </div>
    </header>
  );
}
