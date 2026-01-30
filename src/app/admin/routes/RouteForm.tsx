"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/SubmitButton";
import {
  WALL_TYPE_LABELS,
  GRADE_VALUES,
  GRADE_DETAILS,
} from "@/types/database";
import type { WallType } from "@/types/database";

const WALL_TYPES: WallType[] = [
  "vertical",
  "slight_overhang",
  "overhang",
  "extreme_overhang",
];

export default function RouteForm() {
  const router = useRouter();
  const [wallType, setWallType] = useState<WallType>("vertical");
  const [gradeValue, setGradeValue] = useState<(typeof GRADE_VALUES)[number]>("10");
  const [gradeDetail, setGradeDetail] = useState<(typeof GRADE_DETAILS)[number]>("a");
  const [name, setName] = useState("");
  const [holdCount, setHoldCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("루트명을 입력해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("routes").insert({
      wall_type: wallType,
      grade_value: gradeValue,
      grade_detail: gradeDetail,
      name: name.trim(),
      hold_count: holdCount,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    setName("");
    setHoldCount(10);
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--chalk)]">루트 추가</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">암벽구분</label>
          <select value={wallType} onChange={(e) => setWallType(e.target.value as WallType)} className="input-base">
            {WALL_TYPES.map((w) => (
              <option key={w} value={w}>
                {WALL_TYPE_LABELS[w]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">난이도(숫자)</label>
          <select value={gradeValue} onChange={(e) => setGradeValue(e.target.value as (typeof GRADE_VALUES)[number])} className="input-base">
            {GRADE_VALUES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
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
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">루트명 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">홀드수</label>
          <input type="number" min={1} value={holdCount} onChange={(e) => setHoldCount(Number(e.target.value))} className="input-base" />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <SubmitButton
          loading={loading}
          loadingLabel="추가 중..."
          className="btn-primary disabled:pointer-events-none"
        >
          추가
        </SubmitButton>
      </div>
    </form>
  );
}
