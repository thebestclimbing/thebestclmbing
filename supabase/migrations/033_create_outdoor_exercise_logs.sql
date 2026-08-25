-- 외벽운동일지
CREATE TABLE public.outdoor_exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  outdoor_route_id UUID NOT NULL REFERENCES public.outdoor_routes(id) ON DELETE CASCADE,
  progress_clip_count INTEGER NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completion_requested BOOLEAN NOT NULL DEFAULT false,
  is_round_trip BOOLEAN NOT NULL DEFAULT false,
  round_trip_count INTEGER NOT NULL DEFAULT 0,
  logged_at DATE NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outdoor_exercise_logs_profile_logged ON public.outdoor_exercise_logs(profile_id, logged_at DESC);
CREATE INDEX idx_outdoor_exercise_logs_route ON public.outdoor_exercise_logs(outdoor_route_id);
CREATE INDEX idx_outdoor_exercise_logs_completed ON public.outdoor_exercise_logs(is_completed, logged_at DESC);

CREATE TRIGGER outdoor_exercise_logs_updated_at BEFORE UPDATE ON public.outdoor_exercise_logs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.outdoor_exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "외벽운동일지 본인" ON public.outdoor_exercise_logs FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "외벽완등 공개 조회" ON public.outdoor_exercise_logs
  FOR SELECT USING (is_completed = true);

CREATE POLICY "관리자 외벽운동일지 전체 조회" ON public.outdoor_exercise_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "관리자 외벽운동일지 완등처리" ON public.outdoor_exercise_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
