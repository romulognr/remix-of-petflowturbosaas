import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { sendBrandEmail } from "@/lib/email-client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/equipe")({ component: EquipePage });

function EquipePage() {
  const { data: company } = useCurrentCompany();
  const { user } = useAuth();
  const cid = company?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ email: string; nome: string; role: "admin" | "barbeiro" | "financeiro" | "owner" | "recepcao" }>({
    email: "", nome: "", role: "recepcao",
  });

  const { data = [] } = useQuery({
    queryKey: ["team", cid],
    enabled: !!cid,
    queryFn: async () =>
      (await supabase.from("company_user").select("*").eq("company_id", cid!).order("created_at")).data ?? [],
  });

  const invite = useMutation({
    mutationFn: async () => {
      if (!cid) throw new Error("Sem empresa");
      const token = crypto.randomUUID().replace(/-/g, "");
      const { error } = await supabase.from("company_user").insert({
        company_id: cid,
        email: form.email.toLowerCase().trim(),
        nome: form.nome || null,
        role: form.role,
        ativo: true,
        convite_token: token,
        convite_aceito: false,
        user_id: null as any,
      });
      if (error) throw error;
      return token;
    },
    onSuccess: (token) => {
      qc.invalidateQueries({ queryKey: ["team", cid] });
      setOpen(false);
      const sent = { ...form };
      setForm({ email: "", nome: "", role: "recepcao" });
      const link = `${window.location.origin}/entrar?convite=${token}`;
      toast.success("Convite criado", {
        description: `Link: ${link}`,
        action: { label: "Copiar", onClick: () => navigator.clipboard.writeText(link) },
        duration: 8000,
      });
      void sendBrandEmail({
        tipo: "convite_equipe",
        destinatario_email: sent.email,
        destinatario_nome: sent.nome,
        dados: {
          nome_convidador: (user?.user_metadata as any)?.nome || user?.email || "Equipe",
          nome_barbearia: company?.nome_fantasia || company?.name || "Seu petshop",
          link_convite: link,
          papel: sent.role,
        },
      });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Usuários com acesso ao painel"
        action={
          <Button onClick={() => setOpen(true)} className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90">
            <Plus className="w-4 h-4 mr-1" /> Convidar membro
          </Button>
        }
      />
      <DataTable
        data={data as any[]}
        searchableKeys={["email", "nome"]}
        columns={[
          { key: "nome", header: "Nome", render: (r) => r.nome || "—" },
          { key: "email", header: "Email" },
          { key: "role", header: "Papel", render: (r) => <Badge variant="outline">{r.role}</Badge> },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.convite_aceito || r.user_id
                ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ativo</Badge>
                : <Badge variant="secondary">Pendente</Badge>,
          },
          {
            key: "actions", header: "", className: "text-right",
            render: (r) =>
              r.convite_token && !r.convite_aceito ? (
                <Button size="sm" variant="ghost" onClick={() => {
                  const link = `${window.location.origin}/entrar?convite=${r.convite_token}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Link copiado");
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Link
                </Button>
              ) : null,
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Convidar membro"
        saving={invite.isPending}
        onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}
      >
        <div>
          <Label>Email *</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Nome</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div>
          <Label>Papel</Label>
          <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Dono</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="barbeiro">Tosador / Veterinário</SelectItem>
              <SelectItem value="recepcao">Recepção</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Um link de convite será gerado e simuladamente enviado por email.
        </p>
      </FormDialog>
    </div>
  );
}
