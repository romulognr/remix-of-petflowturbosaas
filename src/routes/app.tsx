import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarTenant } from "@/components/sidebar-tenant";
import { TrialBanner } from "@/components/trial-banner";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/entrar", search: { tab: "signin" } as any });
    }
    // Forçar troca de senha no primeiro acesso
    const { data: cu } = await supabase
      .from("company_user")
      .select("forcar_troca_senha")
      .eq("user_id", data.user.id)
      .eq("ativo", true)
      .limit(1)
      .maybeSingle();
    if (cu?.forcar_troca_senha) {
      throw redirect({ to: "/trocar-senha" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { data: company, isLoading } = useCurrentCompany();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (isLoading) return;
    if (!company && !pathname.endsWith("/onboarding")) {
      navigate({ to: "/app/onboarding" });
      return;
    }
    if (company && !company.onboarding_concluido && !pathname.endsWith("/onboarding")) {
      navigate({ to: "/app/onboarding" });
    }
  }, [company, isLoading, navigate, pathname]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const suspended = company?.status_cobranca === "suspenso";
  const allowedWhenSuspended = pathname.endsWith("/configuracoes") || pathname.endsWith("/onboarding");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--surface)" }}>
      <SidebarTenant companyName={company?.nome_fantasia || company?.name} />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner company={company} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {suspended && !allowedWhenSuspended ? <SuspendedView /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function SuspendedView() {
  return (
    <Card className="max-w-lg mx-auto mt-12">
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <Ban className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold">Acesso temporariamente bloqueado</h2>
        <p className="text-sm text-muted-foreground">
          Sua assinatura foi suspensa por inadimplência. Regularize a cobrança para liberar o painel novamente.
        </p>
        <Link to="/app/configuracoes">
          <Button className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90">
            Ir para Cobrança
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
