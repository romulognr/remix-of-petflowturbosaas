import { addDays, subDays, format } from "date-fns";

const today = new Date();
const iso = (d: Date) => d.toISOString();
const ymd = (d: Date) => format(d, "yyyy-MM-dd");

export const demoCompany = {
  id: "demo-company",
  name: "Petshop Amigo Fiel",
  nome_fantasia: "Petshop Amigo Fiel",
  razao_social: "Amigo Fiel Pet & Veterinária LTDA",
  slug: "amigo-fiel",
  cnpj: "12.345.678/0001-90",
  telefone_comercial: "(11) 4002-8922",
  whatsapp: "(11) 99876-5432",
  email_contato: "contato@amigofielpet.com.br",
  primary_color: "#0D9488",
  logo_url: "",
  plano: "profissional",
  status_cobranca: "ativo",
  ciclo: "mensal",
  valor_mensal: 197,
  trial_ate: ymd(addDays(today, 9)),
  endereco: { rua: "Rua das Acácias, 250", bairro: "Vila Madalena", cidade: "São Paulo", estado: "SP", cep: "05435-001" },
  business_hours: {
    seg: { open: "08:00", close: "19:00" }, ter: { open: "08:00", close: "19:00" },
    qua: { open: "08:00", close: "19:00" }, qui: { open: "08:00", close: "20:00" },
    sex: { open: "08:00", close: "20:00" }, sab: { open: "08:00", close: "17:00" }, dom: null,
  },
};

export const demoCategories = [
  { id: "cat1", name: "Banho & Tosa", sort_order: 1 },
  { id: "cat2", name: "Veterinário", sort_order: 2 },
  { id: "cat3", name: "Estética", sort_order: 3 },
  { id: "cat4", name: "Creche & Hotel", sort_order: 4 },
];

export const demoServices = [
  { id: "s1", category_id: "cat1", name: "Banho Pequeno Porte", description: "Banho com shampoo neutro + secagem", price: 60, duration_minutes: 45, featured: true },
  { id: "s2", category_id: "cat1", name: "Banho Médio Porte", description: "Banho completo + perfume hipoalergênico", price: 85, duration_minutes: 60, featured: false },
  { id: "s3", category_id: "cat1", name: "Tosa Higiênica", description: "Patas, focinho e regiões íntimas", price: 50, duration_minutes: 30, featured: false },
  { id: "s4", category_id: "cat1", name: "Tosa na Tesoura", description: "Tosa artesanal para raças específicas", price: 120, duration_minutes: 90, featured: true },
  { id: "s5", category_id: "cat1", name: "Banho & Tosa Combo", description: "Banho + tosa completa + perfume", price: 150, duration_minutes: 120, featured: true },
  { id: "s6", category_id: "cat2", name: "Consulta Veterinária", description: "Avaliação clínica geral com veterinário", price: 180, duration_minutes: 40, featured: true },
  { id: "s7", category_id: "cat2", name: "Vacina V10/V8", description: "Vacina polivalente para cães", price: 130, duration_minutes: 20, featured: true },
  { id: "s8", category_id: "cat2", name: "Vacina Antirrábica", description: "Imunização anual obrigatória", price: 90, duration_minutes: 15, featured: false },
  { id: "s9", category_id: "cat2", name: "Vermifugação", description: "Avaliação e aplicação do vermífugo", price: 70, duration_minutes: 15, featured: false },
  { id: "s10", category_id: "cat3", name: "Hidratação de Pelos", description: "Tratamento profundo para pelagem", price: 75, duration_minutes: 40, featured: false },
  { id: "s11", category_id: "cat3", name: "Corte de Unhas", description: "Corte e lixamento de unhas", price: 35, duration_minutes: 15, featured: false },
  { id: "s12", category_id: "cat4", name: "Day Care (Creche)", description: "Hospedagem diurna com recreação", price: 110, duration_minutes: 480, featured: false },
];

export const demoProfessionals = [
  { id: "p1", name: "Dra. Patrícia Lima", specialty: "Veterinária — clínica geral e vacinas", commission_type: "percent", commission_value: 50, photo_url: "", service_ids: ["s6","s7","s8","s9"], faturamento_mes: 8950 },
  { id: "p2", name: "Dr. Marcelo Andrade", specialty: "Veterinário — dermatologia e check-up", commission_type: "percent", commission_value: 50, photo_url: "", service_ids: ["s6","s7","s8","s9"], faturamento_mes: 7320 },
  { id: "p3", name: "Jéssica Tosadora", specialty: "Tosa na tesoura — raças longas", commission_type: "percent", commission_value: 45, photo_url: "", service_ids: ["s1","s2","s3","s4","s5","s10","s11"], faturamento_mes: 6810 },
  { id: "p4", name: "Rafael Banhista", specialty: "Banho & tosa higiênica", commission_type: "fixed", commission_value: 25, photo_url: "", service_ids: ["s1","s2","s3","s11"], faturamento_mes: 4280 },
  { id: "p5", name: "Camila Estética Pet", specialty: "Estética e hidratação", commission_type: "percent", commission_value: 50, photo_url: "", service_ids: ["s4","s5","s10","s11"], faturamento_mes: 5100 },
];

const tutors = [
  ["Mariana Costa", "Thor", "Golden Retriever"],
  ["João Pereira", "Bella", "Yorkshire"],
  ["Lucas Almeida", "Mel", "Shih Tzu"],
  ["Carolina Souza", "Luna", "Poodle Toy"],
  ["Felipe Rocha", "Rex", "Labrador"],
  ["Gabriela Martins", "Nina", "Maltês"],
  ["Thiago Ribeiro", "Pipoca", "SRD"],
  ["Patrícia Nunes", "Bento", "Bulldog Francês"],
  ["Vinicius Dias", "Mimi", "Persa"],
  ["Eduarda Pinto", "Theo", "Lhasa Apso"],
  ["Marcos Vieira", "Amora", "Schnauzer"],
  ["Andréa Oliveira", "Chico", "Pug"],
  ["Diego Carvalho", "Lola", "Beagle"],
  ["Renata Barros", "Tobias", "Border Collie"],
  ["Caio Mendes", "Princesa", "Spitz Alemão"],
  ["Igor Fernandes", "Max", "Pinscher"],
  ["Heloísa Cardoso", "Cacau", "Dachshund"],
  ["Daniel Ramos", "Frida", "Boxer"],
  ["Leandra Faria", "Bidu", "SRD"],
  ["Otávio Teixeira", "Sushi", "Shiba Inu"],
  ["Roberta Castro", "Pretinha", "SRD"],
  ["Wesley Antunes", "Apollo", "Pastor Alemão"],
  ["Samuel Moura", "Donna", "Cocker"],
  ["Juliana Macedo", "Pingo", "Poodle Toy"],
  ["Roberto Pires", "Nala", "Siamês"],
  ["Fernanda Lopes", "Simba", "Maine Coon"],
  ["Murilo Tavares", "Luke", "Husky Siberiano"],
  ["Anderson Brito", "Brisa", "Lhasa Apso"],
  ["Ricardo Sales", "Madonna", "Pinscher"],
  ["Vitória Hugo", "Estrela", "Yorkshire"],
  ["Mateus Ferraz", "Floquinho", "Bichon Frisé"],
  ["Davi Cunha", "Chaplin", "Pug"],
  ["Henrique Borba", "Toddy", "SRD"],
  ["Joana Reis", "Maya", "Pinscher"],
  ["Sérgia Andrade", "Romeu", "Labrador"],
];

export const demoCustomers = tutors.map(([name, pet, breed], i) => {
  const tags: string[] = [];
  if (i % 6 === 0) tags.push("vip");
  if (i % 3 === 0) tags.push("recorrente");
  if (i > 28) tags.push("novo");
  if (i % 9 === 0) tags.push("alto_valor");
  const lastDays = i % 5 === 0 ? 65 + (i % 30) : (i % 20);
  const total = 1 + ((i * 3) % 22);
  return {
    id: `c${i + 1}`,
    name,
    phone: `(11) 9${String(1000 + i).padStart(4, "0")}-${String(2000 + i).padStart(4, "0")}`,
    email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, ".")}@email.com`,
    notes: `Pet: ${pet} · ${breed}${i % 7 === 0 ? " · alérgico a shampoo perfumado" : ""}`,
    tags,
    total_appointments: total,
    last_appointment_at: iso(subDays(today, lastDays)),
    ticket_medio: 55 + (i * 7) % 60,
    total_gasto: total * (55 + (i * 7) % 60),
    favorite_service: demoServices[i % demoServices.length].name,
    favorite_professional: demoProfessionals[i % demoProfessionals.length].name,
    status: lastDays > 60 ? "inactive" : "active",
  };
});

const statuses = ["agendado","confirmado","em_atendimento","concluido","cancelado","faltou"] as const;

export const demoAppointments = Array.from({ length: 250 }).map((_, i) => {
  const dayOffset = (i % 44) - 30;
  const d = addDays(today, dayOffset);
  const hour = 9 + (i % 11);
  const min = (i % 4) * 15;
  d.setHours(hour, min, 0, 0);
  const svc = demoServices[i % demoServices.length];
  const prof = demoProfessionals[i % demoProfessionals.length];
  const cli = demoCustomers[i % demoCustomers.length];
  let status: typeof statuses[number];
  if (d < today) {
    const r = i % 20;
    if (r === 0) status = "cancelado";
    else if (r === 1) status = "faltou";
    else status = "concluido";
  } else {
    status = statuses[i % 3];
  }
  return {
    id: `a${i + 1}`,
    scheduled_at: iso(d),
    service_id: svc.id,
    service_name: svc.name,
    professional_id: prof.id,
    professional_name: prof.name,
    customer_id: cli.id,
    customer_name: cli.name,
    customer_phone: cli.phone,
    price: svc.price,
    duration_minutes: svc.duration_minutes,
    status,
    source: i % 3 === 0 ? "online" : "interno",
  };
});

export const demoFinancials = Array.from({ length: 60 }).map((_, i) => {
  const d = subDays(today, i % 35);
  const isIncome = i % 5 !== 0;
  return {
    id: `f${i + 1}`,
    date: ymd(d),
    type: isIncome ? "entrada" : "saida",
    category: isIncome
      ? ["Atendimento","Produto","Outros"][i % 3]
      : ["Aluguel","Ração/Insumos","Equipamento","Marketing","Folha","Outros"][i % 6],
    description: isIncome ? "Serviços do dia" : ["Aluguel mensal","Shampoos e cosméticos pet","Mesa de tosa nova","Anúncio Instagram","Pagamento equipe","Material limpeza"][i % 6],
    amount: isIncome ? 380 + (i * 47) % 920 : 180 + (i * 53) % 1400,
    status: "confirmado",
  };
});

export const demoTeamMembers = [
  { id: "t1", nome: "Você (Owner)", email: "owner@amigofiel.com", role: "owner", ativo: true, ultimo_login: iso(today) },
  { id: "t2", nome: "Ana Recepção", email: "ana@amigofiel.com", role: "recepcao", ativo: true, ultimo_login: iso(subDays(today, 1)) },
  { id: "t3", nome: "Bruno Admin", email: "bruno@amigofiel.com", role: "admin", ativo: true, ultimo_login: iso(today) },
  { id: "t4", nome: "Camila Financeiro", email: "camila@amigofiel.com", role: "financeiro", ativo: true, ultimo_login: iso(subDays(today, 3)) },
  { id: "t5", nome: "Diego Auxiliar", email: "diego@amigofiel.com", role: "recepcao", ativo: false, ultimo_login: iso(subDays(today, 30)) },
];

export const demoAIInsights = [
  {
    id: "ai1",
    type: "reativacao",
    priority: "alta",
    icon: "star",
    title: "8 tutores VIP com banho mensal vencido",
    description: "Esses tutores costumam trazer o pet para banho a cada 30 dias e já passaram do prazo. Uma mensagem amigável pode recuperar até R$ 2.400 esse mês.",
    impact_estimate: 2400,
    action_label: "Disparar campanha WhatsApp",
    whatsapp_message: "Olá {nome}! 🐾 Faz tempo que o seu pet não passa por aqui no Petshop Amigo Fiel para o banho mensal. Que tal agendar essa semana? Temos horário livre e o cheirinho dele vai ficar incrível! 🛁",
    targets: ["Mariana Costa", "Marcos Vieira", "Renata Barros", "Fernanda Lopes", "Heloísa Cardoso", "Roberta Castro", "Ricardo Sales", "Sérgia Andrade"],
  },
  {
    id: "ai2",
    type: "ocupacao",
    priority: "media",
    icon: "clock",
    title: "Segunda 14h-15h sem agendamentos nas últimas 4 semanas",
    description: "Horário ocioso com 0 banhos no último mês. Considere oferecer 15% off em banho para preencher.",
    impact_estimate: 580,
    action_label: "Criar promoção pontual",
    whatsapp_message: "🐶 PROMO RELÂMPAGO! Toda segunda 14h-15h com 15% OFF em banho + perfume. Vagas limitadas. Agende: link.amigofielpet.com",
  },
  {
    id: "ai3",
    type: "demanda",
    priority: "media",
    icon: "sparkles",
    title: "Tosa na Tesoura com baixa procura no mês",
    description: "Serviço premium com poucas vendas. Oferecer como combo com Banho pode dobrar a saída.",
    impact_estimate: 720,
    action_label: "Criar combo Banho+Tosa",
  },
  {
    id: "ai4",
    type: "reativacao",
    priority: "alta",
    icon: "user-x",
    title: "12 pets com vacina vencendo nos próximos 15 dias",
    description: "Tutores que ainda não agendaram a revacinação anual. Lembrete por WhatsApp aumenta o retorno em ~40%.",
    impact_estimate: 1850,
    action_label: "Disparar lembrete de vacina",
    whatsapp_message: "Olá {nome}! 💉 A vacina do seu pet está vencendo em breve. Bora garantir a proteção dele? Agende em link.amigofielpet.com",
  },
  {
    id: "ai5",
    type: "performance",
    priority: "media",
    icon: "alert-circle",
    title: "Rafael Banhista com taxa de cancelamento 18%",
    description: "Cancelamentos concentrados às quartas. Conversar com o profissional ou revisar agenda.",
    impact_estimate: 420,
    action_label: "Ver agenda do profissional",
  },
];

export function demoKpis() {
  return {
    todayAppointments: 18,
    weekAppointments: 142,
    monthAppointments: 487,
    faturamentoMes: 32400,
    monthIncome: 32400,
    monthExp: 8500,
    ticketMedio: 67,
    activeCustomers: 248,
    taxaOcupacao: 0.78,
    noShowRate: 0.05,
  };
}

export function demoTopServices() {
  const counts = new Map<string, number>();
  demoAppointments.forEach((a) => counts.set(a.service_name, (counts.get(a.service_name) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function demoWeeklyChart() {
  const today0 = new Date(); today0.setHours(0,0,0,0);
  return Array.from({ length: 14 }).map((_, i) => {
    const d = subDays(today0, 13 - i);
    const day = format(d, "dd/MM");
    const dow = d.getDay();
    const base = dow === 0 ? 0 : dow === 6 ? 28 : dow === 5 ? 24 : 14 + (i % 5);
    return { day, count: base + (i % 4) };
  });
}

export function demoRevenueChart6m() {
  return [
    { month: "Jun", value: 27800 },
    { month: "Jul", value: 29400 },
    { month: "Ago", value: 31200 },
    { month: "Set", value: 30100 },
    { month: "Out", value: 33800 },
    { month: "Nov", value: 32400 },
  ];
}
