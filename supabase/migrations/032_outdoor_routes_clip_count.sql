-- 외벽문제 클립수 (진행도 추적 기준: 홀드수 대신 클립수 사용)
ALTER TABLE outdoor_routes
  ADD COLUMN clip_count INTEGER NOT NULL DEFAULT 1 CHECK (clip_count > 0);

-- outdoor_routes.updated_at 자동 갱신 트리거 누락 보완
CREATE TRIGGER outdoor_routes_updated_at BEFORE UPDATE ON public.outdoor_routes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
