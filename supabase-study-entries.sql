CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.study_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technology_name TEXT NOT NULL,
  lesson_id BIGINT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sem titulo',
  summary TEXT NOT NULL DEFAULT '',
  full_code TEXT NOT NULL DEFAULT '',
  study_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_study_entries_user_tech_lesson
  ON public.study_entries (user_id, technology_name, lesson_id);

ALTER TABLE public.study_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.study_entries FROM anon;
REVOKE ALL ON public.study_entries FROM public;
GRANT ALL ON public.study_entries TO authenticated;

DROP POLICY IF EXISTS "Users can read own study entries" ON public.study_entries;
DROP POLICY IF EXISTS "Users can insert own study entries" ON public.study_entries;
DROP POLICY IF EXISTS "Users can update own study entries" ON public.study_entries;
DROP POLICY IF EXISTS "Users can delete own study entries" ON public.study_entries;

CREATE POLICY "Users can read own study entries"
  ON public.study_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study entries"
  ON public.study_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study entries"
  ON public.study_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study entries"
  ON public.study_entries FOR DELETE
  USING (auth.uid() = user_id);
