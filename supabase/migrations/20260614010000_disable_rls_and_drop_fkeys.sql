-- Migration to disable RLS and drop foreign keys pointing to auth.users for Firebase Auth compatibility

-- 1. Dynamically drop all foreign key constraints referencing auth.users(id) only on PUBLIC tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            ns.nspname AS table_schema,
            rel.relname AS table_name,
            con.conname AS constraint_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = rel.relnamespace
        JOIN pg_class refrel ON refrel.oid = con.confrelid
        JOIN pg_namespace refns ON refns.oid = refrel.relnamespace
        WHERE con.contype = 'f'
          AND ns.nspname = 'public'  -- Restrict only to tables in the public schema
          AND refns.nspname = 'auth'
          AND refrel.relname = 'users'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END;
$$;

-- 2. Dynamically disable Row Level Security (RLS) on all public tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END;
$$;

-- 3. Replace storage table RLS disable with fully permissive public storage policies
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view resource files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resource files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resource files" ON storage.objects;

CREATE POLICY "Public storage view" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public storage insert" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public storage update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public storage delete" ON storage.objects FOR DELETE USING (true);
