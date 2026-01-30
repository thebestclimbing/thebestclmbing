"use client";

import { LoadingSpinner } from "./LoadingSpinner";

type SubmitButtonProps = {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

/**
 * 트랜잭션 발생 시 로딩 스피너 + 버튼 비활성화 (플랜핏 스타일)
 */
export function SubmitButton({
  loading,
  loadingLabel,
  children,
  disabled,
  className = "btn-primary disabled:pointer-events-none",
  type = "submit",
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={className}
      onClick={onClick}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" className="text-current" />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
