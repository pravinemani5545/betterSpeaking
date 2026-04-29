-- Feedback / bug reports table
CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('bug', 'feedback', 'feature')),
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX feedback_user_idx ON feedback (user_id, created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_select_own" ON feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
