/**
 * 왕복(round trip)을 포함한 실제 진행 홀드/클립 수 계산.
 * 왕복 N회 = 진행한 홀드(클립)수만큼을 N번 반복한 것으로 간주해 곱한다.
 * 왕복이 없으면(0회) 진행 홀드수를 그대로 사용한다.
 */
export function effectiveProgressCount(
  progressCount: number,
  roundTripCount: number
): number {
  return roundTripCount > 0 ? progressCount * roundTripCount : progressCount;
}
