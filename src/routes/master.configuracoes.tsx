import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { sendBrandEmail } from "@/lib/email-client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/master/configuracoes")({ component: ConfigPage });

function ConfigPage() {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copiado"); };

  const sendTest = async () => {
    if (!testEmail.includes("@")) return toast.error("Email inválido");
    setSending(true);
    const ok = await sendBrandEmail({
      tipo: "credenciais_admin",
      destinatario_email: testEmail,
      destinatario_nome: "Teste",
      dados: {
        email_login: testEmail,
        senha_temporaria: "exemplo-1234",
        link_painel: `${window.location.origin}/app/dashboard`,
        link_agendamento: `${window.location.origin}/agendar/exemplo`,
        nome_barbearia: "Petshop Exemplo",
      },
    });
    if (ok) toast.success("Email de teste enviado!");
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Integrações e infraestrutura da plataforma" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" style={{ color: "#1B3A4B" }} />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-4">
            <p className="font-semibold mb-1">Envio de email em modo stub</p>
            <p className="text-xs leading-relaxed">
              A função <code>enviar-email</code> está ativa, mas <b>não envia emails reais</b> — ela apenas
              registra o payload no console e responde sucesso, para que o fluxo do app (criação de petshop,
              convites, confirmações de agendamento) continue funcionando sem nenhuma integração externa.
            </p>
            <p className="text-xs mt-2 leading-relaxed">
              Para habilitar envios reais, edite{" "}
              <code>supabase/functions/enviar-email/index.ts</code> e conecte o provedor de sua preferência
              (Resend, SendGrid, AWS SES, Mailgun, etc.). Há um comentário <code>TODO</code> no topo do arquivo
              indicando exatamente onde plugar.
            </p>
          </div>

          <div className="border-t pt-5">
            <Label>Testar a função (modo stub)</Label>
            <div className="flex gap-2 mt-1.5 max-w-md">
              <Input
                type="email"
                placeholder="voce@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button onClick={sendTest} disabled={sending} className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white">
                {sending ? "Enviando…" : "Disparar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum email será entregue. A chamada apenas valida que a função responde 200 e loga o payload.
            </p>
            <Button variant="ghost" size="sm" className="mt-2 h-7" onClick={() => copy("supabase/functions/enviar-email/index.ts")}>
              <Copy className="w-3 h-3 mr-1" /> Copiar caminho da função
            </Button>
            <a
              href="https://resend.com/signup"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline"
            >
              Resend (sugestão) <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
