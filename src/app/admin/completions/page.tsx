import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WALL_TYPE_LABELS, OUTDOOR_LOCATION_LABELS, HOLD_COLOR_LABELS, formatGrade } from "@/types/database";
import type { GradeDetail, GradeValue, OutdoorLocation, HoldColor } from "@/types/database";
import { CompletionConfirmButton } from "./CompletionConfirmButton";

export default async function AdminCompletionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/completions");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (myProfile?.role !== "admin") redirect("/");

  const { data: logsRaw } = await supabase
    .from("exercise_logs")
    .select(
      `
      id,
      logged_at,
      completion_requested,
      is_completed,
      profile_id,
      route_id,
      profile:profiles(id, name),
      route:routes(id, name, wall_type, grade_value, grade_detail, hold_count)
    `
    )
    .eq("completion_requested", true)
    .eq("is_completed", false)
    .order("logged_at", { ascending: false });

  const { data: outdoorLogsRaw } = await supabase
    .from("outdoor_exercise_logs")
    .select(
      `
      id,
      logged_at,
      completion_requested,
      is_completed,
      profile_id,
      outdoor_route_id,
      profile:profiles(id, name),
      route:outdoor_routes(id, outdoor_location, wall_type, grade_value, grade_detail, hold_color, clip_count)
    `
    )
    .eq("completion_requested", true)
    .eq("is_completed", false)
    .order("logged_at", { ascending: false });

  type Row = {
    id: string;
    logged_at: string;
    completion_requested: boolean;
    is_completed: boolean;
    profile_id: string;
    route_id: string;
    profile: { id: string; name: string } | { id: string; name: string }[] | null;
    route:
      | { id: string; name: string; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_count: number }
      | { id: string; name: string; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_count: number }[];
  };
  const rows = ((logsRaw ?? []) as Row[]).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] ?? null : r.profile,
    route: Array.isArray(r.route) ? r.route[0] : r.route,
    kind: "indoor" as const,
  }));

  type OutdoorRow = {
    id: string;
    logged_at: string;
    completion_requested: boolean;
    is_completed: boolean;
    profile_id: string;
    outdoor_route_id: string;
    profile: { id: string; name: string } | { id: string; name: string }[] | null;
    route:
      | { id: string; outdoor_location: OutdoorLocation; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_color: HoldColor; clip_count: number }
      | { id: string; outdoor_location: OutdoorLocation; wall_type: string; grade_value: GradeValue; grade_detail: GradeDetail; hold_color: HoldColor; clip_count: number }[];
  };
  const outdoorRows = ((outdoorLogsRaw ?? []) as OutdoorRow[]).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] ?? null : r.profile,
    route: Array.isArray(r.route) ? r.route[0] : r.route,
    kind: "outdoor" as const,
  }));

  const allRows = [...rows, ...outdoorRows].sort((a, b) =>
    a.logged_at < b.logged_at ? 1 : a.logged_at > b.logged_at ? -1 : 0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">
        회원 완등관리
      </h1>
      <p className="mb-4 text-sm text-[var(--chalk-muted)]">
        회원이 완등요청한 기록을 조회하고 완등완료 처리합니다.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden -mx-4 sm:mx-0">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)] whitespace-nowrap">날짜</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">구분</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">회원</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">문제</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">난이도</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">동작</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((r) => {
              if (r.kind === "indoor") {
                const grade = formatGrade(r.route.grade_value, r.route.grade_detail);
                const wallLabel =
                  WALL_TYPE_LABELS[r.route.wall_type as keyof typeof WALL_TYPE_LABELS] ??
                  r.route.wall_type;
                return (
                  <tr key={`indoor-${r.id}`} className="border-b border-[var(--border)]">
                    <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)] whitespace-nowrap">{r.logged_at}</td>
                    <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">실내</td>
                    <td className="p-1.5 sm:p-2 text-[var(--chalk)]">
                      {r.profile?.name ?? "-"}
                    </td>
                    <td className="p-1.5 sm:p-2 text-[var(--chalk)]">
                      {r.route.name} ({wallLabel})
                    </td>
                    <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{grade}</td>
                    <td className="p-1.5 sm:p-2">
                      <CompletionConfirmButton logId={r.id} table="exercise_logs" />
                    </td>
                  </tr>
                );
              }
              const grade = formatGrade(r.route.grade_value, r.route.grade_detail);
              const wallLabel =
                WALL_TYPE_LABELS[r.route.wall_type as keyof typeof WALL_TYPE_LABELS] ??
                r.route.wall_type;
              const locationLabel = OUTDOOR_LOCATION_LABELS[r.route.outdoor_location] ?? r.route.outdoor_location;
              const colorLabel = HOLD_COLOR_LABELS[r.route.hold_color] ?? r.route.hold_color;
              return (
                <tr key={`outdoor-${r.id}`} className="border-b border-[var(--border)]">
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)] whitespace-nowrap">{r.logged_at}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">외벽</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk)]">
                    {r.profile?.name ?? "-"}
                  </td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk)]">
                    {locationLabel} {colorLabel} ({wallLabel})
                  </td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{grade}</td>
                  <td className="p-1.5 sm:p-2">
                    <CompletionConfirmButton logId={r.id} table="outdoor_exercise_logs" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {allRows.length === 0 && (
        <p className="mt-4 text-[var(--chalk-muted)]">완등요청된 기록이 없습니다.</p>
      )}
      <p className="mt-6">
        <Link
          href="/admin/members"
          className="text-sm text-[var(--chalk-muted)] underline hover:text-[var(--chalk)]"
        >
          관리자 메뉴
        </Link>
      </p>
    </div>
  );
}
