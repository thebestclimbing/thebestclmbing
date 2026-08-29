-- 외벽문제 암벽구분값을 실내와 별도로 변경: 직벽/좌측오버행/우측오버행/중앙오버행
-- 기존 값(약오버벽/오버벽/극오버)은 새 분류 기준(방향)과 무관하므로 직벽으로 초기화
ALTER TABLE outdoor_routes DROP CONSTRAINT outdoor_routes_wall_type_check;
UPDATE outdoor_routes SET wall_type = 'vertical' WHERE wall_type NOT IN ('vertical', 'left_overhang', 'right_overhang', 'center_overhang');
ALTER TABLE outdoor_routes
  ADD CONSTRAINT outdoor_routes_wall_type_check
  CHECK (wall_type IN ('vertical', 'left_overhang', 'right_overhang', 'center_overhang'));
