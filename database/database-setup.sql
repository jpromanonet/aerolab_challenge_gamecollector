-- =====================================================
-- Gaming Haven Z - Complete Database Setup
-- =====================================================
-- This script sets up all necessary tables, policies, and functions
-- for the Gaming Haven Z application with Supabase authentication.

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User collections table
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    game_id INTEGER NOT NULL,
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_game_id ON public.user_collections(game_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON public.user_collections(created_at);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. DROP EXISTING POLICIES (IF ANY)
-- =====================================================

-- Drop user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.user_profiles;

-- Drop user_collections policies
DROP POLICY IF EXISTS "Users can view their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Users can insert into their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Users can delete from their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.user_collections;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_collections;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.user_collections;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.user_collections;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- User collections policies
CREATE POLICY "Users can view their own collections" ON public.user_collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own collections" ON public.user_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own collections" ON public.user_collections
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. CREATE FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('user_profiles', 'user_collections')
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_collections')
ORDER BY tablename;

-- Check if policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_collections', 'user_profiles')
ORDER BY tablename, policyname;

-- Check if functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_new_user', 'handle_updated_at')
ORDER BY routine_name;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your database is now ready for the Gaming Haven Z application!
-- 
-- Features enabled:
-- ✅ User profiles with automatic creation
-- ✅ User collections with game data storage
-- ✅ Row Level Security for data protection
-- ✅ Automatic timestamp updates
-- ✅ Performance indexes
-- ✅ Proper foreign key relationships 