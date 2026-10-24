import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { format, subDays, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/format";
import { TrendingUp, TrendingDown, Percent, Receipt } from "lucide-react";

export const Route = createFileRoute("/app/relatorios")({ component: RelPage });

const COLORS = ["#1B3A4B", "#3b6fa0", "#5cbdb9", "#c9a84c", "#e85d3a", "#7c3aed"];

function RelPage() {
  const { data: company } = useCurrentCompany();
  const cid = company?.id;
  const { data } = useQuery({
    queryKey: ["reports", cid],
    enabled: !!cid,
    queryFn: async () => {
      const now = new Date();
      const since = subMonths(startOfMonth(now), 5);
      const [aptsRes, finRes] = await Promise.all([
        supabase.from("appointment")
          .select("scheduled_at, service_name, price, professional_name, status")
          .eq("company_id", cid!).gte("scheduled_at", since.toISOString()),
        supabase.from("financial_entry").select("type, amount, date")
          .eq("company_id", cid!).gte("date", format(since, "yyyy-MM-dd")),
      ]);
      const apts = aptsRes.data ?? [];
      const fin = finRes.data ?? [];

      // Faturamento por mês (últimos 6)
      const months = eachMonthOfInterval({ start: since, end: now });
      const byMonth = months.map((m) => {
        const k = format(m, "yyyy-MM");
        const revenue = fin
          .filter((f: any) => f.type === "entrada" && f.date.startsWith(k))
          .reduce((s: number, f: any) => s + Number(f.amount), 0);
        const expense = fin
          .filter((f: any) => f.type === "saida" && f.date.startsWith(k))
          .reduce((s: number, f: any) => s + Number(f.amount), 0);
        return { month: format(m, "MMM/yy", { locale: ptBR }), revenue, expense };
      });

      // Top serviços (últimos 30d)
      const cutoff30 = subDays(now, 30);
      const recent = apts.filter((a: any) => new Date(a.scheduled_at) >= cutoff30);
      const svcMap = new Map<string, number>();
      recent.forEach((a: any) => svcMap.set(a.service_name ?? "—", (svcMap.get(a.service_name ?? "—") ?? 0) + 1));
      const byService = Array.from(svcMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value).slice(0, 6);

      // Top profissionais por faturamento
      const proMap = new Map<string, number>();
      recent.filter((a: any) => a.status === "concluido").forEach((a: any) => {
        const k = a.professional_name ?? "—";
        proMap.set(k, (proMap.get(k) ?? 0) + Number(a.price ?? 0));
      });
      const byProfessional = Array.from(proMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value).slice(0, 6);

      // No-show / cancel rate por mês
      const noShowByMonth = months.map((m) => {
        const k = format(m, "yyyy-MM");
        const ms = apts.filter((a: any) => a.scheduled_at.startsWith(k));
        const total = ms.length;
        const cancel = ms.filter((a: any) => a.status === "cancelado").length;
        return { month: format(m, "MMM/yy", { locale: ptBR }), rate: total ? Math.round((cancel / total) * 100) : 0 };
      });

      const totalRevenue30 = recent.filter((a: any) => a.status === "concluido")
        .reduce((s: number, a: any) => s + Number(a.price ?? 0), 0);
      const totalAttended = recent.filter((a: any) => a.status === "concluido").length;
      const totalCancel = recent.filter((a: any) => a.status === "cancelado").length;
      const noShowRate = recent.length ? totalCancel / recent.length : 0;

      return { byMonth, byService, byProfessional, noShowByMonth, totalRevenue30, totalAttended, totalCancel, noShowRate };
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Últimos 6 meses + janela de 30 dias" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard variant="cinematic" tone="emerald" label="Faturamento 30d" value={formatBRL(data?.totalRevenue30)} icon={TrendingUp} />
        <KpiCard variant="cinematic" tone="brand" label="Atendimentos 30d" value={String(data?.totalAttended ?? 0)} icon={Receipt} />
        <KpiCard variant="cinematic" tone="gold" label="Cancelamentos 30d" value={String(data?.totalCancel ?? 0)} icon={TrendingDown} />
        <KpiCard variant="cinematic" tone="rose" label="Taxa no-show" value={`${Math.round((data?.noShowRate ?? 0) * 100)}%`} icon={Percent} delta={{ value: -1.4, positiveIsGood: false }} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Faturamento por mês</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data?.byMonth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Receita" fill="#1B3A4B" />
                  <Bar dataKey="expense" name="Despesa" fill="#e85d3a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top serviços (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data?.byService ?? []} dataKey="value" nameKey="name" outerRadius={90} label>
                    {(data?.byService ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Faturamento por profissional (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data?.byProfessional ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                  <Bar dataKey="value" fill="#1B3A4B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Taxa de no-show por mês</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={data?.noShowByMonth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#e85d3a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
