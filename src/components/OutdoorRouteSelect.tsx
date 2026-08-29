"use client";

import { useState, useRef, useEffect } from "react";
import {
  OUTDOOR_LOCATION_LABELS,
  OUTDOOR_WALL_TYPE_LABELS,
  HOLD_COLOR_LABELS,
  formatGrade,
} from "@/types/database";
import type { OutdoorLocation, OutdoorWallType, HoldColor, GradeValue, GradeDetail } from "@/types/database";

interface OutdoorRouteOption {
  id: string;
  outdoor_location: string;
  wall_type: string;
  grade_value: string;
  grade_detail: string;
  hold_color: string;
  clip_count: number;
}

function routeLabel(r: OutdoorRouteOption): string {
  const locationLabel = OUTDOOR_LOCATION_LABELS[r.outdoor_location as OutdoorLocation] ?? r.outdoor_location;
  const wallLabel = OUTDOOR_WALL_TYPE_LABELS[r.wall_type as OutdoorWallType] ?? r.wall_type;
  const grade = formatGrade(r.grade_value as GradeValue, r.grade_detail as GradeDetail);
  const colorLabel = HOLD_COLOR_LABELS[r.hold_color as HoldColor] ?? r.hold_color;
  return `${locationLabel} ${wallLabel} ${grade} ${colorLabel}`;
}

export function OutdoorRouteSelect({
  routes,
  value,
  onChange,
  onSelectRoute,
  className = "",
}: {
  routes: OutdoorRouteOption[];
  value: string;
  onChange: (routeId: string) => void;
  onSelectRoute?: (route: OutdoorRouteOption) => void;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = routes.find((r) => r.id === value);
  const filterLower = search.trim().toLowerCase();
  const filtered = filterLower
    ? routes.filter((r) => routeLabel(r).toLowerCase().includes(filterLower))
    : routes;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(r: OutdoorRouteOption) {
    onChange(r.id);
    onSelectRoute?.(r);
    setSearch("");
    setOpen(false);
  }

  const displayText = selected ? `${routeLabel(selected)} (클립 ${selected.clip_count})` : "선택";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input-base w-full text-left flex items-center justify-between ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "text-[var(--chalk)]" : "text-[var(--chalk-muted)]"}>
          {displayText}
        </span>
        <span className="text-[var(--chalk-muted)]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg"
          role="listbox"
        >
          <div className="p-2 border-b border-[var(--border)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="외벽/난이도/색상 검색"
              className="input-base w-full text-sm"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={r.id === value}
                  onClick={() => handleSelect(r)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    r.id === value
                      ? "bg-[var(--primary-muted)] text-[var(--chalk)]"
                      : "text-[var(--chalk)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {routeLabel(r)} (클립 {r.clip_count})
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-[var(--chalk-muted)]">
                검색 결과 없음
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
