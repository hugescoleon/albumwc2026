-- WorldCup 2026 Collector Hub - Supabase Database Schema & RLS Setup
-- Ejecuta este script completo en el SQL Editor de tu panel de Supabase para corregir y asegurar la persistencia.
--------------------------------------------------------------------------------
-- 1. TABLA: profiles
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    country TEXT,
    collector_code TEXT UNIQUE NOT NULL,
    use_whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);
-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- RLS: Permitir lectura pública (Necesaria para que invitados busquen colecciones por código y para verificar login)
DROP POLICY IF EXISTS "Permitir lectura pública de perfiles" ON public.profiles;
CREATE POLICY "Permitir lectura pública de perfiles" ON public.profiles FOR
SELECT USING (true);
-- RLS: Permitir a usuarios autenticados insertar su propio perfil al registrarse
DROP POLICY IF EXISTS "Permitir creación de perfil propio" ON public.profiles;
CREATE POLICY "Permitir creación de perfil propio" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- RLS: Permitir a los usuarios modificar su propio perfil
DROP POLICY IF EXISTS "Permitir actualización de perfil propio" ON public.profiles;
CREATE POLICY "Permitir actualización de perfil propio" ON public.profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
--------------------------------------------------------------------------------
-- 2. TABLA: user_stickers
-- NOTA CRÍTICA: Debe tener una clave primaria compuesta (user_id, sticker_id)
-- para que el comando UPSERT en el código frontend funcione sin fallos.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stickers (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sticker_id TEXT NOT NULL,
    in_album BOOLEAN DEFAULT false NOT NULL,
    quantity INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, sticker_id)
);
-- Habilitar RLS en user_stickers
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;
-- RLS: Permitir lectura pública (Necesaria para que los amigos/invitados vean tu progreso)
DROP POLICY IF EXISTS "Permitir lectura pública de estampas" ON public.user_stickers;
CREATE POLICY "Permitir lectura pública de estampas" ON public.user_stickers FOR
SELECT USING (true);
-- RLS: Permitir a los usuarios autenticados gestionar (insertar, editar, borrar) sus propias estampas
DROP POLICY IF EXISTS "Permitir gestión de estampas propias" ON public.user_stickers;
CREATE POLICY "Permitir gestión de estampas propias" ON public.user_stickers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
--------------------------------------------------------------------------------
-- 3. TABLA: config
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.config (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Habilitar RLS en config
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
-- RLS: Permitir lectura pública del branding, patrocinadores y configuraciones
DROP POLICY IF EXISTS "Permitir lectura pública de configuraciones" ON public.config;
CREATE POLICY "Permitir lectura pública de configuraciones" ON public.config FOR
SELECT USING (true);
-- RLS: Permitir exclusivamente al Super Administrador gestionar la configuración
DROP POLICY IF EXISTS "Permitir edición de config a administradores" ON public.config;
CREATE POLICY "Permitir edición de config a administradores" ON public.config FOR ALL USING (
    auth.jwt()->>'email' IN ('hugoescobarleon@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('hugoescobarleon@gmail.com')
);