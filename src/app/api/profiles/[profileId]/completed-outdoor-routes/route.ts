import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OUTDOOR_LOCATION_LABELS, OUTDOOR_WALL_TYPE_LABELS, HOLD_COLOR_LABELS } from "@/types/database";
import type { OutdoorLocation, OutdoorWallType, HoldColor } from "@/types/database";

export type CompletedOutdoorRouteItem = {
  label: string;
  rank_point: number | null;
  grade_value: string | null;
  grade_detail: string | null;
};

/**
 * GET /api/profiles/[profileId]/completed-outdoor-routes
 * 해당 회원의 완등한 외벽문제 목록 (문제당 1회, 외벽·홀드색상 라벨·난이도·랭크포인트)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  if (!profileId) {
    return NextResponse.json({ routes: [] });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "설정이 되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const { data: logs } = await supabase
    .from("outdoor_exercise_logs")
    .select("outdoor_route_id, logged_at, route:outdoor_routes(outdoor_location, wall_type, hold_color, rank_point, grade_value, grade_detail)")
    .eq("profile_id", profileId)
    .eq("is_completed", true)
    .order("logged_at", { ascending: true });

  const seen = new Set<string>();
  const routes: CompletedOutdoorRouteItem[] = [];

  for (const row of logs ?? []) {
    const routeId = row.outdoor_route_id as string;
    if (seen.has(routeId)) continue;
    seen.add(routeId);
    const route = Array.isArray(row.route) ? row.route[0] : row.route;
    if (!route) continue;
    const r = route as {
      outdoor_location?: OutdoorLocation;
      wall_type?: OutdoorWallType;
      hold_color?: HoldColor;
      rank_point?: number | null;
      grade_value?: string | null;
      grade_detail?: string | null;
    };
    const locationLabel = r.outdoor_location ? OUTDOOR_LOCATION_LABELS[r.outdoor_location] : "-";
    const wallLabel = r.wall_type ? OUTDOOR_WALL_TYPE_LABELS[r.wall_type] : "-";
    const colorLabel = r.hold_color ? HOLD_COLOR_LABELS[r.hold_color] : "-";
    routes.push({
      label: `${locationLabel} ${wallLabel} ${colorLabel}`,
      rank_point: r.rank_point ?? null,
      grade_value: r.grade_value ?? null,
      grade_detail: r.grade_detail ?? null,
    });
  }

  routes.sort((a, b) => (b.rank_point ?? -1) - (a.rank_point ?? -1));

  return NextResponse.json({ routes });
}
