// src/routes/app.dashboard.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar, Eye, PawPrint, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/app/dashboard')({
  component: DashboardRouteComponent,
})

const SPECIES_COLORS: Record<string, string> = {
  canino: '#8CC7B8',
  felino: '#DF756D',
  ave: '#E6B86A',
  nao_informado: '#72F2CE',
  outro: '#94A3B8',
}

function DashboardRouteComponent() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [overdueVaccines, setOverdueVaccines] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedProfessional, setSelectedProfessional] = useState<string>('ALL')

  const resolveCompanyId = async (): Promise<string | null> => {
    const { data: rpcId } = await supabase.rpc('current_company_id')
    if (rpcId) return rpcId

    const { data: firstCompany } = await supabase
      .from('company')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    return firstCompany?.id ?? null
  }

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const companyId = await resolveCompanyId()
      if (!companyId) return

      const [appointmentsRes, petsRes, vaccinesRes, professionalsRes] = await Promise.all([
        supabase
          .from('appointment')
          .select('*')
          .eq('company_id', companyId)
          .order('scheduled_at', { ascending: true }),
        supabase
          .from('pets' as any)
          .select('id, name, species, breed, birth_date, customer:customer_id(name, phone)')
          .eq('company_id', companyId)
          .eq('active', true),
        supabase
          .from('vaccines' as any)
          .select('id, vaccine_name, due_date, next_due_date, status, pet:pet_id(name, customer:customer_id(name))')
          .eq('company_id', companyId)
          .limit(8),
        supabase
          .from('professional')
          .select('id, name')
          .eq('company_id', companyId)
          .eq('active', true)
          .order('name'),
      ])

      setAppointments(appointmentsRes.data ?? [])
      setPets(petsRes.data ?? [])

      const allVaccines = (vaccinesRes.data ?? []) as any[]
      const todayIso = new Date().toISOString().slice(0, 10)
      const overdue = allVaccines.filter(
        (v) =>
          v.status === 'atrasada' ||
          (v.due_date && v.due_date < todayIso) ||
          (v.next_due_date && v.next_due_date < todayIso),
      )
      setOverdueVaccines(overdue)
      setProfessionals(professionalsRes.data ?? [])
    } catch (err) {
      console.error('Erro ao carregar Dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadDashboard()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadDashboard])

  const filteredAppointments = useMemo(() => {
    if (selectedProfessional === 'ALL') return appointments
    return appointments.filter((a) => a.professional_id === selectedProfessional)
  }, [appointments, selectedProfessional])

  // 1. Métricas dos 4 Cards Superiores
  const kpis = useMemo(() => {
    return {
      agendados: filteredAppointments.filter(
        (a) => a.status === 'pendente' || a.status === 'agendado',
      ).length,
      confirmados: filteredAppointments.filter((a) => a.status === 'confirmado').length,
      atendidos: filteredAppointments.filter((a) => a.status === 'concluido').length,
      faltaram: filteredAppointments.filter(
        (a) => a.status === 'no_show' || a.status === 'nao_compareceu',
      ).length,
    }
  }, [filteredAppointments])

  // 2. Dados do Gráfico de Linha ("Atendimentos do período")
  const timelineChartData = useMemo(() => {
    const countsByDate = new Map<string, number>()
    filteredAppointments.forEach((appt) => {
      const day = new Date(appt.scheduled_at).toLocaleDateString('pt-BR')
      countsByDate.set(day, (countsByDate.get(day) ?? 0) + 1)
    })
    return Array.from(countsByDate.entries()).map(([date, total]) => ({ date, total }))
  }, [filteredAppointments])

  // 3. Dados do Gráfico de Pizza ("Pets cadastrados")
  const speciesPieData = useMemo(() => {
    const counts: Record<string, number> = {}
    pets.forEach((p) => {
      const sp = p.species || 'canino'
      counts[sp] = (counts[sp] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rawKey: name,
      value,
    }))
  }, [pets])

  // 4. Percentual de Pets por Raça
  const breedRanking = useMemo(() => {
    const total = Math.max(1, pets.length)
    const map = new Map<string, number>()
    pets.forEach((p) => {
      const breed = p.breed || 'SRD'
      map.set(breed, (map.get(breed) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .map(([breed, count]) => ({
        breed,
        percentage: Number(((count / total) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6)
  }, [pets])

  // 5. Aniversariantes do Dia
  const todaysBirthdays = useMemo(() => {
    const today = new Date()
    const m = today.getMonth() + 1
    const d = today.getDate()
    return pets.filter((p) => {
      if (!p.birth_date) return false
      const [, monthStr, dayStr] = String(p.birth_date).split('-')
      return Number(monthStr) === m && Number(dayStr) === d
    })
  }, [pets])

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-800 p-6 space-y-5">
      {/* CABEÇALHO + FILTRO DE PROFISSIONAL */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-400">Aqui estão dados para sua análise</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 w-64 shadow-2xs focus:outline-none"
          >
            <option value="ALL">Todos os profissionais</option>
            {professionals.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.name}
              </option>
            ))}
          </select>

          <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Últimos 30 dias</span>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-5">
        {/* 4 KPI CARDS SUPERIORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Pets agendados',
              value: kpis.agendados,
              textClass: 'text-slate-500',
              blobClass: 'bg-slate-100/80',
            },
            {
              label: 'Pets confirmados',
              value: kpis.confirmados,
              textClass: 'text-sky-600',
              blobClass: 'bg-sky-100/60',
            },
            {
              label: 'Pets atendidos',
              value: kpis.atendidos,
              textClass: 'text-emerald-500',
              blobClass: 'bg-emerald-100/60',
            },
            {
              label: 'Pets que faltaram',
              value: kpis.faltaram,
              textClass: 'text-rose-500',
              blobClass: 'bg-rose-100/60',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200/80 p-5 relative overflow-hidden shadow-2xs"
            >
              <div
                className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full pointer-events-none ${card.blobClass}`}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{card.label}</span>
                <Eye className={`w-4 h-4 ${card.textClass}`} />
              </div>
              <div className="mt-4 flex items-baseline gap-1.5 relative z-10">
                <span className={`text-3xl font-extrabold font-mono ${card.textClass}`}>
                  {card.value}
                </span>
                <span className="text-xs text-slate-500 font-semibold">pets</span>
              </div>
            </div>
          ))}
        </div>

        {/* GRÁFICO DE LINHA + GRÁFICO DE PIZZA (RECHARTS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-xs font-extrabold text-slate-800 mb-4">Atendimentos do período</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <h2 className="text-xs font-extrabold text-slate-800 mb-2">Pets cadastrados</h2>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speciesPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {speciesPieData.map((entry) => (
                      <Cell
                        key={entry.rawKey}
                        fill={SPECIES_COLORS[entry.rawKey] ?? SPECIES_COLORS.outro}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100">
              {speciesPieData.map((item) => (
                <div key={item.rawKey} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: SPECIES_COLORS[item.rawKey] ?? SPECIES_COLORS.outro,
                    }}
                  />
                  <span className="font-semibold text-slate-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PERCENTUAL POR RAÇA + ANIVERSARIANTES DO DIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-extrabold text-slate-800">Percentual de Pets por Raça</h2>
            {breedRanking.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum pet cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {breedRanking.map((item) => (
                  <div key={item.breed} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.breed}</span>
                      <span className="font-mono font-bold text-slate-500">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#8CC7B8] rounded-full"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-xs font-extrabold text-slate-800 mb-3">Aniversariantes do dia</h2>
            {todaysBirthdays.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum pet faz aniversário hoje.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysBirthdays.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <PawPrint className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{pet.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Tutor: {pet.customer?.name ?? 'Não informado'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-indigo-600">
                      Parabéns!
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VACINAS EM ATRASO */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-extrabold text-slate-800">Vacinas em atraso</h2>
            <Link
              to="/app/clientes"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {overdueVaccines.map((v: any) => (
              <div
                key={v.id}
                className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-slate-50/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <PawPrint className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{v.pet?.name}</p>
                    <p className="text-[11px] text-slate-500">{v.pet?.customer?.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase">{v.vaccine_name}</span>
                  <span className="font-mono font-bold text-[#DF756D]">
                    {v.due_date || v.next_due_date
                      ? new Date(v.due_date || v.next_due_date).toLocaleDateString('pt-BR')
                      : 'Atrasada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
