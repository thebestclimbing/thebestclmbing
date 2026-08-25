CREATE TABLE outdoor_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outdoor_location TEXT NOT NULL CHECK (outdoor_location IN ('ilsan', 'munhak')),
  wall_type TEXT NOT NULL CHECK (wall_type IN ('vertical', 'slight_overhang', 'overhang', 'extreme_overhang')),
  grade_value TEXT NOT NULL,
  grade_detail TEXT NOT NULL,
  hold_color TEXT NOT NULL CHECK (hold_color IN ('red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'black', 'pink')),
  rank_point INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE outdoor_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outdoor_routes_select" ON outdoor_routes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "outdoor_routes_insert" ON outdoor_routes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "outdoor_routes_update" ON outdoor_routes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "outdoor_routes_delete" ON outdoor_routes
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
