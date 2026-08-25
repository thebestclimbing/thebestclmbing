import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OutdoorExerciseLogUpdateForm from "../../OutdoorExerciseLogUpdateForm";

export default async function OutdoorExerciseLogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/exercise/outdoor/" + id + "/edit");

  const { data: log, error } = await supabase
    .from("outdoor_exercise_logs")
    .select(
      "id, profile_id, outdoor_route_id, progress_clip_count, attempt_count, is_completed, is_round_trip, round_trip_count, logged_at"
    )
    .eq("id", id)
    .single();

  if (error || !log || (log as { profile_id: string }).profile_id !== user.id) {
    notFound();
  }

  const { data: routes } = await supabase
    .from("outdoor_routes")
    .select("id, outdoor_location, wall_type, grade_value, grade_detail, hold_color, clip_count")
    .order("created_at", { ascending: false });

  const row = log as {
    id: string;
    profile_id: string;
    outdoor_route_id: string;
    progress_clip_count: number;
    attempt_count: number;
    is_completed: boolean;
    is_round_trip: boolean;
    round_trip_count: number;
    logged_at: string;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">
        외벽운동일지 수정
      </h1>
      <OutdoorExerciseLogUpdateForm
        logId={row.id}
        profileId={row.profile_id}
        routes={routes ?? []}
        initial={{
          outdoor_route_id: row.outdoor_route_id,
          progress_clip_count: row.progress_clip_count,
          attempt_count: row.attempt_count,
          is_completed: row.is_completed,
          is_round_trip: row.is_round_trip,
          round_trip_count: row.round_trip_count,
          logged_at: row.logged_at,
        }}
      />
      <p className="mt-6">
        <Link
          href={"/exercise/outdoor/" + id}
          className="text-sm text-[var(--chalk-muted)] underline hover:text-[var(--chalk)]"
        >
          상세로
        </Link>
      </p>
    </div>
  );
}
