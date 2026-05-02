CREATE TYPE insight_type AS ENUM ('daily', 'weekly');

CREATE TABLE insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         insight_type NOT NULL,
  content      JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type, period_start)
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own insights" ON insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id);
