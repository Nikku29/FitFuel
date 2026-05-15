-- ============================================================================
-- FitFuel: Supabase Schema Migration
-- Drops all existing tables and recreates fresh with RLS
-- ============================================================================

-- 1. Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS ai_recipes CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS nutrition_logs CASCADE;
DROP TABLE IF EXISTS anonymous_sessions CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- 2. PROFILES (maps to old Firestore 'users' collection)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  gender TEXT,
  dob DATE,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  body_type TEXT,
  location TEXT,
  diet_preference TEXT,
  fitness_level TEXT,
  fitness_goal TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  activity_restrictions TEXT,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO')),
  credits INTEGER DEFAULT 3,
  last_profile_change TIMESTAMPTZ,
  profile_changes_count INTEGER DEFAULT 0,
  credits_initialized_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. WORKOUT LOGS
-- ============================================================================
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT,
  workout_title TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  exercises JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. NUTRITION LOGS
-- ============================================================================
CREATE TABLE nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER DEFAULT 0,
  macros JSONB DEFAULT '{"protein":0,"carbs":0,"fat":0}'::jsonb,
  image_url TEXT,
  portion_size TEXT,
  meal_type TEXT DEFAULT 'lunch',
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition logs"
  ON nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition logs"
  ON nutrition_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 5. WORKOUT PLANS (weekly AI-generated plans)
-- ============================================================================
CREATE TABLE workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  days JSONB DEFAULT '[]'::jsonb,
  exercises JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT,
  duration TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'ai_generated',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. USER FAVORITES
-- ============================================================================
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('workout', 'recipe')),
  item_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. USER PROGRESS (weight/measurement tracking)
-- ============================================================================
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  weight NUMERIC,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  measurements JSONB,
  fitness_metrics JSONB,
  goals JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 8. AI RECIPES (user-generated)
-- ============================================================================
CREATE TABLE ai_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prep_time TEXT,
  calories INTEGER DEFAULT 0,
  category TEXT,
  dietary_type TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  serving_size TEXT,
  nutrition_facts JSONB,
  chef_note TEXT,
  source TEXT DEFAULT 'ai_generated',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai recipes"
  ON ai_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai recipes"
  ON ai_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai recipes"
  ON ai_recipes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 9. RECIPES (global seeded recipes - public read)
-- ============================================================================
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  prep_time TEXT,
  calories INTEGER DEFAULT 0,
  category TEXT,
  dietary_type TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  serving_size TEXT,
  nutrition_facts JSONB,
  source TEXT DEFAULT 'seeded',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- Public read for seeded recipes (no auth required)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT USING (true);
-- Only service role can insert/update/delete (via admin)
CREATE POLICY "Service role can manage recipes"
  ON recipes FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 10. ANONYMOUS SESSIONS
-- ============================================================================
CREATE TABLE anonymous_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  age INTEGER,
  gender TEXT,
  body_type TEXT,
  location TEXT,
  diet_preference TEXT,
  fitness_level TEXT,
  fitness_goal TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  activity_restrictions TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;
-- Anonymous sessions can be read/written by anyone (they use token-based auth)
CREATE POLICY "Anyone can create anonymous sessions"
  ON anonymous_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read anonymous sessions"
  ON anonymous_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update anonymous sessions"
  ON anonymous_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete anonymous sessions"
  ON anonymous_sessions FOR DELETE USING (true);

-- ============================================================================
-- 11. DAILY LOGS (aggregated daily stats)
-- ============================================================================
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories_burned NUMERIC DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily logs"
  ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs"
  ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs"
  ON daily_logs FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 12. HELPER FUNCTION: Increment a numeric column (replaces Firestore increment)
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_field(row_id UUID, table_name TEXT, field_name TEXT, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1 WHERE id = $2', table_name, field_name, field_name)
  USING amount, row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. Storage bucket for user uploads
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read for uploaded images
CREATE POLICY "Public can view uploaded files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');
