import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/members");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (myProfile?.role !== "admin") redirect("/");

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, phone_tail4, membership_start, membership_end, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">회원관리</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--chalk)]">
        회원관리
      </h1>
      <p className="mb-4 text-sm text-[var(--chalk-muted)]">
        성명, 이메일, 전화번호, 전화번호 뒷 4자리, 회원권 기간
      </p>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-3 font-medium text-[var(--chalk)]">
                성명
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                이메일
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                전화번호
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                뒷4자리
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                회원권 시작
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                회원권 종료
              </th>
              <th className="p-3 font-medium text-[var(--chalk)]">
                역할
              </th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--border)]"
              >
                <td className="p-3 text-[var(--chalk)]">{p.name}</td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.email ?? "-"}
                </td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.phone}
                </td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.phone_tail4}
                </td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.membership_start ?? "-"}
                </td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.membership_end ?? "-"}
                </td>
                <td className="p-3 text-[var(--chalk-muted)]">
                  {p.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!profiles || profiles.length === 0) && (
        <p className="mt-4 text-[var(--chalk-muted)]">등록된 회원이 없습니다.</p>
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
