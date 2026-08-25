"use client";

import React, { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import OutdoorExerciseLogAddSection from "./OutdoorExerciseLogAddSection";
import OutdoorExerciseLogList from "./OutdoorExerciseLogList";
import type { GradeDetail, GradeValue, OutdoorLocation, HoldColor } from "@/types/database";

interface OutdoorRouteRow {
  id: string;
  outdoor_location: string;
  wall_type: string;
  grade_value: string;
  grade_detail: string;
  hold_color: string;
  clip_count: number;
}

interface LogItem {
  id: string;
  progress_clip_count: number;
  attempt_count: number;
  is_completed: boolean;
  completion_requested: boolean;
  is_round_trip: boolean;
  round_trip_count: number;
  logged_at: string;
  memo: string | null;
  route: {
    id: string;
    outdoor_location: OutdoorLocation;
    wall_type: string;
    grade_value: GradeValue;
    grade_detail: GradeDetail;
    hold_color: HoldColor;
    clip_count: number;
  };
}

export interface OutdoorLogInsertPayload {
  route: OutdoorRouteRow;
  progress_clip_count: number;
  attempt_count: number;
  is_round_trip: boolean;
  round_trip_count: number;
  logged_at: string;
}

export default function OutdoorExerciseLogSection({
  profileId,
  routes,
  completedRouteIds,
  logs,
  completedRouteIdToDate,
  children,
}: {
  profileId: string;
  routes: OutdoorRouteRow[];
  completedRouteIds: string[];
  logs: LogItem[];
  completedRouteIdToDate: Record<string, string>;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    logs,
    (state: LogItem[], newLog: LogItem) => [newLog, ...state]
  );

  function handleInsert(payload: OutdoorLogInsertPayload) {
    const optimisticLog: LogItem = {
      id: `optimistic-${Date.now()}`,
      progress_clip_count: payload.progress_clip_count,
      attempt_count: payload.attempt_count,
      is_completed: false,
      completion_requested: false,
      is_round_trip: payload.is_round_trip,
      round_trip_count: payload.round_trip_count,
      logged_at: payload.logged_at,
      memo: null,
      route: {
        id: payload.route.id,
        outdoor_location: payload.route.outdoor_location as OutdoorLocation,
        wall_type: payload.route.wall_type,
        grade_value: payload.route.grade_value as GradeValue,
        grade_detail: payload.route.grade_detail as GradeDetail,
        hold_color: payload.route.hold_color as HoldColor,
        clip_count: payload.route.clip_count,
      },
    };
    startTransition(() => {
      addOptimisticLog(optimisticLog);
      router.refresh();
    });
  }

  return (
    <>
      <OutdoorExerciseLogAddSection
        profileId={profileId}
        routes={routes}
        completedRouteIds={completedRouteIds}
        onInsert={handleInsert}
      />
      {children}
      <section className="mt-8 lg:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-[var(--chalk)] md:text-xl lg:text-2xl">
          기록 목록
        </h2>
        <OutdoorExerciseLogList
          logs={optimisticLogs}
          profileId={profileId}
          completedRouteIdToDate={completedRouteIdToDate}
        />
      </section>
    </>
  );
}
