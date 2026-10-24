// Edge Function: enviar-email
// ============================================================================
// STUB — não envia email real.
//
// TODO: aluno que clonar este projeto deve conectar sua própria conta de email
// (Resend, SendGrid, AWS SES, etc.) aqui. Hoje a função apenas registra o
// payload no console e responde { ok: true } para o fluxo do app continuar
// funcionando sem nenhuma dependência externa.
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  tipo: "credenciais_admin" | "convite_equipe" | "confirmacao_agendamento";
  destinatario_email: string;
  destinatario_nome?: string;
  dados: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Payload | null = null;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // STUB: apenas registra o que seria enviado.
  console.log("[enviar-email][STUB] payload =", JSON.stringify(payload));

  return new Response(
    JSON.stringify({
      ok: true,
      stub: true,
      message:
        "Email não foi enviado (stub). Conecte um provedor de email para habilitar envios reais.",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
