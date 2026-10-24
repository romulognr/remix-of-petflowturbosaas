import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck, PawPrint, Users, DollarSign, Sparkles, Check, ArrowRight,
  UserCog, Globe, BarChart3, Brain, Store, Stethoscope, Syringe, Bath, Hotel,
  Notebook, UserX, Percent, LineChart, CalendarX, MessageSquareWarning,
  Zap, Star, Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PetFlow AI — Sistema completo para petshops" },
      { name: "description", content: "Agenda online de banho, tosa, veterinário e vacinas. Comissões automáticas, financeiro e IA pra fidelizar tutores. 14 dias grátis." },
      { property: "og:title", content: "PetFlow AI — Sistema para petshops" },
      { property: "og:description", content: "Agenda online, comissões, financeiro e AI Growth para petshops modernos." },
    ],
  }),
  component: LandingPage,
});

const BRAND = "#0D9488";
const ACCENT = "#F59E0B";

const MODULES = [
  { icon: CalendarCheck, title: "Agenda online", desc: "Calendário semanal visual com banhos, tosas, vacinas e consultas coloridos por profissional. Reagende com drag-and-drop." },
  { icon: UserCog, title: "Equipe pet", desc: "Cadastre tosadores, banhistas e veterinários com foto, especialidade e horários — cada um com sua agenda." },
  { icon: Percent, title: "Comissões automáticas", desc: "Comissão fixa ou percentual por serviço. Calcule tudo no fim do mês sem planilha." },
  { icon: Users, title: "Tutores & pets", desc: "Cadastro de tutores com fichas dos pets, histórico de banhos, vacinas e consultas." },
  { icon: Store, title: "Vitrine de serviços", desc: "Catálogo de banho, tosa, estética, vacinas e creche organizado por categoria." },
  { icon: DollarSign, title: "Financeiro integrado", desc: "Entradas e saídas conectadas aos atendimentos. Faturamento em tempo real." },
  { icon: BarChart3, title: "Relatórios", desc: "Faturamento, ocupação, ticket médio, ranking de profissionais e serviços." },
  { icon: Brain, title: "AI Growth", desc: "IA detecta banho mensal vencido, vacina vencendo, horário ocioso e serviços com baixa procura." },
  { icon: Globe, title: "Booking público", desc: "Link único do petshop. Tutor agenda 24/7 sem precisar baixar nada." },
];

const PAINS = [
  { icon: Notebook, title: "Agenda em caderninho", desc: "Tutor liga e você não acha o horário. Banho marcado em rabisco que ninguém entende." },
  { icon: UserX, title: "Tutor que não volta", desc: "Sem histórico, você esquece de chamar quem sumiu — e o banho mensal vira trimestral." },
  { icon: Percent, title: "Comissão confusa", desc: "Fim de mês vira planilha cheia de erro pra calcular o que pagar pra cada tosador e veterinário." },
  { icon: LineChart, title: "Sem dados de desempenho", desc: "Você não sabe qual serviço dá mais lucro nem qual profissional fatura mais." },
  { icon: CalendarX, title: "Sem agendamento online", desc: "Tutor quer marcar de noite, você só atende de dia. Perde a venda do banho de sábado." },
  { icon: MessageSquareWarning, title: "WhatsApp lotado", desc: "Tutor confirmando, perguntando preço de tosa, marcando vacina — tudo manual." },
];

const STATS = [
  { value: "1.800+", label: "Petshops ativos" },
  { value: "140k+", label: "Agendamentos/mês" },
  { value: "97%", label: "Taxa de retenção" },
  { value: "4.9★", label: "Avaliação média" },
];

const STEPS = [
  { n: "01", title: "Cadastre seu petshop", desc: "Configure nome, logo, serviços e equipe em minutos." },
  { n: "02", title: "Personalize seu link", desc: "Seu link público em /agendar/seupetshop para divulgar." },
  { n: "03", title: "Tutores agendam online", desc: "Sem ligação, sem app. Tutor acessa, escolhe e agenda." },
  { n: "04", title: "Gerencie e cresça", desc: "Painel completo com IA orientando próximos passos." },
];

const TURBO_STEPS = [
  "Você recebe pronto, código completo",
  "Clona o template com 1 clique",
  "Personaliza marca, cores e textos",
  "Vende para petshops da sua região",
];

const TURBO_FEATURES = [
  "Sistema multi-empresa",
  "Modo demo completo",
  "Booking público whitelabel",
  "AI Growth nativa",
  "Landing page pública",
  "Código aberto e auditável",
  "Infraestrutura já configurada",
];

const AI_CHECKS = [
  "Banho mensal vencido detectado automaticamente",
  "Alerta de vacina vencendo nos próximos 15 dias",
  "Análise de horários ociosos",
  "Insights de serviços com baixa procura (ex.: tosa)",
];

const SERVICE_HIGHLIGHTS = [
  { icon: Bath, title: "Banho & Tosa", desc: "Higiene, tosa na tesoura e estética." },
  { icon: Stethoscope, title: "Veterinário", desc: "Consultas clínicas e check-ups." },
  { icon: Syringe, title: "Vacinas", desc: "Calendário vacinal sob controle." },
  { icon: Hotel, title: "Creche & Hotel", desc: "Day care e hospedagem com recreação." },
];

const PLANS = [
  { name: "Starter", price: 97, sub: "Para petshops que estão começando", features: ["Até 2 profissionais", "Agenda online", "Link público", "Cadastro de tutores e pets", "Financeiro básico"] },
  { name: "Pro", price: 197, highlight: true, sub: "Para petshops em crescimento", features: ["Até 8 profissionais", "Tudo do Starter", "AI Growth Engine", "Relatórios avançados", "Suporte prioritário"] },
  { name: "Enterprise", price: 397, sub: "Para redes e clínicas premium", features: ["Profissionais ilimitados", "Tudo do Pro", "White-label total", "Multi-unidade", "Onboarding dedicado"] },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#0F1E1C]">
      <header className="border-b border-black/5 bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND }}>
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold tracking-tight">PetFlow AI</div>
              <div className="text-[10px] text-black/50">a agenda que cuida do seu petshop</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/demo/dashboard"><Button variant="ghost" size="sm">Ver demo</Button></Link>
            <Link to="/entrar"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button size="sm" className="text-white" style={{ backgroundColor: BRAND }}>Começar grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ backgroundColor: BRAND + "1A", color: BRAND }}>
          <Sparkles className="w-3 h-3" /> 14 dias grátis, sem cartão de crédito
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight" style={{ color: BRAND }}>
          A agenda que cuida do seu petshop.
        </h1>
        <p className="mt-6 text-lg text-black/60 max-w-2xl mx-auto">
          Banho, tosa, vacina e veterinário — tudo num só sistema. Comissões automáticas, ficha completa do pet e IA que te avisa quando algo dá pra melhorar.
        </p>
        <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
          <Link to="/entrar" search={{ tab: "signup" }}>
            <Button size="lg" className="text-white" style={{ backgroundColor: BRAND }}>
              Criar meu petshop <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/demo/dashboard">
            <Button size="lg" variant="outline">Explorar a demo</Button>
          </Link>
          <a href="/agendar/amigo-fiel" target="_blank" rel="noreferrer">
            <Button size="lg" className="text-white" style={{ backgroundColor: ACCENT }}>Agendar como tutor →</Button>
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {SERVICE_HIGHLIGHTS.map((s) => (
            <div key={s.title} className="p-4 rounded-xl bg-white border border-black/5 text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: BRAND + "1A" }}>
                <s.icon className="w-4 h-4" style={{ color: BRAND }} />
              </div>
              <div className="font-semibold text-sm">{s.title}</div>
              <div className="text-xs text-black/55 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-16 px-6" style={{ backgroundColor: BRAND }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-black text-white">{s.value}</div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="bg-white border-y border-black/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: BRAND }}>Você se reconhece nisso?</h2>
            <p className="text-black/60 mt-2">Os 6 problemas mais comuns que a gente resolve.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PAINS.map((p) => (
              <div key={p.title} className="p-5 rounded-xl border border-black/5 bg-[#F8FAF9]">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                  <p.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-black/60 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: BRAND }}>9 módulos. Um sistema.</h2>
          <p className="text-black/60 mt-2">Tudo o que o seu petshop precisa, integrado de verdade.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <div key={m.title} className="p-6 rounded-xl bg-white border border-black/5 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: BRAND + "1A" }}>
                <m.icon className="w-5 h-5" style={{ color: BRAND }} />
              </div>
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-sm text-black/60 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-black/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: BRAND }}>Como funciona</h2>
            <p className="text-black/60 mt-2">Em minutos seu petshop está operando.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black" style={{ backgroundColor: BRAND }}>
                  {s.n}
                </div>
                <h3 className="font-bold mt-4">{s.title}</h3>
                <p className="text-sm text-black/60 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI GROWTH SECTION */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F8FAF9" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: ACCENT + "26", color: "#92400E" }}>
              <Zap className="w-3 h-3" /> AI GROWTH ENGINE
            </div>
            <h2 className="text-4xl font-black leading-tight" style={{ color: BRAND }}>
              IA que trabalha enquanto você dá banho.
            </h2>
            <p className="mt-4 text-black/60">
              Enquanto você cuida do pet na bancada, nossa IA analisa seus dados e te avisa exatamente onde tem receita escondida.
            </p>
            <ul className="mt-6 space-y-3">
              {AI_CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <Check className="w-5 h-5" style={{ color: BRAND }} /> <span>{c}</span>
                </li>
              ))}
            </ul>
            <Link to="/demo/aigrowth">
              <Button size="lg" className="mt-8 text-white" style={{ backgroundColor: BRAND }}>
                Ver AI Growth na Demo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Bath className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm">12 pets com banho mensal vencido</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold shrink-0">Reativar</span>
                </div>
                <p className="text-xs text-black/60 mt-1">Tutores recorrentes que passaram do prazo. Mensagem pronta para disparar.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm">Segunda-feira às 14h está vazia</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold shrink-0">Oportunidade</span>
                </div>
                <p className="text-xs text-black/60 mt-1">Horário com 0 banhos nas últimas 4 semanas.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm">9 vacinas vencendo em 15 dias</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold shrink-0">Vacina</span>
                </div>
                <p className="text-xs text-black/60 mt-1">Lembrete automático aumenta retorno em ~40%.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: BRAND }}>Planos simples e claros</h2>
            <p className="text-black/60 mt-2">Comece grátis. Cresça com o plano certo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {PLANS.map((p) => {
              const highlighted = p.highlight;
              return (
                <div
                  key={p.name}
                  className={`p-6 rounded-2xl border ${highlighted ? "text-white" : "bg-[#F8FAF9] border-black/5"}`}
                  style={highlighted ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
                >
                  {highlighted && <div className="text-xs font-bold mb-2" style={{ color: ACCENT }}>MAIS POPULAR</div>}
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className={`text-sm mt-1 ${highlighted ? "text-white/70" : "text-black/60"}`}>{p.sub}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black">R${p.price}</span>
                    <span className={highlighted ? "text-white/70" : "text-black/60"}>/mês</span>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlighted ? "text-white" : "text-emerald-600"}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/entrar" search={{ tab: "signup" }}>
                    <Button
                      className={`w-full mt-6 ${highlighted ? "bg-white hover:bg-white/90" : "text-white"}`}
                      style={highlighted ? { color: BRAND } : { backgroundColor: BRAND }}
                    >
                      Começar agora
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: BRAND }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Pronto para transformar seu petshop?
          </h2>
          <p className="text-white/80 mt-4 text-lg">
            Explore a demo completa, sem cadastro.
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
            <Link to="/demo/dashboard">
              <Button size="lg" className="bg-white hover:bg-white/90" style={{ color: BRAND }}>
                Ver Demo Gratuita <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="/agendar/amigo-fiel" target="_blank" rel="noreferrer">
              <Button size="lg" className="text-white border-0" style={{ backgroundColor: ACCENT }}>
                Agendar como tutor →
              </Button>
            </a>
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6" style={{ backgroundColor: "#0B1F1D" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND }}>
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold">PetFlow AI</div>
              <div className="text-[11px] text-white/40">a agenda que cuida do seu petshop</div>
            </div>
          </div>
          <div className="text-sm text-white/40">© {new Date().getFullYear()} PetFlow AI. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
