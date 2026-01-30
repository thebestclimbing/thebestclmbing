"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/SubmitButton";

interface RouteRow {
  id: string;
  name: string;
  hold_count: number;
}

interface Initial {
  route_id: string;
  progress_hold_count: number;
  attempt_count: number;
  is_completed: boolean;
  is_round_trip: boolean;
  round_trip_count: number;
  logged_at: string;
}

export default function ExerciseLogUpdateForm({
  logId,
  profileId,
  routes,
  initial,
}: {
  logId: string;
  profileId: string;
  routes: RouteRow[];
  initial: Initial;
}) {
  const router = useRouter();
  const [routeId, setRouteId] = useState(initial.route_id);
  const [progressHoldCount, setProgressHoldCount] = useState(
    initial.progress_hold_count
  );
  const [attemptCount, setAttemptCount] = useState(initial.attempt_count);
  const [isCompleted, setIsCompleted] = useState(initial.is_completed);
  const [isRoundTrip, setIsRoundTrip] = useState(initial.is_round_trip);
  const [roundTripCount, setRoundTripCount] = useState(initial.round_trip_count);
  const [loggedAt, setLoggedAt] = useState(initial.logged_at);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoute = routes.find((r) => r.id === routeId);
  const maxHold = selectedRoute?.hold_count ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("exercise_logs")
      .update({
        route_id: routeId,
        progress_hold_count: Math.min(progressHoldCount, maxHold),
        attempt_count: attemptCount,
        is_completed: isCompleted,
        is_round_trip: isRoundTrip,
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
    router.push("/exercise/" + logId);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">루트 *</label>
          <select
            value={routeId}
            onChange={(e) => {
              setRouteId(e.target.value);
              const r = routes.find((x) => x.id === e.target.value);
              if (r) setProgressHoldCount(Math.min(progressHoldCount, r.hold_count));
            }}
            required
            className="input-base"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (홀드 {r.hold_count})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">운동일 *</label>
          <input type="date" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} required className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">진행한 홀드수 (0 ~ {maxHold})</label>
          <input type="number" min={0} max={maxHold} value={progressHoldCount} onChange={(e) => setProgressHoldCount(Number(e.target.value))} className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--chalk-muted)]">등반횟수</label>
          <input type="number" min={1} value={attemptCount} onChange={(e) => setAttemptCount(Number(e.target.value))} className="input-base" />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" id="isCompleted" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} className="rounded border-[var(--border)]" />
          <label htmlFor="isCompleted" className="text-sm text-[var(--chalk)]">완등</label>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" id="isRoundTrip" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="rounded border-[var(--border)]" />
          <label htmlFor="isRoundTrip" className="text-sm text-[var(--chalk)]">왕복</label>
        </div>
        {isRoundTrip && (
          <div>
            <label className="mb-1 block text-sm text-[var(--chalk-muted)]">왕복횟수</label>
            <input type="number" min={0} value={roundTripCount} onChange={(e) => setRoundTripCount(Number(e.target.value))} className="input-base" />
          </div>
        )}
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
