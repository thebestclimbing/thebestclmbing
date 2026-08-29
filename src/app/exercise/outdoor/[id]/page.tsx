import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OUTDOOR_LOCATION_LABELS, OUTDOOR_WALL_TYPE_LABELS, HOLD_COLOR_LABELS, formatGrade } from "@/types/database";
import type { GradeDetail, GradeValue, OutdoorLocation, OutdoorWallType, HoldColor } from "@/types/database";
import OutdoorExerciseLogEdit from "../OutdoorExerciseLogEdit";

export default async function OutdoorExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/exercise/outdoor/" + id);

  const { data: log, error } = await supabase
    .from("outdoor_exercise_logs")
    .select(
      `
      id,
      profile_id,
      outdoor_route_id,
      progress_clip_count,
      attempt_count,
      is_completed,
      is_round_trip,
      round_trip_count,
      logged_at,
      route:outdoor_routes(id, outdoor_location, wall_type, grade_value, grade_detail, hold_color, clip_count)
    `
    )
    .eq("id", id)
    .single();

  const profileId = (log as { profile_id: string })?.profile_id;
  if (error || !log) notFound();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = myProfile?.role === "admin";
  if (profileId !== user.id && !isAdmin) notFound();

  const raw = log as unknown as {
    id: string;
    profile_id: string;
    outdoor_route_id: string;
    progress_clip_count: number;
    attempt_count: number;
    is_completed: boolean;
    is_round_trip: boolean;
    round_trip_count: number;
    logged_at: string;
    route:
      | { id: string; outdoor_location: OutdoorLocation; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_color: HoldColor; clip_count: number }
      | { id: string; outdoor_location: OutdoorLocation; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_color: HoldColor; clip_count: number }[];
  };
  const route = Array.isArray(raw.route) ? raw.route[0] : raw.route;
  if (!route) notFound();
  const row = { ...raw, route };

  const locationLabel = OUTDOOR_LOCATION_LABELS[row.route.outdoor_location] ?? row.route.outdoor_location;
  const wallLabel =
    OUTDOOR_WALL_TYPE_LABELS[row.route.wall_type as OutdoorWallType] ??
    row.route.wall_type;
  const colorLabel = HOLD_COLOR_LABELS[row.route.hold_color] ?? row.route.hold_color;
  const grade = formatGrade(row.route.grade_value, row.route.grade_detail);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">
        외벽운동일지 상세
      </h1>
      <div className="card rounded-2xl p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">운동일</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {row.logged_at}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">외벽</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {locationLabel}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">암벽구분</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {wallLabel}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">홀드색상</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {colorLabel}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">난이도</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {grade}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">클립수</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {row.progress_clip_count} / {row.route.clip_count}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">등반횟수</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {row.attempt_count}회
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">완등여부</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {row.is_completed ? "완등" : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--chalk-muted)]">왕복</dt>
            <dd className="font-medium text-[var(--chalk)]">
              {row.is_round_trip ? `왕복 ${row.round_trip_count}회` : "-"}
            </dd>
          </div>
        </dl>
        {profileId === user.id && (
          <div className="mt-6">
            <OutdoorExerciseLogEdit
              logId={row.id}
              profileId={row.profile_id}
            />
          </div>
        )}
      </div>
      <p className="mt-6">
        <Link
          href="/exercise/outdoor"
          className="text-sm text-[var(--chalk-muted)] underline hover:text-[var(--chalk)]"
        >
          목록으로
        </Link>
      </p>
    </div>
  );
}
