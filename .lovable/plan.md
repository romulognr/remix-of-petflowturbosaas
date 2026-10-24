# Plano: BarbeiroPro AI — SaaS multi-tenant completo

Esse é um escopo muito grande (4 tiers de acesso, ~25 rotas, billing simulado, onboarding multi-step, booking público, super admin, demo mode, AI Growth). Vou entregar em **fases sequenciais**, validando cada uma antes de seguir. Se tentar tudo de uma vez em um único turno, vou produzir código de baixa qualidade e cheio de bugs.

## Decisões de arquitetura

- **Reset do schema atual**: o banco já tem `company`, `customer`, `service`, etc. Vou criar uma migration que dropa tudo e recria do zero conforme `MIGRATION.md` do repo + extras (`app_config`, `company_user`, billing fields, `onboarding_step`, `trial_ate`, `status_cobranca`).
- **Repo de referência**: vou ler `github.com/luisbedinot/barbeiropro-ai` (MIGRATION.md, páginas, layouts) antes de cada fase para fidelidade ao spec.
- **Layouts pathless**: `_master.tsx` (sidebar vermelha), `_app.tsx` (tenant), `_demo.tsx` (banner). Públicas no root.
- **Guards**: `SuperAdminGuard` (checa email em `app_config.super_admin_emails` via RPC), `TenantGuard` (checa `company_user` + status_cobranca).
- **Helpers SQL**: `is_super_admin()`, `current_company_id()`, `has_company_access(uuid)`.
- **Demo seed em memória**: `src/lib/demo-seed.ts`, não toca banco.
- **Billing simulado**: cron não, só campos `trial_ate`, `status_cobranca`, `proximo_vencimento`, `valor_mensal`, `ciclo`. Faturas geradas no client a partir de `created_at` + ciclo.

## Fases

### Fase 1 — Schema + RLS + design tokens (este turno)
1. Migration: drop tabelas atuais, criar schema completo (`app_config`, `company` com billing fields, `company_user`, `user_roles`, `service_category`, `service`, `professional`, `professional_service`, `customer`, `appointment`, `financial_entry`, `invoice_simulated`).
2. Enums: `plano`, `status_cobranca`, `appointment_status`, `appointment_source`, `financial_type`, `app_role`, `tenant_role`.
3. Funções SECURITY DEFINER + RLS strict em todas as tabelas.
4. Seed `app_config` com `luis.bedinot@gmail.com`.
5. Tokens em `src/styles.css`: `--brand`, `--brand-master`, `--surface`, `--sidebar-bg`.
6. Stub providers (`__root.tsx` com QueryClient + Auth + Toaster) — reusar o que já existe.

### Fase 2 — Auth + Landing + rotas públicas
- `/` LandingPage (hero, features, pricing 3 planos, footer)
- `/entrar` (Tabs sign-in/sign-up; após criar conta → cria company stub + redireciona `/app/onboarding`)
- `/esqueci-senha`, `/reset-senha`, `/trocar-senha`
- `/agendar/:slug` booking público (lê company por slug, mostra serviços/profissionais, cria appointment via server fn admin-elevada)

### Fase 3 — Tenant `/app/*`
- `_app.tsx` layout com sidebar `#111318`, TrialBanner, guards
- `/app/onboarding` multi-step (5 passos)
- `/app/dashboard` KPIs + chart
- `/app/agenda` calendário semanal
- `/app/clientes`, `/app/servicos` (com categorias), `/app/profissionais` (comissão), `/app/financeiro`, `/app/equipe`
- `/app/relatorios` (recharts)
- `/app/aigrowth` (shell mockado com chat estático)
- `/app/configuracoes` (Tabs: Barbearia | Equipe | Aparência | Cobrança)

### Fase 4 — Master `/master/*`
- `_master.tsx` sidebar vermelha + `SuperAdminGuard`
- `/master/painel` (MRR, novos, churn, ativas)
- `/master/listaBarbearias` (DataTable com filtros + ações)
- `/master/novaBarbearia` (form + cria company + envia credenciais simuladas)

### Fase 5 — Demo `/demo/*`
- `_demo.tsx` com banner CTA
- Reusa páginas tenant trocando data source para seed estático
- Botões mutáveis → tooltip + modal CTA

## Componentes compartilhados (Fase 1-2)
`<PageHeader>`, `<DataTable>` (busca + filtro + paginação client-side), `<FormDialog>`, `<KpiCard>`, `<TrialBanner>`, `<SuperAdminGuard>`, `<TenantGuard>`, `<SidebarMaster/Tenant/Demo>`.

## O que NÃO vou fazer
- Pagamento real (Stripe/Paddle) — apenas simulado conforme spec
- Edge functions / Edge cron — billing manual via UI
- Envio real de email — apenas toast simulado
- Realtime — só react-query refetch

## Pergunta antes de começar
Confirma que posso:
1. **Dropar todo o schema atual** (perderá os testes que você fez antes)?
2. Entregar **fase por fase** (cada turno = 1 fase, ~5 turnos no total)? Ou prefere que eu tente comprimir em menos turnos aceitando menos polish?
3. O repo `github.com/luisbedinot/barbeiropro-ai` está público para eu conseguir ler MIGRATION.md e as páginas?
