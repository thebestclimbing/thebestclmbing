import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  OUTDOOR_LOCATION_LABELS,
  WALL_TYPE_LABELS,
  HOLD_COLOR_LABELS,
  formatGrade,
} from "@/types/database";
import type { GradeDetail, GradeValue, WallType, OutdoorLocation, HoldColor } from "@/types/database";
import OutdoorRouteDeleteButton from "./OutdoorRouteDeleteButton";
import OutdoorRouteForm from "./OutdoorRouteForm";

export default async function AdminOutdoorRoutesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/outdoor-routes");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (myProfile?.role !== "admin") redirect("/");

  const { data: routes, error } = await supabase
    .from("outdoor_routes")
    .select("id, outdoor_location, wall_type, grade_value, grade_detail, hold_color, rank_point, clip_count, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">외벽문제관리</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">외벽문제관리</h1>
      <OutdoorRouteForm />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden -mx-4 sm:mx-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">외벽</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">암벽구분</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">난이도</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">홀드색상</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">클립수</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">랭크포인트</th>
              <th className="p-1.5 sm:p-2 font-medium text-[var(--chalk)]">작업</th>
            </tr>
          </thead>
          <tbody>
            {(routes ?? []).map((r) => {
              const locationLabel = OUTDOOR_LOCATION_LABELS[r.outdoor_location as OutdoorLocation] ?? r.outdoor_location;
              const wallLabel = WALL_TYPE_LABELS[r.wall_type as keyof typeof WALL_TYPE_LABELS] ?? r.wall_type;
              const grade = formatGrade(r.grade_value as GradeValue, r.grade_detail as GradeDetail);
              const colorLabel = HOLD_COLOR_LABELS[r.hold_color as HoldColor] ?? r.hold_color;
              const label = `${locationLabel} ${wallLabel} ${grade} ${colorLabel}`;
              return (
                <tr key={r.id} className="border-b border-[var(--border)]">
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{locationLabel}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{wallLabel}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{grade}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{colorLabel}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{r.clip_count ?? "-"}</td>
                  <td className="p-1.5 sm:p-2 text-[var(--chalk-muted)]">{r.rank_point ?? "-"}</td>
                  <td className="p-1.5 sm:p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/outdoor-routes/${r.id}/edit`}
                        className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--chalk)] transition hover:bg-[var(--surface-muted)]"
                      >
                        수정
                      </Link>
                      <OutdoorRouteDeleteButton routeId={r.id} label={label} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(!routes || routes.length === 0) && (
        <p className="mt-4 text-[var(--chalk-muted)]">등록된 문제가 없습니다.</p>
      )}
      <p className="mt-6">
        <Link
          href="/admin"
          className="text-sm text-[var(--chalk-muted)] underline hover:text-[var(--chalk)]"
        >
          관리자 홈
        </Link>
      </p>
    </div>
  );
}
