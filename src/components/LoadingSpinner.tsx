"use client";

/**
 * 트랜잭션/제출 시 버튼 안에 표시하는 로딩 스피너 (플랜핏 스타일 참고)
 * - size: "sm" 버튼 내 인라인, "md" 독립 로딩
 */
export function LoadingSpinner({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={`inline-block shrink-0 ${size === "sm" ? "spinner spinner-sm" : "spinner"} ${className}`}
    />
  );
}
