"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/SubmitButton";
import {
  OUTDOOR_LOCATION_LABELS,
  OUTDOOR_LOCATIONS,
  WALL_TYPE_LABELS,
  GRADE_VALUES,
  GRADE_DETAILS,
  HOLD_COLOR_LABELS,
  HOLD_COLORS,
} from "@/types/database";
import type { OutdoorLocation, WallType, HoldColor } from "@/types/database";

const WALL_TYPES: WallType[] = ["vertical", "slight_overhang", "overhang", "extreme_overhang"];

export default function OutdoorRouteForm() {
  const router = useRouter();
  const [location, setLocation] = useState<OutdoorLocation>("munhak");
  const [wallType, setWallType] = useState<WallType>("vertical");
  const [gradeValue, setGradeValue] = useState<(typeof GRADE_VALUES)[number]>("10");
  const [gradeDetail, setGradeDetail] = useState<(typeof GRADE_DETAILS)[number]>("a");
  const [holdColor, setHoldColor] = useState<HoldColor>("red");
  const [rankPoint, setRankPoint] = useState<number | "">("");
  const [clipCount, setClipCount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rankPoint === "" || clipCount === "") return;
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("outdoor_routes").insert({
      outdoor_location: location,
      wall_type: wallType,
      grade_value: gradeValue,
      grade_detail: gradeDetail,
      hold_color: holdColor,
      rank_point: rankPoint,
      clip_count: clipCount,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    setRankPoint("");
    setClipCount("");
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--chalk)]">문제 추가</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">외벽</label>
          <select value={location} onChange={(e) => setLocation(e.target.value as OutdoorLocation)} className="input-base">
            {OUTDOOR_LOCATIONS.map((l) => (
              <option key={l} value={l}>{OUTDOOR_LOCATION_LABELS[l]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">암벽구분</label>
          <select value={wallType} onChange={(e) => setWallType(e.target.value as WallType)} className="input-base">
            {WALL_TYPES.map((w) => (
              <option key={w} value={w}>{WALL_TYPE_LABELS[w]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">난이도(숫자)</label>
          <select value={gradeValue} onChange={(e) => setGradeValue(e.target.value as (typeof GRADE_VALUES)[number])} className="input-base">
            {GRADE_VALUES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">난이도(상세)</label>
          <select value={gradeDetail} onChange={(e) => setGradeDetail(e.target.value as (typeof GRADE_DETAILS)[number])} className="input-base">
            {GRADE_DETAILS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">홀드색상</label>
          <select value={holdColor} onChange={(e) => setHoldColor(e.target.value as HoldColor)} className="input-base">
            {HOLD_COLORS.map((c) => (
              <option key={c} value={c}>{HOLD_COLOR_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">클립수 *</label>
          <input
            type="number"
            required
            min={1}
            value={clipCount === "" ? "" : clipCount}
            onChange={(e) => {
              const v = e.target.value;
              setClipCount(v === "" ? "" : (Number.isNaN(Number(v)) ? clipCount : Number(v)));
            }}
            className="input-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">랭크포인트 *</label>
          <input
            type="number"
            required
            value={rankPoint === "" ? "" : rankPoint}
            onChange={(e) => {
              const v = e.target.value;
              setRankPoint(v === "" ? "" : (Number.isNaN(Number(v)) ? rankPoint : Number(v)));
            }}
            className="input-base"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <SubmitButton loading={loading} loadingLabel="추가 중..." className="btn-primary disabled:pointer-events-none">
          추가
        </SubmitButton>
      </div>
    </form>
  );
}
