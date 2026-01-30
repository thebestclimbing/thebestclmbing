"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ReservationConfirmButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("daily_reservations")
      .update({ status: "confirmed" })
      .eq("id", reservationId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="text-white" />
          처리 중...
        </>
      ) : (
        "예약완료"
      )}
    </button>
  );
}
