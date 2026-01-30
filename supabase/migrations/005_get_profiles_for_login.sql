-- 로그인 시 이름+전화뒷4자리로 프로필 조회 (비로그인 상태에서 RLS 때문에 profiles SELECT 불가 → RPC로 우회)
-- SECURITY DEFINER로 RLS 없이 name, phone_tail4 일치 행만 반환

CREATE OR REPLACE FUNCTION public.get_profiles_for_login(p_name text, p_tail4 text)
RETURNS TABLE (id uuid, email text, name text, phone text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT pr.id, pr.email, pr.name, pr.phone
  FROM public.profiles pr
  WHERE pr.name = trim(p_name)
    AND pr.phone_tail4 = p_tail4
    AND char_length(p_tail4) = 4;
$$;
