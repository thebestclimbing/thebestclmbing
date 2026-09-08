"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/SubmitButton";
import { OutdoorRouteSelect } from "@/components/OutdoorRouteSelect";

interface OutdoorRouteRow {
  id: string;
  outdoor_location: string;
  wall_type: string;
  grade_value: string;
  grade_detail: string;
  hold_color: string;
  clip_count: number;
}

interface Initial {
  outdoor_route_id: string;
  progress_clip_count: number;
  attempt_count: number;
  is_completed?: boolean;
  is_round_trip: boolean;
  round_trip_count: number;
  logged_at: string;
}

export default function OutdoorExerciseLogUpdateForm({
  logId,
  profileId,
  routes,
  initial,
}: {
  logId: string;
  profileId: string;
  routes: OutdoorRouteRow[];
  initial: Initial;
}) {
  const router = useRouter();
  const [routeId, setRouteId] = useState(initial.outdoor_route_id);
  const [progressClipCountStr, setProgressClipCountStr] = useState(
    String(initial.progress_clip_count)
  );
  const [attemptCountStr, setAttemptCountStr] = useState(String(Math.max(1, initial.attempt_count)));
  const [roundTripCountStr, setRoundTripCountStr] = useState(String(initial.round_trip_count));
  const [loggedAt, setLoggedAt] = useState(initial.logged_at);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const progressClipCount = Math.max(0, parseInt(progressClipCountStr, 10) || 0);
  const roundTripCount = Math.max(0, parseInt(roundTripCountStr, 10) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("outdoor_exercise_logs")
      .update({
        outdoor_route_id: routeId,
        progress_clip_count: progressClipCount,
        attempt_count: Math.max(1, parseInt(attemptCountStr, 10) || 1),
        is_round_trip: roundTripCount > 0,
        round_trip_count: roundTripCount,
        logged_at: loggedAt,
      })
      .eq("id", logId)
      .eq("profile_id", profileId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/exercise/outdoor/" + logId);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">문제 *</label>
          <OutdoorRouteSelect
            routes={routes}
            value={routeId}
            onChange={setRouteId}
            onSelectRoute={() => {}}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">운동일 *</label>
          <input type="date" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} required className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">진행한 클립수</label>
          <input
            type="text"
            inputMode="numeric"
            value={progressClipCountStr}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v === "" || Number(v) >= 0) setProgressClipCountStr(v);
            }}
            placeholder="0"
            className="input-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">등반횟수</label>
          <input type="number" min={1} value={attemptCountStr} onChange={(e) => setAttemptCountStr(e.target.value)} className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">왕복횟수</label>
          <input
            type="text"
            inputMode="numeric"
            value={roundTripCountStr}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setRoundTripCountStr(v);
            }}
            placeholder="0"
            className="input-base"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <SubmitButton
          loading={loading}
          loadingLabel="저장 중..."
          className="btn-primary disabled:pointer-events-none"
        >
          저장
        </SubmitButton>
      </div>
    </form>
  );
}
