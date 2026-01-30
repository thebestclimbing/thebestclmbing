"use client";

import Link from "next/link";
import { WALL_TYPE_LABELS, formatGrade } from "@/types/database";
import type { GradeDetail, GradeValue } from "@/types/database";

interface LogItem {
  id: string;
  progress_hold_count: number;
  attempt_count: number;
  is_completed: boolean;
  is_round_trip: boolean;
  round_trip_count: number;
  logged_at: string;
  route: {
    id: string;
    wall_type: string;
    grade_value: GradeValue;
    grade_detail: GradeDetail;
    name: string;
    hold_count: number;
  };
}

export default function ExerciseLogList({ logs }: { logs: LogItem[] }) {
  if (logs.length === 0) {
    return (
      <p className="card rounded-2xl p-6 text-[var(--chalk-muted)]">
        기록이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {logs.map((log) => {
        const wallLabel =
          WALL_TYPE_LABELS[log.route.wall_type as keyof typeof WALL_TYPE_LABELS] ??
          log.route.wall_type;
        const grade = formatGrade(log.route.grade_value, log.route.grade_detail);
        return (
          <li
            key={log.id}
            className="card rounded-2xl p-4"
          >
            <Link href={`/exercise/${log.id}`} className="block">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-[var(--chalk-muted)]">
                  {log.logged_at}
                </span>
                <span className="text-[var(--chalk-muted)]">
                  {wallLabel}
                </span>
                <span className="font-medium text-[var(--chalk)]">
                  {log.route.name}
                </span>
                <span className="text-[var(--chalk-muted)]">난이도 {grade}</span>
                {log.is_completed && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    완등
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-[var(--chalk-muted)]">
                홀드 {log.progress_hold_count}/{log.route.hold_count} · 시도{" "}
                {log.attempt_count}회
                {log.is_round_trip && ` · 왕복 ${log.round_trip_count}회`}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
