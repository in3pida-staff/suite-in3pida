-- ════════════════════════════════════════════════════════════════════════
--  in3pida Suite — Schema
--  Esegui questo file nel SQL Editor di Supabase.
--  È SICURO: crea SOLO la nuova tabella suite_permissions, non tocca nulla
--  di esistente (usa CREATE TABLE IF NOT EXISTS).
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS suite_permissions (
    id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app_id     text        NOT NULL,
    visible    boolean     DEFAULT true,
    role       text        DEFAULT 'user',
    features   jsonb       DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_suite_perms_user ON suite_permissions(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE suite_permissions ENABLE ROW LEVEL SECURITY;

-- mario@in3pida.it: accesso totale (lettura + scrittura su tutte le righe)
DROP POLICY IF EXISTS "suite_admin_all" ON suite_permissions;
CREATE POLICY "suite_admin_all" ON suite_permissions
    FOR ALL
    USING      ( (auth.jwt() ->> 'email') = 'mario@in3pida.it' )
    WITH CHECK ( (auth.jwt() ->> 'email') = 'mario@in3pida.it' );

-- ogni altro utente: può leggere SOLO le proprie righe (mai scrivere)
DROP POLICY IF EXISTS "suite_read_own" ON suite_permissions;
CREATE POLICY "suite_read_own" ON suite_permissions
    FOR SELECT
    USING ( auth.uid() = user_id );
