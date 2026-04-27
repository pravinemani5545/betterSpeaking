-- BetterSpeaking: Initial Schema

-- Enums
CREATE TYPE question_category AS ENUM (
  'behavioral', 'technical', 'situational', 'leadership', 'problem_solving'
);
CREATE TYPE response_type AS ENUM ('text', 'video');

-- Questions table
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 500),
  category    question_category NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX questions_user_category_idx ON questions (user_id, category);

-- Daily questions table
CREATE TABLE daily_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  served_date DATE NOT NULL,
  responded   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, served_date)
);

CREATE INDEX daily_questions_user_date_idx ON daily_questions (user_id, served_date DESC);

-- Responses table
CREATE TABLE responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  response_type    response_type NOT NULL,
  text_content     TEXT,
  video_url        TEXT,
  transcript       TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX responses_user_created_idx ON responses (user_id, created_at DESC);
CREATE INDEX responses_question_idx ON responses (question_id);

-- Analyses table
CREATE TABLE analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id       UUID NOT NULL UNIQUE REFERENCES responses(id) ON DELETE CASCADE,
  overall_score     SMALLINT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 10),
  content_analysis  JSONB NOT NULL,
  delivery_analysis JSONB,
  suggestions       TEXT[] NOT NULL DEFAULT '{}',
  strengths         TEXT[] NOT NULL DEFAULT '{}',
  improved_response TEXT NOT NULL,
  raw_json          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Questions RLS
CREATE POLICY "questions_select_own" ON questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "questions_insert_own" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "questions_update_own" ON questions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "questions_delete_own" ON questions FOR DELETE USING (auth.uid() = user_id);

-- Daily questions RLS
CREATE POLICY "daily_questions_select_own" ON daily_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_questions_insert_own" ON daily_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_questions_update_own" ON daily_questions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Responses RLS
CREATE POLICY "responses_select_own" ON responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "responses_insert_own" ON responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analyses RLS (read via response ownership)
CREATE POLICY "analyses_select_own" ON analyses FOR SELECT
  USING (EXISTS (SELECT 1 FROM responses WHERE responses.id = analyses.response_id AND responses.user_id = auth.uid()));
CREATE POLICY "analyses_insert_own" ON analyses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM responses WHERE responses.id = analyses.response_id AND responses.user_id = auth.uid()));
