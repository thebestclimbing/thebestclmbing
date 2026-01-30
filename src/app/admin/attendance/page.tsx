import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/attendance");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (myProfile?.role !== "admin") redirect("/");

  const { data: attendances, error } = await supabase
    .from("attendances")
    .select(
      `
      id,
      attended_at,
      checked_at,
      profile:profiles(id, name, phone_tail4)
    `
    )
    .order("attended_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">출석관리</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  type ProfileRef = { id: string; name: string; phone_tail4: string } | null;
  type Row = {
    id: string;
    attended_at: string;
    checked_at: string;
    profile: ProfileRef | ProfileRef[];
  };

  function getProfile(row: Row): ProfileRef {
    const p = row.profile;
    if (Array.isArray(p)) return p[0] ?? null;
    return p ?? null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">
        출석관리
      </h1>
      <p className="mb-4 text-sm text-[var(--chalk-muted)]">
        회원명, 출석일자, 체크 시각
      </p>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-3 font-medium text-[var(--chalk)]">
                출석일자
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                회원명
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                전화뒷4자리
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                체크 시각
              </th>
            </tr>
          </thead>
          <tbody>
            {(attendances ?? []).map((a) => {
              const row = a as unknown as Row;
              const profile = getProfile(row);
              return (
                <tr
                  key={row.id}
                  className="border-b border-[var(--border)]"
                >
                  <td className="p-3 text-[var(--chalk)]">
                    {row.attended_at}
                  </td>
                  <td className="p-3 text-[var(--chalk-muted)]">
                    {profile?.name ?? "-"}
                  </td>
                  <td className="p-3 text-[var(--chalk-muted)]">
                    {profile?.phone_tail4 ?? "-"}
                  </td>
                  <td className="p-3 text-[var(--chalk-muted)]">
                    {new Date(row.checked_at).toLocaleString("ko-KR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(!attendances || attendances.length === 0) && (
        <p className="mt-4 text-[var(--chalk-muted)]">출석 기록이 없습니다.</p>
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
