// src/routes/app.banho-tosa.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlarmClock,
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  PawPrint,
  RefreshCw,
  Scissors,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

type AppointmentRow = Tables<'appointment'> & {
  pet_name?: string | null
  slot_number?: number | null
  payment_status?: 'pago' | 'em_aberto' | null
  expected_exit_at?: string | null
  is_grooming?: boolean | null
}

const TOTAL_SALON_SLOTS = 29

export const Route = createFileRoute('/app/banho-tosa')({
  component: SalonManagementScreen,
})

function SalonManagementScreen() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Estados dos filtros superiores
  const [occupancyFilter, setOccupancyFilter] = useState<'ALL' | 'OCCUPIED' | 'FREE'>('ALL')
  const [sortByExitTime, setSortByExitTime] = useState<boolean>(false)
  const [onlyGrooming, setOnlyGrooming] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'pago' | 'em_aberto' | null>(null)
  const [selectedEmptySlot, setSelectedEmptySlot] = useState<number | null>(null)

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

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const companyId = await resolveCompanyId()
      if (!companyId) return

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('appointment')
        .select('*')
        .eq('company_id', companyId)
        .gte('scheduled_at', todayStart.toISOString())
        .in('status', ['pendente', 'agendado', 'confirmado', 'em_andamento'] as any)
        .order('scheduled_at', { ascending: true })

      setAppointments((data as AppointmentRow[]) ?? [])
    } catch (err) {
      console.error('Erro ao carregar agendamentos do salão:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadAppointments()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadAppointments])

  // Agendamentos ainda sem gaiola atribuída ("pendentes")
  const pendingUnallocated = useMemo(
    () => appointments.filter((a) => !a.slot_number),
    [appointments],
  )

  // Mapa rápido: slot_number (1..29) -> AppointmentRow
  const slotMap = useMemo(() => {
    const map = new Map<number, AppointmentRow>()
    appointments.forEach((appt) => {
      if (appt.slot_number && appt.slot_number >= 1 && appt.slot_number <= TOTAL_SALON_SLOTS) {
        map.set(appt.slot_number, appt)
      }
    })
    return map
  }, [appointments])

  // Lista final das 29 gaiolas filtradas e ordenadas
  const visibleSlots = useMemo(() => {
    let slots = Array.from({ length: TOTAL_SALON_SLOTS }, (_, i) => i + 1)

    slots = slots.filter((slotNumber) => {
      const appt = slotMap.get(slotNumber)
      if (occupancyFilter === 'OCCUPIED' && !appt) return false
      if (occupancyFilter === 'FREE' && appt) return false
      if (onlyGrooming && (!appt || !appt.is_grooming)) return false
      if (paymentStatusFilter && (!appt || appt.payment_status !== paymentStatusFilter)) {
        return false
      }
      return true
    })

    if (sortByExitTime) {
      slots.sort((a, b) => {
        const apptA = slotMap.get(a)
        const apptB = slotMap.get(b)
        if (apptA && !apptB) return -1
        if (!apptA && apptB) return 1
        if (apptA?.expected_exit_at && apptB?.expected_exit_at) {
          return apptA.expected_exit_at.localeCompare(apptB.expected_exit_at)
        }
        return a - b
      })
    }

    return slots
  }, [slotMap, occupancyFilter, onlyGrooming, paymentStatusFilter, sortByExitTime])

  // Alocar um agendamento pendente na gaiola escolhida
  const handleAllocateAppointmentToSlot = async (appointmentId: string, slotNumber: number) => {
    const { error } = await supabase
      .from('appointment')
      .update({ slot_number: slotNumber, status: 'em_andamento' } as any)
      .eq('id', appointmentId)

    if (error) {
      alert(`Não foi possível alocar na posição #${slotNumber}: ${error.message}`)
      return
    }
    setSelectedEmptySlot(null)
    await loadAppointments()
  }

  // Alternar rapidamente entre 'pago' e 'em_aberto'
  const handleTogglePaymentStatus = async (appt: AppointmentRow) => {
    const nextStatus = appt.payment_status === 'pago' ? 'em_aberto' : 'pago'
    await supabase
      .from('appointment')
      .update({ payment_status: nextStatus } as any)
      .eq('id', appt.id)
    await loadAppointments()
  }

  // Liberar a gaiola quando o pet sai
  const handleReleaseSlot = async (apptId: string) => {
    await supabase
      .from('appointment')
      .update({
        slot_number: null,
        status: 'concluido',
        completed_at: new Date().toISOString(),
      } as any)
      .eq('id', apptId)
    await loadAppointments()
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-800 p-4 lg:p-6">
      {/* BARRA SUPERIOR DE CONTROLE DO SALÃO */}
      <header className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 mb-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-800 leading-tight">Banho & Tosa</h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão do Salão</p>
          </div>
          <span className="ml-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-900 text-xs font-bold flex items-center gap-1.5">
            <PawPrint className="w-3.5 h-3.5 text-indigo-600" />
            <span>{pendingUnallocated.length} pendentes</span>
          </span>
        </div>

        {/* FILTROS CENTRAIS: Todos | Horário de saída | Apenas tosas */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value as any)}
              className="bg-transparent focus:outline-none"
            >
              <option value="ALL">Todos</option>
              <option value="OCCUPIED">Ocupadas</option>
              <option value="FREE">Livres</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortByExitTime((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition ${
              sortByExitTime
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlarmClock className="w-3.5 h-3.5" />
            <span>Horário de saída</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyGrooming((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition ${
              onlyGrooming
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Apenas tosas</span>
          </button>
        </div>

        {/* FILTROS DIREITA: Pago | Em Aberto | Resumo */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              setPaymentStatusFilter((prev) => (prev === 'pago' ? null : 'pago'))
            }
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition ${
              paymentStatusFilter === 'pago'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Pago</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setPaymentStatusFilter((prev) => (prev === 'em_aberto' ? null : 'em_aberto'))
            }
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition ${
              paymentStatusFilter === 'em_aberto'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Em Aberto</span>
          </button>

          <div className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Resumo ({slotMap.size}/29)</span>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* GRID DE GAIOLAS NUMERADAS DE 1 A 29 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {visibleSlots.map((slotNumber) => {
          const appt = slotMap.get(slotNumber)

          if (!appt) {
            return (
              <button
                key={slotNumber}
                type="button"
                onClick={() => setSelectedEmptySlot(slotNumber)}
                className="group text-left bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between min-h-[126px]"
              >
                <div className="w-full bg-[#F1F3F6] group-hover:bg-indigo-50/70 px-3.5 py-2 flex items-center justify-between transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-indigo-700">
                    LIVRE
                  </span>
                  <span className="text-xl font-extrabold text-slate-600 group-hover:text-indigo-700 font-mono leading-none">
                    {slotNumber}
                  </span>
                </div>
                <div className="w-full flex-1 flex flex-col items-center justify-center py-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-700">
                    VAZIA
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Clique para alocar</p>
                </div>
              </button>
            )
          }

          const isPaid = appt.payment_status === 'pago'

          return (
            <div
              key={slotNumber}
              className={`bg-white rounded-xl border-2 ${
                isPaid ? 'border-emerald-300' : 'border-rose-300'
              } shadow-2xs overflow-hidden flex flex-col justify-between min-h-[126px]`}
            >
              <div
                className={`${
                  isPaid ? 'bg-emerald-50/80' : 'bg-rose-50/80'
                } px-3.5 py-2 flex items-center justify-between border-b border-slate-100`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isPaid ? 'Pago' : 'Em Aberto'}
                  </span>
                  {appt.is_grooming && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Tosa
                    </span>
                  )}
                </div>

                <span className="text-xl font-extrabold text-slate-700 font-mono leading-none">
                  {slotNumber}
                </span>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <p className="font-extrabold text-xs text-slate-800 uppercase">
                    {appt.pet_name ?? appt.customer_name ?? 'Pet em Atendimento'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {appt.service_name} • {appt.customer_name}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleTogglePaymentStatus(appt)}
                    className={`font-bold ${
                      isPaid ? 'text-emerald-700' : 'text-rose-700'
                    } hover:underline`}
                  >
                    Marcar {isPaid ? 'Em Aberto' : 'Pago'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReleaseSlot(appt.id)}
                    className="text-slate-400 hover:text-rose-600 font-semibold"
                  >
                    Concluir / Liberar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL SIMPLES DE ALOCAÇÃO DE AGENDAMENTO NA GAIOLA CLICADA */}
      {selectedEmptySlot !== null && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800">
                Alocar Pet na Gaiola #{selectedEmptySlot}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEmptySlot(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Fechar
              </button>
            </div>

            {pendingUnallocated.length === 0 ? (
              <p className="text-xs text-slate-500">
                Não há agendamentos pendentes sem gaiola no momento.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingUnallocated.map((appt) => (
                  <button
                    key={appt.id}
                    type="button"
                    onClick={() => handleAllocateAppointmentToSlot(appt.id, selectedEmptySlot)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        {appt.pet_name ?? appt.customer_name}
                      </p>
                      <p className="text-[11px] text-slate-500">{appt.service_name}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">
                      Alocar #{selectedEmptySlot} →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
