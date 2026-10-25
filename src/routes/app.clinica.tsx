import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/clinica")({
  head: () => ({
    meta: [
      { title: "Clínica Veterinária — PetFlow AI" },
      { name: "description", content: "Pets, prontuários e vacinas da clínica." },
    ],
  }),
  component: ClinicaPage,
});

function ClinicaPage() {
  const { data: company } = useCurrentCompany();
  const companyId = company?.id;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const pets = useQuery({
    queryKey: ["pets", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("pets")
        .select("*, customer:customer_id(name, phone)")
        .eq("company_id", companyId!)
        .order("name");
      return data ?? [];
    },
  });
  const customers = useQuery({
    queryKey: ["customers-min", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from("customer").select("id, name").eq("company_id", companyId!).order("name");
      return data ?? [];
    },
  });
  const records = useQuery({
    queryKey: ["records", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from("medical_records").select("*").eq("pet_id", selected!).order("record_date", { ascending: false });
      return data ?? [];
    },
  });
  const vaccines = useQuery({
    queryKey: ["vaccines", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from("vaccines").select("*").eq("pet_id", selected!).order("next_due_date");
      return data ?? [];
    },
  });

  const [pet, setPet] = useState({ name: "", species: "Cão", breed: "", customer_id: "", birth_date: "" });
  const [rec, setRec] = useState({ vet_name: "", complaint: "", diagnosis: "", treatment: "", weight_kg: "" });
  const [vac, setVac] = useState({ vaccine_name: "", applied_at: "", next_due_date: "" });

  const addPet = async () => {
    if (!companyId || !pet.name) return toast.error("Informe o nome do pet");
    const { error } = await supabase.from("pets").insert({
      company_id: companyId, name: pet.name, species: pet.species, breed: pet.breed || null,
      customer_id: pet.customer_id || null, birth_date: pet.birth_date || null,
    });
    if (error) return toast.error(error.message);
    setPet({ name: "", species: "Cão", breed: "", customer_id: "", birth_date: "" });
    qc.invalidateQueries({ queryKey: ["pets"] });
    toast.success("Pet cadastrado");
  };
  const addRecord = async () => {
    if (!companyId || !selected) return;
    const { error } = await supabase.from("medical_records").insert({
      company_id: companyId, pet_id: selected, vet_name: rec.vet_name || null, complaint: rec.complaint || null,
      diagnosis: rec.diagnosis || null, treatment: rec.treatment || null, weight_kg: rec.weight_kg ? Number(rec.weight_kg) : null,
    });
    if (error) return toast.error(error.message);
    setRec({ vet_name: "", complaint: "", diagnosis: "", treatment: "", weight_kg: "" });
    qc.invalidateQueries({ queryKey: ["records"] });
    toast.success("Atendimento registrado");
  };
  const addVaccine = async () => {
    if (!companyId || !selected || !vac.vaccine_name) return toast.error("Informe a vacina");
    const { error } = await supabase.from("vaccines").insert({
      company_id: companyId, pet_id: selected, vaccine_name: vac.vaccine_name,
      applied_at: vac.applied_at || null, next_due_date: vac.next_due_date || null, due_date: vac.next_due_date || null,
      status: vac.applied_at ? "aplicada" : "pendente",
    });
    if (error) return toast.error(error.message);
    setVac({ vaccine_name: "", applied_at: "", next_due_date: "" });
    qc.invalidateQueries({ queryKey: ["vaccines"] });
    toast.success("Vacina registrada");
  };

  const list = (pets.data ?? []).filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase()));
  const current = (pets.data ?? []).find((p: any) => p.id === selected) as any;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Clínica Veterinária" description="Pets, prontuários e carteira de vacinação" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Novo pet</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Nome" value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Espécie" value={pet.species} onChange={(e) => setPet({ ...pet, species: e.target.value })} />
                <Input placeholder="Raça" value={pet.breed} onChange={(e) => setPet({ ...pet, breed: e.target.value })} />
              </div>
              <select className="w-full h-9 rounded-md border bg-background px-2 text-sm" value={pet.customer_id} onChange={(e) => setPet({ ...pet, customer_id: e.target.value })}>
                <option value="">Tutor (opcional)</option>
                {(customers.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input type="date" value={pet.birth_date} onChange={(e) => setPet({ ...pet, birth_date: e.target.value })} />
              <Button className="w-full" onClick={addPet}>Cadastrar</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 space-y-2">
              <Input placeholder="Buscar pet..." value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="max-h-96 overflow-y-auto space-y-1">
                {list.length === 0 && <p className="text-sm text-muted-foreground p-2">Nenhum pet.</p>}
                {list.map((p: any) => (
                  <button key={p.id} onClick={() => setSelected(p.id)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm border ${selected === p.id ? "bg-accent" : "hover:bg-muted"}`}>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{[p.species, p.breed].filter(Boolean).join(" · ")} {p.customer?.name ? `— ${p.customer.name}` : ""}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {!current ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Selecione um pet para ver o prontuário.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>{current.name} <span className="text-sm font-normal text-muted-foreground">{current.species} {current.breed}</span></CardTitle></CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                <div><Label>Veterinário</Label><Input value={rec.vet_name} onChange={(e) => setRec({ ...rec, vet_name: e.target.value })} /></div>
                <div><Label>Peso (kg)</Label><Input type="number" value={rec.weight_kg} onChange={(e) => setRec({ ...rec, weight_kg: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Queixa</Label><Textarea value={rec.complaint} onChange={(e) => setRec({ ...rec, complaint: e.target.value })} /></div>
                <div><Label>Diagnóstico</Label><Textarea value={rec.diagnosis} onChange={(e) => setRec({ ...rec, diagnosis: e.target.value })} /></div>
                <div><Label>Tratamento</Label><Textarea value={rec.treatment} onChange={(e) => setRec({ ...rec, treatment: e.target.value })} /></div>
                <Button className="md:col-span-2" onClick={addRecord}>Registrar atendimento</Button>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {(records.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem atendimentos.</p>}
                  {(records.data ?? []).map((r) => (
                    <div key={r.id} className="border rounded-md p-2 text-sm">
                      <p className="font-medium">{new Date(r.record_date + "T12:00").toLocaleDateString("pt-BR")} {r.vet_name && `· ${r.vet_name}`}</p>
                      {r.complaint && <p><b>Queixa:</b> {r.complaint}</p>}
                      {r.diagnosis && <p><b>Diagnóstico:</b> {r.diagnosis}</p>}
                      {r.treatment && <p><b>Tratamento:</b> {r.treatment}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Vacinas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Input placeholder="Vacina (ex: V10)" value={vac.vaccine_name} onChange={(e) => setVac({ ...vac, vaccine_name: e.target.value })} />
                  <div className="flex gap-2">
                    <div className="flex-1"><Label className="text-xs">Aplicada em</Label><Input type="date" value={vac.applied_at} onChange={(e) => setVac({ ...vac, applied_at: e.target.value })} /></div>
                    <div className="flex-1"><Label className="text-xs">Próxima dose</Label><Input type="date" value={vac.next_due_date} onChange={(e) => setVac({ ...vac, next_due_date: e.target.value })} /></div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={addVaccine}>Adicionar vacina</Button>
                  {(vaccines.data ?? []).map((v) => {
                    const late = v.next_due_date && v.next_due_date < today;
                    return (
                      <div key={v.id} className="flex items-center justify-between border rounded-md p-2 text-sm">
                        <span>{v.vaccine_name}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {v.next_due_date && new Date(v.next_due_date + "T12:00").toLocaleDateString("pt-BR")}
                          {late && <Badge variant="destructive">Atrasada</Badge>}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
