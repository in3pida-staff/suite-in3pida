// ════════════════════════════════════════════════════════════════════════
//  suite-admin-users — Edge Function
//
//  Espone la lista degli account Supabase Auth (id, email, ultimo accesso)
//  SOLO a mario@in3pida.it. È in SOLA LETTURA: non crea, non modifica e non
//  elimina alcun account. La suite la usa per la sezione "Gestione utenti".
//
//  Deploy:  supabase functions deploy suite-admin-users
//  (Le variabili SUPABASE_URL / SERVICE_ROLE / ANON sono già nell'ambiente.)
// ════════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!;
const ADMIN_EMAIL      = 'mario@in3pida.it';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  // 1) chi sta chiamando?
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: authErr } = await anon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 401, headers: cors });
  }

  // 2) DEVE essere l'admin — altrimenti niente
  if ((user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: 'Accesso riservato all\'amministratore' }), { status: 403, headers: cors });
  }

  // 3) solo lettura della lista utenti
  if (req.method === 'GET') {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    const slim = users.map(u => ({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at }));
    return new Response(JSON.stringify(slim), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Metodo non supportato' }), { status: 405, headers: cors });
});
