// Edge Function: resetar-senha-admin
// Gera nova senha temporária para o admin (owner) de uma barbearia.
// Apenas super_admin pode chamar (validado via JWT + rpc is_super_admin).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[bytes[i] % chars.length];
  return out;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Não autenticado" }, 401);

    // valida JWT + is_super_admin via cliente do usuário
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sessão inválida" }, 401);

    const { data: isAdmin, error: rpcErr } = await userClient.rpc("is_super_admin");
    if (rpcErr) return json({ error: rpcErr.message }, 500);
    if (!isAdmin) return json({ error: "Apenas super admin pode resetar senhas" }, 403);

    const body = await req.json().catch(() => ({}));
    const company_id = body?.company_id as string | undefined;
    if (!company_id) return json({ error: "company_id é obrigatório" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // localiza owner ativo da barbearia
    const { data: owner, error: ownerErr } = await admin
      .from("company_user")
      .select("id, user_id, email")
      .eq("company_id", company_id)
      .eq("role", "owner")
      .eq("ativo", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (ownerErr) return json({ error: ownerErr.message }, 500);
    if (!owner || !owner.user_id) return json({ error: "Owner não encontrado para esta barbearia" }, 404);

    const tempPassword = generateTempPassword();

    const { error: upErr } = await admin.auth.admin.updateUserById(owner.user_id, {
      password: tempPassword,
    });
    if (upErr) return json({ error: upErr.message }, 500);

    const { error: flagErr } = await admin
      .from("company_user")
      .update({ forcar_troca_senha: true })
      .eq("id", owner.id);
    if (flagErr) return json({ error: flagErr.message }, 500);

    return json({ admin_email: owner.email, senha_temporaria: tempPassword });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
